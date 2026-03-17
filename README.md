<p align="center">
  <img src="https://img.shields.io/badge/status-planejamento-blue?style=for-the-badge" alt="Status: Planejamento" />
  <img src="https://img.shields.io/badge/versão-v0.0.0-informational?style=for-the-badge" alt="Versão: v0.0.0" />
  <img src="https://img.shields.io/badge/UNINASSAU-Tópicos_Integradores-purple?style=for-the-badge" alt="UNINASSAU" />
</p>

<h1 align="center">🧠 ARIANO</h1>

<p align="center">
  <strong>Arquitetura de Inteligência Artificial Naturalmente Ordenada</strong><br/>
  Motor de Matchmaking Inteligente para a plataforma <strong>CORETO</strong>
</p>

<p align="center">
  <em>Conectando Academia e Governo através de grafos de conhecimento e agentes de IA</em>
</p>

---

## 📋 Sobre o Projeto

O **ARIANO** é o módulo de **matchmaking inteligente** da plataforma **CORETO** — uma plataforma digital da Prefeitura do Recife que conecta os quatro pilares da **quádrupla hélice da inovação**: Academia, Governo, Indústria e Sociedade Civil.

Este repositório contém o **MVP (Minimum Viable Product)** do ARIANO, focado exclusivamente no matchmaking entre **Academia ↔ Governo**.

### 🎯 O que o ARIANO faz?

1. **Recebe** perfis acadêmicos (alunos, pesquisadores, professores) e editais governamentais (FACEPE, CNPq, etc.)
2. **Agentes de IA** interpretam, classificam e enriquecem esses dados
3. **Configuram um grafo** de conhecimento (Neo4j) com relacionamentos ponderados
4. **Matches instantâneos** via Cypher query O(1) sobre o grafo pré-configurado

> **Filosofia-chave:** Os agentes de IA **não fazem** o match diretamente. Eles **preparam o grafo** — o match é apenas uma query sobre adjacência livre de índice.

---

## 🏗️ Status Atual

| Fase | Status | Descrição |
|------|--------|-----------|
| 📐 Planejamento | ✅ Concluído | Visão do produto, arquitetura, stack, design system |
| 📋 Levantamento de Requisitos | ✅ Concluído | User Stories, Product Backlog, DoD |
| 🎨 Design Reference | ✅ Concluído | Análise visual do GitNexus, paleta Blue Neon |
| 🛠️ Plano de Implementação | ✅ Concluído | Roadmap de 4 sprints, estrutura de pastas |
| 💻 Sprint 0 — Fundação | ⬜ Pendente | Setup do repo, Docker, CI/CD |
| 📊 Sprint 1 — Data Layer | ⬜ Pendente | Modelagem Neo4j, API CRUD |
| 🤖 Sprint 2 — Agentes IA | ⬜ Pendente | ProfileAnalyzer, EditalInterpreter, EligibilityCalc |
| 🖥️ Sprint 3 — Frontend | ⬜ Pendente | Dashboard, cadastro, visualizador de grafo |
| ✨ Sprint 4 — Polish | ⬜ Pendente | Integração E2E, animações, deploy |

---

## 🏛️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 FRONTEND — Vite 5 + React 18 + TypeScript               │
│  ├─ Sigma.js v3 + Graphology (grafo interativo WebGL)        │
│  ├─ ForceAtlas2 Worker (layout físico em Web Worker)         │
│  ├─ Tailwind CSS v4 · Framer Motion · React Router v7       │
│  └─ Lucide React · Outfit + JetBrains Mono                  │
├──────────────────────────┬──────────────────────────────────┤
│  ⚙️ BACKEND              │  🤖 AGENTES IA                   │
│  Python 3.12 + FastAPI   │  LangChain + LangGraph           │
│  Neomodel (OGM)         │  Google Gemini (gemini-2.0-flash) │
│  Uvicorn (ASGI)          │  ProfileAnalyzer                 │
│                          │  EditalInterpreter               │
│                          │  EligibilityCalculator           │
├──────────────────────────┴──────────────────────────────────┤
│  🗄️ DATA LAYER — Neo4j 5.x Community (Graph Database)       │
│  Nós: Student, Researcher, Professor, Edital, Skill, Area   │
│  Arestas: HAS_SKILL, ELIGIBLE_FOR, RESEARCHES_AREA, ...     │
├─────────────────────────────────────────────────────────────┤
│  🔧 DEVOPS — Docker + Docker Compose · GitHub Actions        │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
FASE 1 — Configuração (offline, assíncrono)
  Cadastro → API → Agente IA → Interpreta/Classifica → Cria nós+arestas no Neo4j

FASE 2 — Match (online, instantâneo)
  Request → Cypher: MATCH (a)-[r:ELIGIBLE_FOR]->(e) WHERE r.score >= 0.7 → Resultado O(1)
```

---

## 📂 Estrutura do Repositório

```
ProjetoARIANO/
├── Prototype v0/
│   ├── Docs/
│   │   ├── 01_DOCUMENTO_PROJETO_ARIANO.md    # 📋 Documento completo do projeto
│   │   └── assets/
│   │       ├── screenshots/                   # 📸 19 screenshots de referência (GitNexus)
│   │       └── recordings/                    # 🎥 Gravações de exploração do GitNexus
│   └── implementation_plan.md                 # 🗺️ Plano de implementação (4 sprints)
├── trabalho faculdade/
│   ├── apresentacao_TIdCC (1).html            # 📊 Apresentação da disciplina
│   └── Banco-de-Dados-Nao-Relacional.pptx    # 📊 Slides sobre BD não-relacional
└── README.md                                  # 📖 Este arquivo
```

---

## 🎨 Design — Blue Neon Edition

O design do ARIANO é inspirado no [GitNexus](https://gitnexus.vercel.app/), adaptado de roxo para **azul neon**.

| Token | Cor | Uso |
|-------|-----|-----|
| `--color-void` | `#020810` | Background principal |
| `--color-surface` | `#0a1420` | Superfícies de painéis |
| `--color-accent` | `#0ea5e9` | Accent azul neon (sky-500) |
| `--color-accent-glow` | `#38bdf8` | Efeito glow (sky-400) |

### Cores dos Nós do Grafo

| Entidade | Cor | Hex |
|----------|-----|-----|
| 🏛️ Edital | Azul Neon | `#0ea5e9` |
| 🎓 Student | Cyan | `#06b6d4` |
| 🔬 Researcher | Emerald | `#10b981` |
| 👨‍🏫 Professor | Amber | `#f59e0b` |
| 📚 Skill | Violet | `#8b5cf6` |
| 🔬 Area | Indigo | `#6366f1` |

---

## 📚 Documentação

| Documento | Descrição | Link |
|-----------|-----------|------|
| **Documento do Projeto** | Visão completa: contexto, arquitetura, backlog, sprints, DoD | [`Docs/01_DOCUMENTO_PROJETO_ARIANO.md`](Prototype%20v0/Docs/01_DOCUMENTO_PROJETO_ARIANO.md) |
| **Plano de Implementação** | Stack final, roadmap por sprint, modelagem do grafo | [`implementation_plan.md`](Prototype%20v0/implementation_plan.md) |
| **Screenshots de Referência** | 19 capturas do GitNexus para referência de design | [`Docs/assets/screenshots/`](Prototype%20v0/Docs/assets/screenshots/) |

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Vite | 5.x | Build tool + Dev server (HMR < 50ms) |
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Sigma.js | 3.x | Motor de renderização de grafo (WebGL) |
| Graphology | 0.26.x | Manipulação de grafos em memória |
| ForceAtlas2 | Worker | Layout force-directed em Web Worker |
| Tailwind CSS | 4.x | Design system |
| Framer Motion | — | Animações de UI |
| React Router | 7.x | Routing SPA |

### Backend
| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Python | 3.12 | Linguagem principal |
| FastAPI | — | Framework web async |
| LangChain + LangGraph | — | Orquestração de agentes IA |
| Google Gemini | 2.0-flash | LLM para classificação |
| Neomodel | — | OGM para Neo4j |
| Uvicorn | — | Servidor ASGI |

### Dados & DevOps
| Tecnologia | Papel |
|-----------|-------|
| Neo4j 5.x Community | Graph database (adjacência O(1)) |
| Docker + Docker Compose | Containerização |
| GitHub Actions | CI/CD |

---

## 👥 Equipe

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Guilherme Andrade de Aguiar | 01606498 | Product Owner / Tech Lead |

---

## 🎓 Informações Acadêmicas

| Campo | Detalhe |
|-------|---------|
| **Instituição** | UNINASSAU Graças — Recife/PE |
| **Disciplina** | Tópicos Integradores |
| **Período** | 7º Período — 2026.1 |
| **Metodologia** | SCRUM (adaptado para contexto acadêmico) |

---

## 📄 Licença

Este projeto é desenvolvido no contexto acadêmico da UNINASSAU Graças.

---

<p align="center">
  <sub>Feito com 🧠 por <strong>Guilherme Aguiar</strong> — UNINASSAU Graças, 2026</sub>
</p>
