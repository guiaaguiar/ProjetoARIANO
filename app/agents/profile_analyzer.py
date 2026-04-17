"""ProfileAnalyzer Agent — Extracts skills and classifies academic profiles.

This agent takes raw academic profile data and:
1. Extracts implicit skills from bio/description using LLM
2. Classifies the academic level and research areas
3. Creates/updates nodes and HAS_SKILL edges in Neo4j
4. Enriches profiles with structured metadata

LLM: NVIDIA Nemotron 3 Super (120B MoE, 12B active) via OpenRouter
Part of PHASE 1 (Graph Configuration) — runs offline/async.
"""

import json
import logging
import uuid
from typing import Optional

from app.core.config import settings
from app.core.neo4j_driver import run_cypher

logger = logging.getLogger(__name__)

# Skill taxonomy for classification
SKILL_CATEGORIES = {
    "programacao": ["Python", "JavaScript", "TypeScript", "Java", "C++", "React",
                    "FastAPI", "Django", "Node.js", "SQL", "HTML", "CSS"],
    "ia": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision",
           "LangChain", "TensorFlow", "PyTorch", "Reinforcement Learning",
           "Generative AI", "Transfer Learning"],
    "ciencia_dados": ["Data Science", "Statistics", "R", "Pandas", "Spark",
                      "Data Visualization", "Big Data", "ETL"],
    "banco_de_dados": ["Neo4j", "Graph Databases", "MongoDB", "PostgreSQL",
                       "Redis", "Elasticsearch"],
    "devops": ["Docker", "Kubernetes", "Cloud Computing", "AWS", "Azure",
               "CI/CD", "Terraform", "Linux"],
    "hardware": ["IoT", "Embedded Systems", "Arduino", "FPGA", "Robotics"],
    "seguranca": ["Cybersecurity", "Cryptography", "Network Security",
                  "Penetration Testing", "LGPD"],
}

# Level hierarchy for academic matching
LEVEL_HIERARCHY = {
    "graduacao": 1,
    "mestrado": 2,
    "doutorado": 3,
    "pos-doutorado": 4,
}


class ProfileAnalyzer:
    """AI Agent that analyzes academic profiles and configures the graph."""

    def __init__(self):
        self.llm = None
        self._init_llm()

    def _init_llm(self):
        """Initialize LLM via OpenRouter (NVIDIA Nemotron 3 Super)."""
        if settings.openrouter_api_key:
            try:
                from langchain_openai import ChatOpenAI
                self.llm = ChatOpenAI(
                    model=settings.openrouter_model,
                    openai_api_key=settings.openrouter_api_key,
                    openai_api_base=settings.openrouter_base_url,
                    temperature=0.1,
                    max_tokens=2048,
                    default_headers={
                        "HTTP-Referer": "https://github.com/guiaaguiar/ProjetoARIANO",
                        "X-Title": "ARIANO - ProfileAnalyzer Agent",
                    },
                )
                logger.info("✅ ProfileAnalyzer: Nemotron 3 Super LLM initialized via OpenRouter")
            except Exception as e:
                logger.warning(f"⚠️ ProfileAnalyzer: Could not init LLM: {e}")
                self.llm = None
        else:
            logger.info("ℹ️ ProfileAnalyzer: No API key, using rule-based extraction")

    def analyze_profile(self, profile_data: dict) -> dict:
        """Analyze an academic profile and extract structured features.

        Args:
            profile_data: Dict with name, bio, institution, level, course, etc.

        Returns:
            Dict with extracted_skills, classified_areas, confidence_scores.
        """
        if self.llm:
            return self._analyze_with_llm(profile_data)
        return self._analyze_rule_based(profile_data)

    def _analyze_with_llm(self, profile_data: dict) -> dict:
        """Use Nemotron 3 Super to extract skills and classify areas using Graph-CoT."""
        from app.core.graph_tools import retrieve_node, neighbour_check
        
        bio = profile_data.get('bio', '')
        curriculo_texto = profile_data.get('curriculo_texto', '')
        search_query = f"{bio} {curriculo_texto}"[:500]
        
        similar_profiles = retrieve_node(search_query, k=2)
        cluster_skills = []
        for p in similar_profiles:
            neighbors = neighbour_check(p.get('uid', ''), "HAS_SKILL")
            cluster_skills.extend([n.get('name', '') for n in neighbors])
        
        cluster_skills = list(set(cluster_skills))
        
        prompt = f"""Analise o seguinte perfil acadêmico e extraia informações via Graph-CoT (Chain-of-Thought).

PERFIL ATUAL:
- Nome: {profile_data.get('name', '')}
- Instituição: {profile_data.get('institution', '')}
- Curso/Depto: {profile_data.get('course', profile_data.get('department', ''))}
- Semestre: {profile_data.get('semester', '')}
- Bio: {bio}
- Currículo (texto): {curriculo_texto}

CONTEXTO DO GRAFO (Recuperado):
- Perfis similares no ecossistema: {[p.get('name', '') for p in similar_profiles]}
- Skills comuns neste cluster: {cluster_skills}

INSTRUÇÕES (Graph-CoT):
Você deve gerar um raciocínio sequencial estruturado em "scratchpad" (5 steps) e depois o resultado final.
Step 1: Ler bio + curriculo_texto e identificar capacidades
Step 2: Comparar com contexto do grafo (cluster_skills) para ver se há aderência
Step 3: Determinar a `maturidade` (0.0 a 10.0) baseada em experiências, e semestre
Step 4: Inferir o texto `o_que_busco` descritivo do que o acadêmico busca no ecossistema
Step 5: Extrair skills tecnológicas explícitas ou implícitas e associar áreas. O usuário NÃO selecionou tags, VOCÊ deve fazer isso.

Responda APENAS em JSON válido com a estrutura exata:
{{
    "scratchpad": "[SCRATCHPAD]\\nStep 1: ...\\nStep 2: ...\\nStep 3: ...\\nStep 4: ...\\nStep 5: ...",
    "maturidade": 7.5,
    "o_que_busco": "Oportunidades de pesquisa em IA e Healthtech...",
    "extracted_skills": [
        {{"name": "Python", "category": "programacao", "confidence": 0.95}}
    ],
    "classified_areas": ["Inteligencia Artificial", "Saude Digital"],
    "profile_summary": "Resumo em 1 frase"
}}"""

        try:
            response = self.llm.invoke(prompt)
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            result = json.loads(content.strip())
            logger.info(f"✅ ProfileAnalyzer LLM Graph-CoT executado para {profile_data.get('name')}. Maturidade: {result.get('maturidade')}")
            return result
        except Exception as e:
            logger.warning(f"⚠️ LLM analysis failed, falling back to rules: {e}")
            return self._analyze_rule_based(profile_data)

    def _analyze_rule_based(self, profile_data: dict) -> dict:
        """Rule-based skill extraction when LLM is unavailable."""
        bio = (profile_data.get("bio", "") or "").lower()
        course = (profile_data.get("course", "") or "").lower()
        curriculo = (profile_data.get("curriculo_texto", "") or "").lower()
        declared_skills = profile_data.get("skills", [])

        extracted_skills = []
        classified_areas = []

        for skill_name in declared_skills:
            category = self._categorize_skill(skill_name)
            extracted_skills.append({
                "name": skill_name,
                "category": category,
                "confidence": 0.9,
            })

        all_skills = {s: cat for cat, skills in SKILL_CATEGORIES.items() for s in skills}
        for skill_name, category in all_skills.items():
            if (skill_name.lower() in bio or skill_name.lower() in curriculo) and skill_name not in declared_skills:
                extracted_skills.append({
                    "name": skill_name,
                    "category": category,
                    "confidence": 0.7,
                })

        area_keywords = {
            "Inteligencia Artificial": ["ia", "inteligencia artificial", "machine learning", "deep learning", "ml"],
            "Ciencia de Dados": ["dados", "data science", "estatistic", "analytics"],
            "Engenharia de Software": ["software", "desenvolvimento", "web", "sistemas"],
            "Sistemas Embarcados": ["embarcado", "iot", "arduino", "hardware"],
            "Computacao em Nuvem": ["cloud", "nuvem", "aws", "azure"],
            "Processamento de Linguagem Natural": ["nlp", "pln", "linguagem natural", "texto"],
        }

        text_to_search = f"{bio} {course} {curriculo}"
        for area, keywords in area_keywords.items():
            if any(kw in text_to_search for kw in keywords):
                classified_areas.append(area)

        return {
            "scratchpad": "[SCRATCHPAD] Execução via regras estáticas sem LLM.",
            "maturidade": profile_data.get("semester", 1) * 0.8 + 2.0,
            "o_que_busco": "Oportunidades de colaboração e pesquisa.",
            "extracted_skills": extracted_skills,
            "classified_areas": classified_areas,
            "profile_summary": f"Perfil acadêmico em {profile_data.get('institution', 'N/A')}",
        }

    def _categorize_skill(self, skill_name: str) -> str:
        """Categorize a skill name into a known category."""
        for category, skills in SKILL_CATEGORIES.items():
            if skill_name in skills:
                return category
        return "general"

    def configure_graph(self, entity_uid: str, entity_type: str, analysis: dict) -> dict:
        """Write analysis results to Neo4j graph.

        Creates Skill nodes and HAS_SKILL edges based on analysis.
        """
        skills_created = 0
        edges_created = 0

        for skill_data in analysis.get("extracted_skills", []):
            run_cypher(
                """
                MERGE (s:Skill {name: $name})
                ON CREATE SET s.category = $category,
                              s.uid = $skill_uid,
                              s.created_at = $created_at
                """,
                {
                    "name": skill_data["name"], 
                    "category": skill_data.get("category", "general"),
                    "skill_uid": str(uuid.uuid4())[:8],
                    "created_at": datetime.now().isoformat()
                },
            )
            skills_created += 1

            run_cypher(
                f"""
                MATCH (a:{entity_type} {{uid: $uid}})
                MATCH (s:Skill {{name: $skill_name}})
                MERGE (a)-[r:HAS_SKILL]->(s)
                ON CREATE SET r.confidence = $confidence,
                              r.source = 'agent:ProfileAnalyzer',
                              r.created_at = $created_at
                ON MATCH SET r.confidence = CASE
                    WHEN $confidence > r.confidence THEN $confidence
                    ELSE r.confidence END
                """,
                {
                    "uid": entity_uid,
                    "skill_name": skill_data["name"],
                    "confidence": skill_data.get("confidence", 0.8),
                    "created_at": datetime.now().isoformat()
                },
            )
            edges_created += 1

        for area_name in analysis.get("classified_areas", []):
            run_cypher(
                """
                MERGE (a:Area {name: $name})
                ON CREATE SET a.uid = $area_uid,
                              a.created_at = $created_at
                """,
                {
                    "name": area_name,
                    "area_uid": str(uuid.uuid4())[:8],
                    "created_at": datetime.now().isoformat()
                },
            )

            if entity_type in ["Researcher", "Professor"]:
                run_cypher(
                    f"""
                    MATCH (ent:{entity_type} {{uid: $uid}})
                    MATCH (a:Area {{name: $area_name}})
                    MERGE (ent)-[r:RESEARCHES_AREA]->(a)
                    ON CREATE SET r.source = 'agent:ProfileAnalyzer',
                                  r.created_at = $created_at
                    """,
                    {"uid": entity_uid, "area_name": area_name, "created_at": datetime.now().isoformat()},
                )
                
        # Update entity with maturidade and o_que_busco
        maturidade = analysis.get("maturidade", 0.0)
        o_que_busco = analysis.get("o_que_busco", "")
        run_cypher(
            f"""
            MATCH (ent:{entity_type} {{uid: $uid}})
            SET ent.maturidade = $maturidade,
                ent.o_que_busco = $o_que_busco
            """,
            {"uid": entity_uid, "maturidade": maturidade, "o_que_busco": o_que_busco}
        )

        logger.info(
            f"✅ ProfileAnalyzer: Configured graph for {entity_type} {entity_uid} "
            f"({skills_created} skills, {edges_created} edges, Maturidade={maturidade})"
        )
        return {
            "skills_created": skills_created,
            "edges_created": edges_created,
            "areas_connected": len(analysis.get("classified_areas", [])),
        }

    def analyze_and_configure(self, entity_uid: str, entity_type: str, profile_data: dict) -> dict:
        """Full pipeline: analyze profile → configure graph."""
        analysis = self.analyze_profile(profile_data)
        graph_result = self.configure_graph(entity_uid, entity_type, analysis)
        return {
            "analysis": analysis,
            "graph_changes": graph_result,
        }
