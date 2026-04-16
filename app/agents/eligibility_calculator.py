"""EligibilityCalculator Agent — Calculates match scores and creates ELIGIBLE_FOR edges.

This is the MAIN agent of ARIANO. It:
1. Traverses the Neo4j graph to find potential matches
2. Calculates a multi-dimensional eligibility score using:
   - Skill overlap (weighted by confidence and priority)
   - Area alignment
   - Academic level compatibility
   - Institutional diversity bonus
3. Uses LLM to generate human-readable justifications
4. Creates ELIGIBLE_FOR edges with scores in Neo4j

LLM: NVIDIA Nemotron 3 Super (120B MoE, 12B active) via OpenRouter
The result is a pre-computed graph where matches = O(1) Cypher queries.
Part of PHASE 1 (Graph Configuration) — runs offline/async.
"""

import json
import logging
from datetime import datetime

from app.core.config import settings
from app.core.neo4j_driver import run_cypher

logger = logging.getLogger(__name__)

# Weights for score components
WEIGHTS = {
    "skill_overlap": 0.45,
    "area_alignment": 0.25,
    "maturidade_compatibility": 0.15,
    "priority_bonus": 0.15,
}


class EligibilityCalculator:
    """AI Agent that calculates eligibility scores and creates match edges."""

    def __init__(self):
        self.llm = None
        self._init_llm()

    def _init_llm(self):
        """Initialize LLM via OpenRouter (NVIDIA Nemotron 3 Super) for justifications."""
        if settings.openrouter_api_key:
            try:
                from langchain_openai import ChatOpenAI
                self.llm = ChatOpenAI(
                    model=settings.openrouter_model,
                    openai_api_key=settings.openrouter_api_key,
                    openai_api_base=settings.openrouter_base_url,
                    temperature=0.3,
                    max_tokens=512,
                    default_headers={
                        "HTTP-Referer": "https://github.com/guiaaguiar/ProjetoARIANO",
                        "X-Title": "ARIANO - EligibilityCalculator Agent",
                    },
                )
                logger.info("✅ EligibilityCalculator: Nemotron 3 Super LLM initialized via OpenRouter")
            except Exception as e:
                logger.warning(f"⚠️ EligibilityCalculator: Could not init LLM: {e}")
                self.llm = None
        else:
            logger.info("ℹ️ EligibilityCalculator: No API key, using mathematical scoring only")

    def calculate_all_matches(self) -> dict:
        """Calculate eligibility for ALL academic entities against ALL editais."""
        academics = run_cypher("""
            MATCH (a)
            WHERE a:Student OR a:Researcher OR a:Professor
            RETURN a.uid AS uid, a.name AS name, labels(a)[0] AS type,
                   coalesce(a.maturidade, 0.0) AS maturidade, a.institution AS institution
        """)

        editais = run_cypher("""
            MATCH (e:Edital)
            WHERE e.status = 'aberto'
            RETURN e.uid AS uid, e.title AS title, coalesce(e.min_maturidade, 0.0) AS min_maturidade,
                   e.instituicao AS instituicao, e.funding AS funding
        """)

        total_matches = 0
        total_calculated = 0
        results = []

        for academic in academics:
            for edital in editais:
                total_calculated += 1
                score_data = self._calculate_score(academic["uid"], edital["uid"])

                if score_data["score"] > 0.1:
                    self._create_eligible_for_edge(
                        academic["uid"],
                        academic["type"],
                        edital["uid"],
                        score_data,
                    )
                    total_matches += 1
                    results.append({
                        "entity": academic["name"],
                        "edital": edital["title"],
                        "score": score_data["score"],
                    })

        logger.info(
            f"✅ EligibilityCalculator: Calculated {total_calculated} pairs, "
            f"created {total_matches} ELIGIBLE_FOR edges"
        )

        return {
            "total_pairs_calculated": total_calculated,
            "matches_created": total_matches,
            "top_matches": sorted(results, key=lambda x: x["score"], reverse=True)[:10],
        }

    def calculate_for_entity(self, entity_uid: str) -> dict:
        """Calculate eligibility for a specific entity against all editais."""
        entity = run_cypher(
            """
            MATCH (a {uid: $uid})
            WHERE a:Student OR a:Researcher OR a:Professor
            RETURN a.uid AS uid, a.name AS name, labels(a)[0] AS type,
                   coalesce(a.maturidade, 0.0) AS maturidade, a.institution AS institution
            """,
            {"uid": entity_uid},
        )

        if not entity:
            return {"error": "Entity not found"}

        entity = entity[0]
        editais = run_cypher("""
            MATCH (e:Edital) WHERE e.status = 'aberto'
            RETURN e.uid AS uid, e.title AS title
        """)

        matches = []
        for edital in editais:
            score_data = self._calculate_score(entity_uid, edital["uid"])
            if score_data["score"] > 0.1:
                self._create_eligible_for_edge(
                    entity_uid, entity["type"], edital["uid"], score_data
                )
                matches.append({
                    "edital": edital["title"],
                    "score": score_data["score"],
                    "justification": score_data["justification"],
                })

        return {
            "entity_name": entity["name"],
            "matches_found": len(matches),
            "matches": sorted(matches, key=lambda x: x["score"], reverse=True),
        }

    def calculate_for_edital(self, edital_uid: str) -> dict:
        """Calculate eligibility for all academics against a specific edital."""
        edital = run_cypher(
            "MATCH (e:Edital {uid: $uid}) RETURN e.title AS title",
            {"uid": edital_uid},
        )

        if not edital:
            return {"error": "Edital not found"}

        academics = run_cypher("""
            MATCH (a) WHERE a:Student OR a:Researcher OR a:Professor
            RETURN a.uid AS uid, a.name AS name, labels(a)[0] AS type
        """)

        matches = []
        for academic in academics:
            score_data = self._calculate_score(academic["uid"], edital_uid)
            if score_data["score"] > 0.1:
                self._create_eligible_for_edge(
                    academic["uid"], academic["type"], edital_uid, score_data
                )
                matches.append({
                    "entity": academic["name"],
                    "type": academic["type"],
                    "score": score_data["score"],
                    "justification": score_data["justification"],
                })

        return {
            "edital_title": edital[0]["title"],
            "matches_found": len(matches),
            "matches": sorted(matches, key=lambda x: x["score"], reverse=True),
        }

    def _calculate_score(self, entity_uid: str, edital_uid: str) -> dict:
        """Calculate the multi-dimensional eligibility score.

        Score = skill_overlap*0.45 + area_alignment*0.25 + level*0.15 + priority*0.15
        """
        skill_data = run_cypher(
            """
            MATCH (a {uid: $entity_uid})-[hs:HAS_SKILL]->(sk:Skill)<-[rs:REQUIRES_SKILL]-(e:Edital {uid: $edital_uid})
            RETURN sk.name AS skill_name, hs.confidence AS confidence,
                   rs.priority AS priority
            """,
            {"entity_uid": entity_uid, "edital_uid": edital_uid},
        )

        total_required = run_cypher(
            "MATCH (e:Edital {uid: $uid})-[:REQUIRES_SKILL]->(s:Skill) RETURN count(s) AS total",
            {"uid": edital_uid},
        )
        total_req_count = total_required[0]["total"] if total_required else 0

        area_data = run_cypher(
            """
            MATCH (a {uid: $entity_uid})-[:RESEARCHES_AREA]->(ar:Area)<-[:TARGETS_AREA]-(e:Edital {uid: $edital_uid})
            RETURN ar.name AS area_name
            """,
            {"entity_uid": entity_uid, "edital_uid": edital_uid},
        )

        total_areas = run_cypher(
            "MATCH (e:Edital {uid: $uid})-[:TARGETS_AREA]->(a:Area) RETURN count(a) AS total",
            {"uid": edital_uid},
        )
        total_area_count = total_areas[0]["total"] if total_areas else 0

        maturidade_data = run_cypher(
            """
            MATCH (a {uid: $entity_uid}), (e:Edital {uid: $edital_uid})
            RETURN coalesce(a.maturidade, 0.0) AS entity_mat, coalesce(e.min_maturidade, 0.0) AS min_mat
            """,
            {"entity_uid": entity_uid, "edital_uid": edital_uid},
        )

        # 1. Skill overlap (45%)
        matched_skills = [s["skill_name"] for s in skill_data]
        skill_score = len(matched_skills) / max(total_req_count, 1)
        skill_score = min(skill_score, 1.0)

        # 2. Area alignment (25%)
        matched_areas = [a["area_name"] for a in area_data]
        area_score = len(matched_areas) / max(total_area_count, 1)
        area_score = min(area_score, 1.0)

        # 3. Maturidade compatibility (15%)
        maturidade_score = 0.0
        if maturidade_data:
            entity_mat = maturidade_data[0].get("entity_mat", 0.0)
            min_mat = maturidade_data[0].get("min_mat", 0.0)
            if entity_mat >= min_mat:
                maturidade_score = 1.0
            elif entity_mat >= min_mat - 2.0:
                maturidade_score = 0.5

        # 4. Priority bonus (15%)
        essential_matches = sum(1 for s in skill_data if s.get("priority") == "essential")
        total_essential = len(run_cypher(
            """
            MATCH (e:Edital {uid: $uid})-[r:REQUIRES_SKILL]->(s:Skill)
            WHERE r.priority = 'essential'
            RETURN s.name
            """,
            {"uid": edital_uid},
        ))
        priority_score = essential_matches / max(total_essential, 1)
        priority_score = min(priority_score, 1.0)

        # Weighted final score
        final_score = (
            skill_score * WEIGHTS["skill_overlap"]
            + area_score * WEIGHTS["area_alignment"]
            + maturidade_score * WEIGHTS["maturidade_compatibility"]
            + priority_score * WEIGHTS["priority_bonus"]
        )
        final_score = round(min(final_score, 1.0), 3)

        justification = self._generate_justification(
            matched_skills, matched_areas, final_score, maturidade_score, skill_score, area_score
        )

        return {
            "score": final_score,
            "matched_skills": matched_skills,
            "matched_areas": matched_areas,
            "justification": justification,
            "components": {
                "skill_overlap": round(skill_score, 3),
                "area_alignment": round(area_score, 3),
                "maturidade_compatibility": round(maturidade_score, 3),
                "priority_bonus": round(priority_score, 3),
            },
        }

    def _generate_justification(
        self, matched_skills, matched_areas, score, maturidade_score, skill_score, area_score,
    ) -> str:
        """Generate a human-readable justification for the match score."""
        if self.llm and score > 0.3:
            try:
                prompt = f"""Gere uma justificativa BREVE (máximo 2 frases) em português para este match acadêmico:
- Score: {score*100:.0f}%
- Skills compartilhados: {', '.join(matched_skills) if matched_skills else 'nenhum'}
- Áreas alinhadas: {', '.join(matched_areas) if matched_areas else 'nenhuma'}
- Maturidade: {'Plena' if maturidade_score >= 1.0 else 'Parcial' if maturidade_score > 0 else 'Baixa'}

Responda APENAS com a justificativa, sem formatação."""
                response = self.llm.invoke(prompt)
                return response.content.strip()
            except Exception:
                pass

        # Fallback: rule-based justification
        parts = []
        if matched_skills:
            parts.append(f"Skills em comum: {', '.join(matched_skills[:3])}")
        if matched_areas:
            parts.append(f"Áreas alinhadas: {', '.join(matched_areas[:2])}")
        if maturidade_score >= 1.0:
            parts.append("Maturidade acadêmica alinhada")
        elif maturidade_score > 0:
            parts.append("Maturidade acadêmica parcialmente alinhada")

        pct = f"{score*100:.0f}%"
        if parts:
            return f"Aderência de {pct}. {'. '.join(parts)}."
        return f"Aderência de {pct} baseada na análise de compatibilidade."

    def _create_eligible_for_edge(self, entity_uid, entity_type, edital_uid, score_data):
        """Create or update ELIGIBLE_FOR edge in Neo4j."""
        run_cypher(
            f"""
            MATCH (a:{entity_type} {{uid: $entity_uid}})
            MATCH (e:Edital {{uid: $edital_uid}})
            MERGE (a)-[r:ELIGIBLE_FOR]->(e)
            SET r.score = $score,
                r.matched_skills = $matched_skills,
                r.matched_areas = $matched_areas,
                r.justification = $justification,
                r.calculated_by = 'agent:EligibilityCalculator',
                r.calculated_at = datetime()
            """,
            {
                "entity_uid": entity_uid,
                "edital_uid": edital_uid,
                "score": score_data["score"],
                "matched_skills": score_data["matched_skills"],
                "matched_areas": score_data["matched_areas"],
                "justification": score_data["justification"],
            },
        )

    def recalculate_all(self) -> dict:
        """Clear all existing matches and recalculate from scratch."""
        run_cypher("MATCH ()-[r:ELIGIBLE_FOR]->() DELETE r")
        logger.info("🗑️ Cleared all existing ELIGIBLE_FOR edges")
        return self.calculate_all_matches()
