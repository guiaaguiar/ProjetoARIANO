# 🚀 ARIANO v0 — Plano de Implementação do MVP

> **Arquitetura de Inteligência Artificial Naturalmente Ordenada**
> Orquestrador inteligente de matches para a plataforma **CORETO**

> **Versão:** 1.1.0 (Atualizado — Sprint 0+1 concluídas, migração D3.js)  
> **Data:** 23/03/2026  
> **Última atualização:** 23/03/2026

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
│  ├─ D3.js v7 (grafo interativo SVG + Force Simulation)    │
│  ├─ D3-force (layout force-directed com colisão)          │
│  ├─ SVG Filters (glow neon por tipo de nó)                │
│  ├─ Curved Edges (arcos SVG arc paths)                    │
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
| **Grafo** | D3.js | Cytoscape.js | **D3.js v7 (Force Simulation SVG)** | Controle total sobre glow filters SVG, arestas curvas (arc paths), drag. Inspirado em grafos acadêmicos (Game of Thrones / Labcodes). |
| **Layout** | — | Cytoscape built-in | **D3-force (Simulation)** | Forças configuráveis: gravidade, repulsão, colisão. Clusters naturais. |
| **Edges** | — | Straight | **Curved (@sigma/edge-curve)** | Visual elegante comprovado |
| **Animação** | — | — | **Framer Motion** | Transições de página, micro-interactions |

---

## 3. Arquitetura

```
FRONTEND (Vite + React + D3.js)
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

### Sprint 0 — Fundação (Semana 1) ✅ CONCLUÍDA

| Tarefa | US | Detalhes | Status |
|--------|----|---------|--------|
| Criar repo GitHub `ProjetoARIANO` | US-03 | README, .gitignore, LICENSE MIT | ✅ |
| Estrutura de pastas | US-03 | frontend/, backend/, Prototype v0/ | ✅ |
| Setup Frontend | US-03 | Vite 5 + React 18 + TS + Tailwind v4 | ✅ |
| Setup Backend | US-03 | FastAPI + Uvicorn + Neomodel (estrutura) | ✅ |
| Design System | — | Blue Neon Edition: tokens CSS, paleta neon, tipografia | ✅ |
| Documentação | — | Documento de Visão + Implementation Plan | ✅ |

### Sprint 1 — Frontend + Visualização de Grafo (Semana 2-3) ✅ CONCLUÍDA

| Tarefa | US | Detalhes | Status |
|--------|----|---------|--------|
| Layout base dark theme | US-12 | Sidebar colapsável + Header responsivo | ✅ |
| Dashboard | US-12 | Cards KPI com mock data | ✅ |
| Pág. Acadêmicos | US-13 | Listagem com cards e filtros | ✅ |
| Pág. Editais | US-14 | Listagem com detalhes de financiamento | ✅ |
| Pág. Matches | US-16 | Rankings com score e justificativa | ✅ |
| **Grafo D3.js** | US-15 | **D3.js v7 + Force Simulation + SVG glow filters** | ✅ |
| Arestas curvas | US-15 | Arc paths SVG inspirados em grafos acadêmicos | ✅ |
| Interação click/hover | US-17 | Click trava, hover preview, ESC desseleciona | ✅ |
| Filtros inteligentes | US-15 | Edges se ocultam quando endpoints filtrados | ✅ |
| Painel de detalhes | US-17 | Desktop lateral + Mobile bottom sheet | ✅ |
| Mock data | US-07 | 48 nós + 112 arestas (15 acadêmicos, 8 editais) | ✅ |
| Cores atualizadas | — | Student=#00e5ff (cyan), Edital=#2563eb (azul escuro) | ✅ |
| UX/UI refinements | — | Padding 8px+, responsividade, tooltip removido | ✅ |

### Sprint 2 — Data Layer + CRUD + Agentes IA (Semana 4-5)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Config Neo4j local | US-04 | Community Edition, Bolt protocol |
| Modelar nós academia | US-04 | Student, Researcher, Professor (Neomodel) |
| Modelar nós governo | US-04 | Edital (Neomodel) |
| Modelar nós auxiliares | US-05 | Skill, Area |
| Seed de dados | US-07 | ~15 acadêmicos + ~8 editais FACEPE |
| API CRUD | US-04 | FastAPI routers (POST/GET/PUT/DELETE) |
| Config Google Gemini | US-08 | API key, SDK, LangChain wrapper |
| ProfileAnalyzer | US-08 | Cadastro → extrai skills + classifica área → cria nós/arestas |
| EditalInterpreter | US-09 | Edital → extrai requisitos + áreas → cria arestas |
| EligibilityCalculator | US-10 | Percorre grafo → calcula score → cria ELIGIBLE_FOR |
| Match Engine | US-11 | Cypher puro: `MATCH (a)-[r:ELIGIBLE_FOR]->(e)` |
| Endpoint match | US-11 | `GET /api/matches?entity_id=X&threshold=0.7` |
| Integração Frontend | — | Substituir mock data por API real |
| Testes | US-04 | Pytest + Neo4j container |

### Sprint 3 — Integração + Polish (Semana 5-6)

| Tarefa | US | Detalhes |
|--------|----|---------|
| Integração E2E | — | Frontend ↔ Backend ↔ Neo4j ↔ Agentes |
| Loading states | — | Skeletons, spinners durante processamento |
| Error handling | — | Toast notifications (Sonner) |
| Animações de match | — | Trajeto nó-a-nó com pulse neon |
| Deploy staging | — | Vercel (front) + Railway (back) + Neo4j local |
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
| Edital | `#2563eb` (azul escuro) |
| Student | `#00e5ff` (cyan brilhante) |
| Researcher | `#10b981` |
| Professor | `#f59e0b` |
| Skill | `#8b5cf6` |
| Area | `#6366f1` |

### Interações do grafo

- **Hover:** Highlight visual + edges do nó hovered (sem tooltip)
- **Click:** Trava seleção, mostra painel de detalhes, mantém edges visíveis
- **ESC / Click fora:** Desseleciona, oculta edges
- **Filtros:** Edges só aparecem se ambos endpoints visíveis
- **Painel:** Mostra TODAS as conexões (filtros são visuais, não de dados)

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

**Criado em:** 16/03/2026 · **Última atualização:** 23/03/2026 · **Versão:** 1.1.0
