# 🚀 ARIANO v0 — Plano de Implementação do MVP

> **Arquitetura de Inteligência Artificial Naturalmente Ordenada**
> Orquestrador inteligente de matches para a plataforma **CORETO**

> **Versão:** 1.0.0 (Atualizado com stack final Sigma.js + Vite)
> **Data:** 16/03/2026

---

## 1. Visão Geral

O ARIANO é o **motor de matchmaking inteligente** da plataforma CORETO (Prefeitura do Recife). O MVP foca no matchmaking **Academia ↔ Governo**.

**Filosofia:** Agentes de IA configuram o grafo (offline) → Match = Cypher query O(1) (online).

---

## 2. Stack Tecnológica Final

```
┌──────────────────────────────────────────────────────────┐
│                   STACK ARIANO v0                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎨 FRONTEND                                              │
│  ├─ Vite 5 + React 18 + TypeScript                       │
│  ├─ Tailwind CSS v4 (design system)                       │
│  ├─ Sigma.js v3 + Graphology (grafo interativo WebGL)     │
│  ├─ ForceAtlas2 Worker (layout físico em Web Worker)      │
│  ├─ @sigma/edge-curve (edges curvos)                      │
│  ├─ D3.js (helpers: scales, interpolation)                │
│  ├─ Framer Motion (animações de UI)                       │
│  ├─ React Router v7 (routing)                             │
│  ├─ Lucide React (ícones)                                 │
│  ├─ Outfit + JetBrains Mono (tipografia)                  │
│  └─ React Hook Form + Zod (formulários)                   │
│                                                           │
│  ⚙️ BACKEND                                               │
│  ├─ Python 3.12 + FastAPI                                 │
│  ├─ LangChain + LangGraph (agentes IA)                    │
│  ├─ Google Gemini API (LLM — gemini-2.0-flash)            │
│  ├─ Neomodel (OGM para Neo4j)                             │
│  └─ Uvicorn (servidor ASGI)                               │
│                                                           │
│  🗄️ DADOS                                                 │
│  └─ Neo4j 5.x Community (graph database)                  │
│                                                           │
│  🔧 DEVOPS                                                │
│  ├─ Docker + Docker Compose                               │
│  └─ GitHub Actions (CI/CD)                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Decisões de stack (histórico de mudanças)

| Aspecto | v0.1 (inicial) | v0.2 (análise) | **v1.0 (final)** | Motivo |
|---------|---------------|----------------|-------------------|--------|
| **Frontend** | Next.js 15 | Vite + React | **Vite 5 + React 18** | SPA pura = melhor para UX interativo e grafo |
| **Grafo** | D3.js | Cytoscape.js | **Sigma.js v3 + Graphology** | Comprovado pelo GitNexus, WebGL, ForceAtlas2 Worker |
| **Layout** | — | Cytoscape built-in | **ForceAtlas2 (Web Worker)** | Thread separada, UI nunca trava |
| **Edges** | — | Straight | **Curved (@sigma/edge-curve)** | Visual elegante comprovado |
| **Animação** | — | — | **Framer Motion** | Transições de página, micro-interactions |

---

## 3. Arquitetura

```
FRONTEND (Vite + React + Sigma.js)
    │ REST API
BACKEND (Python + FastAPI)
    │
    ├─ Agentes IA (LangChain + Gemini)
    │   ├─ ProfileAnalyzer
    │   ├─ EditalInterpreter
    │   └─ EligibilityCalculator
    │
    ├─ Match Engine (Cypher puro)
    │
    │ Bolt Protocol
DATA LAYER (Neo4j)
```

### Fluxo de dados

**Fase 1 — Configuração (agentes):**
```
Cadastro → API → Agente IA → Interpreta/Classifica → Cria nós+arestas no Neo4j → Grafo configurado
```

**Fase 2 — Match (Cypher):**
```
Request → API → Cypher: MATCH (a)-[r:ELIGIBLE_FOR]->(e) WHERE r.score >= 0.7 → Resultado O(1)
```

---

## 4. Modelagem do Grafo

```cypher
// NÓS ACADEMIA
(:Student {id, name, institution, level, semester, course})
(:Researcher {id, name, institution, level, lattes_url})
(:Professor {id, name, institution, department, research_group})

// NÓS GOVERNO
(:Edital {id, title, agency, type, funding, deadline, min_level})

// NÓS REFERÊNCIA
(:Skill {name})
(:Area {name})

// ARESTAS
(Academia)-[:HAS_SKILL {confidence}]->(Skill)
(Academia)-[:RESEARCHES_AREA]->(Area)
(Edital)-[:REQUIRES_SKILL {priority}]->(Skill)
(Edital)-[:TARGETS_AREA]->(Area)
(Academia)-[:ELIGIBLE_FOR {score, justification, calculated_at}]->(Edital)  // ← MATCH
(Professor)-[:ADVISES]->(Student)
(Professor)-[:COLLABORATES]->(Researcher)
```

---

## 5. Roadmap por Sprint

### Sprint 0 — Fundação (Semana 1)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Criar repo GitHub `ariano-v0` | US-03 | README, .gitignore, LICENSE MIT |
| Estrutura de pastas | US-03 | frontend/, backend/, docker-compose.yml |
| Docker Compose | US-01 | Neo4j 5 Community + Backend container |
| Setup Frontend | US-03 | `npm create vite@latest -- --template react-ts` + Tailwind v4 |
| Setup Backend | US-03 | FastAPI + Uvicorn + Neomodel |
| CI/CD | US-02 | GitHub Actions — lint + typecheck |

### Sprint 1 — Data Layer + CRUD (Semana 2-3)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Modelar nós academia | US-04 | Student, Researcher, Professor (Neomodel) |
| Modelar nós governo | US-04 | Edital (Neomodel) |
| Modelar nós auxiliares | US-05 | Skill, Area |
| Modelar arestas | US-06 | HAS_SKILL, RESEARCHES_AREA, REQUIRES_SKILL, TARGETS_AREA, ELIGIBLE_FOR |
| Seed de dados | US-07 | ~15 acadêmicos + ~8 editais FACEPE fictícios |
| API CRUD | US-04 | FastAPI routers (POST/GET/PUT/DELETE) |
| Testes unitários | US-04 | Pytest + Neo4j container |

### Sprint 2 — Agentes IA (Semana 3-4)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Config Google Gemini | US-08 | API key, SDK, LangChain wrapper |
| ProfileAnalyzer | US-08 | Cadastro → extrai skills + classifica área → cria nós/arestas |
| EditalInterpreter | US-09 | Edital → extrai requisitos + áreas → cria arestas |
| EligibilityCalculator | US-10 | Percorre grafo → calcula score → cria ELIGIBLE_FOR |
| Match Engine | US-11 | Cypher puro: `MATCH (a)-[r:ELIGIBLE_FOR]->(e)` |
| Endpoint match | US-11 | `GET /api/matches?entity_id=X&threshold=0.7` |

### Sprint 3 — Frontend + Visualização (Semana 4-5)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Layout base | US-12 | Dark theme azul neon, Sidebar + Header |
| Dashboard | US-12 | Cards KPI: acadêmicos, editais, matches, score médio |
| Cadastro acadêmico | US-13 | React Hook Form + Zod → POST /api/entities |
| Cadastro edital | US-14 | Formulário → POST /api/editais |
| **Visualizador de grafo** | US-15 | **Sigma.js v3 + Graphology + ForceAtlas2 Worker** |
| Lista de matches | US-16 | Cards ranqueados com score e justificativa |
| Detalhes de nó | US-17 | Painel lateral ao clicar nó no grafo |

### Sprint 4 — Integração + Polish (Semana 5-6)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Integração E2E | — | Frontend ↔ Backend ↔ Neo4j ↔ Agentes |
| Loading states | — | Skeletons, spinners durante processamento |
| Error handling | — | Toast notifications (Sonner) |
| Animações de match | — | Trajeto nó-a-nó com pulse azul neon |
| Deploy staging | — | Vercel (front) + Railway (back) + Neo4j Aura |
| Documentação final | — | README com screenshots e instruções |

---

## 6. Design — Blue Neon Edition

### Paleta de cores (adaptada do GitNexus)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-void` | `#020810` | Background |
| `--color-surface` | `#0a1420` | Superfícies |
| `--color-accent` | `#0ea5e9` | Accent azul neon |
| `--color-accent-glow` | `#38bdf8` | Glow effect |

### Cores dos nós

| Entidade | Hex |
|----------|-----|
| Edital | `#0ea5e9` |
| Student | `#06b6d4` |
| Researcher | `#10b981` |
| Professor | `#f59e0b` |
| Skill | `#8b5cf6` |
| Area | `#6366f1` |

### Interações do grafo (inspiradas no GitNexus)

- **Hover:** Dark pill tooltip + glow ring
- **Seleção:** Nó selecionado 1.8x, vizinhos 1.3x, demais dimmed (0.25)
- **Match animation:** Pulse cyan nó-a-nó com edge flow
- **Layout:** ForceAtlas2 adaptativo por tamanho do grafo

---

## 7. Verificação

### Testes automatizados

| Tipo | Ferramenta |
|------|-----------|
| Unit (backend) | Pytest |
| Integration | Pytest + Neo4j container |
| Unit (frontend) | Vitest |
| E2E | Playwright |
| Lint | ESLint + Ruff |

### Critérios de aceite (DoD)

- [ ] ≥ 15 acadêmicos + ≥ 8 editais no grafo
- [ ] Agentes criam/configuram nós e arestas
- [ ] Match = Cypher puro, sem IA no momento da consulta
- [ ] Frontend com dashboard + cadastro + grafo interativo
- [ ] Design consistente com Blue Neon Edition
- [ ] CI/CD passando

---

## 8. Setup do Ambiente

```powershell
# 1. Clonar e subir infra
git clone https://github.com/guiaaguiar/ProjetoARIANO.git
cd ariano-v0
docker-compose up -d neo4j

# 2. Frontend
cd frontend
npm install
npm run dev   # → http://localhost:5173

# 3. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # → http://localhost:8000

# 4. Neo4j Browser → http://localhost:7474
```

---

**Criado em:** 16/03/2026 · **Versão:** 1.0.0
