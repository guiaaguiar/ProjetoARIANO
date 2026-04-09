# 🚀 ARIANO v1.0 — Plano de Implementação do MVP

> **Arquitetura de Inteligência Artificial Naturalmente Ordenada**
> Orquestrador inteligente de matches para a plataforma **CORETO**

> **Versão:** 4.0.0 (MVP 1.0.0 Finalizado — Fullstack Vercel)
> **Data:** 09/04/2026  
> **Última atualização:** 09/04/2026

---

## 1. Visão Geral

O ARIANO é o **motor de matchmaking inteligente** da plataforma CORETO (Prefeitura do Recife). O MVP foca no matchmaking **Academia ↔ Governo**.

**Filosofia:** Agentes de IA configuram o grafo (offline) → Match = Cypher query O(1) (online).

---

## 2. Stack Tecnológica Final

```
┌──────────────────────────────────────────────────────────┐
│                   STACK ARIANO v1.0                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎨 FRONTEND                                              │
│  ├─ Vite 5 + React 18 + TypeScript                       │
│  ├─ Tailwind CSS v4 (design system)                       │
│  ├─ D3.js v7 (grafo interativo SVG + Force Simulation)    │
│  ├─ Framer Motion (animações e transições)                │
│  └─ D3-force (layout force-directed com colisão)          │
│                                                           │
│  ⚙️ BACKEND                                               │
│  ├─ Python 3.12 + FastAPI                                 │
│  ├─ LangChain + LangChain-OpenAI (agentes IA)             │
│  ├─ NVIDIA Nemotron 3 Super 120B via OpenRouter (LLM)     │
│  └─ Neomodel (OGM para Neo4j) + Neo4j Driver (Cypher)    │
│                                                           │
│  🗄️ DADOS                                                 │
│  ├─ Neo4j 5.x Community (graph database, primário)        │
│  └─ In-Memory Graph Store (fallback state zero-config)    │
│                                                           │
│  🔧 DEVOPS & DEPLOY                                       │
│  ├─ Vercel Fullstack (Monorepo)                           │
│  ├─ Vercel Secrets / Environment Variables                │
│  └─ GitHub Actions (CI/CD)                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Decisões de stack (histórico de mudanças)

| Aspecto | v0.1 (inicial) | v0.2 (análise) | **v1.0 (final)** | Motivo |
|---------|---------------|----------------|-------------------|--------|
| **Frontend** | Next.js 15 | Vite + React | **Vite 5 + React 18** | SPA pura = melhor para UX interativo e grafo |
| **Grafo** | D3.js | Cytoscape.js | **D3.js v7 (Force Simulation SVG)** | Controle total sobre glow filters SVG, arestas curvas (arc paths), drag |
| **Layout** | — | Cytoscape built-in | **D3-force (Simulation)** | Forças configuráveis: gravidade, repulsão, colisão |
| **Edges** | — | Straight | **Curved (@sigma/edge-curve)** | Visual elegante comprovado |
| **Animação** | — | — | **Framer Motion** | Transições de página, micro-interactions |
| **LLM** | — | Google Gemini | **NVIDIA Nemotron 3 Super (OpenRouter)** | 120B MoE/12B ativo, 1M context, tier gratuito, multi-agent |

### Justificativa Técnica — NVIDIA Nemotron 3 Super via OpenRouter

O modelo **NVIDIA Nemotron 3 Super** foi escolhido como LLM principal do ARIANO pelos seguintes motivos:

1. **Arquitetura MoE Híbrida (120B/12B):** Modelo com 120B parâmetros totais mas ativa apenas 12B durante inferência, garantindo eficiência computacional máxima sem comprometer qualidade — ideal para aplicações multi-agente como ARIANO.

2. **Mamba-Transformer + Multi-Token Prediction (MTP):** Arquitetura híbrida que entrega >50% mais tokens gerados que modelos abertos concorrentes, acelerando o processamento dos três agentes (ProfileAnalyzer, EditalInterpreter, EligibilityCalculator).

3. **Context Window de 1M tokens:** Permite coerência de longo prazo entre agentes, raciocínio cross-document e planejamento multi-step — essencial para interpretar editais complexos e cruzar múltiplos perfis acadêmicos.

4. **Latent MoE:** Chama 4 experts pelo custo de 1, melhorando inteligência e generalização em tasks de classificação e scoring.

5. **Multi-environment RL Training:** Treinado em 10+ ambientes, com accuracy líder em benchmarks (AIME 2025, TerminalBench, SWE-Bench Verified) — relevante para as tarefas de extração estruturada e raciocínio que os agentes ARIANO executam.

6. **Tier Gratuito via OpenRouter:** Disponível sem custo na tier free do OpenRouter, permitindo desenvolvimento e testes sem restrição orçamentária.

7. **Licença Aberta (NVIDIA Open License):** Weights, datasets e recipes totalmente abertos, permitindo customização futura e deploy seguro em qualquer ambiente.

8. **Compatibilidade OpenAI API:** Via OpenRouter, o modelo é acessível com a mesma interface `ChatOpenAI` do LangChain, simplificando integração e permitindo troca futura de modelo sem alteração de código.

### Justificativa Técnica — In-Memory Graph Data Store (Fallback)

Para garantir que o protótipo e o backend funcionem em ambientes de demonstração de forma **leve e fluida** sem depender da instalação estrita do Neo4j, o sistema implementa um **In-Memory Graph Store**.
1. **Graceful Degradation:** Na ausência de conexão com Neo4j, o backend automaticamente opera em memória.
2. **Alta Performance:** A busca na memória possui tempo O(1), permitindo carregamentos de página e grafos instantâneos via `api.ts`.
3. **Consistência:** A camada de CRUD foi arquitetada com uma API unificada, abstraindo se o dado vem do `neomodel` (persistente) ou dos `drivers` na memória.
4. **Auto-seeding Dinâmico:** Para garantir a funcionalidade, sempre que a API é inicializada em In-Memory Mode, o próprio sistema aciona iterativamente os seeds nativos e preenche as simulações, entregando a experiência final prontas para uso.

---

## 3. Arquitetura

```
FRONTEND (Vite + React + D3.js)
    │ REST API
BACKEND (Python + FastAPI)
    │
    ├─ Agentes IA (LangChain + Nemotron 3 Super via OpenRouter)
    │   ├─ ProfileAnalyzer
    │   ├─ EditalInterpreter
    │   └─ EligibilityCalculator
    │
    ├─ Match Engine (Cypher puro)
    │
    │ Bolt Protocol
DATA LAYER (Neo4j local)
```

### Fluxo de dados

**Fase 1 — Configuração (agentes):**
```
Cadastro → API → Agente IA (Nemotron) → Interpreta/Classifica → Cria nós+arestas no Neo4j → Grafo configurado
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

### Sprint 2 — Agente Inteligente de Grafos (Semana 4-5) ✅ CONCLUÍDA

**Objetivo Central:** Construir o Agente de IA Principal especializado em interpretar o Neo4j e fazer conexões estratégicas de forma matemática.

| Tarefa | US | Detalhes | Status |
|--------|----|---------|--------|
| **Implementar Agente Especialista Neo4j (MAIN)** | US-10 | EligibilityCalculator: scoring multi-dimensional (skill 45%, area 25%, level 15%, priority 15%) | ✅ |
| Configuração Neo4j (Data Layer) | US-04 | Neo4j local, Bolt protocol, driver nativo + neomodel | ✅ |
| Match Engine Concept (Cypher) | US-11 | Cypher puro com queries O(1): `MATCH (a)-[r:ELIGIBLE_FOR]->(e)` | ✅ |
| Agente ProfileAnalyzer | US-08 | Extração de skills e classificação de áreas via Nemotron 3 Super | ✅ |
| Agente EditalInterpreter | US-08 | Interpretação de editais e extração de requisitos via Nemotron 3 Super | ✅ |
| API Rest FastAPI (Agent Routes) | US-04 | Endpoints: analyze-profile, interpret-edital, calculate-matches, run-pipeline, status | ✅ |
| Neo4j Driver Nativo | US-04 | Wrapper para Cypher queries complexas fora do neomodel | ✅ |
| OpenRouter + Nemotron 3 Super | US-10 | LLM via OpenRouter API (OpenAI-compatible), 120B MoE gratuito | ✅ |
| Seed + Pipeline Script | — | Script automatizado: seed data → analyze → interpret → calculate | ✅ |
| Integração Frontend (API Client) | — | Endpoints de agentes expostos no api.ts do frontend | ✅ |

### Sprint 3 — Integração, Deploy e Hardening ✅ CONCLUÍDA

**Entregáveis Consolidados:**
- **Fullstack E2E:** Frontend e Backend 100% integrados em monorepo.
- **Deploy Vercel:** Sistema online com funções serverless estáveis.
- **Security Hardening:** Proteção de chaves via Secrets/Env Vars.
- **Arquitetura Nuvem:** Pasta `app/` na raiz para descoberta nativa.
- **Correção Pydantic:** Configuração de ambientes Local/Prod validada.

| Tarefa | US | Detalhes | Status |
|--------|----|---------|--------|
| Integração E2E (Remoção Mock) | — | Frontend ↔ Backend totalmente integrado sem mocks | ✅ |
| Deploy Fullstack Vercel | — | Monorepo configurado com FastAPI (Serverless) + Vite | ✅ |
| Segurança de Credenciais | — | Gestão de chaves via Vercel Secrets / Env Vars | ✅ |
| Refatoração de Estrutura | — | Pasta `app/` na raiz para descoberta nativa | ✅ |
| Correção Pydantic Prod | — | Ajuste de validação para variáveis de ambiente Vercel | ✅ |
| In-Memory Graph Fallback | — | Fallback do Neo4j em memória (Dicionário O(1)) | ✅ |
| Skeletons & Spinners | — | Animações de loading otimizadas durante chamadas | ✅ |

### Sprint 4 — Polimento e Expansão 🚀 EM ANDAMENTO

**Expectativas de Entrega Final:**
- **Software Polido:** Eliminação de bugs visuais e estabilização de performance.
- **Visualização de Agentes:** Interface clara mostrando o **processamento dos agentes IA** e o matchmaking em tempo real.
- **Desempenho Geral:** Otimização de tempo de resposta e fluidez do grafo D3.js.
- **Excelência UX/UI:** Refinamentos de design system e usabilidade avançada.

| Tarefa | US | Detalhes | Status |
|--------|----|---------|--------|
| **Visualização de Processamento** | — | Mostrar feedback dos agentes IA trabalhando no backend | ⬜ |
| **Animações Fluidas** | — | Transições suaves de grafos e interações orgânicas | ⬜ |
| Expansão de Grafos | — | Novos nós de Indústria e Sociedade Civil | ⬜ |
| Lógica Zero-Filter | — | Inicialização limpa e progressiva do grafo | ⬜ |
| Estabilização Final | — | Testes de carga e refinamentos de UI/UX | ⬜ |
| Manual do Usuário | — | Vídeo demo e guia de instalação | ⬜ |

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
| Integration | Pytest + Neo4j local |
| Unit (frontend) | Vitest |
| E2E | Playwright |
| Lint | ESLint + Ruff |

### Critérios de aceite (DoD)

- [x] ≥ 15 acadêmicos + ≥ 8 editais no grafo
- [x] Agentes criam/configuram nós e arestas
- [x] Match = Cypher puro, sem IA no momento da consulta
- [x] Frontend com dashboard + cadastro + grafo interativo
- [x] Design consistente com Blue Neon Edition
- [x] Deploy Fullstack funcional (Vercel)
- [x] Segurança de credenciais via Secrets
- [x] CI/CD passando

---

## 8. Setup do Ambiente

```bash
# 1. Clonar o repositório
git clone https://github.com/guiaaguiar/ProjetoARIANO.git
cd ProjetoARIANO

# 2. Instalar Neo4j localmente
brew install neo4j
neo4j start
# Neo4j Browser → http://localhost:7474

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com sua OPENROUTER_API_KEY

# 4. Frontend
cd frontend
npm install
npm run dev   # → http://localhost:5173

# 5. Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # → http://localhost:8000

# 6. Seed + Pipeline (popular banco e rodar agentes)
python -m app.services.seed_and_configure
```

---

## 9. Estrutura de Arquivos (Sprint 2)

```
├── app/                   # ⚙️ BACKEND CODE
│   ├── agents/            # IA Agents
│   ├── api/               # FastAPI Routers
│   ├── core/              # Config & Security
│   ├── models/            # Graph Models
│   └── services/          # Business Logic
├── api/                   # 🚀 Vercel functions
├── frontend/              # 🎨 Frontend React
├── vercel.json            # Monorepo config
├── requirements.txt       # Global dependencies
└── .env                   # Secret variables (GitIgnored)
```

---

**Criado em:** 16/03/2026 · **Última atualização:** 09/04/2026 · **Versão:** 4.0.0
