"""Neo4j Graph Models — ARIANO v0.

Graph schema for matchmaking between Academia and Government:
  - Nodes: Student, Researcher, Professor, Edital, Skill, Area
  - Edges: HAS_SKILL, RESEARCHES_AREA, REQUIRES_SKILL, TARGETS_AREA,
           ELIGIBLE_FOR, ADVISES, COLLABORATES
"""

from datetime import datetime

from neomodel import (
    FloatProperty,
    RelationshipFrom,
    RelationshipTo,
    StringProperty,
    StructuredNode,
    StructuredRel,
    UniqueIdProperty,
    IntegerProperty,
    DateTimeProperty,
    ArrayProperty,
)


# ═══════════════════════════════════════════
# RELATIONSHIP MODELS (Edges with properties)
# ═══════════════════════════════════════════

class HasSkillRel(StructuredRel):
    """Edge: (Academia)-[:HAS_SKILL]->(Skill)."""

    confidence = FloatProperty(default=0.0)
    provenance = StringProperty(default="manual")
    created_at = DateTimeProperty(default_now=True)


class RequiresSkillRel(StructuredRel):
    """Edge: (Edital)-[:REQUIRES_SKILL]->(Skill)."""

    priority = StringProperty(default="desirable")  # essential, desirable, optional
    provenance = StringProperty(default="manual")
    created_at = DateTimeProperty(default_now=True)


class EligibleForRel(StructuredRel):
    """Edge: (Academia)-[:ELIGIBLE_FOR]->(Edital). THE MATCH EDGE."""

    score = FloatProperty(default=0.0)
    matched_skills = ArrayProperty(StringProperty(), default=[])
    matched_areas = ArrayProperty(StringProperty(), default=[])
    justification = StringProperty(default="")
    calculated_by = StringProperty(default="agent:EligibilityCalculator")
    calculated_at = DateTimeProperty(default_now=True)


class ResearchesAreaRel(StructuredRel):
    """Edge: (Academia)-[:RESEARCHES_AREA]->(Area)."""

    provenance = StringProperty(default="manual")
    created_at = DateTimeProperty(default_now=True)


class TargetsAreaRel(StructuredRel):
    """Edge: (Edital)-[:TARGETS_AREA]->(Area)."""

    provenance = StringProperty(default="manual")
    created_at = DateTimeProperty(default_now=True)


# ═══════════════════════════════════════════
# NODE MODELS — REFERENCE (Skill, Area)
# ═══════════════════════════════════════════

class Skill(StructuredNode):
    """Node: Skill — a competence or technology."""

    uid = UniqueIdProperty()
    name = StringProperty(unique_index=True, required=True)
    category = StringProperty(default="general")
    created_at = DateTimeProperty(default_now=True)

    # Incoming relationships
    possessed_by_students = RelationshipFrom("Student", "HAS_SKILL", model=HasSkillRel)
    possessed_by_researchers = RelationshipFrom("Researcher", "HAS_SKILL", model=HasSkillRel)
    possessed_by_professors = RelationshipFrom("Professor", "HAS_SKILL", model=HasSkillRel)
    required_by_editals = RelationshipFrom("Edital", "REQUIRES_SKILL", model=RequiresSkillRel)


class Area(StructuredNode):
    """Node: Area — a research/knowledge area."""

    uid = UniqueIdProperty()
    name = StringProperty(unique_index=True, required=True)
    parent_area = StringProperty(default="")
    created_at = DateTimeProperty(default_now=True)

    # Incoming relationships
    researched_by = RelationshipFrom("Researcher", "RESEARCHES_AREA", model=ResearchesAreaRel)
    targeted_by = RelationshipFrom("Edital", "TARGETS_AREA", model=TargetsAreaRel)


# ═══════════════════════════════════════════
# NODE MODELS — ACADEMIA
# ═══════════════════════════════════════════

class Student(StructuredNode):
    """Node: Student — undergraduate or graduate student."""

    uid = UniqueIdProperty()
    name = StringProperty(required=True)
    email = StringProperty(default="")
    password_hash = StringProperty(default="")
    institution = StringProperty(default="")
    course = StringProperty(default="")
    semester = IntegerProperty(default=1)
    bio = StringProperty(default="")
    curriculo_texto = StringProperty(default="")
    maturidade = FloatProperty(default=0.0)
    o_que_busco = StringProperty(default="")
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Outgoing relationships
    skills = RelationshipTo("Skill", "HAS_SKILL", model=HasSkillRel)
    eligible_for = RelationshipTo("Edital", "ELIGIBLE_FOR", model=EligibleForRel)


class Researcher(StructuredNode):
    """Node: Researcher — active researcher."""

    uid = UniqueIdProperty()
    name = StringProperty(required=True)
    email = StringProperty(default="")
    password_hash = StringProperty(default="")
    institution = StringProperty(default="")
    bio = StringProperty(default="")
    curriculo_texto = StringProperty(default="")
    maturidade = FloatProperty(default=0.0)
    o_que_busco = StringProperty(default="")
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Outgoing relationships
    skills = RelationshipTo("Skill", "HAS_SKILL", model=HasSkillRel)
    areas = RelationshipTo("Area", "RESEARCHES_AREA", model=ResearchesAreaRel)
    eligible_for = RelationshipTo("Edital", "ELIGIBLE_FOR", model=EligibleForRel)


class Professor(StructuredNode):
    """Node: Professor — academic professor."""

    uid = UniqueIdProperty()
    name = StringProperty(required=True)
    email = StringProperty(default="")
    password_hash = StringProperty(default="")
    institution = StringProperty(default="")
    department = StringProperty(default="")
    research_group = StringProperty(default="")
    bio = StringProperty(default="")
    curriculo_texto = StringProperty(default="")
    maturidade = FloatProperty(default=0.0)
    o_que_busco = StringProperty(default="")
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Outgoing relationships
    skills = RelationshipTo("Skill", "HAS_SKILL", model=HasSkillRel)
    areas = RelationshipTo("Area", "RESEARCHES_AREA", model=ResearchesAreaRel)
    eligible_for = RelationshipTo("Edital", "ELIGIBLE_FOR", model=EligibleForRel)
    advises = RelationshipTo("Student", "ADVISES")
    collaborates = RelationshipTo("Researcher", "COLLABORATES")


# ═══════════════════════════════════════════
# NODE MODELS — GOVERNMENT
# ═══════════════════════════════════════════

class Edital(StructuredNode):
    """Node: Edital — government funding call / public notice."""

    uid = UniqueIdProperty()
    title = StringProperty(required=True)
    description = StringProperty(default="")
    instituicao = StringProperty(default="")  # FACEPE, CNPq, CAPES
    edital_type = StringProperty(default="pesquisa")  # pesquisa, extensao, iniciacao_cientifica
    funding = FloatProperty(default=0.0)
    deadline = StringProperty(default="")
    min_maturidade = FloatProperty(default=0.0)
    status = StringProperty(default="aberto")  # aberto, fechado, em_analise
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Outgoing relationships
    requires_skills = RelationshipTo("Skill", "REQUIRES_SKILL", model=RequiresSkillRel)
    targets_areas = RelationshipTo("Area", "TARGETS_AREA", model=TargetsAreaRel)

    # Incoming relationships (matches)
    eligible_students = RelationshipFrom("Student", "ELIGIBLE_FOR", model=EligibleForRel)
    eligible_researchers = RelationshipFrom("Researcher", "ELIGIBLE_FOR", model=EligibleForRel)
    eligible_professors = RelationshipFrom("Professor", "ELIGIBLE_FOR", model=EligibleForRel)
