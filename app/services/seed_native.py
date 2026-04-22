from __future__ import annotations

"""Seed data — populate the graph using the native driver (works in both modes).

This is the universal seed that uses run_cypher directly, supporting
both Neo4j and in-memory graph store seamlessly.
"""

import uuid
import logging

from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════
# DATA DEFINITIONS
# ═══════════════════════════════════════════

SKILLS = [
    ("Python", "programacao"), ("Machine Learning", "ia"),
    ("Deep Learning", "ia"), ("NLP", "ia"),
    ("React", "programacao"), ("TypeScript", "programacao"),
    ("Neo4j", "banco_de_dados"), ("Graph Databases", "banco_de_dados"),
    ("Data Science", "ciencia_dados"), ("Computer Vision", "ia"),
    ("IoT", "hardware"), ("Embedded Systems", "hardware"),
    ("Docker", "devops"), ("FastAPI", "programacao"),
    ("LangChain", "ia"), ("Cybersecurity", "seguranca"),
    ("Cloud Computing", "devops"), ("TensorFlow", "ia"),
    ("Statistics", "ciencia_dados"), ("R", "ciencia_dados"),
]

AREAS = [
    "Inteligencia Artificial",
    "Ciencia de Dados",
    "Engenharia de Software",
    "Redes de Computadores",
    "Seguranca da Informacao",
    "Sistemas Embarcados",
    "Computacao em Nuvem",
    "Processamento de Linguagem Natural",
]

STUDENTS = [
    {"name": "Ana Carolina Silva", "institution": "UNINASSAU Gracas",
     "course": "Ciencia da Computacao", "semester": 7, "level": "graduacao",
     "bio": "Estudante focada em IA e processamento de dados",
     "skills": ["Python", "Machine Learning", "Data Science"],
     "areas": ["Inteligencia Artificial", "Ciencia de Dados"]},
    {"name": "Bruno Costa Oliveira", "institution": "UNINASSAU Gracas",
     "course": "Ciencia da Computacao", "semester": 5, "level": "graduacao",
     "bio": "Desenvolvimento web e sistemas distribuidos",
     "skills": ["React", "TypeScript", "FastAPI", "Docker"],
     "areas": ["Engenharia de Software"]},
    {"name": "Carla Mendes Santos", "institution": "UFPE",
     "course": "Engenharia da Computacao", "semester": 8, "level": "graduacao",
     "bio": "IoT e sistemas embarcados para cidades inteligentes",
     "skills": ["IoT", "Embedded Systems", "Python"],
     "areas": ["Sistemas Embarcados"]},
    {"name": "Daniel Ferreira Lima", "institution": "UNICAP",
     "course": "Sistemas de Informacao", "semester": 6, "level": "graduacao",
     "bio": "Seguranca cibernetica e redes",
     "skills": ["Cybersecurity", "Cloud Computing", "Docker"],
     "areas": ["Seguranca da Informacao", "Computacao em Nuvem"]},
    {"name": "Elena Rodrigues Pereira", "institution": "UFPE",
     "course": "Ciencia da Computacao", "semester": 3, "level": "mestrado",
     "bio": "Mestranda em NLP com foco em PLN para portugues",
     "skills": ["Python", "NLP", "Deep Learning", "TensorFlow"],
     "areas": ["Processamento de Linguagem Natural", "Inteligencia Artificial"]},
    {"name": "João Victor Mendes", "institution": "UNINASSAU Gracas",
     "course": "Sistemas de Informacao", "semester": 4, "level": "graduacao",
     "bio": "Focado em inovacao com React e automacao de banco de dados",
     "skills": ["React", "Neo4j", "Graph Databases", "TypeScript"],
     "areas": ["Engenharia de Software", "Ciencia de Dados"]},
    {"name": "Larissa Barros", "institution": "UNICAP",
     "course": "Ciencia da Computacao", "semester": 6, "level": "graduacao",
     "bio": "Pesquisadora iniciante em Data Science com interesse no SUS.",
     "skills": ["Python", "Statistics", "Data Science"],
     "areas": ["Ciencia de Dados"]},
]

RESEARCHERS = [
    {"name": "Dr. Marcos Aurelio Vasconcelos", "institution": "UFPE - CIn",
     "level": "doutorado",
     "bio": "Pesquisador em grafos de conhecimento e IA explicavel",
     "skills": ["Python", "Neo4j", "Graph Databases", "Machine Learning"],
     "areas": ["Inteligencia Artificial", "Ciencia de Dados"]},
    {"name": "Dra. Fernanda Albuquerque", "institution": "UFPE - CIn",
     "level": "pos-doutorado",
     "bio": "Especialista em NLP e modelos de linguagem",
     "skills": ["Python", "NLP", "Deep Learning", "LangChain"],
     "areas": ["Processamento de Linguagem Natural", "Inteligencia Artificial"]},
    {"name": "MSc. Ricardo Barros Neto", "institution": "UNINASSAU Gracas",
     "level": "mestrado",
     "bio": "Mestre em Engenharia de Software com foco em arquitetura cloud",
     "skills": ["Docker", "Cloud Computing", "FastAPI", "React"],
     "areas": ["Engenharia de Software", "Computacao em Nuvem"]},
    {"name": "Dr. Paulo Sergio Monteiro", "institution": "UNICAP",
     "level": "doutorado",
     "bio": "Pesquisador em seguranca e redes IoT",
     "skills": ["Cybersecurity", "IoT", "Embedded Systems"],
     "areas": ["Seguranca da Informacao", "Redes de Computadores"]},
    {"name": "Dra. Lucia Helena Campos", "institution": "UFPE",
     "level": "pos-doutorado",
     "bio": "Data Science aplicada a politicas publicas",
     "skills": ["Python", "Data Science", "Statistics", "R"],
     "areas": ["Ciencia de Dados"]},
]

PROFESSORS = [
    {"name": "Prof. Dr. Antonio Guimaraes", "institution": "UFPE - CIn",
     "department": "Ciencia da Computacao", "research_group": "GRIA",
     "bio": "Professor titular em IA e Machine Learning",
     "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow"],
     "areas": ["Inteligencia Artificial"]},
    {"name": "Prof. Dra. Maria Beatriz Lopes", "institution": "UNINASSAU Gracas",
     "department": "Sistemas de Informacao", "research_group": "NuPES",
     "bio": "Coordenadora de pesquisa em Engenharia de Software",
     "skills": ["React", "TypeScript", "Docker", "FastAPI"],
     "areas": ["Engenharia de Software"]},
    {"name": "Prof. Dr. Roberto Carlos Nascimento", "institution": "UNICAP",
     "department": "Computacao", "research_group": "LaSSI",
     "bio": "Pesquisador em seguranca cibernetica e privacidade",
     "skills": ["Cybersecurity", "Cloud Computing"],
     "areas": ["Seguranca da Informacao", "Computacao em Nuvem"]},
    {"name": "Prof. Dra. Sandra Maria Freitas", "institution": "UFPE",
     "department": "Estatistica e Informatica", "research_group": "CDLab",
     "bio": "Professora em ciencia de dados e estatistica aplicada",
     "skills": ["Python", "Data Science", "Statistics", "R"],
     "areas": ["Ciencia de Dados"]},
    {"name": "Prof. Dr. Joao Pedro Cavalcanti", "institution": "UFPE - CIn",
     "department": "Ciencia da Computacao", "research_group": "GPRT",
     "bio": "Especialista em IoT e sistemas embarcados para smart cities",
     "skills": ["IoT", "Embedded Systems", "Python"],
     "areas": ["Sistemas Embarcados", "Redes de Computadores"]},
    {"name": "Prof. Dr. Lucas Nogueira", "institution": "UNINASSAU Gracas",
     "department": "Redes de Computadores", "research_group": "REDES-Lab",
     "bio": "Focado e pioneiro em arquiteturas inovadoras Serverless e Cloud",
     "skills": ["Cloud Computing", "Docker", "Python", "FastAPI"],
     "areas": ["Computacao em Nuvem", "Redes de Computadores"]},
    {"name": "Prof. Dra. Amanda Vieira", "institution": "UFPE",
     "department": "Estatistica e Informatica", "research_group": "InovaDados",
     "bio": "Professora orientadora de mestrado em mineracao de grafos e data science",
     "skills": ["Graph Databases", "Neo4j", "R", "Data Science"],
     "areas": ["Ciencia de Dados", "Processamento de Linguagem Natural"]},
]

EDITAIS = [
    {"title": "FACEPE - Programa de Iniciacao Cientifica 2026",
     "description": "Bolsas para estudantes de graduacao em projetos de pesquisa",
     "agency": "FACEPE", "edital_type": "iniciacao_cientifica",
     "funding": 4800.0, "min_level": "graduacao", "status": "aberto",
     "required_skills": ["Python", "Data Science"],
     "target_areas": ["Ciencia de Dados", "Inteligencia Artificial"]},
    {"title": "CNPq - Universal 2026 - Faixa A",
     "description": "Apoio a projetos de pesquisa em todas as areas do conhecimento",
     "agency": "CNPq", "edital_type": "pesquisa",
     "funding": 30000.0, "min_level": "doutorado", "status": "aberto",
     "required_skills": ["Machine Learning", "Deep Learning"],
     "target_areas": ["Inteligencia Artificial"]},
    {"title": "FACEPE - APQ Inovacao Tecnologica",
     "description": "Apoio a projetos de inovacao com aplicacao em governo digital",
     "agency": "FACEPE", "edital_type": "pesquisa",
     "funding": 50000.0, "min_level": "mestrado", "status": "aberto",
     "required_skills": ["Neo4j", "Graph Databases", "Python"],
     "target_areas": ["Inteligencia Artificial", "Engenharia de Software"]},
    {"title": "CAPES - Bolsa de Mestrado 2026",
     "description": "Bolsas de mestrado para programas de pos-graduacao",
     "agency": "CAPES", "edital_type": "pesquisa",
     "funding": 24000.0, "min_level": "mestrado", "status": "aberto",
     "required_skills": ["Python", "NLP"],
     "target_areas": ["Processamento de Linguagem Natural"]},
    {"title": "Prefeitura do Recife - Smart City Challenge",
     "description": "Chamada para solucoes IoT para mobilidade urbana",
     "agency": "Prefeitura do Recife", "edital_type": "extensao",
     "funding": 100000.0, "min_level": "graduacao", "status": "aberto",
     "required_skills": ["IoT", "Embedded Systems", "Cloud Computing"],
     "target_areas": ["Sistemas Embarcados", "Computacao em Nuvem"]},
    {"title": "FACEPE - Programa de Pos-Doc 2026",
     "description": "Bolsas para pesquisadores pos-doutorais em instituicoes de PE",
     "agency": "FACEPE", "edital_type": "pesquisa",
     "funding": 72000.0, "min_level": "doutorado", "status": "aberto",
     "required_skills": ["Python", "Machine Learning", "Statistics"],
     "target_areas": ["Ciencia de Dados", "Inteligencia Artificial"]},
    {"title": "CNPq - Seguranca Cibernetica Nacional",
     "description": "Edital tematico em seguranca digital e privacidade",
     "agency": "CNPq", "edital_type": "pesquisa",
     "funding": 80000.0, "min_level": "doutorado", "status": "aberto",
     "required_skills": ["Cybersecurity", "Cloud Computing"],
     "target_areas": ["Seguranca da Informacao"]},
    {"title": "FACEPE - Hackathon Governo Digital 2026",
     "description": "Competicao de desenvolvimento de solucoes para servicos publicos",
     "agency": "FACEPE", "edital_type": "extensao",
     "funding": 15000.0, "min_level": "graduacao", "status": "aberto",
     "required_skills": ["React", "TypeScript", "FastAPI", "Docker"],
     "target_areas": ["Engenharia de Software"]},
    {"title": "MCTI - Fomento a Startups e IA",
     "description": "Subvencao economica para startups com forte embasamento em redes de P&D",
     "agency": "MCTI", "edital_type": "inovacao",
     "funding": 250000.0, "min_level": "graduacao", "status": "aberto",
     "required_skills": ["React", "TypeScript", "Python", "Docker"],
     "target_areas": ["Engenharia de Software", "Inteligencia Artificial"]},
    {"title": "FINEP - Pesquisa em Saúde e Dados",
     "description": "Ciencia de dados aplicada em prontuarios e melhoria do sistema publico de saude",
     "agency": "FINEP", "edital_type": "pesquisa",
     "funding": 120000.0, "min_level": "mestrado", "status": "aberto",
     "required_skills": ["R", "Statistics", "Data Science", "Machine Learning"],
     "target_areas": ["Ciencia de Dados"]},
]


# ═══════════════════════════════════════════
# SEED FUNCTIONS
# ═══════════════════════════════════════════

def _gen_uid() -> str:
    return str(uuid.uuid4())[:8]


def seed_native():
    """Seed database using native driver (works in both Neo4j and memory modes).

    Returns dict of uid mappings for reference.
    """
    print("🌱 Seeding graph data (universal driver)...")

    if is_memory_mode():
        store = get_memory_store()
        store.nodes.clear()
        store.edges.clear()
        return _seed_to_memory(store)
    else:
        run_cypher("MATCH (n) DETACH DELETE n")
        return _seed_to_neo4j()


def _seed_to_memory(store) -> dict:
    """Seed directly into MemoryGraphStore."""

    # Skills
    skill_uids = {}
    for name, cat in SKILLS:
        uid = _gen_uid()
        store.add_node(uid, ["Skill"], {"name": name, "category": cat})
        skill_uids[name] = uid
    print(f"  ✅ {len(SKILLS)} skills")

    # Areas
    area_uids = {}
    for name in AREAS:
        uid = _gen_uid()
        store.add_node(uid, ["Area"], {"name": name})
        area_uids[name] = uid
    print(f"  ✅ {len(AREAS)} areas")

    # Students
    for s in STUDENTS:
        uid = _gen_uid()
        store.add_node(uid, ["Student"], {
            "name": s["name"], "institution": s["institution"],
            "course": s["course"], "semester": s["semester"],
            "level": s["level"], "bio": s["bio"], "status": "ativo",
        })
        for sk in s["skills"]:
            if sk in skill_uids:
                store.add_edge(uid, skill_uids[sk], "HAS_SKILL",
                               {"confidence": 0.85, "provenance": "seed"})
        for area in s.get("areas", []):
            if area in area_uids:
                store.add_edge(uid, area_uids[area], "RESEARCHES_AREA",
                               {"provenance": "seed"})
    print(f"  ✅ {len(STUDENTS)} students")

    # Researchers
    for r in RESEARCHERS:
        uid = _gen_uid()
        store.add_node(uid, ["Researcher"], {
            "name": r["name"], "institution": r["institution"],
            "level": r["level"], "bio": r["bio"], "status": "ativo",
        })
        for sk in r["skills"]:
            if sk in skill_uids:
                store.add_edge(uid, skill_uids[sk], "HAS_SKILL",
                               {"confidence": 0.9, "provenance": "seed"})
        for area in r.get("areas", []):
            if area in area_uids:
                store.add_edge(uid, area_uids[area], "RESEARCHES_AREA",
                               {"provenance": "seed"})
    print(f"  ✅ {len(RESEARCHERS)} researchers")

    # Professors
    for p in PROFESSORS:
        uid = _gen_uid()
        store.add_node(uid, ["Professor"], {
            "name": p["name"], "institution": p["institution"],
            "department": p.get("department", ""),
            "research_group": p.get("research_group", ""),
            "level": "doutorado", "bio": p["bio"], "status": "ativo",
        })
        for sk in p["skills"]:
            if sk in skill_uids:
                store.add_edge(uid, skill_uids[sk], "HAS_SKILL",
                               {"confidence": 0.95, "provenance": "seed"})
        for area in p.get("areas", []):
            if area in area_uids:
                store.add_edge(uid, area_uids[area], "RESEARCHES_AREA",
                               {"provenance": "seed"})
    print(f"  ✅ {len(PROFESSORS)} professors")

    # Editais
    for e in EDITAIS:
        uid = _gen_uid()
        store.add_node(uid, ["Edital"], {
            "title": e["title"], "description": e["description"],
            "agency": e["agency"], "edital_type": e["edital_type"],
            "funding": e["funding"], "min_level": e["min_level"],
            "status": e.get("status", "aberto"),
        })
        for sk in e["required_skills"]:
            if sk in skill_uids:
                store.add_edge(uid, skill_uids[sk], "REQUIRES_SKILL",
                               {"priority": "essential", "provenance": "seed"})
        for area in e["target_areas"]:
            if area in area_uids:
                store.add_edge(uid, area_uids[area], "TARGETS_AREA",
                               {"provenance": "seed"})
    print(f"  ✅ {len(EDITAIS)} editais")

    total_nodes = store.count_nodes()
    total_edges = store.count_edges()
    print(f"\n🎉 Seed completo! {total_nodes} nós, {total_edges} arestas")
    return {"skill_uids": skill_uids, "area_uids": area_uids}


def _seed_to_neo4j() -> dict:
    """Seed via Cypher queries to real Neo4j."""

    # Skills
    skill_uids = {}
    for name, cat in SKILLS:
        uid = _gen_uid()
        run_cypher("""
            MERGE (s:Skill {name: $name})
            ON CREATE SET s.uid = $uid, s.category = $cat
            RETURN s.uid AS uid
        """, {"name": name, "uid": uid, "cat": cat})
        skill_uids[name] = uid
    print(f"  ✅ {len(SKILLS)} skills")

    # Areas
    area_uids = {}
    for name in AREAS:
        uid = _gen_uid()
        run_cypher("""
            MERGE (a:Area {name: $name})
            ON CREATE SET a.uid = $uid
            RETURN a.uid AS uid
        """, {"name": name, "uid": uid})
        area_uids[name] = uid
    print(f"  ✅ {len(AREAS)} areas")

    # Helper to create academic node
    def _create_academic(label, data, confidence):
        uid = _gen_uid()
        skills = data.pop("skills", [])
        areas = data.pop("areas", [])
        props = {**data, "uid": uid, "status": "ativo"}
        props_str = ", ".join(f"a.{k} = ${k}" for k in props)
        run_cypher(f"""
            CREATE (a:{label} {{uid: $uid}})
            SET {props_str}
        """, props)
        for sk in skills:
            if sk in skill_uids:
                run_cypher("""
                    MATCH (a {uid: $uid}), (s:Skill {name: $skill})
                    MERGE (a)-[:HAS_SKILL {confidence: $conf, provenance: 'seed'}]->(s)
                """, {"uid": uid, "skill": sk, "conf": confidence})
        for area in areas:
            if area in area_uids:
                run_cypher("""
                    MATCH (a {uid: $uid}), (ar:Area {name: $area})
                    MERGE (a)-[:RESEARCHES_AREA {provenance: 'seed'}]->(ar)
                """, {"uid": uid, "area": area})

    for s in STUDENTS:
        _create_academic("Student", {**s}, 0.85)
    print(f"  ✅ {len(STUDENTS)} students")

    for r in RESEARCHERS:
        _create_academic("Researcher", {**r}, 0.9)
    print(f"  ✅ {len(RESEARCHERS)} researchers")

    for p in PROFESSORS:
        p_copy = {**p, "level": "doutorado"}
        _create_academic("Professor", p_copy, 0.95)
    print(f"  ✅ {len(PROFESSORS)} professors")

    # Editais
    for e in EDITAIS:
        uid = _gen_uid()
        skills = e.pop("required_skills", []) if "required_skills" in e else e.get("required_skills", [])
        areas = e.pop("target_areas", []) if "target_areas" in e else e.get("target_areas", [])
        e_copy = {k: v for k, v in e.items() if k not in ("required_skills", "target_areas")}
        e_copy["uid"] = uid
        e_copy["status"] = "aberto"
        props_str = ", ".join(f"e.{k} = ${k}" for k in e_copy)
        run_cypher(f"""
            CREATE (e:Edital {{uid: $uid}})
            SET {props_str}
        """, e_copy)
        for sk in skills:
            if sk in skill_uids:
                run_cypher("""
                    MATCH (e:Edital {uid: $uid}), (s:Skill {name: $skill})
                    MERGE (e)-[:REQUIRES_SKILL {priority: 'essential', provenance: 'seed'}]->(s)
                """, {"uid": uid, "skill": sk})
        for area in areas:
            if area in area_uids:
                run_cypher("""
                    MATCH (e:Edital {uid: $uid}), (a:Area {name: $area})
                    MERGE (e)-[:TARGETS_AREA {provenance: 'seed'}]->(a)
                """, {"uid": uid, "area": area})
    print(f"  ✅ {len(EDITAIS)} editais")

    stats = run_cypher("""
        MATCH (n) WITH count(n) AS nodes
        MATCH ()-[r]->() WITH nodes, count(r) AS edges
        RETURN nodes, edges
    """)
    if stats:
        print(f"\n🎉 Seed completo! {stats[0]['nodes']} nós, {stats[0]['edges']} arestas")

    return {"skill_uids": skill_uids, "area_uids": area_uids}
