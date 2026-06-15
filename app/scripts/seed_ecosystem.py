#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║   ARIANO — Seed do Ecossistema de Inovação do Recife                       ║
║   Popula o grafo Neo4j com perfis hiper-realistas para teste do             ║
║   motor de matchmaking O(1).                                                ║
║                                                                              ║
║   Uso:  python -m app.scripts.seed_ecosystem                                ║
║         (execute a partir da raiz do projeto, com .env carregado)           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
from __future__ import annotations

import os
import sys
import random
import uuid
import logging
from pathlib import Path
from datetime import datetime

# ── Garante que a raiz do projeto esteja no PYTHONPATH ───────────────────────
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

# Carrega .env antes de tudo
from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from neo4j import GraphDatabase

logging.basicConfig(level=logging.WARNING)

# ═════════════════════════════════════════════════════════════════════════════
# TERMINAL COLORS — sem dependências externas
# ═════════════════════════════════════════════════════════════════════════════
class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    GREEN  = "\033[92m"
    CYAN   = "\033[96m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    MAGENTA= "\033[95m"
    BLUE   = "\033[94m"
    DIM    = "\033[2m"

def ok(msg):    print(f"  {C.GREEN}✓{C.RESET} {msg}")
def info(msg):  print(f"  {C.CYAN}→{C.RESET} {msg}")
def warn(msg):  print(f"  {C.YELLOW}⚠{C.RESET} {msg}")
def err(msg):   print(f"  {C.RED}✗{C.RESET} {msg}")
def section(msg): print(f"\n{C.BOLD}{C.BLUE}▶ {msg}{C.RESET}")
def stat(label, val): print(f"  {C.MAGENTA}{label:.<45}{C.RESET}{C.BOLD}{val}{C.RESET}")


# ═════════════════════════════════════════════════════════════════════════════
# CATÁLOGO COMPARTILHADO — NÓS ÂNCORA
# ═════════════════════════════════════════════════════════════════════════════

SKILLS = [
    # Programação & Engenharia
    {"name": "Python",           "category": "programacao",     "demand": "alta"},
    {"name": "React",            "category": "programacao",     "demand": "alta"},
    {"name": "TypeScript",       "category": "programacao",     "demand": "alta"},
    {"name": "FastAPI",          "category": "programacao",     "demand": "media"},
    {"name": "Docker",           "category": "devops",          "demand": "alta"},
    {"name": "DevOps",           "category": "devops",          "demand": "alta"},
    {"name": "Framer Motion",    "category": "programacao",     "demand": "baixa"},
    # IA & Dados
    {"name": "Machine Learning", "category": "ia",              "demand": "alta"},
    {"name": "Deep Learning",    "category": "ia",              "demand": "alta"},
    {"name": "NLP",              "category": "ia",              "demand": "alta"},
    {"name": "GraphRAG",         "category": "ia",              "demand": "alta"},
    {"name": "Data Science",     "category": "ciencia_dados",   "demand": "alta"},
    {"name": "LangChain",        "category": "ia",              "demand": "media"},
    # Grafos & BD
    {"name": "Neo4j",            "category": "banco_de_dados",  "demand": "media"},
    {"name": "Graph Databases",  "category": "banco_de_dados",  "demand": "media"},
    # Gestão & Inovação
    {"name": "Scrum",            "category": "gestao",          "demand": "alta"},
    {"name": "Gestão Pública",   "category": "gestao",          "demand": "media"},
    {"name": "UI/UX",            "category": "design",          "demand": "alta"},
    {"name": "Finanças Públicas","category": "gestao",          "demand": "baixa"},
    {"name": "Análise de Dados", "category": "ciencia_dados",   "demand": "alta"},
]

SKILL_NAMES = [s["name"] for s in SKILLS]

COMUNIDADES = [
    {"name": "GovTech",   "descricao": "Soluções de tecnologia para o setor público",     "setor": "governo"},
    {"name": "HealthTech","descricao": "Inovação digital na saúde pública e privada",     "setor": "saude"},
    {"name": "EdTech",    "descricao": "Tecnologia educacional e aprendizado adaptativo", "setor": "educacao"},
    {"name": "DeepTech",  "descricao": "Pesquisa de ponta: IA, biotech, computação quântica","setor":"ciencia"},
    {"name": "Fintech",   "descricao": "Serviços financeiros digitais e open finance",    "setor": "financas"},
]

TRL_LEVELS = [
    {"level": i, "name": n, "descricao": d}
    for i, n, d in [
        (1, "TRL 1", "Princípios básicos observados"),
        (2, "TRL 2", "Conceito de tecnologia formulado"),
        (3, "TRL 3", "Prova de conceito experimental"),
        (4, "TRL 4", "Tecnologia validada em laboratório"),
        (5, "TRL 5", "Tecnologia validada em ambiente relevante"),
        (6, "TRL 6", "Tecnologia demonstrada em ambiente relevante"),
        (7, "TRL 7", "Demonstração em ambiente operacional"),
        (8, "TRL 8", "Sistema completo e qualificado"),
        (9, "TRL 9", "Sistema comprovado em ambiente operacional"),
    ]
]


# ═════════════════════════════════════════════════════════════════════════════
# PERFIS REALISTAS — 45 USUÁRIOS (mix fixo + Faker expansion)
# ═════════════════════════════════════════════════════════════════════════════

# Perfis curados manualmente (10 profiles com narrativas ricas)
CURATED_PROFILES = [
    # ── Estudantes / Pesquisadores (40%) ─────────────────────────────────────
    {
        "type": "Student",
        "name": "Ana Beatriz Cavalcanti",
        "email": "ana.cavalcanti@uninassau.edu.br",
        "institution": "UNINASSAU — Campus Recife",
        "course": "Ciência da Computação",
        "semester": 7,
        "level": "graduacao",
        "bio": "Pesquisadora iniciante em GraphRAG e IA aplicada à saúde pública do SUS. Bolsista PIBIC-UNINASSAU 2025.",
        "skills": ["Python", "GraphRAG", "Neo4j", "Machine Learning"],
        "comunidade": "HealthTech",
        "trl": 3,
        "github": "anacavalcanti-dev",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Rodrigo Mendonça Ferreira",
        "email": "rodrigo.mendonca@cin.ufpe.br",
        "institution": "UFPE — Centro de Informática",
        "course": "Ciência da Computação",
        "semester": 9,
        "level": "mestrado",
        "bio": "Mestrando em NLP com foco em modelos de linguagem para português jurídico. Colaborador do projeto Corpora-PT no CIn.",
        "skills": ["Python", "NLP", "Deep Learning", "LangChain"],
        "comunidade": "GovTech",
        "trl": 4,
        "github": "rodrigomf-nlp",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Isabela Torres Queiroz",
        "email": "isabela.torres@discente.uninassau.edu.br",
        "institution": "UNINASSAU — Campus Gracas",
        "course": "Sistemas de Informação",
        "semester": 5,
        "level": "graduacao",
        "bio": "Desenvolvedora front-end apaixonada por design de interfaces inclusivas. Monitora de UI/UX no Tópico Integrador IV.",
        "skills": ["React", "TypeScript", "Framer Motion", "UI/UX"],
        "comunidade": "EdTech",
        "trl": 2,
        "github": "isabelatq-ux",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Matheus Lins Albuquerque",
        "email": "matheus.lins@d.ufpe.br",
        "institution": "UFPE — CIn",
        "course": "Engenharia da Computação",
        "semester": 8,
        "level": "graduacao",
        "bio": "Desenvolvedor de APIs escaláveis e pipelines MLOps. Estagiário no Porto Digital — Polo de TI do Recife.",
        "skills": ["Python", "FastAPI", "Docker", "DevOps", "Machine Learning"],
        "comunidade": "DeepTech",
        "trl": 5,
        "github": "matheusla-dev",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Camila Novaes Brito",
        "email": "camila.novaes@uninassau.edu.br",
        "institution": "UNINASSAU — Campus Recife",
        "course": "Análise e Desenvolvimento de Sistemas",
        "semester": 6,
        "level": "graduacao",
        "bio": "Pesquisadora de dados aplicados à mobilidade urbana. Participa do grupo SMARTCIDADE-UFPE como convidada.",
        "skills": ["Data Science", "Python", "Análise de Dados", "Scrum"],
        "comunidade": "GovTech",
        "trl": 3,
        "github": "camilanb-data",
        "cidade": "Olinda",
    },
    {
        "type": "Student",
        "name": "Lucas Wanderlei Gomes",
        "email": "lucas.wanderlei@cin.ufpe.br",
        "institution": "UFPE — Centro de Informática",
        "course": "Ciência da Computação",
        "semester": 4,
        "level": "graduacao",
        "bio": "Foco em Graph Databases e algoritmos de recomendação. Vencedor do Hackathon FACEPE 2024 na categoria IA.",
        "skills": ["Neo4j", "Graph Databases", "Python", "GraphRAG"],
        "comunidade": "DeepTech",
        "trl": 3,
        "github": "lucaswg-graphs",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Fernanda Barbosa Lima",
        "email": "fernanda.barbosa@sp.uninassau.edu.br",
        "institution": "UNINASSAU — Campus Santo Amaro",
        "course": "Sistemas de Informação",
        "semester": 3,
        "level": "graduacao",
        "bio": "Iniciante em Data Science com interesse em saúde digital. Participante do programa Meninas na Computação-UFPE.",
        "skills": ["Python", "Análise de Dados", "Data Science"],
        "comunidade": "HealthTech",
        "trl": 1,
        "github": "fernandabl-data",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Thiago Cardoso Vieira",
        "email": "thiago.cardoso@discente.unicap.br",
        "institution": "UNICAP — Universidade Católica de Pernambuco",
        "course": "Ciência da Computação",
        "semester": 6,
        "level": "graduacao",
        "bio": "Desenvolvedor full-stack com interesse em plataformas EdTech. Co-fundador da startup EduPath (pré-aceleração CESAR).",
        "skills": ["React", "FastAPI", "Docker", "TypeScript", "Scrum"],
        "comunidade": "EdTech",
        "trl": 4,
        "github": "thiagocv-dev",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Juliana Farias Monteiro",
        "email": "juliana.farias@d.ufpe.br",
        "institution": "UFPE — CIn",
        "course": "Ciência da Computação",
        "semester": 6,
        "level": "mestrado",
        "bio": "Mestranda em IA com foco em modelos de linguagem para diagnóstico clínico. Bolsa CAPES — Linha de Pesquisa: HealthAI.",
        "skills": ["Machine Learning", "Deep Learning", "Python", "NLP", "LangChain"],
        "comunidade": "HealthTech",
        "trl": 5,
        "github": "julianafm-ai",
        "cidade": "Recife",
    },
    {
        "type": "Student",
        "name": "Pedro Augusto Ramos",
        "email": "pedro.ramos@uninassau.edu.br",
        "institution": "UNINASSAU — Campus Recife",
        "course": "Ciência da Computação",
        "semester": 7,
        "level": "graduacao",
        "bio": "Especialista em DevOps e automação de CI/CD. Contribuidor ativo do Porto Digital Open Source Initiative.",
        "skills": ["DevOps", "Docker", "Python", "FastAPI"],
        "comunidade": "DeepTech",
        "trl": 4,
        "github": "pedroar-devops",
        "cidade": "Recife",
    },
    # ── Profissionais de Mercado / Mentores (30%) ─────────────────────────────
    {
        "type": "Docente",
        "name": "Dr. Marcos Aurélio Vasconcelos",
        "email": "marcos.vasconcelos@cin.ufpe.br",
        "institution": "UFPE — Centro de Informática",
        "department": "Pós-Graduação em CC",
        "research_group": "GRIA — Grupo de Pesq. em IA Aplicada",
        "level": "doutorado",
        "bio": "Professor associado no CIn/UFPE. Pesquisador em grafos de conhecimento e IA explicável aplicada a políticas públicas. Membro do Conselho Científico da FACEPE.",
        "skills": ["GraphRAG", "Neo4j", "Python", "Machine Learning", "Graph Databases"],
        "comunidade": "GovTech",
        "trl": 7,
        "lattes": "5892341098765432",
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Dra. Fernanda Albuquerque Souza",
        "email": "fernanda.albuquerque@uninassau.edu.br",
        "institution": "UNINASSAU — Campus Recife",
        "department": "Tópicos Integradores — TI IV/V",
        "research_group": "NuPES — Núcleo de Pesq. em Eng. de Software",
        "level": "pos-doutorado",
        "bio": "Pesquisadora em PLN e LLMs aplicados à educação. Coordenadora do Tópico Integrador V e mentora do hackathon SECTI-PE 2025.",
        "skills": ["NLP", "LangChain", "Python", "Deep Learning", "Machine Learning"],
        "comunidade": "EdTech",
        "trl": 6,
        "lattes": "2341098765432198",
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "MSc. Ricardo Barros Neto",
        "email": "ricardo.barros@portdigital.org.br",
        "institution": "Porto Digital — Polo de TI",
        "department": "Hub de Inovação",
        "research_group": "DevSquad Porto Digital",
        "level": "mestrado",
        "bio": "Desenvolvedor Sênior e Tech Lead no Porto Digital. Mestre em Eng. de Software pela UFPE. Mentor de startups deeptech na aceleradora CESAR.",
        "skills": ["React", "TypeScript", "FastAPI", "Docker", "DevOps", "Scrum"],
        "comunidade": "DeepTech",
        "trl": 8,
        "lattes": "3456789012345678",
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Dra. Lúcia Helena Campos",
        "email": "lucia.campos@secti.pe.gov.br",
        "institution": "SECTI-PE — Secretaria de Ciência e Tecnologia",
        "department": "Diretoria de Inovação e Startups",
        "research_group": "Observatório de Inovação de PE",
        "level": "doutorado",
        "bio": "Analista de inovação na SECTI-PE. Doutora em Políticas Científicas pela USP. Coordena o programa GovTech Recife e é jurada do InovaPE.",
        "skills": ["Gestão Pública", "Data Science", "Análise de Dados", "Finanças Públicas"],
        "comunidade": "GovTech",
        "trl": 7,
        "lattes": "9087654321234567",
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Prof. Dr. Paulo Sérgio Monteiro",
        "email": "paulo.monteiro@unicap.br",
        "institution": "UNICAP — Universidade Católica de Pernambuco",
        "department": "Computação e Sistemas",
        "research_group": "LaSSI — Lab. de Seg. de Sistemas e Info.",
        "level": "doutorado",
        "bio": "Professor titular e pesquisador em cibersegurança aplicada a sistemas de saúde conectada. Consultor do DATASUS-PE.",
        "skills": ["Python", "DevOps", "Docker", "Data Science", "Análise de Dados"],
        "comunidade": "HealthTech",
        "trl": 6,
        "lattes": "1234567890123456",
        "cidade": "Recife",
    },
    # ── Gestores Públicos / Investidores (30%) ────────────────────────────────
    {
        "type": "Docente",
        "name": "Eng. Carlos Eduardo Rêgo",
        "email": "carlos.rego@portdigital.org.br",
        "institution": "Porto Digital — Polo de TI do Recife",
        "department": "Gestão de Projetos de Inovação",
        "research_group": "Aceleradora Porto Digital",
        "level": "especializacao",
        "bio": "Gestor de inovação no Porto Digital há 8 anos. Especialista em programas de aceleração para startups GovTech e HealthTech. MBA em Inovação pelo CESAR School.",
        "skills": ["Scrum", "Gestão Pública", "Finanças Públicas", "Análise de Dados"],
        "comunidade": "GovTech",
        "trl": 8,
        "lattes": None,
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Ana Paula Vidal Macêdo",
        "email": "ana.vidal@secti.pe.gov.br",
        "institution": "SECTI-PE",
        "department": "Gerência de Editais e Fomento",
        "research_group": "Célula de Inovação Aberta",
        "level": "mestrado",
        "bio": "Gestora de fomento à inovação na SECTI-PE. Mestre em Políticas Públicas pela UFPE. Responsável pelos editais do programa Pernambuco Inovador 2024-2026.",
        "skills": ["Gestão Pública", "Finanças Públicas", "Análise de Dados", "Scrum"],
        "comunidade": "GovTech",
        "trl": 7,
        "lattes": None,
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Dr. Augusto Figueiredo Lima",
        "email": "augusto.figueiredo@facepe.br",
        "institution": "FACEPE — Fundação de Amparo à Ciência de PE",
        "department": "Diretoria Científica",
        "research_group": "Painel de Avaliação de Projetos",
        "level": "doutorado",
        "bio": "Diretor científico da FACEPE. Doutor em Ciências da Computação pela PUC-Rio. Avaliador ad hoc do CNPq e membro do comitê de IA da SBPC.",
        "skills": ["Machine Learning", "Data Science", "Python", "Gestão Pública"],
        "comunidade": "DeepTech",
        "trl": 9,
        "lattes": "8765432109876543",
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Mariana Soares Cavalcanti",
        "email": "mariana.cavalcanti@recife.pe.gov.br",
        "institution": "Prefeitura do Recife — Secretaria de Inovação",
        "department": "Coordenação Smart Recife",
        "research_group": None,
        "level": "especialista",
        "bio": "Coordenadora do programa Smart Recife. Engenheira de produção com MBA em Gestão Pública. Lidera projetos de cidades inteligentes com foco em mobilidade e saúde.",
        "skills": ["Gestão Pública", "Análise de Dados", "Scrum", "UI/UX"],
        "comunidade": "GovTech",
        "trl": 7,
        "lattes": None,
        "cidade": "Recife",
    },
    {
        "type": "Docente",
        "name": "Prof. Dr. Henrique Coutinho Neves",
        "email": "henrique.coutinho@cesar.school",
        "institution": "CESAR School",
        "department": "Inovação e Empreendedorismo",
        "research_group": "Lab InovaHealth",
        "level": "doutorado",
        "bio": "Professor de Inovação e Empreendedorismo no CESAR School. Doutor em Bioinformática. Mentor de startups HealthTech no programa FACEPE Inova Saúde.",
        "skills": ["Machine Learning", "Data Science", "NLP", "LangChain", "Python"],
        "comunidade": "HealthTech",
        "trl": 6,
        "lattes": "6543210987654321",
        "cidade": "Recife",
    },
]

# ── Perfis gerados via Faker (expandindo até ~45 total) ───────────────────────
FAKER_TEMPLATES = [
    # (type, institution, course_or_dept, level, skills_pool, comunidade, trl_range)
    ("Student", "UNINASSAU — Campus Recife",     "Ciência da Computação",   "graduacao",    ["Python","React","Machine Learning","Data Science"],         "EdTech",   (1,4)),
    ("Student", "UFPE — CIn",                    "Engenharia da Computação","mestrado",     ["NLP","LangChain","GraphRAG","Deep Learning","Python"],       "DeepTech", (3,6)),
    ("Student", "UNINASSAU — Campus Gracas",     "Sistemas de Informação",  "graduacao",    ["React","TypeScript","UI/UX","Framer Motion","Scrum"],        "EdTech",   (1,3)),
    ("Student", "UNICAP",                        "Ciência da Computação",   "graduacao",    ["Python","Docker","DevOps","FastAPI","Data Science"],         "GovTech",  (2,5)),
    ("Student", "UFPE — CIn",                    "Ciência da Computação",   "doutorado",    ["Machine Learning","Deep Learning","GraphRAG","Neo4j"],       "HealthTech",(4,7)),
    ("Student", "UNINASSAU — Campus Recife",     "Análise e Des. de Sistemas","graduacao",  ["React","TypeScript","FastAPI","Docker"],                     "Fintech",  (2,4)),
    ("Student", "UFPE — CIn",                    "Ciência da Computação",   "mestrado",     ["Data Science","Análise de Dados","Python","Machine Learning"],"GovTech", (3,5)),
    ("Student", "UNICAP",                        "Sistemas de Informação",  "graduacao",    ["React","Scrum","UI/UX","TypeScript"],                        "EdTech",   (1,3)),
    ("Student", "UNINASSAU — Campus Recife",     "Ciência da Computação",   "graduacao",    ["Neo4j","Graph Databases","Python","GraphRAG"],               "DeepTech", (2,4)),
    ("Student", "FBV — Faculdade Boa Viagem",    "Sistemas de Informação",  "graduacao",    ["Python","FastAPI","Docker","DevOps"],                        "Fintech",  (2,5)),
    ("Student", "UFPE — CIn",                    "Engenharia da Computação","graduacao",    ["Machine Learning","Python","Data Science","Deep Learning"],  "HealthTech",(3,6)),
    ("Student", "UNINASSAU — Campus Recife",     "Ciência da Computação",   "graduacao",    ["React","TypeScript","UI/UX","Scrum"],                        "EdTech",   (1,3)),
    ("Student", "UNICAP",                        "Ciência da Computação",   "mestrado",     ["NLP","Python","LangChain","Machine Learning"],               "GovTech",  (3,5)),
    ("Student", "UFPE — CIn",                    "Ciência da Computação",   "graduacao",    ["DevOps","Docker","Python","FastAPI"],                        "DeepTech", (2,4)),
    ("Docente", "Porto Digital — Polo de TI",    "Desenvolvimento de Software","senior",    ["React","TypeScript","FastAPI","Docker","DevOps","Scrum"],     "Fintech",  (6,9)),
    ("Docente", "SECTI-PE",                      "Políticas de Inovação",   "especialista", ["Gestão Pública","Finanças Públicas","Análise de Dados"],     "GovTech",  (6,8)),
    ("Docente", "UFPE — CIn",                    "Inteligência Artificial",  "doutorado",   ["Machine Learning","Deep Learning","Python","NLP"],           "HealthTech",(5,8)),
    ("Docente", "UNINASSAU — Campus Gracas",     "Tópicos Integradores",    "mestrado",     ["React","UI/UX","Scrum","TypeScript"],                        "EdTech",   (4,7)),
    ("Docente", "FACEPE",                        "Fomento à Pesquisa",      "doutorado",    ["Data Science","Python","Gestão Pública","Análise de Dados"], "DeepTech", (7,9)),
    ("Docente", "CESAR School",                  "Inovação e Empreend.",    "doutorado",    ["Machine Learning","LangChain","Python","GraphRAG"],           "HealthTech",(5,8)),
    ("Docente", "Prefeitura do Recife",          "Smart Recife",            "especialista", ["Gestão Pública","Análise de Dados","UI/UX"],                 "GovTech",  (5,8)),
    ("Docente", "Porto Digital — Polo de TI",    "Hub de Inovação",         "mestrado",     ["Scrum","Gestão Pública","DevOps","Docker"],                  "GovTech",  (6,8)),
    ("Docente", "UFPE — CIn",                    "Ciência da Computação",   "doutorado",    ["Graph Databases","Neo4j","GraphRAG","Machine Learning"],     "DeepTech", (6,9)),
    ("Docente", "SECTI-PE",                      "Inovação Aberta",         "mestrado",     ["Gestão Pública","Finanças Públicas","Scrum"],                "GovTech",  (5,7)),
]

# Bio templates variados por tipo
BIO_TEMPLATES_STUDENT = [
    "Pesquisador(a) em {area} com foco em aplicações práticas no ecossistema de Pernambuco.",
    "Desenvolvedor(a) apaixonado(a) por {area}. Ativo(a) na comunidade open source do Porto Digital.",
    "Estudante de {course} com projetos de iniciação científica em {area}.",
    "Bolsista de pesquisa na área de {area}, com publicações no SBSI e SBBD.",
    "Interessado(a) em {area} e como essa tecnologia pode transformar o setor público no Recife.",
    "Co-fundador(a) de projeto de extensão universitária em {area} na comunidade {comunidade}.",
]
BIO_TEMPLATES_DOCENTE = [
    "Especialista em {area} com mais de 8 anos de experiência no ecossistema de inovação de PE.",
    "Professor(a) e pesquisador(a) em {area}. Orientador(a) de projetos no Porto Digital.",
    "Profissional sênior em {area}, atuando como mentor(a) em programas de aceleração do CESAR.",
    "Gestor(a) de inovação com expertise em {area} e articulação público-privada em Pernambuco.",
    "Doutor(a) em {area}, com publicações em periódicos Qualis A1. Avaliador(a) de projetos FACEPE.",
    "Líder técnico(a) em {area} com trajetória construída no ecossistema inovador do Recife.",
]

FIRST_NAMES_M = ["Rafael","Gabriel","Matheus","Lucas","Guilherme","Felipe","Diego","André","Caio","Bruno",
                 "Vinicius","Henrique","Eduardo","Marcos","Carlos","João","Pedro","Daniel","Thiago","Arthur"]
FIRST_NAMES_F = ["Ana","Fernanda","Mariana","Juliana","Camila","Isabela","Larissa","Bianca","Priscila","Amanda",
                 "Letícia","Carolina","Rebeca","Vanessa","Patricia","Natalia","Gabriela","Sophia","Vitoria","Luisa"]
LAST_NAMES    = ["Silva","Santos","Oliveira","Souza","Lima","Ferreira","Costa","Carvalho","Alves","Pereira",
                 "Melo","Ribeiro","Barbosa","Nascimento","Nunes","Cavalcanti","Medeiros","Andrade","Moraes","Gomes",
                 "Vasconcelos","Figueiredo","Novaes","Pimentel","Brito","Lemos","Albuquerque","Ramos","Cardoso","Vieira"]
EMAIL_DOMAINS = {
    "UNINASSAU — Campus Recife":    "uninassau.edu.br",
    "UNINASSAU — Campus Gracas":    "uninassau.edu.br",
    "UNINASSAU — Campus Santo Amaro":"uninassau.edu.br",
    "UFPE — CIn":                   "cin.ufpe.br",
    "UFPE — CIn":                   "d.ufpe.br",
    "UNICAP":                       "unicap.br",
    "Porto Digital — Polo de TI":   "portdigital.org.br",
    "SECTI-PE":                     "secti.pe.gov.br",
    "FACEPE":                       "facepe.br",
    "CESAR School":                 "cesar.school",
    "Prefeitura do Recife":         "recife.pe.gov.br",
    "FBV — Faculdade Boa Viagem":   "fbv.edu.br",
}
AREA_NAMES_BY_SKILL = {
    "Python": "ciência de dados", "React": "desenvolvimento web", "Machine Learning": "inteligência artificial",
    "NLP": "PLN", "GraphRAG": "recuperação de informação em grafos", "Neo4j": "bancos de dados em grafos",
    "DevOps": "infraestrutura e automação", "Scrum": "metodologias ágeis", "Gestão Pública": "governo digital",
    "UI/UX": "design de interfaces", "Data Science": "análise de dados", "LangChain": "LLMs",
    "Docker": "containerização", "TypeScript": "desenvolvimento front-end", "FastAPI": "APIs REST",
    "Deep Learning": "redes neurais profundas", "Finanças Públicas": "gestão de recursos públicos",
    "Graph Databases": "ciência de grafos", "Análise de Dados": "inteligência de dados", "Framer Motion": "animações web",
}


def _gen_uid() -> str:
    return str(uuid.uuid4())

def _random_name():
    gender = random.choice(["M", "F"])
    first = random.choice(FIRST_NAMES_M if gender == "M" else FIRST_NAMES_F)
    last  = f"{random.choice(LAST_NAMES)} {random.choice(LAST_NAMES)}"
    return f"{first} {last}"

def _email_from(name: str, institution: str) -> str:
    clean = name.lower().replace(" ", ".").replace("ã","a").replace("é","e").replace("ê","e").replace("ó","o").replace("ç","c")
    parts = clean.split(".")
    if len(parts) >= 2:
        handle = f"{parts[0]}.{parts[-1]}"
    else:
        handle = clean
    domain = EMAIL_DOMAINS.get(institution, "recife.pe.gov.br")
    return f"{handle}@{domain}"

def _build_faker_profiles() -> list[dict]:
    """Gera perfis sintéticos mas realistas baseados nos templates."""
    profiles = []
    for (ptype, institution, dept, level, skills_pool, comunidade, trl_range) in FAKER_TEMPLATES:
        name = _random_name()
        email = _email_from(name, institution)
        skills = random.sample(skills_pool, k=min(random.randint(3, 5), len(skills_pool)))
        main_skill = skills[0]
        area_str = AREA_NAMES_BY_SKILL.get(main_skill, main_skill.lower())
        com_name = comunidade
        trl = random.randint(*trl_range)

        if ptype == "Student":
            bio_tmpl = random.choice(BIO_TEMPLATES_STUDENT)
            bio = bio_tmpl.format(area=area_str, course=dept, comunidade=com_name)
        else:
            bio_tmpl = random.choice(BIO_TEMPLATES_DOCENTE)
            bio = bio_tmpl.format(area=area_str)

        p = {
            "type": ptype,
            "name": name,
            "email": email,
            "institution": institution,
            "course": dept if ptype == "Student" else None,
            "department": dept if ptype == "Docente" else None,
            "level": level,
            "bio": bio,
            "skills": skills,
            "comunidade": comunidade,
            "trl": trl,
            "cidade": "Recife",
        }
        profiles.append(p)
    return profiles

ALL_PROFILES = CURATED_PROFILES + _build_faker_profiles()


# ═════════════════════════════════════════════════════════════════════════════
# OPORTUNIDADES / EDITAIS (15 nós)
# ═════════════════════════════════════════════════════════════════════════════

OPPORTUNITIES = [
    {
        "label": "Edital",
        "title": "FACEPE — Programa de Iniciação Científica IC-2026",
        "description": "Bolsas mensais de R$ 700 para estudantes de graduação em projetos de IA e dados. Vigência: Março-Dezembro 2026.",
        "organizer": "FACEPE",
        "type": "bolsa_ic",
        "funding_brl": 8400.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-03-31",
        "required_skills": ["Python", "Data Science", "Machine Learning"],
        "comunidades": ["DeepTech", "HealthTech"],
        "trl_min": 1, "trl_max": 4,
    },
    {
        "label": "Edital",
        "title": "CNPq — Universal 2026 Faixa A: IA e Saúde Digital",
        "description": "Apoio a projetos de pesquisa em inteligência artificial aplicada à saúde. Valor: até R$ 50.000.",
        "organizer": "CNPq",
        "type": "pesquisa",
        "funding_brl": 50000.0,
        "min_level": "doutorado",
        "status": "aberto",
        "deadline": "2026-04-30",
        "required_skills": ["Machine Learning", "Deep Learning", "NLP", "Python"],
        "comunidades": ["HealthTech", "DeepTech"],
        "trl_min": 3, "trl_max": 7,
    },
    {
        "label": "Edital",
        "title": "FACEPE — APQ Inovação GovTech Pernambuco 2026",
        "description": "Apoio a projetos de inovação com aplicação direta em governo digital e serviços públicos inteligentes.",
        "organizer": "FACEPE",
        "type": "pesquisa_inovacao",
        "funding_brl": 80000.0,
        "min_level": "mestrado",
        "status": "aberto",
        "deadline": "2026-05-15",
        "required_skills": ["Gestão Pública", "Data Science", "Neo4j", "GraphRAG"],
        "comunidades": ["GovTech", "DeepTech"],
        "trl_min": 4, "trl_max": 8,
    },
    {
        "label": "Opportunity",
        "title": "Hackathon GovTech Recife 2026 — SECTI-PE",
        "description": "Competição de 72h para desenvolvimento de soluções digitais para o governo de Pernambuco. Premiação de R$ 30.000.",
        "organizer": "SECTI-PE",
        "type": "hackathon",
        "funding_brl": 30000.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-07-20",
        "required_skills": ["React", "FastAPI", "Docker", "Scrum", "TypeScript"],
        "comunidades": ["GovTech", "Fintech"],
        "trl_min": 1, "trl_max": 5,
    },
    {
        "label": "Edital",
        "title": "CAPES — Bolsa de Mestrado em Ciência da Computação 2026",
        "description": "Bolsas de mestrado para programas de pós-graduação stricto sensu em PE. Valor anual: R$ 24.000.",
        "organizer": "CAPES",
        "type": "bolsa_mestrado",
        "funding_brl": 24000.0,
        "min_level": "mestrado",
        "status": "aberto",
        "deadline": "2026-02-28",
        "required_skills": ["Python", "NLP", "Machine Learning", "Deep Learning"],
        "comunidades": ["DeepTech", "HealthTech"],
        "trl_min": 2, "trl_max": 5,
    },
    {
        "label": "Opportunity",
        "title": "Porto Digital — Programa de Residência em IA 2026",
        "description": "Residência de 6 meses em empresas do Porto Digital. Foco em projetos de IA generativa e GraphRAG.",
        "organizer": "Porto Digital",
        "type": "residencia",
        "funding_brl": 18000.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-03-15",
        "required_skills": ["Python", "LangChain", "GraphRAG", "Machine Learning", "FastAPI"],
        "comunidades": ["DeepTech", "Fintech"],
        "trl_min": 3, "trl_max": 7,
    },
    {
        "label": "Edital",
        "title": "FINEP — Inova Saúde Pernambuco 2026",
        "description": "Subvenção econômica para projetos de inovação em saúde digital. Chamada pública FINEP com recursos de R$ 200.000.",
        "organizer": "FINEP",
        "type": "subvencao",
        "funding_brl": 200000.0,
        "min_level": "doutorado",
        "status": "aberto",
        "deadline": "2026-06-30",
        "required_skills": ["Machine Learning", "Data Science", "NLP", "Python", "GraphRAG"],
        "comunidades": ["HealthTech", "DeepTech"],
        "trl_min": 4, "trl_max": 8,
    },
    {
        "label": "Opportunity",
        "title": "Smart Recife Challenge — Mobilidade Urbana 2026",
        "description": "Chamada pública da Prefeitura do Recife para soluções de mobilidade inteligente com análise de dados em tempo real.",
        "organizer": "Prefeitura do Recife",
        "type": "chamada_publica",
        "funding_brl": 120000.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-08-01",
        "required_skills": ["Data Science", "Análise de Dados", "Docker", "Python", "Gestão Pública"],
        "comunidades": ["GovTech"],
        "trl_min": 3, "trl_max": 7,
    },
    {
        "label": "Opportunity",
        "title": "UNINASSAU — Bolsa de Iniciação Científica Tópicos Integradores 2026",
        "description": "Programa interno de bolsas para estudantes participantes dos Tópicos Integradores IV e V com projetos de inovação aplicada.",
        "organizer": "UNINASSAU",
        "type": "bolsa_ic",
        "funding_brl": 6000.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-04-01",
        "required_skills": ["React", "TypeScript", "Python", "Scrum", "UI/UX"],
        "comunidades": ["EdTech"],
        "trl_min": 1, "trl_max": 4,
    },
    {
        "label": "Edital",
        "title": "MCTI — Subvenção para Startups DeepTech 2026",
        "description": "Apoio financeiro a startups com base tecnológica profunda (IA, biotech, computação quântica). Até R$ 500.000 por projeto.",
        "organizer": "MCTI",
        "type": "subvencao_startup",
        "funding_brl": 500000.0,
        "min_level": "mestrado",
        "status": "aberto",
        "deadline": "2026-09-30",
        "required_skills": ["Machine Learning", "Deep Learning", "GraphRAG", "Python", "Neo4j"],
        "comunidades": ["DeepTech", "Fintech"],
        "trl_min": 4, "trl_max": 9,
    },
    {
        "label": "Opportunity",
        "title": "CESAR School — Mentoria em Product Design 2026",
        "description": "Programa de mentoria individual para estudantes e profissionais que querem aprofundar competências em UI/UX e Product Design.",
        "organizer": "CESAR School",
        "type": "mentoria",
        "funding_brl": 0.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-03-01",
        "required_skills": ["UI/UX", "Framer Motion", "React", "Scrum"],
        "comunidades": ["EdTech", "Fintech"],
        "trl_min": 1, "trl_max": 4,
    },
    {
        "label": "Edital",
        "title": "CNPq — Programa Nacional de Pós-Doutorado (PNPD) 2026",
        "description": "Bolsas de pós-doutorado para pesquisadores vinculados a programas de pós-graduação avaliados com nota ≥ 5 pela CAPES.",
        "organizer": "CNPq",
        "type": "bolsa_posDoc",
        "funding_brl": 84000.0,
        "min_level": "doutorado",
        "status": "aberto",
        "deadline": "2026-10-31",
        "required_skills": ["Python", "Machine Learning", "Data Science", "GraphRAG"],
        "comunidades": ["DeepTech"],
        "trl_min": 5, "trl_max": 9,
    },
    {
        "label": "Opportunity",
        "title": "Open Finance Brasil — Hackathon Fintech Nordeste 2026",
        "description": "Competição nacional com foco no Nordeste. Solucões de open finance, crédito inteligente e inclusão financeira usando dados abertos.",
        "organizer": "Banco Central / FEBRABAN",
        "type": "hackathon",
        "funding_brl": 50000.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-05-31",
        "required_skills": ["React", "FastAPI", "TypeScript", "Data Science", "Docker"],
        "comunidades": ["Fintech", "GovTech"],
        "trl_min": 2, "trl_max": 6,
    },
    {
        "label": "Edital",
        "title": "EMBRAPII — Cooperação Empresa-Instituto: HealthTech 2026",
        "description": "Financiamento compartilhado para projetos em parceria entre empresas e institutos de pesquisa em tecnologia da saúde.",
        "organizer": "EMBRAPII",
        "type": "cooperacao_empresa",
        "funding_brl": 300000.0,
        "min_level": "doutorado",
        "status": "aberto",
        "deadline": "2026-07-15",
        "required_skills": ["Machine Learning", "Data Science", "NLP", "Python", "Deep Learning"],
        "comunidades": ["HealthTech"],
        "trl_min": 4, "trl_max": 8,
    },
    {
        "label": "Opportunity",
        "title": "Google for Startups — Aceleração EdTech Brasil 2026",
        "description": "Programa de aceleração de 3 meses do Google para startups EdTech. Inclui créditos em Google Cloud, mentoria e acesso à rede Google.",
        "organizer": "Google for Startups",
        "type": "aceleracao",
        "funding_brl": 0.0,
        "min_level": "graduacao",
        "status": "aberto",
        "deadline": "2026-04-30",
        "required_skills": ["React", "DevOps", "Docker", "Machine Learning", "LangChain"],
        "comunidades": ["EdTech", "DeepTech"],
        "trl_min": 3, "trl_max": 7,
    },
]


# ═════════════════════════════════════════════════════════════════════════════
# CONEXÃO DIRETA AO NEO4J (sem depender do driver da aplicação)
# ═════════════════════════════════════════════════════════════════════════════

def _get_driver():
    neo4j_uri  = os.getenv("NEO4J_URI")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_pass = os.getenv("NEO4J_PASSWORD", "")

    if not neo4j_uri or "localhost" in neo4j_uri:
        raise SystemExit(
            f"{C.RED}✗ NEO4J_URI não configurado ou aponta para localhost.\n"
            f"  Configure o arquivo .env com as credenciais do Neo4j Aura.{C.RESET}"
        )

    info(f"Conectando a: {neo4j_uri[:40]}...")
    driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_pass))
    with driver.session() as session:
        session.run("RETURN 1").single()
    ok(f"Conexão estabelecida com sucesso.")
    return driver


def run(driver, query: str, params: dict = None) -> list:
    with driver.session() as session:
        result = session.run(query, params or {})
        return [rec.data() for rec in result]


# ═════════════════════════════════════════════════════════════════════════════
# FASE 0 — WIPE SEGURO (apenas nós com tag SEED)
# ═════════════════════════════════════════════════════════════════════════════

def wipe_seed_data(driver):
    section("FASE 0 — Limpeza de dados de seed anteriores")
    result = run(driver, "MATCH (n {seed: true}) DETACH DELETE n RETURN count(n) AS deleted")
    deleted = result[0]["deleted"] if result else 0
    ok(f"{deleted} nós de seed anteriores removidos.")


# ═════════════════════════════════════════════════════════════════════════════
# FASE 1 — CATÁLOGO COMPARTILHADO (nós âncora)
# ═════════════════════════════════════════════════════════════════════════════

def seed_catalog(driver) -> tuple[dict, dict, dict]:
    section("FASE 1 — Catálogo Compartilhado (Skills, Comunidades, TRL)")

    # Skills
    info(f"Criando {len(SKILLS)} Skills...")
    skill_uids = {}
    for s in SKILLS:
        uid = _gen_uid()
        run(driver, """
            MERGE (sk:Skill {name: $name})
            ON CREATE SET sk.uid = $uid, sk.category = $category, sk.demand = $demand, sk.seed = true
            ON MATCH SET sk.demand = $demand
            RETURN sk.uid AS uid
        """, {**s, "uid": uid})
        # Retrieve actual uid (in case it already existed)
        rows = run(driver, "MATCH (sk:Skill {name: $name}) RETURN sk.uid AS uid", {"name": s["name"]})
        skill_uids[s["name"]] = rows[0]["uid"] if rows else uid
    ok(f"{len(SKILLS)} Skills criadas/atualizadas.")

    # Comunidades
    info(f"Criando {len(COMUNIDADES)} Comunidades (setores)...")
    comunidade_uids = {}
    for c in COMUNIDADES:
        uid = _gen_uid()
        run(driver, """
            MERGE (com:Comunidade {name: $name})
            ON CREATE SET com.uid = $uid, com.descricao = $descricao, com.setor = $setor, com.seed = true
            RETURN com.uid AS uid
        """, {**c, "uid": uid})
        rows = run(driver, "MATCH (com:Comunidade {name: $name}) RETURN com.uid AS uid", {"name": c["name"]})
        comunidade_uids[c["name"]] = rows[0]["uid"] if rows else uid
    ok(f"{len(COMUNIDADES)} Comunidades criadas.")

    # TRL Levels
    info(f"Criando {len(TRL_LEVELS)} nós de Maturidade (TRL 1-9)...")
    trl_uids = {}
    for t in TRL_LEVELS:
        uid = _gen_uid()
        run(driver, """
            MERGE (trl:TRL {level: $level})
            ON CREATE SET trl.uid = $uid, trl.name = $name, trl.descricao = $descricao, trl.seed = true
            RETURN trl.uid AS uid
        """, {**t, "uid": uid})
        rows = run(driver, "MATCH (trl:TRL {level: $level}) RETURN trl.uid AS uid", {"level": t["level"]})
        trl_uids[t["level"]] = rows[0]["uid"] if rows else uid
    ok(f"{len(TRL_LEVELS)} nós TRL criados.")

    total_catalog = len(SKILLS) + len(COMUNIDADES) + len(TRL_LEVELS)
    stat("  Total de nós âncora criados", f" {total_catalog}")
    return skill_uids, comunidade_uids, trl_uids


# ═════════════════════════════════════════════════════════════════════════════
# FASE 2 — USUÁRIOS (45 perfis realistas)
# ═════════════════════════════════════════════════════════════════════════════

def seed_users(driver, skill_uids: dict, comunidade_uids: dict, trl_uids: dict) -> list[dict]:
    section(f"FASE 2 — Geração de {len(ALL_PROFILES)} Perfis de Usuários")

    counts = {"Student": 0, "Docente": 0}
    rel_count = 0
    created_users = []

    info(f"Inserindo perfis no Neo4j com relacionamentos cruzados...")

    for p in ALL_PROFILES:
        uid = _gen_uid()
        label = p["type"]  # "Student" ou "Docente"
        now = datetime.utcnow().isoformat()

        # Propriedades base do usuário
        props = {
            "uid": uid,
            "name": p["name"],
            "email": p["email"].lower(),
            "institution": p["institution"],
            "level": p["level"],
            "bio": p["bio"],
            "cidade": p.get("cidade", "Recife"),
            "seed": True,
            "created_at": now,
            "status": "ativo",
        }
        if label == "Student" and p.get("course"):
            props["course"] = p["course"]
        if label == "Docente" and p.get("department"):
            props["department"] = p["department"]
        if label == "Docente" and p.get("research_group"):
            props["research_group"] = p.get("research_group") or ""

        # Cria o nó (MERGE por email para idempotência)
        props_set = ", ".join(f"u.{k} = ${k}" for k in props)
        run(driver, f"""
            MERGE (u:{label} {{email: $email}})
            ON CREATE SET {props_set}
            ON MATCH SET u.uid = $uid, u.name = $name, u.bio = $bio, u.seed = true
        """, props)

        # Recupera UID real
        rows = run(driver, f"MATCH (u:{label} {{email: $email}}) RETURN u.uid AS uid", {"email": props["email"]})
        actual_uid = rows[0]["uid"] if rows else uid
        created_users.append({"uid": actual_uid, "label": label, "name": p["name"]})

        # Relacionamento HAS_SKILL (3-5 skills)
        for skill_name in p.get("skills", []):
            if skill_name in skill_uids:
                confidence = round(random.uniform(0.70, 0.98), 2)
                run(driver, f"""
                    MATCH (u:{label} {{uid: $uid}}), (s:Skill {{name: $skill}})
                    MERGE (u)-[r:HAS_SKILL]->(s)
                    ON CREATE SET r.confidence = $conf, r.provenance = 'seed', r.since = $now
                    ON MATCH SET r.confidence = $conf
                """, {"uid": actual_uid, "skill": skill_name, "conf": confidence, "now": now})
                rel_count += 1

        # Relacionamento PERTENCE_A (comunidade)
        com_name = p.get("comunidade")
        if com_name and com_name in comunidade_uids:
            run(driver, f"""
                MATCH (u:{label} {{uid: $uid}}), (c:Comunidade {{name: $com}})
                MERGE (u)-[r:PERTENCE_A]->(c)
                ON CREATE SET r.provenance = 'seed', r.since = $now
            """, {"uid": actual_uid, "com": com_name, "now": now})
            rel_count += 1

        # Relacionamento TEM_MATURIDADE (TRL)
        trl_level = p.get("trl")
        if trl_level and trl_level in trl_uids:
            run(driver, f"""
                MATCH (u:{label} {{uid: $uid}}), (t:TRL {{level: $trl}})
                MERGE (u)-[r:TEM_MATURIDADE]->(t)
                ON CREATE SET r.provenance = 'seed', r.since = $now
            """, {"uid": actual_uid, "trl": trl_level, "now": now})
            rel_count += 1

        counts[label] += 1

    ok(f"{counts['Student']} Estudantes/Pesquisadores criados.")
    ok(f"{counts['Docente']} Profissionais/Mentores/Gestores criados.")
    stat("  Relacionamentos de usuários criados", f" {rel_count}")
    return created_users


# ═════════════════════════════════════════════════════════════════════════════
# FASE 3 — OPORTUNIDADES / EDITAIS (15 nós)
# ═════════════════════════════════════════════════════════════════════════════

def seed_opportunities(driver, skill_uids: dict, comunidade_uids: dict) -> int:
    section(f"FASE 3 — Geração de {len(OPPORTUNITIES)} Oportunidades/Editais")

    rel_count = 0
    info("Inserindo oportunidades e conectando às Skills e Comunidades...")

    for opp in OPPORTUNITIES:
        uid = _gen_uid()
        label = opp["label"]  # "Edital" ou "Opportunity"
        now = datetime.utcnow().isoformat()

        props = {
            "uid": uid,
            "title": opp["title"],
            "description": opp["description"],
            "organizer": opp["organizer"],
            "type": opp["type"],
            "funding_brl": opp["funding_brl"],
            "min_level": opp["min_level"],
            "status": opp["status"],
            "deadline": opp["deadline"],
            "trl_min": opp["trl_min"],
            "trl_max": opp["trl_max"],
            "seed": True,
            "created_at": now,
        }
        props_set = ", ".join(f"o.{k} = ${k}" for k in props)

        run(driver, f"""
            MERGE (o:{label} {{title: $title}})
            ON CREATE SET {props_set}
            ON MATCH SET o.uid = $uid, o.seed = true
        """, props)

        rows = run(driver, f"MATCH (o:{label} {{title: $title}}) RETURN o.uid AS uid", {"title": opp["title"]})
        actual_uid = rows[0]["uid"] if rows else uid

        # REQUIRES_SKILL
        for skill_name in opp.get("required_skills", []):
            if skill_name in skill_uids:
                run(driver, f"""
                    MATCH (o:{label} {{uid: $uid}}), (s:Skill {{name: $skill}})
                    MERGE (o)-[r:REQUIRES_SKILL]->(s)
                    ON CREATE SET r.priority = 'essential', r.provenance = 'seed'
                """, {"uid": actual_uid, "skill": skill_name})
                rel_count += 1

        # VOLTADO_PARA (comunidade)
        for com_name in opp.get("comunidades", []):
            if com_name in comunidade_uids:
                run(driver, f"""
                    MATCH (o:{label} {{uid: $uid}}), (c:Comunidade {{name: $com}})
                    MERGE (o)-[r:VOLTADO_PARA]->(c)
                    ON CREATE SET r.provenance = 'seed'
                """, {"uid": actual_uid, "com": com_name})
                rel_count += 1

    ok(f"{len(OPPORTUNITIES)} oportunidades/editais criados.")
    stat("  Relacionamentos de oportunidades criados", f" {rel_count}")
    return rel_count


# ═════════════════════════════════════════════════════════════════════════════
# FASE 4 — DENSIDADE DO GRAFO: inter-conexões User↔User (COLABORA_COM)
# ═════════════════════════════════════════════════════════════════════════════

def seed_collaborations(driver, users: list[dict]) -> int:
    section("FASE 4 — Criação de Colaborações entre Usuários (COLABORA_COM)")
    info("Criando rede de colaborações para densificar o grafo...")

    # Estratégia: Busca usuários que compartilham Skill ou Comunidade e cria COLABORA_COM
    result = run(driver, """
        MATCH (a)-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(b)
        WHERE a.uid < b.uid AND a.seed = true AND b.seed = true
        WITH a, b, collect(s.name) AS shared_skills
        WHERE size(shared_skills) >= 2
        MERGE (a)-[r:COLABORA_COM]-(b)
        ON CREATE SET r.shared_skills = shared_skills,
                      r.strength = size(shared_skills),
                      r.provenance = 'seed'
        RETURN count(r) AS criados
    """)
    collab_skills = result[0]["criados"] if result else 0
    ok(f"{collab_skills} colaborações criadas via Skills compartilhadas.")

    result2 = run(driver, """
        MATCH (a)-[:PERTENCE_A]->(c:Comunidade)<-[:PERTENCE_A]-(b)
        WHERE a.uid < b.uid AND a.seed = true AND b.seed = true
        MERGE (a)-[r:COLABORA_COM]-(b)
        ON CREATE SET r.shared_comunidade = c.name,
                      r.strength = 1,
                      r.provenance = 'seed'
        RETURN count(r) AS criados
    """)
    collab_com = result2[0]["criados"] if result2 else 0
    ok(f"{collab_com} colaborações adicionais criadas via Comunidade compartilhada.")

    total = collab_skills + collab_com
    stat("  Total de relacionamentos COLABORA_COM", f" {total}")
    return total


# ═════════════════════════════════════════════════════════════════════════════
# FASE 5 — RESUMO FINAL
# ═════════════════════════════════════════════════════════════════════════════

def print_final_stats(driver):
    section("FASE 5 — Resumo do Grafo (Neo4j)")

    node_stats = run(driver, """
        MATCH (n)
        RETURN labels(n)[0] AS label, count(n) AS total
        ORDER BY total DESC
    """)
    edge_stats = run(driver, """
        MATCH ()-[r]->()
        RETURN type(r) AS rel_type, count(r) AS total
        ORDER BY total DESC
    """)
    totals = run(driver, """
        MATCH (n) WITH count(n) AS nodes
        MATCH ()-[r]->() WITH nodes, count(r) AS rels
        RETURN nodes, rels
    """)

    print(f"\n  {C.BOLD}{C.CYAN}{'Nós por Label':.<30}{'Count':>8}{C.RESET}")
    print(f"  {'─'*38}")
    for row in node_stats:
        print(f"  {C.GREEN}{row['label']:.<30}{C.RESET}{row['total']:>8}")

    print(f"\n  {C.BOLD}{C.CYAN}{'Relacionamentos por Tipo':.<35}{'Count':>8}{C.RESET}")
    print(f"  {'─'*43}")
    for row in edge_stats:
        print(f"  {C.MAGENTA}{row['rel_type']:.<35}{C.RESET}{row['total']:>8}")

    if totals:
        t = totals[0]
        print(f"\n  {'─'*43}")
        print(f"  {C.BOLD}{'TOTAL DE NÓS':.<35}{C.RESET}{C.BOLD}{C.GREEN}{t['nodes']:>8}{C.RESET}")
        print(f"  {C.BOLD}{'TOTAL DE RELACIONAMENTOS':.<35}{C.RESET}{C.BOLD}{C.MAGENTA}{t['rels']:>8}{C.RESET}")
        return t["nodes"], t["rels"]
    return 0, 0


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═════════════════════════════════════════════════════════════════════════════

def main():
    print(f"\n{C.BOLD}{C.CYAN}{'═'*60}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  🌱 ARIANO — Seed do Ecossistema de Inovação do Recife{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}{'═'*60}{C.RESET}")
    print(f"  {C.DIM}Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}{C.RESET}")
    print(f"  {C.DIM}Perfis a inserir: {len(ALL_PROFILES)} | Oportunidades: {len(OPPORTUNITIES)}{C.RESET}")

    driver = _get_driver()

    try:
        # Fase 0: Wipe
        wipe_seed_data(driver)

        # Fase 1: Catálogo âncora
        skill_uids, comunidade_uids, trl_uids = seed_catalog(driver)

        # Fase 2: Usuários
        users = seed_users(driver, skill_uids, comunidade_uids, trl_uids)

        # Fase 3: Oportunidades
        seed_opportunities(driver, skill_uids, comunidade_uids)

        # Fase 4: Colaborações
        seed_collaborations(driver, users)

        # Fase 5: Resumo
        total_nodes, total_rels = print_final_stats(driver)

        print(f"\n{C.BOLD}{C.GREEN}{'═'*60}{C.RESET}")
        print(f"{C.BOLD}{C.GREEN}  ✅ Seed concluído com sucesso!{C.RESET}")
        print(f"{C.BOLD}{C.GREEN}  🏙️  Ecossistema Recife injetado no Neo4j Aura.{C.RESET}")
        print(f"{C.BOLD}{C.GREEN}  📊 {total_nodes} nós | {total_rels} relacionamentos{C.RESET}")
        print(f"{C.BOLD}{C.GREEN}{'═'*60}{C.RESET}\n")

    finally:
        driver.close()


if __name__ == "__main__":
    main()
