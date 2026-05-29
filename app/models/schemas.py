"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════
# SKILL
# ═══════════════════════════════════════════

class SkillCreate(BaseModel):
    name: str
    category: str = "general"

class SkillResponse(BaseModel):
    uid: str
    name: str
    category: str


# ═══════════════════════════════════════════
# AREA
# ═══════════════════════════════════════════

class AreaCreate(BaseModel):
    name: str
    parent_area: str = ""

class AreaResponse(BaseModel):
    uid: str
    name: str
    parent_area: str


# ═══════════════════════════════════════════
# STUDENT
# ═══════════════════════════════════════════

class StudentCreate(BaseModel):
    name: str
    email: str = ""
    password: str = ""
    institution: str = ""
    course: str = ""
    semester: int = 1
    bio: str = ""
    curriculo_texto: str = ""
    maturidade: float = 0.0
    o_que_busco: str = ""
    skills: list[str] = Field(default_factory=list)

class StudentResponse(BaseModel):
    uid: str
    name: str
    email: str
    institution: str
    course: str
    semester: int
    bio: str
    curriculo_texto: str
    maturidade: float
    o_que_busco: str
    skills: list[SkillResponse] = Field(default_factory=list)
    node_type: str = "student"


# ═══════════════════════════════════════════
# DOCENTE  (unified Researcher + Professor)
# ═══════════════════════════════════════════

class DocenteCreate(BaseModel):
    name: str
    email: str = ""
    password: str = ""
    institution: str = ""
    department: str = ""
    research_group: str = ""
    cargo: str = "pesquisador"  # pesquisador | professor | professor-pesquisador
    bio: str = ""
    curriculo_texto: str = ""
    maturidade: float = 0.0
    o_que_busco: str = ""
    skills: list[str] = Field(default_factory=list)
    areas: list[str] = Field(default_factory=list)

class DocenteResponse(BaseModel):
    uid: str
    name: str
    email: str
    institution: str
    department: str
    research_group: str
    cargo: str
    bio: str
    curriculo_texto: str
    maturidade: float
    o_que_busco: str
    skills: list[SkillResponse] = Field(default_factory=list)
    areas: list[AreaResponse] = Field(default_factory=list)
    node_type: str = "docente"

# Backward-compat aliases (used by legacy routes not yet migrated)
ResearcherCreate = DocenteCreate
ResearcherResponse = DocenteResponse
ProfessorCreate = DocenteCreate
ProfessorResponse = DocenteResponse


# ═══════════════════════════════════════════
# EDITAL
# ═══════════════════════════════════════════

class EditalCreate(BaseModel):
    title: str
    description: str = ""
    instituicao: str = ""
    edital_type: str = "pesquisa"
    funding: float = 0.0
    deadline: str = ""
    min_maturidade: float = 0.0
    required_skills: list[str] = Field(default_factory=list)
    target_areas: list[str] = Field(default_factory=list)

class EditalResponse(BaseModel):
    uid: str
    title: str
    description: str
    instituicao: str
    edital_type: str
    funding: float
    deadline: str
    min_maturidade: float
    status: str
    required_skills: list[SkillResponse] = Field(default_factory=list)
    target_areas: list[AreaResponse] = Field(default_factory=list)
    node_type: str = "edital"


# ═══════════════════════════════════════════
# MATCH
# ═══════════════════════════════════════════

class MatchResponse(BaseModel):
    entity_uid: str
    entity_name: str
    entity_type: str
    edital_uid: str
    edital_title: str
    score: float
    matched_skills: list[str] = Field(default_factory=list)
    matched_areas: list[str] = Field(default_factory=list)
    justification: str = ""


# ═══════════════════════════════════════════
# GRAPH DATA (for visualization)
# ═══════════════════════════════════════════

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    size: float = 5.0
    color: str = "#0ea5e9"
    metadata: dict = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    weight: float = 1.0
    color: str = "#334155"
    metadata: dict = Field(default_factory=dict)

class GraphData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]

class DashboardStats(BaseModel):
    total_students: int = 0
    total_docentes: int = 0
    total_editais: int = 0
    total_skills: int = 0
    total_areas: int = 0
    total_matches: int = 0
    avg_match_score: float = 0.0
    graph_mode: str = "Neo4j AuraDB"
    is_connected: bool = True
