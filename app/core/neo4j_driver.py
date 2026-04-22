from __future__ import annotations

"""Neo4j driver with in-memory fallback.

When Neo4j is available → uses real Bolt driver.
When Neo4j is NOT available → uses an in-memory graph store.

This allows the MVP to function fully without a running Neo4j instance.
Switch is automatic: if the connection fails, it falls back silently.
"""

import logging
from collections import defaultdict
from typing import Any
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

_driver = None
_use_memory = False
_memory_store: MemoryGraphStore | None = None


# ═══════════════════════════════════════════
# IN-MEMORY GRAPH STORE (Neo4j fallback)
# ═══════════════════════════════════════════

class MemoryGraphStore:
    """Simple in-memory graph store that mimics Neo4j Cypher operations.

    Stores nodes as dicts with labels, and edges as (source, target, type, props).
    Supports basic Cypher-like operations via Python methods.
    """

    def __init__(self):
        self.nodes: dict[str, dict] = {}  # uid -> {labels: [...], props: {...}}
        self.edges: list[dict] = []  # [{source, target, type, props}]
        logger.info("📦 MemoryGraphStore initialized (Neo4j fallback)")

    def add_node(self, uid: str, labels: list[str], props: dict):
        self.nodes[uid] = {"labels": labels, "props": {**props, "uid": uid}}

    def get_node(self, uid: str) -> dict | None:
        return self.nodes.get(uid)

    def get_nodes_by_label(self, label: str) -> list[dict]:
        return [
            n["props"] for n in self.nodes.values()
            if label in n["labels"]
        ]

    def add_edge(self, source_uid: str, target_uid: str, edge_type: str, props: dict = None):
        # MERGE semantics — update if exists
        for edge in self.edges:
            if (edge["source"] == source_uid and
                edge["target"] == target_uid and
                edge["type"] == edge_type):
                edge["props"].update(props or {})
                return
        self.edges.append({
            "source": source_uid,
            "target": target_uid,
            "type": edge_type,
            "props": props or {},
        })

    def get_edges(self, source: str = None, target: str = None,
                  edge_type: str = None) -> list[dict]:
        results = []
        for edge in self.edges:
            if source and edge["source"] != source:
                continue
            if target and edge["target"] != target:
                continue
            if edge_type and edge["type"] != edge_type:
                continue
            results.append(edge)
        return results

    def delete_edges(self, edge_type: str):
        self.edges = [e for e in self.edges if e["type"] != edge_type]

    def find_node_by_prop(self, label: str, prop: str, value: Any) -> dict | None:
        for n in self.nodes.values():
            if label in n["labels"] and n["props"].get(prop) == value:
                return n["props"]
        return None

    def count_nodes(self, label: str = None) -> int:
        if label:
            return len(self.get_nodes_by_label(label))
        return len(self.nodes)

    def count_edges(self, edge_type: str = None) -> int:
        if edge_type:
            return len([e for e in self.edges if e["type"] == edge_type])
        return len(self.edges)


def get_memory_store() -> MemoryGraphStore:
    global _memory_store
    if _memory_store is None:
        _memory_store = MemoryGraphStore()
    return _memory_store


# ═══════════════════════════════════════════
# CYPHER INTERPRETER (for in-memory mode)
# ═══════════════════════════════════════════

def _interpret_cypher(query: str, params: dict | None = None) -> list[dict]:
    """Interpret common Cypher patterns against the in-memory store.

    This is NOT a full Cypher parser — it handles the specific patterns
    used by ARIANO's agents, match engine, and CRUD layer.
    """
    store = get_memory_store()
    params = params or {}
    query_upper = query.strip().upper()
    query_clean = query.strip()

    # ── CREATE ──
    if "CREATE" in query_upper and "(" in query_clean and ")" in query_clean:
        return _handle_create(query_clean, params, store)

    # ── MERGE node ──
    if "MERGE" in query_upper and "(" in query_clean and ")" in query_clean:
        return _handle_merge(query_clean, params, store)

    # ── MATCH + RETURN (queries) ──
    if "MATCH" in query_upper and "RETURN" in query_upper:
        return _handle_match_return(query_clean, params, store)

    # ── DELETE edges ──
    if "DELETE" in query_upper:
        return _handle_delete(query_clean, params, store)

    # ── COUNT ──
    if "COUNT" in query_upper:
        return _handle_count(query_clean, params, store)

    return []


def _handle_create(query: str, params: dict, store: MemoryGraphStore) -> list[dict]:
    """Handle CREATE operations for nodes."""
    import re
    # Extract label: CREATE (n:Label {props})
    match = re.search(r'\((\w+):(\w+)', query)
    if match:
        label = match.group(2)
        uid = params.get("uid") or str(uuid.uuid4())[:8]
        props = {**params, "uid": uid}
        store.add_node(uid, [label], props)
        return [{"uid": uid}]
    return []

def _handle_merge(query: str, params: dict, store: MemoryGraphStore) -> list[dict]:
    """Handle MERGE operations for nodes and edges."""
    q = query.upper()

    # Edge MERGE: (a)-[r:TYPE]->(b)
    if ")-[" in query and "]->" in query:
        # Extract edge type from r:TYPE
        import re
        edge_match = re.search(r'\[r?:(\w+)\]', query)
        edge_type = edge_match.group(1) if edge_match else "UNKNOWN"

        # Find source and target UIDs from params
        source_uid = params.get("uid") or params.get("entity_uid")
        target_name = params.get("skill_name") or params.get("area_name")
        target_uid = params.get("edital_uid")

        # If target is by name, find it
        if target_name and not target_uid:
            for n in store.nodes.values():
                if n["props"].get("name") == target_name:
                    target_uid = n["props"]["uid"]
                    break

        if source_uid and target_uid:
            edge_props = {}
            # Extract SET properties from params
            for key in ["confidence", "priority", "source", "score",
                        "matched_skills", "matched_areas", "justification",
                        "calculated_by"]:
                if key in params:
                    edge_props[key] = params[key]
            edge_props["created_at"] = datetime.now().isoformat()

            store.add_edge(source_uid, target_uid, edge_type, edge_props)
        return []

    # Node MERGE: (s:Label {name: $name})
    import re
    node_match = re.search(r'\((\w+):(\w+)\s*\{(\w+):\s*\$(\w+)\}', query)
    if node_match:
        label = node_match.group(2)
        prop_key = node_match.group(3)
        param_key = node_match.group(4)
        value = params.get(param_key)

        if value:
            existing = store.find_node_by_prop(label, prop_key, value)
            if not existing:
                uid = str(uuid.uuid4())[:8]
                props = {prop_key: value, "uid": uid, "created_at": datetime.now().isoformat()}
                # Add extra params
                for k in ["category"]:
                    if k in params:
                        props[k] = params[k]
                store.add_node(uid, [label], props)
    return []


def _handle_match_return(query: str, params: dict, store: MemoryGraphStore) -> list[dict]:
    """Handle MATCH...RETURN queries."""
    q = query.upper()

    # --- Generic Node Query (for NetworkX) ---
    if "MATCH (N)" in q and "RETURN" in q and not any(k in q for k in ["-", "[", "->", ":"]):
        results = []
        for node in store.nodes.values():
            results.append({
                "uid": node["props"].get("uid"),
                "name": node["props"].get("name") or node["props"].get("title"),
                "type": node["labels"][0] if node.get("labels") else "Unknown"
            })
        return results

    # --- Generic Edge Query (for NetworkX) ---
    if "MATCH (S)-[R]->(T)" in q and "RETURN" in q:
        results = []
        for edge in store.edges:
            results.append({
                "source": edge["source"],
                "target": edge["target"],
                "label": edge["type"]
            })
        return results

    # Stats query: count nodes and edges
    if "COUNT(N)" in q and "COUNT(R)" in q:
        return [{"nodes": store.count_nodes(), "edges": store.count_edges()}]

    # Count specific edges
    if "COUNT(R)" in q and "ELIGIBLE_FOR" in q:
        count = store.count_edges("ELIGIBLE_FOR")
        return [{"total_matches": count, "avg_score": 0.0, "max_score": 0.0,
                 "min_score": 0.0, "median_score": 0.0}]

    if "COUNT(S)" in q and "REQUIRES_SKILL" in q:
        edital_uid = params.get("uid")
        edges = store.get_edges(source=edital_uid, edge_type="REQUIRES_SKILL")
        return [{"total": len(edges)}]

    if "COUNT(A)" in q and "TARGETS_AREA" in q:
        edital_uid = params.get("uid")
        edges = store.get_edges(source=edital_uid, edge_type="TARGETS_AREA")
        return [{"total": len(edges)}]

    if "COUNT(S)" in q or "COUNT(A)" in q:
        return [{"total": 0}]

    # Academic entities query
    if ("STUDENT" in q or "RESEARCHER" in q or "PROFESSOR" in q) and "RETURN" in q and not any(k in q for k in ["HAS_SKILL", "REQUIRES_SKILL", "TARGETS_AREA", "RESEARCHES_AREA", "ELIGIBLE_FOR"]):
        results = []
        for label in ["Student", "Researcher", "Professor"]:
            if label.upper() in q:
                for node in store.get_nodes_by_label(label):
                    # Filter by uid if provided
                    uid_param = params.get("uid") or params.get("entity_uid")
                    if uid_param and node.get("uid") != uid_param:
                        continue
                    n = store.nodes.get(node["uid"], {})
                    results.append({
                        "uid": node.get("uid"),
                        "name": node.get("name"),
                        "type": label,
                        "level": node.get("level"),
                        "institution": node.get("institution"),
                        "bio": node.get("bio"),
                        "course": node.get("course"),
                    })
        if not results and "STUDENT" not in q and "RESEARCHER" not in q:
            pass  # not an academic query
        return results

    # Edital query
    if "EDITAL" in q and "ELIGIBLE_FOR" not in q and not any(k in q for k in ["HAS_SKILL", "REQUIRES_SKILL", "TARGETS_AREA", "RESEARCHES_AREA", "ENTITY_LEVEL", "A.LEVEL", "ESSENTIAL"]):
        uid = params.get("uid")
        results = []
        for node in store.get_nodes_by_label("Edital"):
            if uid and node.get("uid") != uid:
                continue
            results.append({
                "uid": node.get("uid"),
                "title": node.get("title"),
                "description": node.get("description"),
                "agency": node.get("agency"),
                "edital_type": node.get("edital_type"),
                "funding": node.get("funding"),
                "min_level": node.get("min_level"),
                "status": node.get("status", "aberto"),
            })
        return results

    # Shared skills query (HAS_SKILL + REQUIRES_SKILL)
    if "HAS_SKILL" in q and "REQUIRES_SKILL" in q:
        entity_uid = params.get("entity_uid")
        edital_uid = params.get("edital_uid")
        if entity_uid and edital_uid:
            entity_skills = store.get_edges(source=entity_uid, edge_type="HAS_SKILL")
            edital_skills = store.get_edges(source=edital_uid, edge_type="REQUIRES_SKILL")

            entity_skill_targets = {e["target"] for e in entity_skills}
            results = []
            for es in edital_skills:
                if es["target"] in entity_skill_targets:
                    skill_node = store.get_node(es["target"])
                    hs = next((e for e in entity_skills if e["target"] == es["target"]), {})
                    results.append({
                        "skill_name": skill_node["props"]["name"] if skill_node else "",
                        "confidence": hs.get("props", {}).get("confidence", 0.8),
                        "priority": es.get("props", {}).get("priority", "desirable"),
                    })
            return results
        return []

    # Shared areas query (RESEARCHES_AREA + TARGETS_AREA)
    if "RESEARCHES_AREA" in q and "TARGETS_AREA" in q:
        entity_uid = params.get("entity_uid")
        edital_uid = params.get("edital_uid")
        if entity_uid and edital_uid:
            entity_areas = store.get_edges(source=entity_uid, edge_type="RESEARCHES_AREA")
            edital_areas = store.get_edges(source=edital_uid, edge_type="TARGETS_AREA")

            entity_area_targets = {e["target"] for e in entity_areas}
            results = []
            for ea in edital_areas:
                if ea["target"] in entity_area_targets:
                    area_node = store.get_node(ea["target"])
                    results.append({
                        "area_name": area_node["props"]["name"] if area_node else "",
                    })
            return results
        return []

    # Level data query
    if "A.LEVEL" in q or "ENTITY_LEVEL" in q:
        entity_uid = params.get("entity_uid")
        edital_uid = params.get("edital_uid")
        entity = store.get_node(entity_uid) if entity_uid else None
        edital = store.get_node(edital_uid) if edital_uid else None
        if entity and edital:
            return [{
                "entity_level": entity["props"].get("level", "graduacao"),
                "min_level": edital["props"].get("min_level", "graduacao"),
            }]
        return []

    # Essential skills query
    if "PRIORITY" in q and "ESSENTIAL" in q.upper():
        edital_uid = params.get("uid")
        edges = store.get_edges(source=edital_uid, edge_type="REQUIRES_SKILL")
        results = []
        for e in edges:
            if e["props"].get("priority") == "essential":
                skill = store.get_node(e["target"])
                results.append({"name": skill["props"]["name"] if skill else ""})
        return results

    # ELIGIBLE_FOR matches query
    if "ELIGIBLE_FOR" in q:
        entity_uid = params.get("entity_uid")
        edital_uid = params.get("edital_uid")
        threshold = params.get("threshold", 0.0)
        limit = params.get("limit", 100)

        edges = store.get_edges(edge_type="ELIGIBLE_FOR")
        results = []
        for edge in edges:
            if entity_uid and edge["source"] != entity_uid:
                continue
            if edital_uid and edge["target"] != edital_uid:
                continue
            score = edge["props"].get("score", 0)
            if score < threshold:
                continue
            source_node = store.get_node(edge["source"])
            target_node = store.get_node(edge["target"])
            if source_node and target_node:
                results.append({
                    "entity_uid": edge["source"],
                    "entity_name": source_node["props"].get("name", ""),
                    "entity_type": source_node["labels"][0] if source_node.get("labels") else "",
                    "edital_uid": edge["target"],
                    "edital_title": target_node["props"].get("title", ""),
                    "agency": target_node["props"].get("agency", ""),
                    "funding": target_node["props"].get("funding", 0),
                    "score": score,
                    "matched_skills": edge["props"].get("matched_skills", []),
                    "matched_areas": edge["props"].get("matched_areas", []),
                    "justification": edge["props"].get("justification", ""),
                    "calculated_at": edge["props"].get("calculated_at"),
                })
        results.sort(key=lambda x: x.get("score", 0), reverse=True)
        return results[:limit]

    return []


def _handle_delete(query: str, params: dict, store: MemoryGraphStore) -> list[dict]:
    """Handle DELETE operations."""
    if "ELIGIBLE_FOR" in query.upper():
        store.delete_edges("ELIGIBLE_FOR")
    return []


def _handle_count(query: str, params: dict, store: MemoryGraphStore) -> list[dict]:
    return [{"count": store.count_nodes()}]


# ═══════════════════════════════════════════
# PUBLIC API (same interface as original)
# ═══════════════════════════════════════════

def get_driver():
    """Get or create Neo4j driver singleton. Falls back to memory mode."""
    global _driver, _use_memory
    if _use_memory:
        return None
    if _driver is None:
        try:
            from neo4j import GraphDatabase
            from app.core.config import settings
            
            # Use a short connection timeout to avoid hanging on Vercel
            _driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
                connection_timeout=5.0,  # 5 seconds max to connect
                max_connection_lifetime=600,
            )
            # verify_connectivity can hang if the network is flaky
            # We skip it or use a try block with timeout if we really want to test
            logger.info(f"Attempting Neo4j connection to {settings.neo4j_uri}...")
            # _driver.verify_connectivity() # Skipping blocking call for faster startup
            logger.info("✅ Neo4j driver initialized (lazy connectivity)")
        except Exception as e:
            logger.warning(f"⚠️ Neo4j unavailable ({e}), using in-memory graph store")
            _driver = None
            _use_memory = True
    return _driver


def close_driver():
    """Close the Neo4j driver."""
    global _driver, _use_memory
    if _driver:
        _driver.close()
        _driver = None
    _use_memory = False


def is_memory_mode() -> bool:
    """Check if we're using in-memory fallback."""
    return _use_memory


def run_cypher(query: str, params: dict | None = None) -> list[dict]:
    """Execute a Cypher query. Uses Neo4j if available, memory store otherwise."""
    driver = get_driver()

    if _use_memory or driver is None:
        return _interpret_cypher(query, params)

    try:
        with driver.session() as session:
            result = session.run(query, params or {})
            return [record.data() for record in result]
    except Exception as e:
        logger.error(f"Cypher query failed: {e}")
        return []


def run_cypher_single(query: str, params: dict | None = None) -> dict | None:
    """Execute a Cypher query and return a single result."""
    results = run_cypher(query, params)
    return results[0] if results else None
