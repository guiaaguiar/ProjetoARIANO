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
