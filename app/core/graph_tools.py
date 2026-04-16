import logging
from typing import Any

from app.core.neo4j_driver import is_memory_mode, get_memory_store, run_cypher

logger = logging.getLogger(__name__)

def retrieve_node(query: str, k: int = 1) -> list[dict]:
    """Retrieve nodes based on similarity to query. Mocked as a fuzzy search for MVP."""
    query_lower = query.lower()
    if is_memory_mode():
        store = get_memory_store()
        matches = []
        for uid, node in store.nodes.items():
            name = node["props"].get("name", "").lower()
            bio = node["props"].get("bio", "").lower()
            if query_lower in name or query_lower in bio:
                # Add a dummy similarity score based on presence
                matches.append({"uid": uid, **node["props"], "similarity": 0.8})
        return sorted(matches, key=lambda x: x["similarity"], reverse=True)[:k]
    
    # Simple Neo4j text search mock (use proper embeddings + vector search in prod)
    cypher = """
    MATCH (n)
    WHERE toLower(n.name) CONTAINS $q OR toLower(n.bio) CONTAINS $q
    RETURN n.uid AS uid, n.name AS name, labels(n)[0] AS type
    LIMIT $k
    """
    results, _ = run_cypher(cypher, {"q": query_lower, "k": k})
    return [{"uid": row[0], "name": row[1], "type": row[2]} for row in results]

def node_feature(uid: str, feature: str) -> Any:
    """Return a specific attribute of a node."""
    if is_memory_mode():
        store = get_memory_store()
        node = store.get_node(uid)
        if node and feature in node["props"]:
            return node["props"][feature]
        return None
    
    cypher = f"MATCH (n {{uid: $uid}}) RETURN n.{feature} AS value"
    results, _ = run_cypher(cypher, {"uid": uid})
    return results[0][0] if results else None

def neighbour_check(uid: str, edge_type: str = "") -> list[dict]:
    """List neighbours of a node, optionally filtered by edge type."""
    if is_memory_mode():
        store = get_memory_store()
        edges = store.get_edges(source=uid, edge_type=edge_type if edge_type else None)
        neighbors = []
        for edge in edges:
            target = store.get_node(edge["target"])
            if target:
                neighbors.append({"uid": edge["target"], "type": target["labels"][0], **target["props"]})
        return neighbors
    
    edge_filter = f":{edge_type}" if edge_type else ""
    cypher = f"MATCH (n {{uid: $uid}})-[{edge_filter}]->(m) RETURN m.uid, m.name, labels(m)[0]"
    results, _ = run_cypher(cypher, {"uid": uid})
    return [{"uid": row[0], "name": row[1], "type": row[2]} for row in results]

def node_degree(uid: str, edge_type: str = "") -> int:
    """Count connections of a specific type."""
    return len(neighbour_check(uid, edge_type))

def get_entity_deep_context(uid: str, depth: int = 3) -> dict:
    """Return an expanded subgraph around the entity (N-hop context)."""
    context = {"uid": uid, "details": {}, "connections": []}
    
    if is_memory_mode():
        store = get_memory_store()
        node = store.get_node(uid)
        if not node:
            return context
        context["details"] = node["props"]
        
        # Hop 1 simple
        for edge in store.get_edges(source=uid):
            target = store.get_node(edge["target"])
            if target:
                context["connections"].append({
                    "relationship": edge["type"],
                    "target_uid": edge["target"],
                    "target_name": target["props"].get("name", ""),
                    "target_type": target["labels"][0]
                })
        return context
        
    cypher = f"""
    MATCH path = (n {{uid: $uid}})-[*1..{depth}]-(m)
    WITH n, relationships(path) AS rels, nodes(path) AS nodes
    UNWIND range(0, size(rels)-1) AS i
    WITH n, rels[i] AS r, nodes[i] AS start_node, nodes[i+1] AS end_node
    RETURN DISTINCT 
           start_node.uid, labels(start_node)[0], start_node.name,
           type(r), properties(r),
           end_node.uid, labels(end_node)[0], end_node.name
    """
    results, _ = run_cypher(cypher, {"uid": uid})
    
    # Simplistic context building for prompt consumption
    cypher_details = "MATCH (n {uid: $uid}) RETURN properties(n)"
    details_results, _ = run_cypher(cypher_details, {"uid": uid})
    if details_results:
        context["details"] = details_results[0][0]
        
    for row in results:
        context["connections"].append({
            "from_uid": row[0], "from_type": row[1], "from_name": row[2],
            "rel_type": row[3], "rel_props": row[4],
            "to_uid": row[5], "to_type": row[6], "to_name": row[7]
        })
        
    return context
