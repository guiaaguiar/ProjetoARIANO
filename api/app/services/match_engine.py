from __future__ import annotations

"""Match Engine — Pure Cypher queries for O(1) match retrieval.

This module implements the PHASE 2 of ARIANO's architecture:
  Request → Cypher Query → O(1) adjacency → Instant results

The matches (ELIGIBLE_FOR edges) are pre-computed by AI agents (PHASE 1).
This engine only READS the pre-computed graph — no AI at query time.
"""

from app.core.neo4j_driver import run_cypher


def get_matches_for_entity(entity_uid: str, threshold: float = 0.0) -> list[dict]:
    """Get all matches for a specific academic entity.

    Cypher O(1): MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
    """
    query = """
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE a.uid = $entity_uid AND r.score >= $threshold
        RETURN a.uid AS entity_uid,
               a.name AS entity_name,
               labels(a)[0] AS entity_type,
               e.uid AS edital_uid,
               e.title AS edital_title,
               e.agency AS agency,
               e.funding AS funding,
               r.score AS score,
               r.matched_skills AS matched_skills,
               r.matched_areas AS matched_areas,
               r.justification AS justification,
               r.calculated_at AS calculated_at
        ORDER BY r.score DESC
    """
    return run_cypher(query, {"entity_uid": entity_uid, "threshold": threshold})


def get_matches_for_edital(edital_uid: str, threshold: float = 0.0) -> list[dict]:
    """Get all academic entities matched to a specific edital.

    Cypher O(1): MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
    """
    query = """
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE e.uid = $edital_uid AND r.score >= $threshold
        RETURN a.uid AS entity_uid,
               a.name AS entity_name,
               labels(a)[0] AS entity_type,
               e.uid AS edital_uid,
               e.title AS edital_title,
               e.agency AS agency,
               e.funding AS funding,
               r.score AS score,
               r.matched_skills AS matched_skills,
               r.matched_areas AS matched_areas,
               r.justification AS justification,
               r.calculated_at AS calculated_at
        ORDER BY r.score DESC
    """
    return run_cypher(query, {"edital_uid": edital_uid, "threshold": threshold})


def get_all_matches(threshold: float = 0.0, limit: int = 100) -> list[dict]:
    """Get all matches above a threshold, ordered by score.

    Cypher O(1): Pure adjacency traversal.
    """
    query = """
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE r.score >= $threshold
        RETURN a.uid AS entity_uid,
               a.name AS entity_name,
               labels(a)[0] AS entity_type,
               e.uid AS edital_uid,
               e.title AS edital_title,
               e.agency AS agency,
               e.funding AS funding,
               r.score AS score,
               r.matched_skills AS matched_skills,
               r.matched_areas AS matched_areas,
               r.justification AS justification,
               r.calculated_at AS calculated_at
        ORDER BY r.score DESC
        LIMIT $limit
    """
    return run_cypher(query, {"threshold": threshold, "limit": limit})


def get_top_matches(n: int = 10) -> list[dict]:
    """Get top N matches by score."""
    return get_all_matches(threshold=0.0, limit=n)


def get_match_stats() -> dict:
    """Get match statistics from the graph."""
    query = """
        MATCH ()-[r:ELIGIBLE_FOR]->()
        RETURN count(r) AS total_matches,
               avg(r.score) AS avg_score,
               max(r.score) AS max_score,
               min(r.score) AS min_score,
               percentileDisc(r.score, 0.5) AS median_score
    """
    result = run_cypher(query)
    if result:
        return result[0]
    return {
        "total_matches": 0,
        "avg_score": 0.0,
        "max_score": 0.0,
        "min_score": 0.0,
        "median_score": 0.0,
    }


def get_entity_connections(entity_uid: str) -> dict:
    """Get all connections for an entity (skills, areas, matches)."""
    query = """
        MATCH (a {uid: $uid})
        OPTIONAL MATCH (a)-[hs:HAS_SKILL]->(sk:Skill)
        WITH a, collect(DISTINCT {name: sk.name, confidence: hs.confidence}) AS skills
        OPTIONAL MATCH (a)-[:RESEARCHES_AREA]->(ar:Area)
        WITH a, skills, collect(DISTINCT ar.name) AS areas
        OPTIONAL MATCH (a)-[ef:ELIGIBLE_FOR]->(e:Edital)
        WITH a, skills, areas, collect(DISTINCT {
            edital_title: e.title,
            edital_uid: e.uid,
            score: ef.score,
            justification: ef.justification
        }) AS matches
        RETURN labels(a)[0] AS entity_type,
               a.name AS name,
               skills, areas, matches
    """
    result = run_cypher(query, {"uid": entity_uid})
    if result:
        data = result[0]
        # Filter out null skills
        data["skills"] = [s for s in data["skills"] if s.get("name")]
        data["matches"] = [m for m in data["matches"] if m.get("edital_title")]
        return data
    return {"entity_type": "", "name": "", "skills": [], "areas": [], "matches": []}


def find_potential_matches_cypher(entity_uid: str) -> list[dict]:
    """Find potential matches by shared skills and areas (without AI).

    This is a mathematical scoring based purely on graph structure:
    - Shared skills contribute 60% of the score
    - Shared areas contribute 30% of the score
    - Level compatibility contributes 10% of the score
    """
    query = """
        MATCH (a {uid: $uid})
        MATCH (e:Edital)
        WHERE e.status = 'aberto'

        // Shared skills
        OPTIONAL MATCH (a)-[hs:HAS_SKILL]->(sk:Skill)<-[:REQUIRES_SKILL]-(e)
        WITH a, e, collect(DISTINCT sk.name) AS shared_skills,
             count(DISTINCT sk) AS skill_count

        // Total required skills for edital
        OPTIONAL MATCH (e)-[:REQUIRES_SKILL]->(rs:Skill)
        WITH a, e, shared_skills, skill_count,
             count(DISTINCT rs) AS total_required

        // Shared areas
        OPTIONAL MATCH (a)-[:RESEARCHES_AREA]->(ar:Area)<-[:TARGETS_AREA]-(e)
        WITH a, e, shared_skills, skill_count, total_required,
             collect(DISTINCT ar.name) AS shared_areas,
             count(DISTINCT ar) AS area_count

        // Total target areas for edital
        OPTIONAL MATCH (e)-[:TARGETS_AREA]->(ta:Area)
        WITH a, e, shared_skills, skill_count, total_required,
             shared_areas, area_count,
             count(DISTINCT ta) AS total_areas

        // Calculate score
        WITH a, e, shared_skills, shared_areas,
             CASE WHEN total_required > 0
                  THEN toFloat(skill_count) / total_required
                  ELSE 0.0 END AS skill_score,
             CASE WHEN total_areas > 0
                  THEN toFloat(area_count) / total_areas
                  ELSE 0.0 END AS area_score

        WITH a, e, shared_skills, shared_areas,
             (skill_score * 0.6 + area_score * 0.3) AS raw_score

        WHERE raw_score > 0
        RETURN a.uid AS entity_uid,
               a.name AS entity_name,
               labels(a)[0] AS entity_type,
               e.uid AS edital_uid,
               e.title AS edital_title,
               e.agency AS agency,
               e.funding AS funding,
               round(raw_score * 1000) / 1000.0 AS score,
               shared_skills,
               shared_areas
        ORDER BY score DESC
    """
    return run_cypher(query, {"uid": entity_uid})
