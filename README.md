<p align="center">
  <img src="https://img.shields.io/badge/status-MVP_v1_Online-green?style=for-the-badge" alt="Status: MVP v1 Online" />
  <img src="https://img.shields.io/badge/versão-v1.0.0-informational?style=for-the-badge" alt="Versão: v1.0.0" />
  <img src="https://img.shields.io/badge/UNINASSAU-Tópicos_Integradores-purple?style=for-the-badge" alt="UNINASSAU" />
</p>

<h1 align="center">AR.I.A.N.O</h1>

<p align="center">
  <strong><b>AR</b>quitetura de <b>I</b>nteligência <b>A</b>rtificial <b>N</b>aturalmente <b>O</b>rdenada</strong><br/>
  O Core do Matchmaking Inteligente para a plataforma <strong>CORETO</strong>
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


<div align="center">
  <img src="https://img.shields.io/badge/STACK_ARIANO-v0-E91E63?style=for-the-badge&logo=rocket" alt="Stack Ariano v0">
</div>

<br />

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Frontend</h3>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
      <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/D3.js_v7-F9A03C?style=flat-square&logo=d3.js&logoColor=white" />
      <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
      <img src="https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=react-router&logoColor=white" />
      <ul>
        <li><b>Visualização:</b> Grafo Interativo (SVG + Force Simulation)</li>
        <li><b>UI:</b> SVG Filters (Neon Glow) & Curved Edges</li>
        <li><b>Tipografia:</b> Outfit + JetBrains Mono</li>
        <li><b>Forms:</b> React Hook Form + Zod</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>⚙️ Backend</h3>
      <img src="https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white" />
      <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white" />
      <img src="https://img.shields.io/badge/NVIDIA_Nemotron-76B900?style=flat-square&logo=nvidia&logoColor=white" />
      <img src="https://img.shields.io/badge/OpenRouter-6562F5?style=flat-square&logo=openrouter&logoColor=white" />
      <ul>
        <li><b>Orquestração:</b> LangGraph (Agentes IA)</li>
        <li><b>LLM:</b> NVIDIA Nemotron 3 Super (via OpenRouter)</li>
        <li><b>Integração:</b> FastAPI + Neomodel</li>
        <li><b>Deploy:</b> Vercel Fullstack (Monorepo)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🗄️ Banco de Dados</h3>
      <img src="https://img.shields.io/badge/Neo4j_5.x-4581C3?style=flat-square&logo=neo4j&logoColor=white" />
      <ul>
        <li>Graph Database (Community)</li>
        <li>Relacionamentos complexos em tempo real</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🔧 DevOps</h3>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
      <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" />
      <ul>
        <li>Docker Compose (Orquestração local)</li>
        <li>CI/CD Automatizado</li>
      </ul>
    </td>
  </tr>
</table>

---



### Fluxo de Dados

```
FASE 1 — Configuração (offline, assíncrono)
  Cadastro → API → Agente IA → Interpreta/Classifica → Cria nós+arestas no Neo4j

FASE 2 — Match (online, instantâneo)
  Request → Cypher: MATCH (a)-[r:ELIGIBLE_FOR]->(e) WHERE r.score >= 0.7 → Resultado O(1)
```

---

## 🏗️ Status Atual

| Fase | Status | Descrição |
|------|--------|-----------|
| 📐 Planejamento | ✅ Concluído | Visão do produto, arquitetura, stack, design system |
| 📋 Levantamento de Requisitos | ✅ Concluído | User Stories, Product Backlog, DoD |
| 🎨 Design Reference | ✅ Concluído | Referência de Design e paletas Blue Neon ajustadas |
| 🛠️ Plano de Implementação | ✅ Concluído | Roadmap de 4 sprints construído, modelo MVC escalonado |
| 💻 Sprint 0 — Fundação | ✅ Concluído | Setup do repo e de ecossistema local configurado |
| 📊 Sprint 1 — UI & Web Grafo| ✅ Concluído | Frontend consolidado (D3.js), Data Mock de nós refinada |
| 🤖 Sprint 2 — Data & Agentes | ✅ Concluído | Modelagem Neo4j, Agentes IA Python, APIs CRUD |
| 🚀 Sprint 3 — Deploy & Prod | ✅ Concluído | Deploy Fullstack Vercel, Security Hardening, Refactor |
| ✨ Sprint 4 — Expansão | ⬜ Pendente | Novos eixos (Indústria), animações fluidas, polimento |

---

## 📂 Estrutura do Repositório

```text
├── app/                   # ⚙️ Código do Backend (IA Agents + Logic)
├── api/                   # 🚀 Entrypoint Vercel (Production)
├── frontend/              # 🎨 Código do Frontend (React)
├── requirements.txt       # Dependências GLOBAIS
├── vercel.json            # Configuração de Deploy Fullstack
├── Prototype v0/          # 📋 Documentação e Histórico
└── README.md              # 📖 Este arquivo
```

---

## 🎨 Design — Blue Neon Edition

O design do ARIANO explora a complexidade orgânica e viva de grafos densos através de customizações da infraestrutura provida pelo **D3.js**. Baseamos nossa elegância analítica e visual moderno no repositório de excelência [GitNexus](https://github.com/abhigyanpatwari/GitNexus), transportando os tons para um ambiente tipicamente tecnológico ("Azul Neon").

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
| **Documento do Projeto** | Histórico consolidado do MVP, arquitetura, design vision, Boas práticas detalhadas das Sprints. | [`Docs/01_DOCUMENTO_PROJETO_ARIANO.md`](Prototype%20v0/Docs/01_DOCUMENTO_PROJETO_ARIANO.md) |
| **Plano de Implementação** | Stack final e roadmap iteracional de entrega de Features. | [`implementation_plan.md`](Prototype%20v0/implementation_plan.md) |

---

## 👥 Equipe

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Guilherme Andrade de Aguiar | 01606498 | Product Owner / Tech Lead / Product Manager |
| Pedro Miranda | 01607408 | DevOps / Back-End Developer |
| Ricardo Cezar O. A. de Almeida | 01606498 | AI Agent Architect / Graph Data Engineer |
| Marcio Maycom | 01607574 | UX UI Designer / Front-End Developer |
| Thiago José Falcão de Freitas | 01597267 | Scrum Master / QA |

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
