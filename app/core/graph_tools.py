"""Graph traversal tools — Neo4j Aura only."""

import logging
from typing import Any

from app.core.neo4j_driver import run_cypher

logger = logging.getLogger(__name__)


def retrieve_node(query: str, k: int = 1) -> list[dict]:
    """Retrieve nodes based on fuzzy text match against Neo4j Aura."""
    query_lower = query.lower()
    cypher = """
    MATCH (n)
    WHERE toLower(coalesce(n.name, '')) CONTAINS $q
       OR toLower(coalesce(n.bio, '')) CONTAINS $q
    RETURN n.uid AS uid, n.name AS name, labels(n)[0] AS type
    LIMIT $k
    """
    results = run_cypher(cypher, {"q": query_lower, "k": k})
    return [{"uid": row.get("uid"), "name": row.get("name"), "type": row.get("type"), "similarity": 0.8} for row in results]


def node_feature(uid: str, feature: str) -> Any:
    """Return a specific attribute of a node."""
    cypher = f"MATCH (n {{uid: $uid}}) RETURN n.{feature} AS value"
    results = run_cypher(cypher, {"uid": uid})
    return results[0].get("value") if results else None


def neighbour_check(uid: str, edge_type: str = "") -> list[dict]:
    """List neighbours of a node, optionally filtered by edge type."""
    edge_filter = f":{edge_type}" if edge_type else ""
    cypher = f"MATCH (n {{uid: $uid}})-[{edge_filter}]->(m) RETURN m.uid AS uid, m.name AS name, labels(m)[0] AS type"
    results = run_cypher(cypher, {"uid": uid})
    return [{"uid": row.get("uid"), "name": row.get("name"), "type": row.get("type")} for row in results]


def node_degree(uid: str, edge_type: str = "") -> int:
    """Count connections of a specific type."""
    return len(neighbour_check(uid, edge_type))


def get_entity_deep_context(uid: str, depth: int = 3) -> dict:
    """Return an expanded subgraph around the entity (N-hop context)."""
    context: dict = {"uid": uid, "details": {}, "connections": []}

    cypher_details = "MATCH (n {uid: $uid}) RETURN properties(n) AS details"
    details_results = run_cypher(cypher_details, {"uid": uid})
    if details_results:
        context["details"] = details_results[0].get("details") or {}

    cypher = f"""
    MATCH path = (n {{uid: $uid}})-[*1..{depth}]-(m)
    WITH n, relationships(path) AS rels, nodes(path) AS ns
    UNWIND range(0, size(rels)-1) AS i
    WITH n, rels[i] AS r, ns[i] AS start_node, ns[i+1] AS end_node
    RETURN DISTINCT
           start_node.uid AS from_uid, labels(start_node)[0] AS from_type, start_node.name AS from_name,
           type(r) AS rel_type, properties(r) AS rel_props,
           end_node.uid AS to_uid, labels(end_node)[0] AS to_type, end_node.name AS to_name
    """
    results = run_cypher(cypher, {"uid": uid})
    for row in results:
        context["connections"].append({
            "from_uid": row.get("from_uid"),
            "from_type": row.get("from_type"),
            "from_name": row.get("from_name"),
            "rel_type": row.get("rel_type"),
            "rel_props": row.get("rel_props"),
            "to_uid": row.get("to_uid"),
            "to_type": row.get("to_type"),
            "to_name": row.get("to_name"),
        })

    return context
