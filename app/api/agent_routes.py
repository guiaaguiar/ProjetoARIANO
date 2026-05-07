from __future__ import annotations

"""API Routes — AI Agent Operations.

Endpoints for triggering and managing AI agent operations:
- Profile analysis (ProfileAnalyzer)
- Edital interpretation (EditalInterpreter)
- Eligibility calculation (EligibilityCalculator)
- Full pipeline (analyze → interpret → calculate)
"""

import logging
import json
import re
import uuid
import datetime
from typing import Optional

# Lazy imports moved inside functions to reduce memory footprint
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.neo4j_driver import run_cypher, is_memory_mode, get_memory_store
# Agent imports moved inside getters for lazy loading
from app.services.match_engine import (
    get_all_matches,
    get_matches_for_entity,
    get_matches_for_edital,
    get_match_stats,
    get_entity_connections,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["AI Agents"])

# Singleton instances
_profile_analyzer = None
_edital_interpreter = None
_eligibility_calculator = None


def _get_profile_analyzer() -> ProfileAnalyzer:
    global _profile_analyzer
    if _profile_analyzer is None:
        from app.agents.profile_analyzer import ProfileAnalyzer
        _profile_analyzer = ProfileAnalyzer()
        logger.info(f"🤖 ProfileAnalyzer Singleton: LLM {'disponível' if _profile_analyzer.llm else 'indisponível'}")
    return _profile_analyzer


def _get_edital_interpreter() -> EditalInterpreter:
    global _edital_interpreter
    if _edital_interpreter is None:
        from app.agents.edital_interpreter import EditalInterpreter
        _edital_interpreter = EditalInterpreter()
        logger.info(f"🤖 EditalInterpreter Singleton: LLM {'disponível' if _edital_interpreter.llm else 'indisponível'}")
    return _edital_interpreter


def _get_eligibility_calculator() -> EligibilityCalculator:
    global _eligibility_calculator
    if _eligibility_calculator is None:
        from app.agents.eligibility_calculator import EligibilityCalculator
        _eligibility_calculator = EligibilityCalculator()
        logger.info(f"🤖 EligibilityCalculator Singleton: LLM {'disponível' if _eligibility_calculator.llm else 'indisponível'}")
    return _eligibility_calculator


# ═══════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════

class AnalyzeProfileRequest(BaseModel):
    entity_uid: str
    entity_type: str = "Student"  # Student, Researcher, Professor
    name: str = ""
    bio: str = ""
    institution: str = ""
    course: str = ""
    level: str = "graduacao"
    skills: list[str] = Field(default_factory=list)


class InterpretEditalRequest(BaseModel):
    edital_uid: str
    title: str = ""
    description: str = ""
    agency: str = ""
    edital_type: str = "pesquisa"
    funding: float = 0.0
    min_level: str = "graduacao"
    required_skills: list[str] = Field(default_factory=list)
    target_areas: list[str] = Field(default_factory=list)


class CalculateRequest(BaseModel):
    entity_uid: Optional[str] = None
    edital_uid: Optional[str] = None


class AgentResponse(BaseModel):
    status: str
    message: str
    data: dict = Field(default_factory=dict)


class ProfileContextRequest(BaseModel):
    entity_uid: str
    name: str
    bio: str = ""
    institution: str = ""
    course: str = ""
    level: str = "graduacao"
    curriculo_texto: str = ""


class ExtractSkillsRequest(BaseModel):
    entity_uid: str
    context: str


class MatchEditaisRequest(BaseModel):
    entity_uid: str
    context: str
    skills: list[str]


class ExplainMatchesRequest(BaseModel):
    entity_uid: str
    context: str
    skills: list[str]
    matches: list[dict] # list of {title, uid}


# ═══════════════════════════════════════════
# V2 MULTI-STEP PIPELINE (FOR ANIMATION)
# ═══════════════════════════════════════════

@router.post("/v2/analyze-profile", response_model=AgentResponse)
def analyze_profile_v2(request: ProfileContextRequest):
    """Stage 1: Generate rich context string and initial summary."""
    # Verify user existence (with retry if memory mode)
    import time
    exists = False
    for i in range(3):
        user_check = run_cypher("MATCH (u) WHERE u.uid = $uid RETURN u.name", {"uid": request.entity_uid})
        if user_check:
            exists = True
            break
        if is_memory_mode():
            logger.info(f"⏳ Stage 1: Usuário {request.entity_uid} não encontrado (tentativa {i+1}/3). Recarregando KV...")
            get_memory_store(force_refresh=True)
            time.sleep(1.5) # Espera 1.5s entre retries para propagação KV

    if not exists:
        logger.error(f"❌ Stage 1: User {request.entity_uid} not found in graph. (Modo Memória detectado - dados perdidos)" if is_memory_mode() else f"❌ Stage 1: User {request.entity_uid} not found.")
        return AgentResponse(
            status="error",
            message=f"Usuário {request.entity_uid} não encontrado no grafo. {'(Modo Memória detectado - dados perdidos)' if is_memory_mode() else ''}",
            data={}
        )

    analyzer = _get_profile_analyzer()
    context = analyzer.generate_profile_context(request.model_dump())
    
    # Save partial progress to graph
    run_cypher(
        """
        MATCH (u) WHERE u.uid = $uid
        SET u.ai_context = $context,
            u.last_ai_analysis = datetime()
        """,
        {"uid": request.entity_uid, "context": context}
    )
    
    summary = f"Perfil acadêmico de {request.name} detectado e contextualizado."
    
    return AgentResponse(
        status="success",
        message="Contexto gerado e persistido",
        data={"context": context, "summary": summary}
    )


@router.post("/v2/extract-skills", response_model=AgentResponse)
def extract_skills_v2(request: ExtractSkillsRequest):
    # Verify user existence
    from app.core.neo4j_driver import run_cypher, is_memory_mode
    # Verify user existence (with retry if memory mode)
    import time
    exists = False
    for i in range(3):
        user_check = run_cypher("MATCH (u) WHERE u.uid = $uid RETURN u.name", {"uid": request.entity_uid})
        if user_check:
            exists = True
            break
        if is_memory_mode():
            logger.info(f"⏳ Stage 2: Usuário {request.entity_uid} não encontrado (tentativa {i+1}/3). Recarregando KV...")
            get_memory_store(force_refresh=True)
            time.sleep(1.0)
            
    if not exists:
        logger.error(f"❌ Stage 2: User {request.entity_uid} not found.")
        return AgentResponse(status="error", message="Usuário não encontrado para extração de skills.", data={})

    analyzer = _get_profile_analyzer()
    
    if analyzer.llm:
        prompt = f"""Como Agente Analista do ARIANO, examine o perfil abaixo:
        CONTEXTO: {request.context}
        
        Sua tarefa:
        1. Extrair as 5 competências técnicas (Skills).
        2. Extrair as 3 áreas de atuação acadêmica.
        3. Gerar um scratchpad de raciocínio (Chain-of-Thought) de 3 steps.
        
        Responda ESTRITAMENTE em formato JSON:
        {{
            "scratchpad": "Step 1: ... Step 2: ... Step 3: ...",
            "skills": ["Skill 1", ...],
            "areas": ["Area 1", ...]
        }}"""
        try:
            from langchain_core.messages import HumanMessage
            response = analyzer.llm.invoke([HumanMessage(content=prompt)])
            clean_content = re.sub(r'```json\s*|\s*```', '', response.content).strip()
            data = json.loads(clean_content)
        except Exception as e:
            logger.error(f"❌ LLM V2 Skills failed: {e}")
            data = {"scratchpad": "Erro na análise profunda.", "skills": ["Inovação"], "areas": ["Tecnologia"]}
    else:
        analysis = analyzer._analyze_rule_based({"bio": request.context, "curriculo_texto": ""})
        data = {
            "scratchpad": "Análise via motor de regras estáticas.",
            "skills": [s["name"] for s in analysis["extracted_skills"]][:5],
            "areas": analysis["classified_areas"][:3]
        }
    
    # PERSISTENCE IN NEO4J (Batched for Performance)
    from app.core.neo4j_driver import get_memory_store, is_memory_mode
    
    def _save_skills_and_areas():
        # Update User with scratchpad
        run_cypher(
            "MATCH (u) WHERE u.uid = $uid SET u.scratchpad = $scratch, u.last_step = 'skills'",
            {"uid": request.entity_uid, "scratch": data.get("scratchpad")}
        )
        
        # Create Skills & Connections
        for s_name in data["skills"]:
            run_cypher(
                """
                MERGE (s:Skill {name: $name})
                ON CREATE SET s.uid = $suid, s.created_at = timestamp()
                WITH s
                MATCH (u) WHERE u.uid = $uid
                MERGE (u)-[r:HAS_SKILL]->(s)
                SET r.source = 'v2_pipeline', r.confidence = 0.95
                """,
                {"name": s_name, "suid": str(uuid.uuid4())[:8], "uid": request.entity_uid}
            )
            
        # Create Areas & Connections
        for a_name in data["areas"]:
            run_cypher(
                """
                MERGE (a:Area {name: $name})
                ON CREATE SET a.uid = $auid, a.created_at = timestamp()
                WITH a
                MATCH (u) WHERE u.uid = $uid
                MERGE (u)-[r:WORKS_IN_AREA]->(a)
                SET r.source = 'v2_pipeline'
                """,
                {"name": a_name, "auid": str(uuid.uuid4())[:8], "uid": request.entity_uid}
            )

    if is_memory_mode():
        with get_memory_store().batch_update():
            _save_skills_and_areas()
    else:
        _save_skills_and_areas()
        
    return AgentResponse(status="success", message="Skills persistidas no grafo", data=data)


@router.post("/v2/match-editais", response_model=AgentResponse)
def match_editais_v2(request: MatchEditaisRequest):
    """Stage 3: Find relevant editais using graph topology + LLM filtering."""
    calculator = _get_eligibility_calculator()
    
    editais = run_cypher("MATCH (e:Edital) WHERE e.status = 'aberto' RETURN e.title AS title, e.uid AS uid, e.description AS description")
    
    if not editais:
        return AgentResponse(status="success", message="Nenhum edital disponível", data={"matches": []})

    if calculator.llm:
        # Prompt simplificado para filtragem rápida
        edital_list = [f"- {e['title']} (ID: {e['uid']})" for e in editais]
        prompt = f"""Como Orquestrador do ARIANO, selecione os 3 editais mais compatíveis.
        
        PERFIL: {request.context}
        SKILLS: {', '.join(request.skills)}
        
        EDITAIS:
        {chr(10).join(edital_list)}
        
        Responda APENAS em JSON:
        {{ "matches": [ {{ "title": "Título", "uid": "uid" }} ] }}"""
        
        try:
            from langchain_core.messages import HumanMessage
            response = calculator.llm.invoke([HumanMessage(content=prompt)])
            clean_content = re.sub(r'```json\s*|\s*```', '', response.content).strip()
            data = json.loads(clean_content)
        except Exception as e:
            logger.error(f"❌ Match filtering failed: {e}")
            data = {"matches": [{"title": e["title"], "uid": e["uid"]} for e in editais[:3]]}
    else:
        data = {"matches": [{"title": e["title"], "uid": e["uid"]} for e in editais[:3]]}

    return AgentResponse(status="success", message="Matches filtrados", data=data)


@router.post("/v2/explain-matches", response_model=AgentResponse)
def explain_matches_v2(request: ExplainMatchesRequest):
    """Stage 4: Generate DEEP justifications for each selected match + PERSIST."""
    calculator = _get_eligibility_calculator()
    
    if not calculator.llm:
        data = {"matches": [{**m, "justification": f"Match estratégico baseado em {request.skills[0] if request.skills else 'perfil acadêmico'}."} for m in request.matches]}
    else:
        prompt = f"""Como Analista Sênior do ARIANO, você deve justificar por que estes editais são perfeitos para o acadêmico.
        
        PERFIL: {request.context}
        SKILLS DETECTADAS: {', '.join(request.skills)}
        
        EDITAIS SELECIONADOS:
        {chr(10).join([f"- {m['title']}" for m in request.matches])}
        
        Para cada edital, escreva 1 frase impactante e técnica que explique a conexão real. Use as skills detectadas na explicação.
        
        Responda APENAS em JSON:
        {{
            "matches": [
                {{ "title": "Título Exato", "uid": "uid", "justification": "Sua bio converge com..." }}
            ]
        }}"""
        
        try:
            from langchain_core.messages import HumanMessage
            import json, re
            response = calculator.llm.invoke([HumanMessage(content=prompt)])
            clean_content = re.sub(r'```json\s*|\s*```', '', response.content).strip()
            data = json.loads(clean_content)
        except Exception as e:
            logger.error(f"❌ Explain matches failed: {e}")
            return AgentResponse(status="error", message="Falha ao gerar justificativas", data={})

    # PERSISTENCE IN NEO4J (Batched for Performance)
    from app.core.neo4j_driver import get_memory_store, is_memory_mode
    
    def _save_matches():
        for match in data.get("matches", []):
            run_cypher(
                """
                MATCH (u) WHERE u.uid = $uid
                MATCH (e:Edital) WHERE e.uid = $euid OR e.title = $title
                MERGE (u)-[r:ELIGIBLE_FOR]->(e)
                SET r.justification = $just,
                    r.score = 0.9,
                    r.source = 'v2_pipeline',
                    r.created_at = timestamp()
                """,
                {
                    "uid": request.entity_uid,
                    "euid": match.get("uid"),
                    "title": match.get("title"),
                    "just": match.get("justification")
                }
            )

    if is_memory_mode():
        with get_memory_store().batch_update():
            _save_matches()
    else:
        _save_matches()

    return AgentResponse(status="success", message="Matches e justificativas salvos no grafo", data=data)


# ═══════════════════════════════════════════
# PROFILE ANALYZER ENDPOINTS
# ═══════════════════════════════════════════

@router.post("/analyze-profile", response_model=AgentResponse)
def analyze_profile(request: AnalyzeProfileRequest):
    """Analyze an academic profile and configure the graph with extracted skills."""
    analyzer = _get_profile_analyzer()

    profile_data = {
        "name": request.name,
        "bio": request.bio,
        "institution": request.institution,
        "course": request.course,
        "level": request.level,
        "skills": request.skills,
    }

    try:
        result = analyzer.analyze_and_configure(
            request.entity_uid, request.entity_type, profile_data
        )
        return AgentResponse(
            status="success",
            message=f"Profile analyzed for {request.entity_type} {request.entity_uid}",
            data=result,
        )
    except Exception as e:
        logger.error(f"Profile analysis failed: {e}")
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.post("/analyze-profile/preview", response_model=AgentResponse)
def preview_profile_analysis(request: AnalyzeProfileRequest):
    """Preview profile analysis WITHOUT writing to the graph."""
    analyzer = _get_profile_analyzer()

    profile_data = {
        "name": request.name,
        "bio": request.bio,
        "institution": request.institution,
        "course": request.course,
        "level": request.level,
        "skills": request.skills,
    }

    try:
        analysis = analyzer.analyze_profile(profile_data)
        return AgentResponse(
            status="preview",
            message="Analysis preview (not written to graph)",
            data=analysis,
        )
    except Exception as e:
        raise HTTPException(500, f"Preview failed: {str(e)}")


# ═══════════════════════════════════════════
# EDITAL INTERPRETER ENDPOINTS
# ═══════════════════════════════════════════

@router.post("/interpret-edital", response_model=AgentResponse)
def interpret_edital(request: InterpretEditalRequest):
    """Interpret an edital and configure the graph with requirements."""
    interpreter = _get_edital_interpreter()

    edital_data = {
        "title": request.title,
        "description": request.description,
        "agency": request.agency,
        "edital_type": request.edital_type,
        "funding": request.funding,
        "min_level": request.min_level,
        "required_skills": request.required_skills,
        "target_areas": request.target_areas,
    }

    try:
        result = interpreter.interpret_and_configure(request.edital_uid, edital_data)
        return AgentResponse(
            status="success",
            message=f"Edital interpreted: {request.edital_uid}",
            data=result,
        )
    except Exception as e:
        logger.error(f"Edital interpretation failed: {e}")
        raise HTTPException(500, f"Interpretation failed: {str(e)}")


# ═══════════════════════════════════════════
# ELIGIBILITY CALCULATOR ENDPOINTS
# ═══════════════════════════════════════════

@router.post("/calculate-matches", response_model=AgentResponse)
def calculate_matches(request: CalculateRequest = CalculateRequest()):
    """Calculate eligibility scores.

    - No params: calculate ALL matches (batch)
    - entity_uid: calculate for specific entity
    - edital_uid: calculate for specific edital
    """
    calculator = _get_eligibility_calculator()

    try:
        if request.entity_uid:
            result = calculator.calculate_for_entity(request.entity_uid)
            msg = f"Calculated matches for entity {request.entity_uid}"
        elif request.edital_uid:
            result = calculator.calculate_for_edital(request.edital_uid)
            msg = f"Calculated matches for edital {request.edital_uid}"
        else:
            result = calculator.calculate_all_matches()
            msg = "Calculated ALL matches (batch)"

        return AgentResponse(status="success", message=msg, data=result)
    except Exception as e:
        logger.error(f"Match calculation failed: {e}")
        raise HTTPException(500, f"Calculation failed: {str(e)}")


@router.post("/orchestrate/{uid}", response_model=AgentResponse)
def orchestrate_user(uid: str, background_tasks: BackgroundTasks):
    """Re-trigger the full Orchestrator pipeline for a user."""

    query = """
    MATCH (u)
    WHERE (u:Student OR u:Researcher OR u:Professor) AND u.uid = $uid
    RETURN u.name AS name, labels(u)[0] AS type, u.bio AS bio, 
           u.institution AS institution, u.course AS course, 
           u.level AS level, u.semester AS semester, u.curriculo_texto AS curriculo_texto
    """
    results = run_cypher(query, {"uid": uid})
    if not results:
        raise HTTPException(404, "Usuário não encontrado")
    
    user_data = results[0]
    from app.agents.orchestrator import OrchestratorAgent
    orchestrator = OrchestratorAgent()
    
    background_tasks.add_task(
        orchestrator.process_new_entity,
        uid,
        user_data["type"],
        user_data
    )
    
    return AgentResponse(
        status="success",
        message=f"Pipeline reiniciado para {user_data['name']}",
        data={"uid": uid}
    )


@router.post("/recalculate-all", response_model=AgentResponse)
def recalculate_all_matches():
    """Clear all existing matches and recalculate everything from scratch."""
    calculator = _get_eligibility_calculator()

    try:
        result = calculator.recalculate_all()
        return AgentResponse(
            status="success",
            message="All matches recalculated from scratch",
            data=result,
        )
    except Exception as e:
        logger.error(f"Recalculation failed: {e}")
        raise HTTPException(500, f"Recalculation failed: {str(e)}")


# ═══════════════════════════════════════════
# FULL PIPELINE
# ═══════════════════════════════════════════

@router.post("/run-pipeline", response_model=AgentResponse)
def run_full_pipeline():
    """Run the complete ARIANO pipeline:
    1. Analyze all profiles (ProfileAnalyzer)
    2. Interpret all editais (EditalInterpreter)
    3. Calculate all matches (EligibilityCalculator)
    """

    analyzer = _get_profile_analyzer()
    interpreter = _get_edital_interpreter()
    calculator = _get_eligibility_calculator()

    results = {
        "profiles_analyzed": 0,
        "editais_interpreted": 0,
        "matches_calculated": {},
    }

    try:
        # Step 1: Analyze all academic profiles
        academics = run_cypher("""
            MATCH (a)
            WHERE a:Student OR a:Researcher OR a:Professor
            RETURN a.uid AS uid, labels(a)[0] AS type, a.name AS name,
                   a.bio AS bio, a.institution AS institution,
                   a.course AS course, a.level AS level
        """)

        for academic in academics:
            profile_data = {
                "name": academic.get("name", ""),
                "bio": academic.get("bio", ""),
                "institution": academic.get("institution", ""),
                "course": academic.get("course", ""),
                "level": academic.get("level", "graduacao"),
                "skills": [],
            }
            analyzer.analyze_and_configure(
                academic["uid"], academic["type"], profile_data
            )
            results["profiles_analyzed"] += 1

        # Step 2: Interpret all editais
        editais = run_cypher("""
            MATCH (e:Edital)
            RETURN e.uid AS uid, e.title AS title, e.description AS description,
                   e.agency AS agency, e.edital_type AS edital_type,
                   e.funding AS funding, e.min_level AS min_level
        """)

        for edital in editais:
            edital_data = {
                "title": edital.get("title", ""),
                "description": edital.get("description", ""),
                "agency": edital.get("agency", ""),
                "edital_type": edital.get("edital_type", "pesquisa"),
                "funding": edital.get("funding", 0),
                "min_level": edital.get("min_level", "graduacao"),
                "required_skills": [],
                "target_areas": [],
            }
            interpreter.interpret_and_configure(edital["uid"], edital_data)
            results["editais_interpreted"] += 1

        # Step 3: Calculate all matches
        results["matches_calculated"] = calculator.recalculate_all()

        return AgentResponse(
            status="success",
            message="Full pipeline completed successfully",
            data=results,
        )
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise HTTPException(500, f"Pipeline failed: {str(e)}")


# ═══════════════════════════════════════════
# MATCH ENGINE QUERY ENDPOINTS
# ═══════════════════════════════════════════

@router.get("/matches", response_model=AgentResponse, tags=["Match Engine"])
def query_matches(
    entity_uid: Optional[str] = None,
    edital_uid: Optional[str] = None,
    threshold: float = 0.0,
    limit: int = 100,
):
    """Query pre-computed matches from the graph (O(1) Cypher)."""
    try:
        if entity_uid:
            matches = get_matches_for_entity(entity_uid, threshold)
        elif edital_uid:
            matches = get_matches_for_edital(edital_uid, threshold)
        else:
            matches = get_all_matches(threshold, limit)

        return AgentResponse(
            status="success",
            message=f"Found {len(matches)} matches",
            data={"matches": matches, "count": len(matches)},
        )
    except Exception as e:
        raise HTTPException(500, f"Query failed: {str(e)}")


@router.get("/match-stats", response_model=AgentResponse, tags=["Match Engine"])
def query_match_stats():
    """Get statistical summary of all matches."""
    try:
        stats = get_match_stats()
        return AgentResponse(
            status="success",
            message="Match statistics retrieved",
            data=stats,
        )
    except Exception as e:
        raise HTTPException(500, f"Stats query failed: {str(e)}")


@router.get("/connections/{entity_uid}", response_model=AgentResponse, tags=["Match Engine"])
def query_entity_connections(entity_uid: str):
    """Get all connections for an entity (skills, areas, matches)."""
    try:
        connections = get_entity_connections(entity_uid)
        return AgentResponse(
            status="success",
            message=f"Connections for {entity_uid}",
            data=connections,
        )
    except Exception as e:
        raise HTTPException(500, f"Query failed: {str(e)}")

@router.get("/communities", response_model=AgentResponse, tags=["Agents"])
def detect_communities():
    """Detect communities using NetworkX Louvain algorithm based on ELIGIBLE_FOR and HAS_SKILL."""
    import networkx as nx
    G = nx.Graph()
    
    if is_memory_mode():
        store = get_memory_store()
        for node_id, node in store.nodes.items():
            G.add_node(node_id, type=node["labels"][0], name=node["props"].get("name") or node["props"].get("title", ""))
            
        for edge in store.edges:
            G.add_edge(edge["source"], edge["target"], weight=1.0)
    else:
        nodes = run_cypher("MATCH (n) RETURN n.uid as id, labels(n)[0] as type, coalesce(n.name, n.title) as name")
        for n in nodes:
            G.add_node(n["id"], type=n["type"], name=n["name"])
            
        edges = run_cypher("MATCH (a)-[r]->(b) RETURN a.uid as source, b.uid as target")
        for e in edges:
            G.add_edge(e["source"], e["target"], weight=1.0)
            
    # Remove isolated nodes to avoid noise
    G.remove_nodes_from(list(nx.isolates(G)))

    try:
        # Louvain algorithm
        communities = nx.community.louvain_communities(G, weight='weight')
        
        clusters = []
        for i, comm in enumerate(communities):
            members = []
            for node_id in comm:
                node_data = G.nodes[node_id]
                members.append({"id": node_id, "type": node_data.get("type"), "name": node_data.get("name")})
            
            clusters.append({
                "cluster_id": i + 1,
                "size": len(comm),
                "members": members
            })
            
        return AgentResponse(
            status="success",
            message=f"Detected {len(clusters)} communities",
            data={"clusters": clusters}
        )
    except Exception as e:
        raise HTTPException(500, f"Community detection failed: {str(e)}")


@router.get("/status", response_model=AgentResponse, tags=["AI Agents"])
def agent_status():
    """Check status of all AI agents."""
    analyzer = _get_profile_analyzer()
    interpreter = _get_edital_interpreter()
    calculator = _get_eligibility_calculator()

    return AgentResponse(
        status="success",
        message="Agent status retrieved",
        data={
            "is_memory_mode": is_memory_mode(),
            "llm_provider": "OpenRouter",
            "llm_model": settings.openrouter_model,
            "profile_analyzer": {
                "llm_available": analyzer.llm is not None,
                "mode": "nemotron-3-super" if analyzer.llm else "rule-based",
            },
            "edital_interpreter": {
                "llm_available": interpreter.llm is not None,
                "mode": "nemotron-3-super" if interpreter.llm else "rule-based",
            },
            "eligibility_calculator": {
                "llm_available": calculator.llm is not None,
                "mode": "nemotron-3-super+math" if calculator.llm else "math-only",
            },
        },
    )
