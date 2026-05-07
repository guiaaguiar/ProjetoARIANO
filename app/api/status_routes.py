from fastapi import APIRouter, HTTPException
from app.core.neo4j_driver import run_cypher
from typing import Dict, Any, List

router = APIRouter(tags=["User Status"])

@router.get("/{uid}/status")
def get_user_ai_status(uid: str):
    """Fetches the AI processing status and logs for a specific user."""
    query = """
    MATCH (u)
    WHERE (u:Student OR u:Researcher OR u:Professor) AND u.uid = $uid
    RETURN u.ai_status AS status, u.ai_logs AS logs, u.name AS name
    """
    results = run_cypher(query, {"uid": uid})
    
    if not results:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user_data = results[0]
    
    # Also try to fetch matches if completed
    matches = []
    if user_data.get("status") == "completed":
        match_query = """
        MATCH (u {uid: $uid})-[r:ELIGIBLE_FOR]->(e:Edital)
        RETURN e.title AS title, e.institution AS institution, 
               r.score AS score, r.justification AS justification
        ORDER BY r.score DESC
        LIMIT 3
        """
        match_results = run_cypher(match_query, {"uid": uid})
        matches = [
            {
                "title": m["title"],
                "instituicao": m["institution"],
                "score": int(m["score"] * 100),
                "justification": m["justification"]
            }
            for m in match_results
        ]
        
    return {
        "status": user_data.get("status", "unknown"),
        "logs": user_data.get("logs", []),
        "name": user_data.get("name"),
        "matches": matches
    }

@router.get("/debug/graph")
def debug_graph():
    """Returns the current in-memory state of the graph store (singleton in this lambda)."""
    from app.core.neo4j_driver import get_memory_store, is_memory_mode
    if not is_memory_mode():
        return {"mode": "neo4j", "message": "Graph is stored in Neo4j, not memory."}
    
    store = get_memory_store()
    return {
        "mode": "memory",
        "node_count": len(store.nodes),
        "edge_count": len(store.edges),
        "nodes_summary": [
            {"uid": uid, "name": n["props"].get("name"), "labels": n["labels"]}
            for uid, n in store.nodes.items()
        ]
    }

@router.get("/debug/kv")
def debug_kv():
    """Directly queries Vercel KV to see the persistent state."""
    import os, httpx, json
    url = os.environ.get("KV_REST_API_URL")
    token = os.environ.get("KV_REST_API_TOKEN")
    
    if not url or not token:
        return {"error": "KV not configured"}
        
    try:
        with httpx.Client() as client:
            res = client.get(
                f"{url}/get/ariano_graph_persistent",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                val = res.json().get("result")
                if val:
                    data = json.loads(val)
                    return {
                        "status": "success",
                        "size_bytes": len(val),
                        "node_count": len(data.get("nodes", {})),
                        "nodes": list(data.get("nodes", {}).keys()),
                        "last_sync": data.get("last_sync")
                    }
                return {"status": "empty", "message": "No data in KV"}
            return {"status": "error", "code": res.status_code, "text": res.text}
    except Exception as e:
        return {"status": "exception", "error": str(e)}
