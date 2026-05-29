from __future__ import annotations

"""CRUD service layer — Neo4j Aura only. No in-memory fallback."""

import logging
import uuid
import datetime

from app.core.neo4j_driver import run_cypher
from app.models.schemas import (
    SkillResponse, AreaResponse,
    StudentCreate, StudentResponse,
    DocenteCreate, DocenteResponse,
    EditalCreate, EditalResponse,
    GraphNode, GraphEdge, GraphData,
    MatchResponse, DashboardStats,
)

logger = logging.getLogger(__name__)

# ─── Node color mapping ───
NODE_COLORS = {
    "edital": "#0ea5e9",
    "student": "#06b6d4",
    "docente": "#10b981",
    "skill": "#8b5cf6",
    "area": "#6366f1",
}

NODE_SIZES = {
    "edital": 12,
    "student": 8,
    "docente": 9,
    "skill": 5,
    "area": 5,
}


# ═══════════════════════════════════════════
# HELPER — Get neomodel models
# ═══════════════════════════════════════════

def _neomodel():
    """Lazy import neomodel models — only used when neomodel ORM is needed."""
    from app.models.graph import Student, Docente, Edital, Skill, Area
    return Student, Docente, Edital, Skill, Area


# ═══════════════════════════════════════════
# SKILL CRUD
# ═══════════════════════════════════════════

def list_skills() -> list[SkillResponse]:
    results = run_cypher("MATCH (s:Skill) RETURN s.uid AS uid, s.name AS name, s.category AS category")
    return [SkillResponse(uid=r["uid"] or "", name=r["name"] or "", category=r["category"] or "") for r in results]


def create_skill(data) -> SkillResponse:
    uid = str(uuid.uuid4())[:8]
    run_cypher(
        "MERGE (s:Skill {name: $name}) ON CREATE SET s.uid = $uid, s.category = $category",
        {"name": data.name, "uid": uid, "category": data.category},
    )
    row = run_cypher("MATCH (s:Skill {name: $name}) RETURN s.uid AS uid, s.name AS name, s.category AS category", {"name": data.name})
    r = row[0] if row else {}
    return SkillResponse(uid=r.get("uid", uid), name=data.name, category=data.category)


def delete_skill(uid: str) -> bool:
    run_cypher("MATCH (s:Skill {uid: $uid}) DETACH DELETE s", {"uid": uid})
    return True


# ═══════════════════════════════════════════
# AREA CRUD
# ═══════════════════════════════════════════

def list_areas() -> list[AreaResponse]:
    results = run_cypher("MATCH (a:Area) RETURN a.uid AS uid, a.name AS name, a.parent_area AS parent_area")
    return [AreaResponse(uid=r["uid"] or "", name=r["name"] or "", parent_area=r.get("parent_area") or "") for r in results]


def create_area(data) -> AreaResponse:
    uid = str(uuid.uuid4())[:8]
    run_cypher(
        "MERGE (a:Area {name: $name}) ON CREATE SET a.uid = $uid, a.parent_area = $parent_area",
        {"name": data.name, "uid": uid, "parent_area": data.parent_area or ""},
    )
    row = run_cypher("MATCH (a:Area {name: $name}) RETURN a.uid AS uid, a.name AS name, a.parent_area AS parent_area", {"name": data.name})
    r = row[0] if row else {}
    return AreaResponse(uid=r.get("uid", uid), name=data.name, parent_area=data.parent_area or "")


def delete_area(uid: str) -> bool:
    run_cypher("MATCH (a:Area {uid: $uid}) DETACH DELETE a", {"uid": uid})
    return True


# ═══════════════════════════════════════════
# STUDENT CRUD
# ═══════════════════════════════════════════

def list_students() -> list[StudentResponse]:
    results = run_cypher("""
        MATCH (s:Student)
        OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)
        RETURN s.uid AS uid, s.name AS name, s.email AS email,
               s.institution AS institution, s.course AS course,
               s.semester AS semester, s.bio AS bio,
               s.curriculo_texto AS curriculo_texto,
               s.maturidade AS maturidade, s.o_que_busco AS o_que_busco,
               collect({uid: sk.uid, name: sk.name, category: sk.category}) AS skills
    """)
    return [_map_student(r) for r in results]


def get_student(uid: str) -> StudentResponse | None:
    results = run_cypher("""
        MATCH (s:Student {uid: $uid})
        OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)
        RETURN s.uid AS uid, s.name AS name, s.email AS email,
               s.institution AS institution, s.course AS course,
               s.semester AS semester, s.bio AS bio,
               s.curriculo_texto AS curriculo_texto,
               s.maturidade AS maturidade, s.o_que_busco AS o_que_busco,
               collect({uid: sk.uid, name: sk.name, category: sk.category}) AS skills
    """, {"uid": uid})
    return _map_student(results[0]) if results else None


def _map_student(r: dict) -> StudentResponse:
    raw_skills = r.get("skills") or []
    skills = [
        SkillResponse(uid=s.get("uid") or "", name=s.get("name") or "", category=s.get("category") or "")
        for s in raw_skills if s.get("name")
    ]
    return StudentResponse(
        uid=r.get("uid") or "", name=r.get("name") or "", email=r.get("email") or "",
        institution=r.get("institution") or "", course=r.get("course") or "",
        semester=r.get("semester") or 1, bio=r.get("bio") or "",
        curriculo_texto=r.get("curriculo_texto") or "",
        maturidade=r.get("maturidade") or 0.0, o_que_busco=r.get("o_que_busco") or "",
        skills=skills,
    )


def create_student(data: StudentCreate) -> StudentResponse:
    from app.core.security import get_password_hash
    uid = str(uuid.uuid4())[:8]
    run_cypher("""
        CREATE (s:Student {
            uid: $uid, name: $name, email: $email, password_hash: $password_hash,
            institution: $institution, course: $course, semester: $semester,
            bio: $bio, curriculo_texto: $curriculo_texto,
            maturidade: $maturidade, o_que_busco: $o_que_busco,
            created_at: $created_at
        })
    """, {
        "uid": uid, "name": data.name, "email": data.email,
        "password_hash": get_password_hash(data.password) if data.password else "",
        "institution": data.institution, "course": data.course, "semester": data.semester,
        "bio": data.bio, "curriculo_texto": data.curriculo_texto,
        "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
        "created_at": datetime.datetime.now().isoformat(),
    })
    return get_student(uid)


def update_student(uid: str, data: StudentCreate) -> StudentResponse | None:
    run_cypher("""
        MATCH (s:Student {uid: $uid})
        SET s.name = $name, s.email = $email, s.institution = $institution,
            s.course = $course, s.semester = $semester, s.bio = $bio,
            s.curriculo_texto = $curriculo_texto, s.maturidade = $maturidade,
            s.o_que_busco = $o_que_busco, s.updated_at = $updated_at
    """, {
        "uid": uid, "name": data.name, "email": data.email,
        "institution": data.institution, "course": data.course, "semester": data.semester,
        "bio": data.bio, "curriculo_texto": data.curriculo_texto,
        "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
        "updated_at": datetime.datetime.now().isoformat(),
    })
    return get_student(uid)


def delete_student(uid: str) -> bool:
    run_cypher("MATCH (s:Student {uid: $uid}) DETACH DELETE s", {"uid": uid})
    return True


# ═══════════════════════════════════════════
# DOCENTE CRUD  (unified Researcher + Professor)
# ═══════════════════════════════════════════

def list_docentes() -> list[DocenteResponse]:
    results = run_cypher("""
        MATCH (d:Docente)
        OPTIONAL MATCH (d)-[:HAS_SKILL]->(sk:Skill)
        OPTIONAL MATCH (d)-[:RESEARCHES_AREA]->(a:Area)
        RETURN d.uid AS uid, d.name AS name, d.email AS email,
               d.institution AS institution, d.department AS department,
               d.research_group AS research_group, d.cargo AS cargo,
               d.bio AS bio, d.curriculo_texto AS curriculo_texto,
               d.maturidade AS maturidade, d.o_que_busco AS o_que_busco,
               collect(DISTINCT {uid: sk.uid, name: sk.name, category: sk.category}) AS skills,
               collect(DISTINCT {uid: a.uid, name: a.name, parent_area: a.parent_area}) AS areas
    """)
    return [_map_docente(r) for r in results]


def get_docente(uid: str) -> DocenteResponse | None:
    results = run_cypher("""
        MATCH (d:Docente {uid: $uid})
        OPTIONAL MATCH (d)-[:HAS_SKILL]->(sk:Skill)
        OPTIONAL MATCH (d)-[:RESEARCHES_AREA]->(a:Area)
        RETURN d.uid AS uid, d.name AS name, d.email AS email,
               d.institution AS institution, d.department AS department,
               d.research_group AS research_group, d.cargo AS cargo,
               d.bio AS bio, d.curriculo_texto AS curriculo_texto,
               d.maturidade AS maturidade, d.o_que_busco AS o_que_busco,
               collect(DISTINCT {uid: sk.uid, name: sk.name, category: sk.category}) AS skills,
               collect(DISTINCT {uid: a.uid, name: a.name, parent_area: a.parent_area}) AS areas
    """, {"uid": uid})
    return _map_docente(results[0]) if results else None


def _map_docente(r: dict) -> DocenteResponse:
    skills = [
        SkillResponse(uid=s.get("uid") or "", name=s.get("name") or "", category=s.get("category") or "")
        for s in (r.get("skills") or []) if s.get("name")
    ]
    areas = [
        AreaResponse(uid=a.get("uid") or "", name=a.get("name") or "", parent_area=a.get("parent_area") or "")
        for a in (r.get("areas") or []) if a.get("name")
    ]
    return DocenteResponse(
        uid=r.get("uid") or "", name=r.get("name") or "", email=r.get("email") or "",
        institution=r.get("institution") or "", department=r.get("department") or "",
        research_group=r.get("research_group") or "", cargo=r.get("cargo") or "pesquisador",
        bio=r.get("bio") or "", curriculo_texto=r.get("curriculo_texto") or "",
        maturidade=r.get("maturidade") or 0.0, o_que_busco=r.get("o_que_busco") or "",
        skills=skills, areas=areas,
    )


def create_docente(data: DocenteCreate) -> DocenteResponse:
    from app.core.security import get_password_hash
    uid = str(uuid.uuid4())[:8]
    run_cypher("""
        CREATE (d:Docente {
            uid: $uid, name: $name, email: $email, password_hash: $password_hash,
            institution: $institution, department: $department,
            research_group: $research_group, cargo: $cargo,
            bio: $bio, curriculo_texto: $curriculo_texto,
            maturidade: $maturidade, o_que_busco: $o_que_busco,
            created_at: $created_at
        })
    """, {
        "uid": uid, "name": data.name, "email": data.email,
        "password_hash": get_password_hash(data.password) if data.password else "",
        "institution": data.institution, "department": data.department,
        "research_group": data.research_group, "cargo": data.cargo,
        "bio": data.bio, "curriculo_texto": data.curriculo_texto,
        "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
        "created_at": datetime.datetime.now().isoformat(),
    })
    return get_docente(uid)


def update_docente(uid: str, data: DocenteCreate) -> DocenteResponse | None:
    run_cypher("""
        MATCH (d:Docente {uid: $uid})
        SET d.name = $name, d.email = $email, d.institution = $institution,
            d.department = $department, d.research_group = $research_group,
            d.cargo = $cargo, d.bio = $bio, d.curriculo_texto = $curriculo_texto,
            d.maturidade = $maturidade, d.o_que_busco = $o_que_busco,
            d.updated_at = $updated_at
    """, {
        "uid": uid, "name": data.name, "email": data.email,
        "institution": data.institution, "department": data.department,
        "research_group": data.research_group, "cargo": data.cargo,
        "bio": data.bio, "curriculo_texto": data.curriculo_texto,
        "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
        "updated_at": datetime.datetime.now().isoformat(),
    })
    return get_docente(uid)


def delete_docente(uid: str) -> bool:
    run_cypher("MATCH (d:Docente {uid: $uid}) DETACH DELETE d", {"uid": uid})
    return True


# Backward-compat aliases for routes not yet fully migrated
list_researchers = list_docentes
get_researcher = get_docente
create_researcher = create_docente
update_researcher = update_docente
delete_researcher = delete_docente
list_professors = list_docentes
get_professor = get_docente
create_professor = create_docente
update_professor = update_docente
delete_professor = delete_docente


# ═══════════════════════════════════════════
# EDITAL CRUD
# ═══════════════════════════════════════════

def list_editais() -> list[EditalResponse]:
    results = run_cypher("""
        MATCH (e:Edital)
        OPTIONAL MATCH (e)-[:REQUIRES_SKILL]->(sk:Skill)
        OPTIONAL MATCH (e)-[:TARGETS_AREA]->(a:Area)
        RETURN e.uid AS uid, e.title AS title, e.description AS description,
               e.instituicao AS instituicao, e.edital_type AS edital_type,
               e.funding AS funding, e.deadline AS deadline,
               e.min_maturidade AS min_maturidade, e.status AS status,
               collect(DISTINCT {uid: sk.uid, name: sk.name, category: sk.category}) AS required_skills,
               collect(DISTINCT {uid: a.uid, name: a.name, parent_area: a.parent_area}) AS target_areas
    """)
    return [_map_edital(r) for r in results]


def get_edital(uid: str) -> EditalResponse | None:
    results = run_cypher("""
        MATCH (e:Edital {uid: $uid})
        OPTIONAL MATCH (e)-[:REQUIRES_SKILL]->(sk:Skill)
        OPTIONAL MATCH (e)-[:TARGETS_AREA]->(a:Area)
        RETURN e.uid AS uid, e.title AS title, e.description AS description,
               e.instituicao AS instituicao, e.edital_type AS edital_type,
               e.funding AS funding, e.deadline AS deadline,
               e.min_maturidade AS min_maturidade, e.status AS status,
               collect(DISTINCT {uid: sk.uid, name: sk.name, category: sk.category}) AS required_skills,
               collect(DISTINCT {uid: a.uid, name: a.name, parent_area: a.parent_area}) AS target_areas
    """, {"uid": uid})
    return _map_edital(results[0]) if results else None


def _map_edital(r: dict) -> EditalResponse:
    skills = [
        SkillResponse(uid=s.get("uid") or "", name=s.get("name") or "", category=s.get("category") or "")
        for s in (r.get("required_skills") or []) if s.get("name")
    ]
    areas = [
        AreaResponse(uid=a.get("uid") or "", name=a.get("name") or "", parent_area=a.get("parent_area") or "")
        for a in (r.get("target_areas") or []) if a.get("name")
    ]
    return EditalResponse(
        uid=r.get("uid") or "", title=r.get("title") or "", description=r.get("description") or "",
        instituicao=r.get("instituicao") or "", edital_type=r.get("edital_type") or "pesquisa",
        funding=r.get("funding") or 0.0, deadline=r.get("deadline") or "",
        min_maturidade=r.get("min_maturidade") or 0.0, status=r.get("status") or "aberto",
        required_skills=skills, target_areas=areas,
    )


def create_edital(data: EditalCreate) -> EditalResponse:
    uid = str(uuid.uuid4())[:8]
    run_cypher("""
        CREATE (e:Edital {
            uid: $uid, title: $title, description: $description,
            instituicao: $instituicao, edital_type: $edital_type,
            funding: $funding, deadline: $deadline,
            min_maturidade: $min_maturidade, status: 'aberto',
            created_at: $created_at
        })
    """, {
        "uid": uid, "title": data.title, "description": data.description,
        "instituicao": data.instituicao, "edital_type": data.edital_type,
        "funding": data.funding, "deadline": data.deadline,
        "min_maturidade": data.min_maturidade,
        "created_at": datetime.datetime.now().isoformat(),
    })
    return get_edital(uid)


def update_edital(uid: str, data: EditalCreate) -> EditalResponse | None:
    run_cypher("""
        MATCH (e:Edital {uid: $uid})
        SET e.title = $title, e.description = $description, e.instituicao = $instituicao,
            e.edital_type = $edital_type, e.funding = $funding, e.deadline = $deadline,
            e.min_maturidade = $min_maturidade, e.updated_at = $updated_at
    """, {
        "uid": uid, "title": data.title, "description": data.description,
        "instituicao": data.instituicao, "edital_type": data.edital_type,
        "funding": data.funding, "deadline": data.deadline,
        "min_maturidade": data.min_maturidade,
        "updated_at": datetime.datetime.now().isoformat(),
    })
    return get_edital(uid)


def delete_edital(uid: str) -> bool:
    run_cypher("MATCH (e:Edital {uid: $uid}) DETACH DELETE e", {"uid": uid})
    return True


# ═══════════════════════════════════════════
# MATCH ENGINE (Pure Cypher)
# ═══════════════════════════════════════════

def get_matches(entity_uid: str | None = None, threshold: float = 0.0) -> list[MatchResponse]:
    today_str = datetime.date.today().isoformat()
    params: dict = {"threshold": threshold, "today": today_str}
    uid_filter = "AND a.uid = $entity_uid" if entity_uid else ""
    if entity_uid:
        params["entity_uid"] = entity_uid
    query = f"""
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE r.score >= $threshold
          AND coalesce(e.deadline, '9999-12-31') >= $today
          {uid_filter}
        RETURN a.uid AS entity_uid, a.name AS entity_name, labels(a)[0] AS entity_type,
               e.uid AS edital_uid, e.title AS edital_title, r.score AS score,
               r.matched_skills AS matched_skills, r.matched_areas AS matched_areas,
               r.justification AS justification
        ORDER BY r.score DESC
    """
    rows = run_cypher(query, params)
    return [
        MatchResponse(
            entity_uid=r["entity_uid"], entity_name=r["entity_name"], entity_type=r["entity_type"],
            edital_uid=r["edital_uid"], edital_title=r["edital_title"], score=r["score"],
            matched_skills=r["matched_skills"] or [], matched_areas=r["matched_areas"] or [],
            justification=r["justification"] or "",
        )
        for r in rows
    ]


# ═══════════════════════════════════════════
# GRAPH DATA (for D3.js / Force Graph visualization)
# ═══════════════════════════════════════════

def get_graph_data(enriched: bool = True) -> GraphData:
    """Get full graph data for visualization from Neo4j Aura."""
    return _get_graph_data_neo4j()


def _get_graph_data_neo4j() -> GraphData:
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    # Fetch all nodes
    node_rows = run_cypher("""
        MATCH (n)
        WHERE n:Student OR n:Docente OR n:Edital OR n:Skill OR n:Area
        RETURN n.uid AS uid,
               COALESCE(n.name, n.title, n.uid) AS label,
               labels(n)[0] AS type,
               properties(n) AS props
    """)
    for r in node_rows:
        node_type = (r.get("type") or "unknown").lower()
        nodes.append(GraphNode(
            id=r["uid"], label=r["label"], type=node_type,
            size=NODE_SIZES.get(node_type, 6),
            color=NODE_COLORS.get(node_type, "#888"),
            metadata={k: v for k, v in (r.get("props") or {}).items()
                      if k not in ("uid", "name", "title", "password_hash")},
        ))

    # Fetch all edges
    edge_rows = run_cypher("""
        MATCH (a)-[r]->(b)
        WHERE (a:Student OR a:Docente OR a:Edital OR a:Skill OR a:Area)
          AND (b:Student OR b:Docente OR b:Edital OR b:Skill OR b:Area)
        RETURN a.uid AS source, b.uid AS target,
               type(r) AS label,
               COALESCE(r.score, r.confidence, 1.0) AS weight
    """)
    edge_colors = {
        "HAS_SKILL": "#06b6d4", "RESEARCHES_AREA": "#6366f1",
        "REQUIRES_SKILL": "#8b5cf6", "TARGETS_AREA": "#6366f1",
        "ELIGIBLE_FOR": "#0ea5e9", "ADVISES": "#f59e0b",
    }
    for i, r in enumerate(edge_rows):
        edges.append(GraphEdge(
            id=f"e{i+1}", source=r["source"], target=r["target"],
            label=r["label"], weight=r.get("weight") or 1.0,
            color=edge_colors.get(r["label"], "#555"),
        ))

    return GraphData(nodes=nodes, edges=edges)


# ═══════════════════════════════════════════
# DASHBOARD STATS
# ═══════════════════════════════════════════

def get_dashboard_stats() -> DashboardStats:
    query = """
        OPTIONAL MATCH (s:Student) WITH count(s) AS students
        OPTIONAL MATCH (d:Docente) WITH students, count(d) AS docentes
        OPTIONAL MATCH (e:Edital) WITH students, docentes, count(e) AS editais
        OPTIONAL MATCH (sk:Skill) WITH students, docentes, editais, count(sk) AS skills
        OPTIONAL MATCH (a:Area) WITH students, docentes, editais, skills, count(a) AS areas
        OPTIONAL MATCH ()-[m:ELIGIBLE_FOR]->()
        WITH students, docentes, editais, skills, areas,
             count(m) AS matches, avg(m.score) AS avg_score
        RETURN students, docentes, editais, skills, areas, matches,
               COALESCE(avg_score, 0.0) AS avg_score
    """
    results = run_cypher(query)
    if results:
        row = results[0]
        return DashboardStats(
            total_students=row.get("students") or 0,
            total_docentes=row.get("docentes") or 0,
            total_editais=row.get("editais") or 0,
            total_skills=row.get("skills") or 0,
            total_areas=row.get("areas") or 0,
            total_matches=row.get("matches") or 0,
            avg_match_score=round(row.get("avg_score") or 0.0, 2),
            graph_mode="Neo4j AuraDB (Nativo)",
            is_connected=True,
        )
    return DashboardStats()
