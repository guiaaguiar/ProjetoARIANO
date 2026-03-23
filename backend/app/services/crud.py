"""CRUD service layer — abstracts Neo4j operations."""

from neomodel import db

from app.models.graph import (
    Student, Researcher, Professor, Edital, Skill, Area,
)
from app.models.schemas import (
    SkillResponse, AreaResponse,
    StudentCreate, StudentResponse,
    ResearcherCreate, ResearcherResponse,
    ProfessorCreate, ProfessorResponse,
    EditalCreate, EditalResponse,
    GraphNode, GraphEdge, GraphData,
    MatchResponse, DashboardStats,
)

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


def _get_or_create_skill(name: str) -> Skill:
    """Get existing skill or create new one."""
    try:
        return Skill.nodes.get(name=name)
    except Skill.DoesNotExist:
        return Skill(name=name).save()


def _get_or_create_area(name: str) -> Area:
    """Get existing area or create new one."""
    try:
        return Area.nodes.get(name=name)
    except Area.DoesNotExist:
        return Area(name=name).save()


def _skill_to_response(skill: Skill) -> SkillResponse:
    return SkillResponse(uid=skill.uid, name=skill.name, category=skill.category)


def _area_to_response(area: Area) -> AreaResponse:
    return AreaResponse(uid=area.uid, name=area.name, parent_area=area.parent_area or "")


# ═══════════════════════════════════════════
# SKILL CRUD
# ═══════════════════════════════════════════

def list_skills() -> list[SkillResponse]:
    return [_skill_to_response(s) for s in Skill.nodes.all()]

def create_skill(data) -> SkillResponse:
    skill = Skill(name=data.name, category=data.category).save()
    return _skill_to_response(skill)

def delete_skill(uid: str) -> bool:
    try:
        skill = Skill.nodes.get(uid=uid)
        skill.delete()
        return True
    except Skill.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# AREA CRUD
# ═══════════════════════════════════════════

def list_areas() -> list[AreaResponse]:
    return [_area_to_response(a) for a in Area.nodes.all()]

def create_area(data) -> AreaResponse:
    area = Area(name=data.name, parent_area=data.parent_area).save()
    return _area_to_response(area)

def delete_area(uid: str) -> bool:
    try:
        area = Area.nodes.get(uid=uid)
        area.delete()
        return True
    except Area.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# STUDENT CRUD
# ═══════════════════════════════════════════

def _student_to_response(s: Student) -> StudentResponse:
    return StudentResponse(
        uid=s.uid, name=s.name, email=s.email or "",
        institution=s.institution or "", course=s.course or "",
        semester=s.semester or 1, level=s.level or "graduacao",
        bio=s.bio or "",
        skills=[_skill_to_response(sk) for sk in s.skills.all()],
    )

def list_students() -> list[StudentResponse]:
    return [_student_to_response(s) for s in Student.nodes.all()]

def get_student(uid: str) -> StudentResponse | None:
    try:
        return _student_to_response(Student.nodes.get(uid=uid))
    except Student.DoesNotExist:
        return None

def create_student(data: StudentCreate) -> StudentResponse:
    student = Student(
        name=data.name, email=data.email, institution=data.institution,
        course=data.course, semester=data.semester, level=data.level,
        bio=data.bio,
    ).save()
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        student.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    return _student_to_response(student)

def update_student(uid: str, data: StudentCreate) -> StudentResponse | None:
    try:
        student = Student.nodes.get(uid=uid)
    except Student.DoesNotExist:
        return None
    student.name = data.name
    student.email = data.email
    student.institution = data.institution
    student.course = data.course
    student.semester = data.semester
    student.level = data.level
    student.bio = data.bio
    student.save()
    # Update skills
    for sk in student.skills.all():
        student.skills.disconnect(sk)
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        student.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    return _student_to_response(student)

def delete_student(uid: str) -> bool:
    try:
        student = Student.nodes.get(uid=uid)
        student.delete()
        return True
    except Student.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# RESEARCHER CRUD
# ═══════════════════════════════════════════

def _researcher_to_response(r: Researcher) -> ResearcherResponse:
    return ResearcherResponse(
        uid=r.uid, name=r.name, email=r.email or "",
        institution=r.institution or "", level=r.level or "doutorado",
        lattes_url=r.lattes_url or "", bio=r.bio or "",
        skills=[_skill_to_response(sk) for sk in r.skills.all()],
        areas=[_area_to_response(a) for a in r.areas.all()],
    )

def list_researchers() -> list[ResearcherResponse]:
    return [_researcher_to_response(r) for r in Researcher.nodes.all()]

def get_researcher(uid: str) -> ResearcherResponse | None:
    try:
        return _researcher_to_response(Researcher.nodes.get(uid=uid))
    except Researcher.DoesNotExist:
        return None

def create_researcher(data: ResearcherCreate) -> ResearcherResponse:
    researcher = Researcher(
        name=data.name, email=data.email, institution=data.institution,
        level=data.level, lattes_url=data.lattes_url, bio=data.bio,
    ).save()
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        researcher.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    for area_name in data.areas:
        area = _get_or_create_area(area_name)
        researcher.areas.connect(area, {"source": "manual"})
    return _researcher_to_response(researcher)

def update_researcher(uid: str, data: ResearcherCreate) -> ResearcherResponse | None:
    try:
        r = Researcher.nodes.get(uid=uid)
    except Researcher.DoesNotExist:
        return None
    r.name = data.name
    r.email = data.email
    r.institution = data.institution
    r.level = data.level
    r.lattes_url = data.lattes_url
    r.bio = data.bio
    r.save()
    for sk in r.skills.all():
        r.skills.disconnect(sk)
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        r.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    for a in r.areas.all():
        r.areas.disconnect(a)
    for area_name in data.areas:
        area = _get_or_create_area(area_name)
        r.areas.connect(area, {"source": "manual"})
    return _researcher_to_response(r)

def delete_researcher(uid: str) -> bool:
    try:
        Researcher.nodes.get(uid=uid).delete()
        return True
    except Researcher.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# PROFESSOR CRUD
# ═══════════════════════════════════════════

def _professor_to_response(p: Professor) -> ProfessorResponse:
    return ProfessorResponse(
        uid=p.uid, name=p.name, email=p.email or "",
        institution=p.institution or "", department=p.department or "",
        research_group=p.research_group or "", bio=p.bio or "",
        skills=[_skill_to_response(sk) for sk in p.skills.all()],
        areas=[_area_to_response(a) for a in p.areas.all()],
    )

def list_professors() -> list[ProfessorResponse]:
    return [_professor_to_response(p) for p in Professor.nodes.all()]

def get_professor(uid: str) -> ProfessorResponse | None:
    try:
        return _professor_to_response(Professor.nodes.get(uid=uid))
    except Professor.DoesNotExist:
        return None

def create_professor(data: ProfessorCreate) -> ProfessorResponse:
    professor = Professor(
        name=data.name, email=data.email, institution=data.institution,
        department=data.department, research_group=data.research_group,
        bio=data.bio,
    ).save()
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        professor.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    for area_name in data.areas:
        area = _get_or_create_area(area_name)
        professor.areas.connect(area, {"source": "manual"})
    return _professor_to_response(professor)

def update_professor(uid: str, data: ProfessorCreate) -> ProfessorResponse | None:
    try:
        p = Professor.nodes.get(uid=uid)
    except Professor.DoesNotExist:
        return None
    p.name = data.name
    p.email = data.email
    p.institution = data.institution
    p.department = data.department
    p.research_group = data.research_group
    p.bio = data.bio
    p.save()
    for sk in p.skills.all():
        p.skills.disconnect(sk)
    for skill_name in data.skills:
        skill = _get_or_create_skill(skill_name)
        p.skills.connect(skill, {"confidence": 0.8, "source": "manual"})
    for a in p.areas.all():
        p.areas.disconnect(a)
    for area_name in data.areas:
        area = _get_or_create_area(area_name)
        p.areas.connect(area, {"source": "manual"})
    return _professor_to_response(p)

def delete_professor(uid: str) -> bool:
    try:
        Professor.nodes.get(uid=uid).delete()
        return True
    except Professor.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# EDITAL CRUD
# ═══════════════════════════════════════════

def _edital_to_response(e: Edital) -> EditalResponse:
    return EditalResponse(
        uid=e.uid, title=e.title, description=e.description or "",
        agency=e.agency or "", edital_type=e.edital_type or "pesquisa",
        funding=e.funding or 0.0, deadline=e.deadline or "",
        min_level=e.min_level or "graduacao", status=e.status or "aberto",
        required_skills=[_skill_to_response(sk) for sk in e.requires_skills.all()],
        target_areas=[_area_to_response(a) for a in e.targets_areas.all()],
    )

def list_editais() -> list[EditalResponse]:
    return [_edital_to_response(e) for e in Edital.nodes.all()]

def get_edital(uid: str) -> EditalResponse | None:
    try:
        return _edital_to_response(Edital.nodes.get(uid=uid))
    except Edital.DoesNotExist:
        return None

def create_edital(data: EditalCreate) -> EditalResponse:
    edital = Edital(
        title=data.title, description=data.description, agency=data.agency,
        edital_type=data.edital_type, funding=data.funding,
        deadline=data.deadline, min_level=data.min_level,
    ).save()
    for skill_name in data.required_skills:
        skill = _get_or_create_skill(skill_name)
        edital.requires_skills.connect(skill, {"priority": "essential", "source": "manual"})
    for area_name in data.target_areas:
        area = _get_or_create_area(area_name)
        edital.targets_areas.connect(area, {"source": "manual"})
    return _edital_to_response(edital)

def update_edital(uid: str, data: EditalCreate) -> EditalResponse | None:
    try:
        e = Edital.nodes.get(uid=uid)
    except Edital.DoesNotExist:
        return None
    e.title = data.title
    e.description = data.description
    e.agency = data.agency
    e.edital_type = data.edital_type
    e.funding = data.funding
    e.deadline = data.deadline
    e.min_level = data.min_level
    e.save()
    for sk in e.requires_skills.all():
        e.requires_skills.disconnect(sk)
    for skill_name in data.required_skills:
        skill = _get_or_create_skill(skill_name)
        e.requires_skills.connect(skill, {"priority": "essential", "source": "manual"})
    for a in e.targets_areas.all():
        e.targets_areas.disconnect(a)
    for area_name in data.target_areas:
        area = _get_or_create_area(area_name)
        e.targets_areas.connect(area, {"source": "manual"})
    return _edital_to_response(e)

def delete_edital(uid: str) -> bool:
    try:
        Edital.nodes.get(uid=uid).delete()
        return True
    except Edital.DoesNotExist:
        return False


# ═══════════════════════════════════════════
# MATCH ENGINE (Pure Cypher)
# ═══════════════════════════════════════════

def get_matches(entity_uid: str | None = None, threshold: float = 0.0) -> list[MatchResponse]:
    """Get matches. If entity_uid is provided, filter by entity."""
    where_clause = ""
    params = {"threshold": threshold}
    if entity_uid:
        where_clause = "AND a.uid = $entity_uid"
        params["entity_uid"] = entity_uid

    query = f"""
        MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
        WHERE r.score >= $threshold {where_clause}
        RETURN a.uid AS entity_uid, a.name AS entity_name,
               labels(a)[0] AS entity_type,
               e.uid AS edital_uid, e.title AS edital_title,
               r.score AS score, r.matched_skills AS matched_skills,
               r.matched_areas AS matched_areas, r.justification AS justification
        ORDER BY r.score DESC
    """
    results, _ = db.cypher_query(query, params)
    return [
        MatchResponse(
            entity_uid=row[0], entity_name=row[1], entity_type=row[2],
            edital_uid=row[3], edital_title=row[4], score=row[5],
            matched_skills=row[6] or [], matched_areas=row[7] or [],
            justification=row[8] or "",
        )
        for row in results
    ]


# ═══════════════════════════════════════════
# GRAPH DATA (for Sigma.js visualization)
# ═══════════════════════════════════════════

def get_graph_data() -> GraphData:
    """Get full graph data for visualization."""
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    edge_id = 0

    # Add all nodes
    for s in Student.nodes.all():
        nodes.append(GraphNode(id=s.uid, label=s.name, type="student",
                               size=NODE_SIZES["student"], color=NODE_COLORS["student"],
                               metadata={"institution": s.institution, "level": s.level}))
    for r in Researcher.nodes.all():
        nodes.append(GraphNode(id=r.uid, label=r.name, type="researcher",
                               size=NODE_SIZES["researcher"], color=NODE_COLORS["researcher"],
                               metadata={"institution": r.institution, "level": r.level}))
    for p in Professor.nodes.all():
        nodes.append(GraphNode(id=p.uid, label=p.name, type="professor",
                               size=NODE_SIZES["professor"], color=NODE_COLORS["professor"],
                               metadata={"institution": p.institution, "department": p.department}))
    for e in Edital.nodes.all():
        nodes.append(GraphNode(id=e.uid, label=e.title, type="edital",
                               size=NODE_SIZES["edital"], color=NODE_COLORS["edital"],
                               metadata={"agency": e.agency, "funding": e.funding}))
    for sk in Skill.nodes.all():
        nodes.append(GraphNode(id=sk.uid, label=sk.name, type="skill",
                               size=NODE_SIZES["skill"], color=NODE_COLORS["skill"]))
    for a in Area.nodes.all():
        nodes.append(GraphNode(id=a.uid, label=a.name, type="area",
                               size=NODE_SIZES["area"], color=NODE_COLORS["area"]))

    # Add edges via Cypher for performance
    edge_queries = [
        ("MATCH (a)-[r:HAS_SKILL]->(b) RETURN a.uid, b.uid, 'HAS_SKILL', r.confidence", "#06b6d4"),
        ("MATCH (a)-[r:RESEARCHES_AREA]->(b) RETURN a.uid, b.uid, 'RESEARCHES_AREA', 1.0", "#6366f1"),
        ("MATCH (a)-[r:REQUIRES_SKILL]->(b) RETURN a.uid, b.uid, 'REQUIRES_SKILL', 1.0", "#8b5cf6"),
        ("MATCH (a)-[r:TARGETS_AREA]->(b) RETURN a.uid, b.uid, 'TARGETS_AREA', 1.0", "#6366f1"),
        ("MATCH (a)-[r:ELIGIBLE_FOR]->(b) RETURN a.uid, b.uid, 'ELIGIBLE_FOR', r.score", "#0ea5e9"),
        ("MATCH (a)-[:ADVISES]->(b) RETURN a.uid, b.uid, 'ADVISES', 1.0", "#f59e0b"),
        ("MATCH (a)-[:COLLABORATES]->(b) RETURN a.uid, b.uid, 'COLLABORATES', 1.0", "#f59e0b"),
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
    """Get dashboard KPI statistics."""
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
