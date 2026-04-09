"""EditalInterpreter Agent — Extracts requirements and areas from government calls.

This agent takes raw edital (government call) data and:
1. Extracts required skills from description using LLM
2. Classifies target research areas
3. Determines minimum academic level requirements
4. Creates/updates Edital nodes with REQUIRES_SKILL and TARGETS_AREA edges

LLM: NVIDIA Nemotron 3 Super (120B MoE, 12B active) via OpenRouter
Part of PHASE 1 (Graph Configuration) — runs offline/async.
"""

import json
import logging

from app.core.config import settings
from app.core.neo4j_driver import run_cypher

logger = logging.getLogger(__name__)


class EditalInterpreter:
    """AI Agent that interprets government calls and configures the graph."""

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
                        "X-Title": "ARIANO - EditalInterpreter Agent",
                    },
                )
                logger.info("✅ EditalInterpreter: Nemotron 3 Super LLM initialized via OpenRouter")
            except Exception as e:
                logger.warning(f"⚠️ EditalInterpreter: Could not init LLM: {e}")
                self.llm = None
        else:
            logger.info("ℹ️ EditalInterpreter: No API key, using rule-based extraction")

    def interpret_edital(self, edital_data: dict) -> dict:
        """Interpret an edital and extract structured requirements."""
        if self.llm:
            return self._interpret_with_llm(edital_data)
        return self._interpret_rule_based(edital_data)

    def _interpret_with_llm(self, edital_data: dict) -> dict:
        """Use Nemotron 3 Super to interpret edital requirements."""
        prompt = f"""Analise o seguinte edital governamental e extraia os requisitos técnicos.

EDITAL:
- Título: {edital_data.get('title', '')}
- Descrição: {edital_data.get('description', '')}
- Agência: {edital_data.get('agency', '')}
- Tipo: {edital_data.get('edital_type', '')}
- Financiamento: R$ {edital_data.get('funding', 0)}
- Nível Mínimo: {edital_data.get('min_level', 'graduacao')}
- Skills declarados: {edital_data.get('required_skills', [])}
- Áreas declaradas: {edital_data.get('target_areas', [])}

INSTRUÇÕES:
1. Extraia TODAS as skills técnicas requeridas pelo edital (explícitas e implícitas)
2. Classifique cada skill com prioridade: "essential", "desirable", "optional"
3. Identifique as áreas de pesquisa alvo
4. Determine requisitos de nível acadêmico
5. Identifique palavras-chave temáticas do edital

Responda APENAS em JSON válido com esta estrutura:
{{
    "required_skills": [
        {{"name": "Python", "priority": "essential"}},
        {{"name": "Machine Learning", "priority": "desirable"}},
        ...
    ],
    "target_areas": ["Inteligencia Artificial", "Ciencia de Dados"],
    "min_level": "graduacao",
    "keywords": ["inovação", "governo digital", "IA"],
    "edital_summary": "Breve resumo do edital em 1 frase"
}}"""

        try:
            response = self.llm.invoke(prompt)
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            result = json.loads(content.strip())
            logger.info(f"✅ EditalInterpreter LLM: Extracted {len(result.get('required_skills', []))} skills for '{edital_data.get('title')}'")
            return result
        except Exception as e:
            logger.warning(f"⚠️ LLM interpretation failed, falling back to rules: {e}")
            return self._interpret_rule_based(edital_data)

    def _interpret_rule_based(self, edital_data: dict) -> dict:
        """Rule-based edital interpretation when LLM is unavailable."""
        title = (edital_data.get("title", "") or "").lower()
        description = (edital_data.get("description", "") or "").lower()
        declared_skills = edital_data.get("required_skills", [])
        declared_areas = edital_data.get("target_areas", [])

        required_skills = []
        target_areas = list(declared_areas)

        for skill_name in declared_skills:
            required_skills.append({"name": skill_name, "priority": "essential"})

        text = f"{title} {description}"
        skill_keywords = {
            "Python": ["python", "programação python"],
            "Machine Learning": ["machine learning", "ml", "aprendizado de máquina"],
            "Deep Learning": ["deep learning", "redes neurais", "neural"],
            "NLP": ["nlp", "processamento de linguagem", "pln"],
            "Data Science": ["data science", "ciência de dados", "análise de dados"],
            "IoT": ["iot", "internet das coisas", "smart city", "cidade inteligente"],
            "Cybersecurity": ["segurança", "cibersegurança", "cybersecurity"],
            "Cloud Computing": ["cloud", "nuvem", "computação em nuvem"],
            "React": ["react", "frontend", "interface web"],
            "Docker": ["docker", "contêiner", "containerização"],
            "Neo4j": ["neo4j", "grafos", "graph database"],
            "TensorFlow": ["tensorflow", "keras"],
            "Computer Vision": ["visão computacional", "computer vision", "imagem"],
            "Statistics": ["estatística", "statistics", "análise estatística"],
        }

        for skill_name, keywords in skill_keywords.items():
            if any(kw in text for kw in keywords) and skill_name not in declared_skills:
                required_skills.append({"name": skill_name, "priority": "desirable"})

        area_keywords = {
            "Inteligencia Artificial": ["ia", "inteligência artificial", "inteligencia artificial", "machine learning", "deep learning"],
            "Ciencia de Dados": ["dados", "data", "estatístic", "analytics"],
            "Engenharia de Software": ["software", "desenvolvimento", "web", "aplicação"],
            "Redes de Computadores": ["redes", "network", "telecomunicaç"],
            "Seguranca da Informacao": ["segurança", "seguranca", "ciberseg", "privacidade"],
            "Sistemas Embarcados": ["embarcado", "iot", "smart city", "robótica"],
            "Computacao em Nuvem": ["cloud", "nuvem", "aws", "azure"],
            "Processamento de Linguagem Natural": ["nlp", "pln", "linguagem natural", "texto"],
        }

        for area, keywords in area_keywords.items():
            if any(kw in text for kw in keywords) and area not in target_areas:
                target_areas.append(area)

        return {
            "required_skills": required_skills,
            "target_areas": target_areas,
            "min_level": edital_data.get("min_level", "graduacao"),
            "keywords": [],
            "edital_summary": f"Edital {edital_data.get('agency', '')} - {edital_data.get('edital_type', 'pesquisa')}",
        }

    def configure_graph(self, edital_uid: str, interpretation: dict) -> dict:
        """Write interpretation results to Neo4j graph."""
        skills_connected = 0
        areas_connected = 0

        for skill_data in interpretation.get("required_skills", []):
            run_cypher(
                """
                MERGE (s:Skill {name: $name})
                ON CREATE SET s.uid = randomUUID(),
                              s.category = 'general',
                              s.created_at = datetime()
                """,
                {"name": skill_data["name"]},
            )

            run_cypher(
                """
                MATCH (e:Edital {uid: $uid})
                MATCH (s:Skill {name: $skill_name})
                MERGE (e)-[r:REQUIRES_SKILL]->(s)
                ON CREATE SET r.priority = $priority,
                              r.source = 'agent:EditalInterpreter',
                              r.created_at = datetime()
                """,
                {
                    "uid": edital_uid,
                    "skill_name": skill_data["name"],
                    "priority": skill_data.get("priority", "desirable"),
                },
            )
            skills_connected += 1

        for area_name in interpretation.get("target_areas", []):
            run_cypher(
                """
                MERGE (a:Area {name: $name})
                ON CREATE SET a.uid = randomUUID(),
                              a.created_at = datetime()
                """,
                {"name": area_name},
            )

            run_cypher(
                """
                MATCH (e:Edital {uid: $uid})
                MATCH (a:Area {name: $area_name})
                MERGE (e)-[r:TARGETS_AREA]->(a)
                ON CREATE SET r.source = 'agent:EditalInterpreter',
                              r.created_at = datetime()
                """,
                {"uid": edital_uid, "area_name": area_name},
            )
            areas_connected += 1

        logger.info(
            f"✅ EditalInterpreter: Configured graph for Edital {edital_uid} "
            f"({skills_connected} skills, {areas_connected} areas)"
        )
        return {
            "skills_connected": skills_connected,
            "areas_connected": areas_connected,
        }

    def interpret_and_configure(self, edital_uid: str, edital_data: dict) -> dict:
        """Full pipeline: interpret edital → configure graph."""
        interpretation = self.interpret_edital(edital_data)
        graph_result = self.configure_graph(edital_uid, interpretation)
        return {
            "interpretation": interpretation,
            "graph_changes": graph_result,
        }
