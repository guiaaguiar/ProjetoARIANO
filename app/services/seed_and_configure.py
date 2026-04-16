from __future__ import annotations

"""Seed + Pipeline — Populate graph and run AI agents to configure matches.

Usage:
    python -m app.services.seed_and_configure

Works in both modes:
- Neo4j available → uses real database
- Neo4j unavailable → uses in-memory graph store (automatic fallback)

Steps:
    1. Initialize database (auto-detect mode)
    2. Seed base data (Students, Researchers, Professors, Editais, Skills, Areas)
    3. Run ProfileAnalyzer on all academics
    4. Run EditalInterpreter on all editais
    5. Run EligibilityCalculator to create ELIGIBLE_FOR matches
"""

import logging
import time

from app.core.database import init_db
from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store
from app.services.seed_native import seed_native
from app.agents.profile_analyzer import ProfileAnalyzer
from app.agents.edital_interpreter import EditalInterpreter
from app.agents.eligibility_calculator import EligibilityCalculator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def _get_all_academics() -> list[dict]:
    """Get all academic entities from the graph."""
    if is_memory_mode():
        store = get_memory_store()
        results = []
        for label in ["Student", "Researcher", "Professor"]:
            for node in store.get_nodes_by_label(label):
                n = store.nodes.get(node["uid"], {})
                    "uid": node["uid"],
                    "type": label,
                    "name": node.get("name", ""),
                    "bio": node.get("bio", ""),
                    "curriculo_texto": node.get("curriculo_texto", ""),
                    "institution": node.get("institution", ""),
                    "course": node.get("course", ""),
                    "maturidade": node.get("maturidade", 0.0),
                })
        return results
    else:
        return run_cypher("""
            MATCH (a)
            WHERE a:Student OR a:Researcher OR a:Professor
            RETURN a.uid AS uid, labels(a)[0] AS type, a.name AS name,
                   a.bio AS bio, a.curriculo_texto AS curriculo_texto, 
                   a.institution AS institution,
                   a.course AS course, coalesce(a.maturidade, 0.0) AS maturidade
        """)


def _get_all_editais() -> list[dict]:
    """Get all editais from the graph."""
    if is_memory_mode():
        store = get_memory_store()
        results = []
        for node in store.get_nodes_by_label("Edital"):
            results.append({
                "uid": node["uid"],
                "title": node.get("title", ""),
                "description": node.get("description", ""),
                "instituicao": node.get("instituicao", ""),
                "edital_type": node.get("edital_type", "pesquisa"),
                "funding": node.get("funding", 0),
                "min_maturidade": node.get("min_maturidade", 0.0),
            })
        return results
    else:
        return run_cypher("""
            MATCH (e:Edital)
            RETURN e.uid AS uid, e.title AS title, e.description AS description,
                   e.instituicao AS instituicao, e.edital_type AS edital_type,
                   e.funding AS funding, coalesce(e.min_maturidade, 0.0) AS min_maturidade
        """)


def run_pipeline():
    """Run full AI pipeline after seed."""
    print("\n" + "=" * 60)
    print("🤖 ARIANO AI Pipeline — Configurando o Grafo")
    print("=" * 60)

    mode = "IN-MEMORY" if is_memory_mode() else "NEO4J"
    print(f"📦 Modo: {mode}")

    start = time.time()

    # Step 1: Profile Analysis
    print("\n📋 Fase 1: Analisando perfis acadêmicos (Orchestrator)...")
    from app.agents.orchestrator import OrchestratorAgent
    orchestrator = OrchestratorAgent()

    academics = _get_all_academics()
    for academic in academics:
        profile_data = {
            "name": academic.get("name", ""),
            "bio": academic.get("bio", ""),
            "curriculo_texto": academic.get("curriculo_texto", ""),
            "institution": academic.get("institution", ""),
            "course": academic.get("course", ""),
            "maturidade": academic.get("maturidade", 0.0),
            "skills": [],
        }
        try:
            # We just do analysis step to avoid calculating matches before editais are interpreted
            deep_context = orchestrator.analyzer.analyze_and_configure(academic["uid"], academic["type"], profile_data)
        except Exception as e:
            logger.warning(f"   ⚠️ Skipping {academic['name']}: {e}")
    print(f"  ✅ {len(academics)} perfis analisados via CoT")

    # Step 2: Edital Interpretation
    print("\n📜 Fase 2: Interpretando editais...")
    interpreter = EditalInterpreter()

    editais = _get_all_editais()
    for edital in editais:
        edital_data = {
            "title": edital.get("title", ""),
            "description": edital.get("description", ""),
            "instituicao": edital.get("instituicao", ""),
            "edital_type": edital.get("edital_type", "pesquisa"),
            "funding": edital.get("funding", 0),
            "min_maturidade": edital.get("min_maturidade", 0.0),
            "required_skills": [],
            "target_areas": [],
        }
        try:
            interpreter.interpret_and_configure(edital["uid"], edital_data)
        except Exception as e:
            logger.warning(f"   ⚠️ Skipping {edital['title']}: {e}")
    print(f"  ✅ {len(editais)} editais interpretados")

    # Step 3: Calculate Matches
    print("\n🎯 Fase 3: Calculando elegibilidades (ELIGIBLE_FOR)...")
    calculator = EligibilityCalculator()
    result = calculator.calculate_all_matches()

    print(f"  ✅ {result['matches_created']} matches criados")
    print(f"  📊 {result['total_pairs_calculated']} pares analisados")

    elapsed = time.time() - start

    # Print top matches
    if result.get("top_matches"):
        print("\n🏆 Top 10 Matches:")
        print("-" * 60)
        for i, match in enumerate(result["top_matches"][:10], 1):
            score_pct = match['score'] * 100
            print(f"  {i}. {match['entity']} → {match['edital']}: {score_pct:.0f}%")

    # Print graph stats
    if is_memory_mode():
        store = get_memory_store()
        total_nodes = store.count_nodes()
        total_edges = store.count_edges()
        print(f"\n📈 Grafo Final: {total_nodes} nós, {total_edges} arestas")
    else:
        stats = run_cypher("""
            MATCH (n) WITH count(n) AS nodes
            MATCH ()-[r]->() WITH nodes, count(r) AS edges
            RETURN nodes, edges
        """)
        if stats:
            print(f"\n📈 Grafo Final: {stats[0]['nodes']} nós, {stats[0]['edges']} arestas")

    print(f"\n⏱️ Pipeline concluído em {elapsed:.2f}s")
    print("=" * 60)

    return result


def seed_and_configure():
    """Full setup: seed data + run AI pipeline."""
    init_db()
    seed_native()
    run_pipeline()


if __name__ == "__main__":
    seed_and_configure()
