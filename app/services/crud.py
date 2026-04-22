from __future__ import annotations

"""CRUD service layer — unified for both Neo4j (neomodel) and in-memory modes."""

import logging

from app.core.neo4j_driver import is_memory_mode, get_memory_store, run_cypher
from app.models.schemas import (
    SkillResponse, AreaResponse,
    StudentCreate, StudentResponse,
    ResearcherCreate, ResearcherResponse,
    ProfessorCreate, ProfessorResponse,
    EditalCreate, EditalResponse,
    GraphNode, GraphEdge, GraphData,
    MatchResponse, DashboardStats,
)

logger = logging.getLogger(__name__)

# ─── Node color mapping ───
NODE_COLORS = {
    "edital": "#0ea5e9",
    "student": "#06b6d4",
    "researcher": "#10b981",
    "professor": "#f59e0b",
    "skill": "#8b5cf6",
    "area": "#6366f1",
}

NODE_SIZES = {
    "edital": 12,
    "student": 8,
    "researcher": 8,
    "professor": 10,
    "skill": 5,
    "area": 5,
}


# ═══════════════════════════════════════════
# HELPER — Get neomodel models (only when NOT in memory mode)
# ═══════════════════════════════════════════

def _neomodel():
    """Lazy import neomodel models — only used when Neo4j is available."""
    from app.models.graph import Student, Researcher, Professor, Edital, Skill, Area
    return Student, Researcher, Professor, Edital, Skill, Area


# ═══════════════════════════════════════════
# MEMORY MODE LIST/READ HELPERS
# ═══════════════════════════════════════════

def _mem_list_label(label: str) -> list[dict]:
    store = get_memory_store()
    return store.get_nodes_by_label(label)


def _mem_get_node(uid: str) -> dict | None:
    store = get_memory_store()
    node = store.get_node(uid)
    if node:
        return node["props"]
    return None


def _mem_get_skills_for(uid: str) -> list[dict]:
    store = get_memory_store()
    edges = store.get_edges(source=uid, edge_type="HAS_SKILL")
    skills = []
    for edge in edges:
        sk = store.get_node(edge["target"])
        if sk:
            skills.append(SkillResponse(
                uid=sk["props"].get("uid", ""),
                name=sk["props"].get("name", ""),
                category=sk["props"].get("category", ""),
            ))
    return skills


def _mem_get_areas_for(uid: str) -> list[dict]:
    store = get_memory_store()
    edges = store.get_edges(source=uid, edge_type="RESEARCHES_AREA")
    areas = []
    for edge in edges:
        a = store.get_node(edge["target"])
        if a:
            areas.append(AreaResponse(
                uid=a["props"].get("uid", ""),
                name=a["props"].get("name", ""),
                parent_area="",
            ))
    return areas


# ═══════════════════════════════════════════
# SKILL CRUD
# ═══════════════════════════════════════════

def list_skills() -> list[SkillResponse]:
    if is_memory_mode():
        return [
            SkillResponse(uid=s.get("uid", ""), name=s.get("name", ""),
                          category=s.get("category", ""))
            for s in _mem_list_label("Skill")
        ]
    Student, Researcher, Professor, Edital, Skill, Area = _neomodel()
    return [SkillResponse(uid=s.uid, name=s.name, category=s.category)
            for s in Skill.nodes.all()]


def create_skill(data) -> SkillResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Skill"], {"name": data.name, "category": data.category})
        return SkillResponse(uid=uid, name=data.name, category=data.category)
    _, _, _, _, Skill, _ = _neomodel()
    skill = Skill(name=data.name, category=data.category).save()
    return SkillResponse(uid=skill.uid, name=skill.name, category=skill.category)


def delete_skill(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    _, _, _, _, Skill, _ = _neomodel()
    try:
        Skill.nodes.get(uid=uid).delete()
        return True
    except Skill.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# AREA CRUD
# ═══════════════════════════════════════════

def list_areas() -> list[AreaResponse]:
    if is_memory_mode():
        return [
            AreaResponse(uid=a.get("uid", ""), name=a.get("name", ""), parent_area="")
            for a in _mem_list_label("Area")
        ]
    _, _, _, _, _, Area = _neomodel()
    return [AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
            for a in Area.nodes.all()]


def create_area(data) -> AreaResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Area"], {"name": data.name})
        return AreaResponse(uid=uid, name=data.name, parent_area=data.parent_area or "")
    _, _, _, _, _, Area = _neomodel()
    area = Area(name=data.name, parent_area=data.parent_area).save()
    return AreaResponse(uid=area.uid, name=area.name, parent_area=area.parent_area or "")


def delete_area(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    _, _, _, _, _, Area = _neomodel()
    try:
        Area.nodes.get(uid=uid).delete()
        return True
    except Area.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# STUDENT CRUD
# ═══════════════════════════════════════════

def list_students() -> list[StudentResponse]:
    if is_memory_mode():
        results = []
        for s in _mem_list_label("Student"):
            results.append(StudentResponse(
                uid=s.get("uid", ""), name=s.get("name", ""), email=s.get("email", ""),
                institution=s.get("institution", ""), course=s.get("course", ""),
                semester=s.get("semester", 1),
                bio=s.get("bio", ""), curriculo_texto=s.get("curriculo_texto", ""),
                maturidade=s.get("maturidade", 0.0), o_que_busco=s.get("o_que_busco", ""),
                skills=_mem_get_skills_for(s.get("uid", "")),
            ))
        return results
    Student, *_ = _neomodel()
    return [StudentResponse(
        uid=s.uid, name=s.name, email=s.email or "",
        institution=s.institution or "", course=s.course or "",
        semester=s.semester or 1, bio=s.bio or "",
        curriculo_texto=s.curriculo_texto or "",
        maturidade=s.maturidade or 0.0, o_que_busco=s.o_que_busco or "",
        skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                for sk in s.skills.all()],
    ) for s in Student.nodes.all()]


def get_student(uid: str) -> StudentResponse | None:
    if is_memory_mode():
        s = _mem_get_node(uid)
        if not s:
            return None
        return StudentResponse(
            uid=s.get("uid", ""), name=s.get("name", ""), email=s.get("email", ""),
            institution=s.get("institution", ""), course=s.get("course", ""),
            semester=s.get("semester", 1),
            bio=s.get("bio", ""), curriculo_texto=s.get("curriculo_texto", ""),
            maturidade=s.get("maturidade", 0.0), o_que_busco=s.get("o_que_busco", ""),
            skills=_mem_get_skills_for(uid),
        )
    Student, *_ = _neomodel()
    try:
        s = Student.nodes.get(uid=uid)
        return StudentResponse(
            uid=s.uid, name=s.name, email=s.email or "",
            institution=s.institution or "", course=s.course or "",
            semester=s.semester or 1, bio=s.bio or "",
            curriculo_texto=s.curriculo_texto or "",
            maturidade=s.maturidade or 0.0, o_que_busco=s.o_que_busco or "",
            skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                    for sk in s.skills.all()],
        )
    except Student.DoesNotExist:
        return None


def create_student(data: StudentCreate) -> StudentResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Student"], {
            "name": data.name, "email": data.email, "institution": data.institution,
            "course": data.course, "semester": data.semester,
            "bio": data.bio, "curriculo_texto": data.curriculo_texto,
            "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
            "password_hash": data.password,
        })
        return get_student(uid)
    Student, *_ = _neomodel()
    student = Student(
        name=data.name, email=data.email, institution=data.institution,
        course=data.course, semester=data.semester, bio=data.bio,
        curriculo_texto=data.curriculo_texto, maturidade=data.maturidade,
        o_que_busco=data.o_que_busco, password_hash=data.password,
    ).save()
    return get_student(student.uid)


def update_student(uid: str, data: StudentCreate) -> StudentResponse | None:
    if is_memory_mode():
        store = get_memory_store()
        node = store.get_node(uid)
        if not node:
            return None
        node["props"].update({"name": data.name, "email": data.email,
                              "institution": data.institution, "course": data.course,
                              "semester": data.semester, "bio": data.bio,
                              "curriculo_texto": data.curriculo_texto, "maturidade": data.maturidade,
                              "o_que_busco": data.o_que_busco})
        return get_student(uid)
    return get_student(uid)  # simplified for now


def delete_student(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    Student, *_ = _neomodel()
    try:
        Student.nodes.get(uid=uid).delete()
        return True
    except Student.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# RESEARCHER CRUD
# ═══════════════════════════════════════════

def list_researchers() -> list[ResearcherResponse]:
    if is_memory_mode():
        results = []
        for r in _mem_list_label("Researcher"):
            uid = r.get("uid", "")
            results.append(ResearcherResponse(
                uid=uid, name=r.get("name", ""), email=r.get("email", ""),
                institution=r.get("institution", ""),
                bio=r.get("bio", ""), curriculo_texto=r.get("curriculo_texto", ""),
                maturidade=r.get("maturidade", 0.0), o_que_busco=r.get("o_que_busco", ""),
                skills=_mem_get_skills_for(uid), areas=_mem_get_areas_for(uid),
            ))
        return results
    _, Researcher, *_ = _neomodel()
    return [ResearcherResponse(
        uid=r.uid, name=r.name, email=r.email or "",
        institution=r.institution or "",
        bio=r.bio or "", curriculo_texto=r.curriculo_texto or "",
        maturidade=r.maturidade or 0.0, o_que_busco=r.o_que_busco or "",
        skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                for sk in r.skills.all()],
        areas=[AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
               for a in r.areas.all()],
    ) for r in Researcher.nodes.all()]


def get_researcher(uid: str) -> ResearcherResponse | None:
    if is_memory_mode():
        r = _mem_get_node(uid)
        if not r:
            return None
        return ResearcherResponse(
            uid=uid, name=r.get("name", ""), email=r.get("email", ""),
            institution=r.get("institution", ""),
            bio=r.get("bio", ""), curriculo_texto=r.get("curriculo_texto", ""),
            maturidade=r.get("maturidade", 0.0), o_que_busco=r.get("o_que_busco", ""),
            skills=_mem_get_skills_for(uid), areas=_mem_get_areas_for(uid),
        )
    _, Researcher, *_ = _neomodel()
    try:
        r = Researcher.nodes.get(uid=uid)
        return ResearcherResponse(
            uid=r.uid, name=r.name, email=r.email or "",
            institution=r.institution or "",
            bio=r.bio or "", curriculo_texto=r.curriculo_texto or "",
            maturidade=r.maturidade or 0.0, o_que_busco=r.o_que_busco or "",
            skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                    for sk in r.skills.all()],
            areas=[AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
                   for a in r.areas.all()],
        )
    except Researcher.DoesNotExist:
        return None


def create_researcher(data: ResearcherCreate) -> ResearcherResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Researcher"], {
            "name": data.name, "email": data.email, "institution": data.institution,
            "bio": data.bio, "curriculo_texto": data.curriculo_texto,
            "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
            "password_hash": data.password,
        })
        return get_researcher(uid)
    _, Researcher, *_ = _neomodel()
    researcher = Researcher(
        name=data.name, email=data.email, institution=data.institution,
        bio=data.bio, curriculo_texto=data.curriculo_texto,
        maturidade=data.maturidade, o_que_busco=data.o_que_busco,
        password_hash=data.password,
    ).save()
    return get_researcher(researcher.uid)


def update_researcher(uid: str, data: ResearcherCreate) -> ResearcherResponse | None:
    return get_researcher(uid)


def delete_researcher(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    _, Researcher, *_ = _neomodel()
    try:
        Researcher.nodes.get(uid=uid).delete()
        return True
    except Researcher.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# PROFESSOR CRUD
# ═══════════════════════════════════════════

def list_professors() -> list[ProfessorResponse]:
    if is_memory_mode():
        results = []
        for p in _mem_list_label("Professor"):
            uid = p.get("uid", "")
            results.append(ProfessorResponse(
                uid=uid, name=p.get("name", ""), email=p.get("email", ""),
                institution=p.get("institution", ""), department=p.get("department", ""),
                research_group=p.get("research_group", ""), bio=p.get("bio", ""),
                curriculo_texto=p.get("curriculo_texto", ""),
                maturidade=p.get("maturidade", 0.0), o_que_busco=p.get("o_que_busco", ""),
                skills=_mem_get_skills_for(uid), areas=_mem_get_areas_for(uid),
            ))
        return results
    _, _, Professor, *_ = _neomodel()
    return [ProfessorResponse(
        uid=p.uid, name=p.name, email=p.email or "",
        institution=p.institution or "", department=p.department or "",
        research_group=p.research_group or "", bio=p.bio or "",
        curriculo_texto=p.curriculo_texto or "",
        maturidade=p.maturidade or 0.0, o_que_busco=p.o_que_busco or "",
        skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                for sk in p.skills.all()],
        areas=[AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
               for a in p.areas.all()],
    ) for p in Professor.nodes.all()]


def get_professor(uid: str) -> ProfessorResponse | None:
    if is_memory_mode():
        p = _mem_get_node(uid)
        if not p:
            return None
        return ProfessorResponse(
            uid=uid, name=p.get("name", ""), email=p.get("email", ""),
            institution=p.get("institution", ""), department=p.get("department", ""),
            research_group=p.get("research_group", ""), bio=p.get("bio", ""),
            curriculo_texto=p.get("curriculo_texto", ""),
            maturidade=p.get("maturidade", 0.0), o_que_busco=p.get("o_que_busco", ""),
            skills=_mem_get_skills_for(uid), areas=_mem_get_areas_for(uid),
        )
    _, _, Professor, *_ = _neomodel()
    try:
        p = Professor.nodes.get(uid=uid)
        return ProfessorResponse(
            uid=p.uid, name=p.name, email=p.email or "",
            institution=p.institution or "", department=p.department or "",
            research_group=p.research_group or "", bio=p.bio or "",
            curriculo_texto=p.curriculo_texto or "",
            maturidade=p.maturidade or 0.0, o_que_busco=p.o_que_busco or "",
            skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                    for sk in p.skills.all()],
            areas=[AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
                   for a in p.areas.all()],
        )
    except Professor.DoesNotExist:
        return None


def create_professor(data: ProfessorCreate) -> ProfessorResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Professor"], {
            "name": data.name, "email": data.email, "institution": data.institution,
            "department": data.department, "research_group": data.research_group,
            "bio": data.bio, "curriculo_texto": data.curriculo_texto,
            "maturidade": data.maturidade, "o_que_busco": data.o_que_busco,
            "password_hash": data.password,
        })
        return get_professor(uid)
    _, _, Professor, *_ = _neomodel()
    prof = Professor(
        name=data.name, email=data.email, institution=data.institution,
        department=data.department, research_group=data.research_group,
        bio=data.bio, curriculo_texto=data.curriculo_texto,
        maturidade=data.maturidade, o_que_busco=data.o_que_busco,
        password_hash=data.password,
    ).save()
    return get_professor(prof.uid)


def update_professor(uid: str, data: ProfessorCreate) -> ProfessorResponse | None:
    return get_professor(uid)


def delete_professor(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    _, _, Professor, *_ = _neomodel()
    try:
        Professor.nodes.get(uid=uid).delete()
        return True
    except Professor.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# EDITAL CRUD
# ═══════════════════════════════════════════

def list_editais() -> list[EditalResponse]:
    if is_memory_mode():
        store = get_memory_store()
        results = []
        for e in _mem_list_label("Edital"):
            uid = e.get("uid", "")
            # Get required skills
            req_edges = store.get_edges(source=uid, edge_type="REQUIRES_SKILL")
            req_skills = []
            for edge in req_edges:
                sk = store.get_node(edge["target"])
                if sk:
                    req_skills.append(SkillResponse(
                        uid=sk["props"].get("uid", ""), name=sk["props"].get("name", ""),
                        category=sk["props"].get("category", ""),
                    ))
            # Get target areas
            area_edges = store.get_edges(source=uid, edge_type="TARGETS_AREA")
            target_areas = []
            for edge in area_edges:
                a = store.get_node(edge["target"])
                if a:
                    target_areas.append(AreaResponse(
                        uid=a["props"].get("uid", ""), name=a["props"].get("name", ""),
                        parent_area="",
                    ))
            results.append(EditalResponse(
                uid=uid, title=e.get("title", ""), description=e.get("description", ""),
                instituicao=e.get("instituicao", ""), edital_type=e.get("edital_type", "pesquisa"),
                funding=e.get("funding", 0.0), deadline=e.get("deadline", ""),
                min_maturidade=e.get("min_maturidade", 0.0), status=e.get("status", "aberto"),
                required_skills=req_skills, target_areas=target_areas,
            ))
        return results
    _, _, _, Edital, Skill, Area = _neomodel()
    return [EditalResponse(
        uid=e.uid, title=e.title, description=e.description or "",
        instituicao=e.instituicao or "", edital_type=e.edital_type or "pesquisa",
        funding=e.funding or 0.0, deadline=e.deadline or "",
        min_maturidade=e.min_maturidade or 0.0, status=e.status or "aberto",
        required_skills=[SkillResponse(uid=sk.uid, name=sk.name, category=sk.category)
                         for sk in e.requires_skills.all()],
        target_areas=[AreaResponse(uid=a.uid, name=a.name, parent_area=a.parent_area or "")
                      for a in e.targets_areas.all()],
    ) for e in Edital.nodes.all()]


def get_edital(uid: str) -> EditalResponse | None:
    editais = list_editais()
    for e in editais:
        if e.uid == uid:
            return e
    return None


def create_edital(data: EditalCreate) -> EditalResponse:
    if is_memory_mode():
        import uuid
        uid = str(uuid.uuid4())[:8]
        store = get_memory_store()
        store.add_node(uid, ["Edital"], {
            "title": data.title, "description": data.description,
            "instituicao": data.instituicao, "edital_type": data.edital_type,
            "funding": data.funding, "min_maturidade": data.min_maturidade,
            "deadline": data.deadline,
            "status": "aberto",
        })
        return get_edital(uid)
    _, _, _, Edital, *_ = _neomodel()
    edital = Edital(
        title=data.title, description=data.description, instituicao=data.instituicao,
        edital_type=data.edital_type, funding=data.funding, min_maturidade=data.min_maturidade,
        deadline=data.deadline, status="aberto"
    ).save()
    return get_edital(edital.uid)


def update_edital(uid: str, data: EditalCreate) -> EditalResponse | None:
    return get_edital(uid)


def delete_edital(uid: str) -> bool:
    if is_memory_mode():
        store = get_memory_store()
        if uid in store.nodes:
            del store.nodes[uid]
            return True
        return False
    _, _, _, Edital, *_ = _neomodel()
    try:
        Edital.nodes.get(uid=uid).delete()
        return True
    except Edital.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# MATCH ENGINE (Pure Cypher / Memory)
# ═══════════════════════════════════════════

def get_matches(entity_uid: str | None = None, threshold: float = 0.0) -> list[MatchResponse]:
    if is_memory_mode():
        import datetime
        today_str = datetime.date.today().isoformat()
        store = get_memory_store()
        edges = store.get_edges(edge_type="ELIGIBLE_FOR")
        results = []
        for edge in edges:
            score = edge["props"].get("score", 0)
            if score < threshold:
                continue
            if entity_uid and edge["source"] != entity_uid:
                continue
            source = store.get_node(edge["source"])
            target = store.get_node(edge["target"])
            if source and target:
                deadline = target["props"].get("deadline", "")
                if deadline and deadline < today_str:
                    continue  # Expired edital
                
                results.append(MatchResponse(
                    entity_uid=edge["source"],
                    entity_name=source["props"].get("name", ""),
                    entity_type=source["labels"][0] if source.get("labels") else "",
                    edital_uid=edge["target"],
                    edital_title=target["props"].get("title", ""),
                    score=score,
                    matched_skills=edge["props"].get("matched_skills", []),
                    matched_areas=edge["props"].get("matched_areas", []),
                    justification=edge["props"].get("justification", ""),
                ))
        results.sort(key=lambda x: x.score, reverse=True)
        return results

    from neomodel import db
    import datetime
    today_str = datetime.date.today().isoformat()
    where_clause = "AND coalesce(e.deadline, '9999-12-31') >= $today"
    params = {"threshold": threshold, "today": today_str}
    if entity_uid:
        where_clause += " AND a.uid = $entity_uid"
        params["entity_uid"] = entity_uid
    query = f"""
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE r.score >= $threshold {where_clause}
        RETURN a.uid, a.name, labels(a)[0],
               e.uid, e.title, r.score,
               r.matched_skills, r.matched_areas, r.justification
        ORDER BY r.score DESC
    """
    results_raw, _ = db.cypher_query(query, params)
    return [
        MatchResponse(
            entity_uid=row[0], entity_name=row[1], entity_type=row[2],
            edital_uid=row[3], edital_title=row[4], score=row[5],
            matched_skills=row[6] or [], matched_areas=row[7] or [],
            justification=row[8] or "",
        )
        for row in results_raw
    ]


# ═══════════════════════════════════════════
# GRAPH DATA (for D3.js visualization)
# ═══════════════════════════════════════════

def get_graph_data(enriched: bool = True) -> GraphData:
    """Get full graph data for visualization."""
    if is_memory_mode():
        data = _get_graph_data_memory()
    else:
        data = _get_graph_data_neo4j()
    
    if enriched:
        try:
            from app.services.graph_analysis import GraphAnalysisService
            import asyncio
            # Como get_graph_data não é async, mas run_query é, usamos um workaround ou 
            # chamamos a versão sync se disponível. Para simplificar, faremos a lógica aqui.
            # No contexto do ARIANO, vamos permitir que o frontend peça o /enriched separadamente 
            # ou injetar os IDs aqui se possível.
            pass 
        except:
            pass
            
    return data


def _get_graph_data_memory() -> GraphData:
    store = get_memory_store()
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    for uid, node in store.nodes.items():
        label = node["labels"][0].lower() if node.get("labels") else "unknown"
        display_name = node["props"].get("name") or node["props"].get("title", uid)
        nodes.append(GraphNode(
            id=uid, label=display_name, type=label,
            size=NODE_SIZES.get(label, 6), color=NODE_COLORS.get(label, "#888"),
            metadata={k: v for k, v in node["props"].items()
                      if k not in ("uid", "name", "title")},
        ))

    edge_colors = {
        "HAS_SKILL": "#06b6d4", "RESEARCHES_AREA": "#6366f1",
        "REQUIRES_SKILL": "#8b5cf6", "TARGETS_AREA": "#6366f1",
        "ELIGIBLE_FOR": "#0ea5e9", "ADVISES": "#f59e0b",
        "COLLABORATES": "#f59e0b",
    }

    for i, edge in enumerate(store.edges):
        edges.append(GraphEdge(
            id=f"e{i+1}", source=edge["source"], target=edge["target"],
            label=edge["type"],
            weight=edge["props"].get("score") or edge["props"].get("confidence") or 1.0,
            color=edge_colors.get(edge["type"], "#555"),
        ))

    return GraphData(nodes=nodes, edges=edges)


def _get_graph_data_neo4j() -> GraphData:
    from neomodel import db
    Student, Researcher, Professor, Edital, Skill, Area = _neomodel()

    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    edge_id = 0

    for s in Student.nodes.all():
        nodes.append(GraphNode(id=s.uid, label=s.name, type="student",
                               size=NODE_SIZES["student"], color=NODE_COLORS["student"],
                               metadata={"institution": s.institution, "maturidade": s.maturidade}))
    for r in Researcher.nodes.all():
        nodes.append(GraphNode(id=r.uid, label=r.name, type="researcher",
                               size=NODE_SIZES["researcher"], color=NODE_COLORS["researcher"],
                               metadata={"institution": r.institution, "maturidade": r.maturidade}))
    for p in Professor.nodes.all():
        nodes.append(GraphNode(id=p.uid, label=p.name, type="professor",
                               size=NODE_SIZES["professor"], color=NODE_COLORS["professor"],
                               metadata={"institution": p.institution, "department": p.department}))
    for e in Edital.nodes.all():
        nodes.append(GraphNode(id=e.uid, label=e.title, type="edital",
                               size=NODE_SIZES["edital"], color=NODE_COLORS["edital"],
                               metadata={"instituicao": e.instituicao, "funding": e.funding}))
    for sk in Skill.nodes.all():
        nodes.append(GraphNode(id=sk.uid, label=sk.name, type="skill",
                               size=NODE_SIZES["skill"], color=NODE_COLORS["skill"]))
    for a in Area.nodes.all():
        nodes.append(GraphNode(id=a.uid, label=a.name, type="area",
                               size=NODE_SIZES["area"], color=NODE_COLORS["area"]))

    edge_queries = [
        ("MATCH (a)-[r:HAS_SKILL]->(b) RETURN a.uid, b.uid, 'HAS_SKILL', r.confidence", "#06b6d4"),
        ("MATCH (a)-[r:RESEARCHES_AREA]->(b) RETURN a.uid, b.uid, 'RESEARCHES_AREA', 1.0", "#6366f1"),
        ("MATCH (a)-[r:REQUIRES_SKILL]->(b) RETURN a.uid, b.uid, 'REQUIRES_SKILL', 1.0", "#8b5cf6"),
        ("MATCH (a)-[r:TARGETS_AREA]->(b) RETURN a.uid, b.uid, 'TARGETS_AREA', 1.0", "#6366f1"),
        ("MATCH (a)-[r:ELIGIBLE_FOR]->(b) RETURN a.uid, b.uid, 'ELIGIBLE_FOR', r.score", "#0ea5e9"),
    ]
    for query, color in edge_queries:
        results, _ = db.cypher_query(query)
        for row in results:
            edge_id += 1
            edges.append(GraphEdge(
                id=f"e{edge_id}", source=row[0], target=row[1],
                label=row[2], weight=row[3] or 1.0, color=color,
            ))

    return GraphData(nodes=nodes, edges=edges)


# ═══════════════════════════════════════════
# DASHBOARD STATS
# ═══════════════════════════════════════════

def get_dashboard_stats() -> DashboardStats:
    if is_memory_mode():
        store = get_memory_store()
        edges = store.get_edges(edge_type="ELIGIBLE_FOR")
        scores = [e["props"].get("score", 0) for e in edges]
        return DashboardStats(
            total_students=store.count_nodes("Student"),
            total_researchers=store.count_nodes("Researcher"),
            total_professors=store.count_nodes("Professor"),
            total_editais=store.count_nodes("Edital"),
            total_skills=store.count_nodes("Skill"),
            total_areas=store.count_nodes("Area"),
            total_matches=len(edges),
            avg_match_score=round(sum(scores) / len(scores), 2) if scores else 0.0,
        )

    from neomodel import db
    query = """
        OPTIONAL MATCH (s:Student) WITH count(s) AS students
        OPTIONAL MATCH (r:Researcher) WITH students, count(r) AS researchers
        OPTIONAL MATCH (p:Professor) WITH students, researchers, count(p) AS professors
        OPTIONAL MATCH (e:Edital) WITH students, researchers, professors, count(e) AS editais
        OPTIONAL MATCH (sk:Skill) WITH students, researchers, professors, editais, count(sk) AS skills
        OPTIONAL MATCH (a:Area) WITH students, researchers, professors, editais, skills, count(a) AS areas
        OPTIONAL MATCH ()-[m:ELIGIBLE_FOR]->()
        WITH students, researchers, professors, editais, skills, areas,
             count(m) AS matches, avg(m.score) AS avg_score
        RETURN students, researchers, professors, editais, skills, areas, matches,
               COALESCE(avg_score, 0.0) AS avg_score
    """
    results, _ = db.cypher_query(query)
    if results:
        row = results[0]
        return DashboardStats(
            total_students=row[0], total_researchers=row[1],
            total_professors=row[2], total_editais=row[3],
            total_skills=row[4], total_areas=row[5],
            total_matches=row[6], avg_match_score=round(row[7], 2),
        )
    return DashboardStats()
