<p align="center">
  <img src="https://img.shields.io/badge/status-MVP_v1_Online-22c55e?style=for-the-badge&labelColor=020810" alt="Status: MVP v1 Online" />
  <img src="https://img.shields.io/badge/versão-v1.0.0-0ea5e9?style=for-the-badge&labelColor=020810" alt="Versão: v1.0.0" />
  <img src="https://img.shields.io/badge/UNINASSAU-Tópicos_Integradores-8b5cf6?style=for-the-badge&labelColor=020810" alt="UNINASSAU" />
  <img src="https://img.shields.io/badge/deploy-Vercel-black?style=for-the-badge&logo=vercel&labelColor=020810" alt="Deploy: Vercel" />
</p>

<h1 align="center">AR.I.A.N.O</h1>

<p align="center">
  <strong><b>AR</b>quitetura de <b>I</b>nteligência <b>A</b>rtificial <b>N</b>aturalmente <b>O</b>rdenada</strong><br/>
  O motor de Matchmaking Inteligente da plataforma <strong>CORETO</strong>
</p>

<p align="center">
  <em>Conectando Academia e Governo através de grafos de conhecimento e agentes de IA cognitiva</em>
</p>

---

## 📋 Sobre o Projeto

O **ARIANO** é o módulo de **matchmaking inteligente** da plataforma **CORETO** — uma iniciativa digital da Prefeitura do Recife (SECTI Recife) que conecta os quatro pilares da **quádrupla hélice da inovação**: Academia, Governo, Indústria e Sociedade Civil.

Este repositório contém o **MVP (Minimum Viable Product)** do ARIANO, focado exclusivamente no matchmaking entre **Academia ↔ Governo**: perfis acadêmicos (estudantes, pesquisadores, professores) e editais de fomento governamentais.

> **Contexto acadêmico:** Projeto desenvolvido para a disciplina de Tópicos Integradores — 7º Período, UNINASSAU Graças — Recife/PE, Semestre 2026.1.

---

## 🎯 O que o ARIANO faz?

O ARIANO opera em **três fases distintas**:

| Fase | Nome | O que acontece |
|------|------|----------------|
| **1** | Cadastro + Match Estratégico | Agentes de IA leem o perfil do acadêmico (bio + currículo PDF), extraem skills e áreas automaticamente, calculam scores e criam arestas ponderadas no grafo — visível ao usuário em tempo real |
| **2** | Enriquecimento Contínuo | O `ContextualAnalyzer` percorre o grafo completo, identifica clusters de afinidade e cria novas conexões (`SIMILAR_TO`, `RELATED_TO`), re-calibrando todos os scores |
| **3** | Consulta O(1) | O usuário já cadastrado consulta seus matches via query Cypher direta — sem IA, sem custo, em milissegundos |

> **Filosofia central — Precomputed Relational Intelligence:** Os agentes de IA **não fazem o match diretamente**. Eles **preparam e configuram o grafo** — o match em si é apenas uma query sobre adjacência livre de índice, resultando em latência O(1) independente do volume de dados.

---

## 🏗️ Arquitetura em Alto Nível

```
┌─────────────────────────────────────────┐
│          FRONTEND (Vite + React 18)     │
│  /user/*  (Portal Acadêmico)            │
│  /admin/* (Portal Administrador)        │
│  Comunicação via REST + Axios           │
└──────────────────┬──────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────┐
│         BACKEND (Python + FastAPI)      │
│  ┌─────────────────────────────────┐    │
│  │   AGENTES DE IA (LangChain)     │    │
│  │  ProfileAnalyzer                │    │
│  │  EditalInterpreter              │    │
│  │  EligibilityCalculator          │    │
│  │  ContextualAnalyzer (Graph-CoT) │    │
│  │  Orchestrator                   │    │
│  └─────────────────────────────────┘    │
│  Match Engine (Cypher O(1))             │
│  Auth (JWT Cookies)                     │
└──────────────────┬──────────────────────┘
                   │ In-Memory + Vercel KV
┌──────────────────▼──────────────────────┐
│   DATA LAYER — "Cérebro" do ARIANO      │
│   MemoryGraphStore (Python) + Redis KV  │
│   Formato: JSON Serialized Graph        │
└─────────────────────────────────────────┘
```

O grafo de conhecimento modela o ecossistema com os seguintes tipos de relacionamento:

| Aresta | Descrição |
|--------|-----------|
| `HAS_SKILL` | Acadêmico possui competência |
| `RESEARCHES_AREA` | Acadêmico pesquisa área |
| `REQUIRES_SKILL` | Edital requer competência |
| `TARGETS_AREA` | Edital foca em área |
| `ELIGIBLE_FOR` | **Aresta de match** — acadêmico elegível para edital (com score e justificativa) |
| `SIMILAR_TO` | Afinidade entre perfis acadêmicos (enriquecimento) |
| `RELATED_TO` | Skills complementares que co-ocorrem (enriquecimento) |

---

## 🛠️ Stack Tecnológica

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Frontend</h3>
      <img src="https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white" />
      <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
      <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square" />
      <img src="https://img.shields.io/badge/react--force--graph-FFB13B?style=flat-square" />
      <ul>
        <li><b>Visualização:</b> Grafo interativo (SVG + Force Graph / Canvas)</li>
        <li><b>UI:</b> Animações com Framer Motion, gráficos com Recharts</li>
        <li><b>Tipografia:</b> Outfit (sans) + JetBrains Mono (mono)</li>
        <li><b>Tema:</b> Dark "Teal Neon" com glassmorphism</li>
        <li><b>Experiência:</b> Cinematográfica — dark/light mode</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>⚙️ Backend & Dados</h3>
      <img src="https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white" />
      <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white" />
      <img src="https://img.shields.io/badge/NVIDIA_Nemotron_3-76B900?style=flat-square&logo=nvidia&logoColor=white" />
      <img src="https://img.shields.io/badge/NetworkX_3.x-orange?style=flat-square" />
      <img src="https://img.shields.io/badge/Vercel_KV_(Redis)-000000?style=flat-square&logo=vercel&logoColor=white" />
      <ul>
        <li><b>LLM:</b> NVIDIA Nemotron 3 Super 120B via OpenRouter</li>
        <li><b>Agentes:</b> LangChain com Graph-CoT (Thought→Action→Observation)</li>
        <li><b>Grafo:</b> MemoryGraphStore + NetworkX (layout, comunidades)</li>
        <li><b>Persistência:</b> Vercel KV (Redis) — resolvendo stateless serverless</li>
        <li><b>PDF:</b> PyMuPDF (fitz) — extração de currículo em &lt;100ms</li>
        <li><b>Deploy:</b> Vercel Fullstack (Backend Serverless + Frontend SPA)</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

| Ferramenta | Versão mínima | Observação |
|-----------|---------------|------------|
| Node.js | v18+ | Para o frontend |
| Python | 3.12+ | Para o backend |
| pip | — | Gerenciador de pacotes Python |

### 1. Clonar o repositório

```bash
git clone https://github.com/<seu-usuario>/ProjetoARIANO.git
cd ProjetoARIANO
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha suas chaves:

```bash
cp .env.example app/.env
```

Edite `app/.env` com os seguintes valores:

```env
# Chave de API do OpenRouter (acesso ao NVIDIA Nemotron 3)
OPENROUTER_API_KEY=sk-or-...

# Credenciais do Vercel KV (Redis) — para persistência do grafo
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Segredo para assinatura de cookies JWT
JWT_SECRET=seu_segredo_aqui

# Ambiente de execução
ENVIRONMENT=development
```

> ⚠️ **Nunca commite o arquivo `.env`** — ele já está no `.gitignore`.

### 3. Instalar e rodar o Backend

```bash
cd app
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r ../requirements.txt
uvicorn api.index:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`  
Documentação interativa (Swagger): `http://localhost:8000/docs`

### 4. Instalar e rodar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 5. Popular o grafo (seed inicial)

Com o backend rodando, execute o seed para popular o grafo com dados de exemplo:

```bash
# No terminal do backend (com venv ativado)
python -m app.services.seed_native
```

Isso cria ≥15 acadêmicos, ≥8 editais e executa o pipeline de agentes para configurar as arestas.

---

## 📁 Estrutura do Repositório

```text
ProjetoARIANO/
├── .github/workflows/ci.yml        # CI/CD com GitHub Actions
├── api/
│   └── index.py                    # Entry point Vercel (serverless)
├── app/                            # ⚙️ BACKEND
│   ├── agents/
│   │   ├── profile_analyzer.py     # Extrai skills/áreas via Graph-CoT sequencial
│   │   ├── edital_interpreter.py   # Interpreta requisitos de editais
│   │   ├── eligibility_calculator.py # Scoring multi-dimensional + arestas ELIGIBLE_FOR
│   │   ├── contextual_analyzer.py  # Graph-CoT iterativo: clusters, SIMILAR_TO
│   │   └── orchestrator.py         # Controla ordem e fluxo dos agentes
│   ├── api/
│   │   ├── routes.py               # Endpoints CRUD de entidades
│   │   ├── agent_routes.py         # Endpoints de pipeline de agentes
│   │   └── auth_routes.py          # Login / Register / Logout
│   ├── core/
│   │   ├── config.py               # Configurações e variáveis de ambiente
│   │   ├── database.py             # Inicialização do grafo in-memory
│   │   ├── neo4j_driver.py         # Queries de contexto profundo
│   │   └── graph_tools.py          # Primitivas Graph-CoT (retrieve_node, etc.)
│   ├── models/
│   │   ├── graph.py                # Modelos Neomodel (nós e arestas)
│   │   └── schemas.py              # Schemas Pydantic (validação de entrada/saída)
│   └── services/
│       ├── crud.py                 # Operações CRUD sobre o grafo
│       ├── pdf_extractor.py        # PyMuPDF: PDF → texto (PDF descartado)
│       ├── graph_visualizer.py     # NetworkX: layout + comunidades → JSON
│       ├── match_engine.py         # Consulta O(1) com filtro de deadline
│       ├── seed_native.py          # Seed de dados de exemplo
│       └── seed_and_configure.py   # Seed + pipeline completo de agentes
├── frontend/                       # 🎨 FRONTEND
│   ├── src/
│   │   ├── App.tsx                 # Rotas /user/* e /admin/*
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Auth global (dual profile)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── UserSidebar.tsx
│   │   │   │   └── AdminSidebar.tsx
│   │   │   ├── AuthPopup.tsx       # Modal de login
│   │   │   ├── ProtectedRoute.tsx  # Guard de rota
│   │   │   ├── AgentProcessingTimeline.tsx  # Timeline visual dos agentes
│   │   │   ├── MiniGraph.tsx       # Visualizador de grafo em miniatura
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useAgentPipeline.ts
│   │   ├── pages/
│   │   │   ├── user/               # Portal do Acadêmico
│   │   │   │   ├── CadastroPage.tsx    # Cadastro CORETO + match em tempo real
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── MatchsPage.tsx      # Matches O(1)
│   │   │   │   └── EcossistemaPage.tsx # Grafo pessoal
│   │   │   └── admin/              # Portal Administrador
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── AcademicosPage.tsx
│   │   │       ├── EditaisPage.tsx
│   │   │       ├── MatchesPage.tsx
│   │   │       ├── GrafoPage.tsx
│   │   │       └── ComunidadesPage.tsx # Ciclo de enriquecimento
│   │   ├── lib/api.ts              # Cliente Axios configurado
│   │   └── types/index.ts          # Tipos TypeScript (Entity, Match, Skill...)
│   └── package.json
├── Prototype v0/                   # 📋 DOCUMENTAÇÃO
│   └── Docs/
│       ├── 01_DOCUMENTO_PROJETO_ARIANO.md   # Visão, arquitetura e roadmap
│       └── 02_RELATORIO_FINAL_ACADEMICO.md  # Relatório de entrega acadêmica
├── requirements.txt                # Dependências Python
├── vercel.json                     # Configuração de deploy Vercel
└── README.md                       # Este arquivo
```

---

## 🔌 Principais Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Cadastrar novo usuário acadêmico |
| `POST` | `/api/auth/login` | Login (retorna cookie JWT) |
| `POST` | `/api/auth/logout` | Logout (invalida cookie) |
| `GET` | `/api/academics` | Listar todos os acadêmicos |
| `POST` | `/api/academics` | Criar acadêmico (com upload de currículo PDF) |
| `GET` | `/api/editais` | Listar editais ativos (deadline > hoje) |
| `POST` | `/api/editais` | Criar edital governamental |
| `GET` | `/api/matches/{uid}` | Matches O(1) para um acadêmico |
| `POST` | `/api/agents/analyze` | Executar pipeline de análise de perfil |
| `POST` | `/api/agents/enrich` | Executar ciclo de enriquecimento do grafo |
| `GET` | `/api/graph/layout` | Layout do grafo (posições NetworkX) |
| `GET` | `/api/graph/communities` | Comunidades de Pensamento detectadas |

Documentação interativa completa disponível em `/docs` (Swagger UI) com o backend rodando.

---

## 🏃 Status Atual

O MVP está **concluído** (Sprint Definitiva), operando com:

- ✅ **UX Premium** — Dark "Teal Neon", animações Framer Motion, grafo interativo
- ✅ **Deploy Fullstack na Vercel** — Backend serverless + Frontend SPA no mesmo monorepo
- ✅ **Resiliência Serverless** — Vercel KV (Redis) elimina perda de estado entre invocações
- ✅ **IA em Tempo Real** — Pipeline multi-agente visível ao usuário durante o cadastro
- ✅ **Autenticação Dual** — Perfis simultâneos `user` e `admin` com cookies JWT HttpOnly
- ✅ **Comunidades de Pensamento** — Graph-CoT iterativo + detecção via NetworkX Louvain

---

## 📚 Documentação

| Documento | Descrição | Link |
|-----------|-----------|------|
| **Documento do Projeto** | Visão, arquitetura detalhada, fundamentação teórica e roadmap de sprints | [`01_DOCUMENTO_PROJETO_ARIANO.md`](Prototype%20v0/Docs/01_DOCUMENTO_PROJETO_ARIANO.md) |
| **Relatório Final Acadêmico** | Relatório formal de entrega para a banca da UNINASSAU | [`02_RELATORIO_FINAL_ACADEMICO.md`](Prototype%20v0/Docs/02_RELATORIO_FINAL_ACADEMICO.md) |

---

## 🔧 Ferramentas de Qualidade

| Ferramenta | Propósito | Quando executa |
|-----------|-----------|----------------|
| **ESLint** | Linting TypeScript/JavaScript | A cada push/PR |
| **Prettier** | Formatação de código | Pre-commit (Husky) |
| **Ruff** | Linting Python | A cada push/PR |
| **Pytest** | Testes do backend | A cada push/PR |
| **Vitest** | Testes do frontend | A cada push/PR |
| **Commitlint** | Padronização de commits (Conventional Commits) | Pre-commit |

**Convenção de commits:**

```
feat(agent): adicionar ProfileAnalyzer para classificação de skills
fix(graph): corrigir cálculo de pesos nas arestas ELIGIBLE_FOR
docs(readme): atualizar instruções de setup
```

---

## 👥 Equipe

**Instituição:** UNINASSAU Graças — Recife/PE | Tópicos Integradores | 2026.1

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Guilherme Andrade de Aguiar | 01606498 | Product Owner / Tech Lead / Product Manager |
| Pedro Miranda | 01607408 | DevOps / Back-End Developer |
| Ricardo Cezar O. A. de Almeida | 01606498 | AI Agent Architect / Graph Data Engineer |
| Marcio Maycom | 01607574 | UX UI Designer / Front-End Developer |
| Thiago José Falcão de Freitas | 01597267 | Scrum Master / QA |

---

## 📄 Licença

Este projeto é desenvolvido no contexto acadêmico da UNINASSAU Graças. Todos os direitos reservados à equipe e à instituição.
