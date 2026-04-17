# 🚀 ARIANO v1.0 — Plano de Implementação do MVP

> **Arquitetura de Inteligência Artificial Naturalmente Ordenada**
> Orquestrador inteligente de matches para a plataforma **CORETO**

> **Versão:** 7.0.0 (Sprint 4 — Graph-CoT Híbrido, Cognição Artificial, Portais & Experiência)
> **Data:** 16/04/2026  
> **Última atualização:** 16/04/2026

> [!IMPORTANT]
> **REGRAS DE OURO (SUI GENERIS):**
> 1. **Nenhum aviso, erro ou pop-up deve estar em Inglês.** Tudo deve ser em Português Brasileiro (PT-BR).
> 2. Todas as mensagens de erro do backend DEVEM ser traduzidas antes de chegarem ao frontend.
> 3. O design deve ser sempre Premium, Neon Teal e focado na experiência "Agentes em Ação".

---

## 1. Visão Geral

O ARIANO é o **motor de matchmaking inteligente** da plataforma CORETO (Prefeitura do Recife). O MVP foca no matchmaking **Academia ↔ Governo**: conectar perfis acadêmicos (alunos, pesquisadores, professores) com editais governamentais (FACEPE, CNPq, etc.) através de um grafo de conhecimento pré-configurado por agentes de IA especializados.

**Filosofia (Precomputed Relational Intelligence + Graph-CoT Híbrido):**
- **Fase 1 (Cadastro):** Agentes usam Graph-CoT sequencial para configurar o grafo com raciocínio profundo
- **Fase 2 (Enriquecimento):** ContextualAnalyzer usa Graph-CoT iterativo completo (Thought → Action → Observation) para criar conexões emergentes
- **Fase 3 (Consulta):** Match = Cypher query O(1) — sem IA, sem custo, instantâneo

**Fundamentação teórica:** Graph Chain-of-Thought (Graph-CoT) adaptado de Cognitive-RAG (Reddy, 2024) com primitivas ReAct (Yao et al., 2023). Detalhes completos na seção 2.4 do Documento de Visão.

---

## 2. Stack Tecnológica Final

```
┌──────────────────────────────────────────────────────────┐
│                   STACK ARIANO v1.0                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎨 FRONTEND                                              │
│  ├─ Vite 5 + React 18 + TypeScript                       │
│  ├─ Tailwind CSS v4 (Design System: Teal Neon/Glassmorphism)│
│  ├─ React SVG (renderização de grafo leve e interativa)   │
│  └─ Framer Motion (animações e transições)                │
│                                                           │
│  ⚙️ BACKEND                                               │
│  ├─ Python 3.12 + FastAPI                                 │
│  ├─ LangChain + LangChain-OpenAI (agentes IA)             │
│  ├─ NVIDIA Nemotron 3 Super 120B via OpenRouter (LLM)     │
│  ├─ NetworkX 3.x (graph layout + community detection)     │
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

*(Histórico de stack, justificativas Nemotron e In-Memory mantidos da v5.0.0 — seções omitidas por brevidade)*

### Migração de Dependências — D3.js → NetworkX (Sprint 4)

| Ação | Pacote | Motivo |
|------|--------|--------|
| 🗑️ **REMOVER** (frontend) | `d3`, `@types/d3` | Substituído por NetworkX (backend) + React SVG |
| 🗑️ **REMOVER** (frontend) | `sigma`, `@sigma/edge-curve` | Substituído por React SVG nativo |
| 🗑️ **REMOVER** (frontend) | `graphology`, `graphology-layout-forceatlas2`, `graphology-layout-noverlap` | Layout agora computado server-side via NetworkX |
| ✅ **ADICIONAR** (backend) | `networkx>=3.3` | Layout (`spring_layout`, `forceatlas2_layout`), comunidades (`louvain_communities`), centralidade |
| ✅ **MANTER** (frontend) | `framer-motion` | Animações de transição e entrada dos nós SVG |

---

## 3. Arquitetura

```
                     ┌──────────────────────────────────────┐
                     │          FRONTEND (Vite+React)        │
                     │                                      │
                     │  /user/*         /admin/*             │
                     │  ├ /cadastro     ├ /dashboard         │
                     │  ├ /profile      ├ /academicos        │
                     │  ├ /matchs       ├ /editais           │
                     │  └ /ecossistema  ├ /matches           │
                     │                  ├ /grafo             │
                     │    Auth Popup    └ /comunidades       │
                     │  (cookie-based)                       │
                     └──────────┬───────────────────────────┘
                                │ REST API (Axios)
                     ┌──────────┴───────────────────────────┐
                     │       BACKEND (Python + FastAPI)       │
                     │                                       │
                     │  Auth (email/password + cookies)       │
                     │  Agente Orquestrador (multi-agent)     │
                     │  ├─ ProfileAnalyzer (Graph-CoT seq.)   │
                     │  ├─ EditalInterpreter                  │
                     │  ├─ EligibilityCalculator (scoring)    │
                     │  ├─ ContextualAnalyzer (Graph-CoT iter)│
                     │  └─ CommunityEnricher (Sprint 4)       │
                     │  Graph-CoT Primitives:                 │
                     │    RetrieveNode, NodeFeature,           │
                     │    NeighbourCheck, NodeDegree           │
                     │  NetworkX 3.x:                         │
                     │    spring_layout, louvain_communities   │
                     │  Match Engine (Cypher O(1))            │
                     └──────────┬───────────────────────────┘
                                │ Bolt / Memory
                     ┌──────────┴───────────────────────────┐
                     │   DATA LAYER = "CÉREBRO" DO ARIANO    │
                     │   Neo4j / In-Memory Graph Database     │
                     │   Nós + Arestas + Comunidades Graph-CoT│
                     └──────────────────────────────────────┘
```

### Fluxo de dados — Três Fases

**Fase 1 — Cadastro + Match Estratégico (tempo real, visível ao usuário):**
```
Usuário se cadastra em /user/cadastro
  → Preenche: nome, instituição, curso, bio, currículo (PDF)
  → Backend cria o nó no grafo
  → Orquestrador aciona agentes EM TEMPO REAL (visível na UI):
    → ProfileAnalyzer lê bio+currículo → extrai skills, áreas, determina maturidade (0-10), gera o_que_busco
    → EligibilityCalculator calcula matches com editais → cria arestas ELIGIBLE_FOR
  → Grafo na UI anima mostrando as novas conexões sendo criadas
  → Usuário vê seus matches com scores e justificativas
```

**Fase 2 — Enriquecimento Contínuo (Comunidades de Pensamento via Graph-CoT):**
```
Ciclo manual (prod: 24h) → Orquestrador → Graph-CoT ITERATIVO:
  Loop: Thought → Action → Observation (até convergência)
    → Primitivas: RetrieveNode, NodeFeature, NeighbourCheck, NodeDegree
    → Scratchpad: memória de trabalho com raciocínio visível
    → Halting: agente decide quando tem info suficiente
  → Novas conexões: SIMILAR_TO, RELATED_TO, OVERLAPS_WITH
  → Re-cálculo: maturidade + scores + o_que_busco recalibrados
  → Cérebro evolutivo: grafo mais inteligente a cada ciclo
```

**Fase 3 — Consulta de Matches O(1) (instantâneo, pós-cadastro):**
```
Usuário acessa /user/matchs (já cadastrado)
  → Cypher: MATCH (a)-[r:ELIGIBLE_FOR]->(e) WHERE a.uid = $uid → O(1)
  → Matches pré-computados retornados instantaneamente
  → Filtros: só editais, só usuários, por score
```

---

## 4. Modelagem do Grafo

### 4.1 Nós — Campos por Entidade

#### 🎓 Student
```
(:Student {
  uid,
  name,
  email,                  // login
  password_hash,          // autenticação
  institution,            // ex: "UNINASSAU"
  course,                 // ex: "Ciência da Computação"
  semester,               // ex: 7
  bio,                    // descrição livre: sobre si, onde trabalha, o que faz, experiências, objetivos
  curriculo_texto,        // texto extraído do PDF enviado pelo usuário via PyMuPDF (fitz) — o PDF NÃO é salvo, apenas o texto
  maturidade,             // 0-10, DETERMINADO PELA IA com base nos demais campos
  o_que_busco,            // texto gerado pela IA descrevendo o que o acadêmico busca
  node_type: "student"
})
```

#### 🔬 Researcher
```
(:Researcher {
  uid,
  name,
  email,
  password_hash,
  institution,
  bio,                    // descrição livre
  curriculo_texto,        // texto extraído do PDF via PyMuPDF — PDF não é salvo
  maturidade,             // 0-10, IA
  o_que_busco,            // IA
  node_type: "researcher"
})
```

#### 👨‍🏫 Professor
```
(:Professor {
  uid,
  name,
  email,
  password_hash,
  institution,
  department,             // ex: "Departamento de Computação"
  research_group,         // ex: "Grupo de IA Aplicada"
  bio,                    // descrição livre
  curriculo_texto,        // texto extraído do PDF via PyMuPDF — PDF não é salvo
  maturidade,             // 0-10, IA
  o_que_busco,            // IA
  node_type: "professor"
})
```

#### 🏛️ Edital
```
(:Edital {
  uid,
  title,
  description,
  instituicao,            // ex: "FACEPE", "CNPq" (era "agency")
  edital_type,            // ex: "pesquisa", "extensão", "inovação"
  funding,                // valor do financiamento (desempate, sem peso no scoring)
  deadline,               // data limite — edital só aparece no match se deadline > hoje
  min_maturidade,         // 0-10, mínimo de maturidade para elegibilidade (era "min_level")
  status,
  node_type: "edital"
})
```

#### 📚 Skill / 🔬 Area
```
(:Skill {uid, name, category})
(:Area  {uid, name, parent_area})
```

> **Campos determinados pela IA / Sistema (não preenchidos pelo usuário):**
> - `curriculo_texto`: O usuário faz upload do PDF do currículo direto do computador no formulário de cadastro. O backend recebe o arquivo temporariamente, extrai todo o texto via **PyMuPDF (fitz)** em <100ms, salva APENAS o texto extraído no campo `curriculo_texto` do nó, e descarta o arquivo PDF (não é armazenado). Os agentes usam esse texto como contexto.
> - `maturidade` (0-10): Calculado pelo ProfileAnalyzer com base em bio, curriculo_texto, semestre, instituição
> - `o_que_busco`: Gerado pelo ProfileAnalyzer descrevendo objetivos inferidos do perfil
> - Skills e Areas: Associadas automaticamente pela IA, sem seleção manual do usuário
>
> **Regra de visibilidade do Edital:**
> - Um edital **só aparece como match visível** se seu `deadline > data de hoje`. Editais com deadline expirado são automaticamente excluídos dos resultados de match (tanto na tela de cadastro CORETO quanto na página /user/matchs). A query Cypher inclui `WHERE e.deadline > date()` como filtro obrigatório.

### 4.2 Arestas

```cypher
// PRIMÁRIAS (criadas pelos agentes na Fase 1)
(Academia)-[:HAS_SKILL {confidence}]->(Skill)
(Academia)-[:RESEARCHES_AREA]->(Area)
(Edital)-[:REQUIRES_SKILL {priority}]->(Skill)
(Edital)-[:TARGETS_AREA]->(Area)
(Academia)-[:ELIGIBLE_FOR {score, justification, calculated_at}]->(Edital)  // ← MATCH
(Professor)-[:ADVISES]->(Student)
(Professor)-[:COLLABORATES]->(Researcher)

// ENRIQUECIDAS (criadas na Fase 2 — Comunidades de Pensamento)
(Academia)-[:SIMILAR_TO {similarity, shared_skills, enrichment_cycle}]->(Academia)
(Skill)-[:RELATED_TO {strength}]->(Skill)
(Area)-[:OVERLAPS_WITH {degree}]->(Area)
```

### 4.3 Cálculo de Score (Match)

```
score_base = (skill_match × 0.40)
           + (area_match  × 0.25)
           + (maturidade_compatibility × 0.15)
           + (priority_match × 0.10)
           + (context_bonus × 0.05)    // comunidades/vizinhos
           + (community_relevance × 0.05) // padrões de sucesso
```

**Critérios adicionais (não entram no score, mas influenciam resultado):**

| Critério | Efeito | Comportamento |
|----------|--------|---------------|
| `o_que_busco` | **Bônus** | Se `o_que_busco` do acadêmico alinha com o `edital_type`, adiciona bônus ao score. NÃO é eliminatório — se for diferente, o match ainda acontece sem o bônus. |
| `funding` | **Desempate** | Não entra no cálculo do score. Quando dois matches têm score igual, o edital com maior `funding` aparece primeiro na ordenação. |
| `min_maturidade` | **Filtro** | Se `maturidade` do acadêmico < `min_maturidade` do edital, o match é penalizado (score reduzido) mas ainda pode ocorrer. |
| `deadline` | **Eliminatório** | Se `deadline < hoje`, o edital **NÃO aparece** nos resultados de match. Query: `WHERE e.deadline > date()`. Único critério eliminatório do sistema. |

---

## 5. Sistema de Autenticação

### 5.1 Modelo de Auth

```
Dois perfis simultâneos via cookies:
  ├─ Cookie "ariano_user"  → JWT com {uid, email, name, role: "user", node_type}
  └─ Cookie "ariano_admin" → JWT com {uid, email, role: "admin"}

Persistência: cookies HttpOnly com expiração de 7 dias.
Ao recarregar a página no Vercel, o login é preservado.
```

### 5.2 Fluxo de Autenticação

**Login Popup (AuthPopup.tsx):**
- Aparece sobre qualquer página protegida se o usuário não estiver logado
- **NÃO pode ser fechado clicando fora** — popup treme (shake animation) e campos ficam vermelhos
- Campos: email + senha + botão "Entrar"
- Link "Criar Conta" → redireciona para `/user/cadastro`
- Toggle Admin/Usuário para selecionar tipo de login

**Regras de acesso:**
- `/user/*` → requer cookie `ariano_user`
- `/admin/*` → requer cookie `ariano_admin`
- `/user/cadastro` → acesso livre (é o registro)
- Admin NÃO tem opção "Criar Conta" — se não tem acesso, conteúdo fica em estado de loading permanente
- Pode estar logado em ambos os perfis simultaneamente

### 5.3 Backend Auth

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /api/auth/register` | POST | Cria conta de usuário (Student/Researcher/Professor) |
| `POST /api/auth/login` | POST | Login (retorna cookie JWT) |
| `POST /api/auth/logout` | POST | Remove cookie |
| `GET  /api/auth/me` | GET | Retorna dados do usuário logado (via cookie) |

---

## 6. Estrutura de Rotas

### 6.1 Portal do Usuário (`/user/*`)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/user/cadastro` | **CadastroPage** | Cadastro CORETO: formulário + match estratégico visível pela IA em tempo real |
| `/user/profile` | **ProfilePage** | Visualizar e editar perfil (campos do cadastro). Simples, salva no banco. |
| `/user/matchs` | **MatchsPage** | Matches do usuário logado (O(1) query). Filtros: editais, outros usuários. |
| `/user/ecossistema` | **EcossistemaPage** | Grafo pessoal (layout NetworkX pre-computado, renderizado React SVG) — mostra APENAS nós conectados ao usuário logado. |

### 6.2 Portal Admin (`/admin/*`)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/dashboard` | DashboardPage | KPIs, estatísticas gerais |
| `/admin/academicos` | AcademicosPage | Listagem de todos os acadêmicos |
| `/admin/editais` | EditaisPage | Listagem de todos os editais |
| `/admin/matches` | MatchesPage | Todos os matches do sistema |
| `/admin/grafo` | GrafoPage | Grafo completo (NetworkX + React SVG) |
| `/admin/comunidades` | ComunidadesPage | Enriquecimento do grafo (Comunidades de Pensamento) |

---

## 7. Roadmap por Sprint

### Sprint 0 — Fundação ✅ CONCLUÍDA
### Sprint 1 — Frontend + Grafo ✅ CONCLUÍDA
### Sprint 2 — Agentes IA ✅ CONCLUÍDA
### Sprint 3 — Deploy + Hardening ✅ CONCLUÍDA

*(Detalhes das Sprints 0-3 mantidos da v5.0.0 — seções omitidas por brevidade)*

---

### Sprint 4 — Inteligência Profunda, Portais & Experiência 🚀 EM ANDAMENTO

**Período:** Semana 7-8 (15/04/2026 → 29/04/2026)

**Objetivo Central:** Transformar o ARIANO em um produto completo com dois portais (Usuário e Admin), autenticação, cadastro inteligente com match visível em tempo real, comunidades de pensamento e excelência visual.

---

#### 📋 TAREFA 4.1 — Lógica Zero-Filter (Quick Win)

**Prioridade:** 🟢 Quick Win · **Estimativa:** 2 pontos

Grafo inicia com todos filtros ativos. Revelação progressiva por tipo de nó (stagger).

**Arquivo:** `frontend/src/pages/admin/GrafoPage.tsx`

---

#### 📋 TAREFA 4.2 — Modelo de Dados + Graph-CoT Híbrido + Engenharia de Prompt Cognitiva

**Prioridade:** 🔴 Crítica (fundação para tudo) · **Estimativa:** 10 pontos

**O que é:** Atualizar o modelo de dados no backend para os novos campos (`bio`, `curriculo_texto`, `maturidade`, `o_que_busco`), remover `lattes_url`/`level`/`agency`, e implementar o sistema **Graph-CoT Híbrido** — onde agentes de IA usam primitivas de interação com o grafo (RetrieveNode, NodeFeature, NeighbourCheck, NodeDegree) para raciocinar iterativamente sobre o grafo de conhecimento, mantendo um **scratchpad** (memória de trabalho) que documenta o raciocínio passo a passo. Baseado no paradigma **Cognitive-RAG** (Reddy, 2024) e **ReAct** (Yao et al., 2023).

**Por que é essencial:** Os agentes atuais operam com campos básicos e lookup estático. O Graph-CoT permite que os agentes **decidam dinamicamente** quais nós visitar e quando parar, imitando processos cognitivos humanos (atenção seletiva, memória de trabalho, raciocínio inferencial). A maturidade (0-10) calculada pela IA é mais precisa do que uma auto-avaliação. O campo o_que_busco permite matches mais assertivos sem depender de tags manuais.

**Arquivos envolvidos:**

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `app/models/schemas.py` | MODIFICAR | Atualizar schemas: novos campos, remover lattes_url/level/agency |
| `app/models/graph.py` | MODIFICAR | Atualizar neomodel definitions |
| `app/services/crud.py` | MODIFICAR | Adaptar CRUD para novos campos |
| `app/services/seed_native.py` | MODIFICAR | Seeds com bio, curriculo, etc. |
| `app/core/neo4j_driver.py` | MODIFICAR | Deep context queries (N-hop), Graph-CoT primitives, novos campos no in-memory store |
| `app/core/graph_tools.py` | **CRIAR** | 🆕 Primitivas do Graph-CoT: `retrieve_node()`, `node_feature()`, `neighbour_check()`, `node_degree()` — camada de abstração para interação agente↔grafo |
| `app/agents/profile_analyzer.py` | MODIFICAR | Prompt Graph-CoT sequencial: bio+CV → scratchpad → maturidade + o_que_busco + skills + areas |
| `app/agents/edital_interpreter.py` | MODIFICAR | Prompt avançado com consciência de ecossistema |
| `app/agents/eligibility_calculator.py` | MODIFICAR | Scoring contextual: maturidade, o_que_busco como bônus, funding como desempate |
| `app/agents/orchestrator.py` | **CRIAR** | Orquestrador que gerencia ordem/ativação dos agentes por contexto |
| `app/agents/contextual_analyzer.py` | **CRIAR** | Graph-CoT iterativo: loop Thought→Action→Observation para detecção de clusters e enriquecimento |
| `app/agents/__init__.py` | MODIFICAR | Registry de contextos (CADASTRO, ENRICHMENT, RECALIBRATION) com config Graph-CoT por contexto |
| `frontend/src/types/index.ts` | MODIFICAR | Atualizar interfaces TS (novos campos, remover antigos) |

**Subtarefas:**

| # | Subtarefa | Detalhes |
|---|-----------|---------|
| 4.2.1 | **Atualizar schemas backend** | Adicionar: `bio`, `curriculo_texto`, `maturidade` (float 0-10), `o_que_busco` (str). Remover: `lattes_url` (Researcher), `level` (todos), `curriculo_url` (todos — não salva mais o PDF). Edital: `agency` → `instituicao`, `min_level` → `min_maturidade`. |
| 4.2.2 | **PDF Text Extraction (PyMuPDF)** | Criar `app/services/pdf_extractor.py` usando **PyMuPDF (fitz)**. O usuário faz upload do PDF direto do computador no formulário. O backend recebe o arquivo temporário (bytes), extrai TODO o texto em <100ms, salva no campo `curriculo_texto` do nó, e **descarta o PDF** — nenhum arquivo é persistido. Dependência: `pip install PyMuPDF`. Função: `extract_text_from_pdf(file_bytes: bytes) -> str`. |
| 4.2.3 | **Deadline Filter** | Em TODOS os endpoints que retornam matches (tanto na Fase 1/CORETO quanto na Fase 3/O(1)), adicionar filtro obrigatório `WHERE e.deadline > date()` no Cypher ou equivalente no in-memory store. Editais com deadline expirado nunca aparecem nos resultados. |
| 4.2.4 | **Graph-CoT Primitives (graph_tools.py)** | Criar `app/core/graph_tools.py` com 4 primitivas inspiradas no Cognitive-RAG (Reddy, 2024): `retrieve_node(query, k=1)` → busca nó mais similar via texto, `node_feature(uid, feature)` → retorna atributo específico, `neighbour_check(uid, edge_type)` → lista vizinhos por tipo, `node_degree(uid, edge_type)` → conta conexões. Estas primitivas são a camada de interface entre os agentes de IA e o grafo. Adicionalmente: `get_entity_deep_context(uid, depth=3)` → query Cypher retornando subgrafo expandido ao redor da entidade (vizinhos diretos, skills compartilhadas, matches existentes). |
| 4.2.5 | **ProfileAnalyzer — Graph-CoT Sequencial** | System prompt com paradigma Graph-CoT sequencial (5 steps com scratchpad visível): Step 1: Ler bio + `curriculo_texto`, Step 2: `retrieve_node(bio)` → buscar perfis similares no grafo, Step 3: `neighbour_check(similar, HAS_SKILL)` → ver skills do cluster, Step 4: Reasoning → inferir maturidade 0-10 com justificativa + gerar o_que_busco, Step 5: Extrair skills + áreas AUTOMATICAMENTE (usuário NÃO seleciona tags). Cada step documentado no scratchpad. |
| 4.2.6 | **EligibilityCalculator — Novo Scoring** | `score = skills(40%) + area(25%) + maturidade(15%) + priority(10%) + context(5%) + community(5%)`. `o_que_busco` como bônus se alinha com edital_type. `funding` como desempate APENAS na ordenação final. `min_maturidade` como penalizador, não eliminatório. `deadline > hoje` como filtro eliminatório. Usa `node_degree()` para calcular fator de integração do acadêmico na rede. |
| 4.2.7 | **Orchestrator Agent (Graph-CoT aware)** | `app/agents/orchestrator.py`: decide quais agentes ativar, em qual ordem, e com qual **contexto Graph-CoT**. Fluxo CADASTRO (Graph-CoT sequencial, Hop-2, temp=0.3): ProfileAnalyzer → EligibilityCalculator. Fluxo ENRICHMENT (Graph-CoT iterativo completo, todas primitivas, temp=0.7): ContextualAnalyzer → ProfileAnalyzer(re-run) → EditalInterpreter(re-run) → EligibilityCalculator(re-scoring). Fluxo RECALIBRATION (Hop-3, temp=0.2): apenas re-scoring com contexto expandido. |
| 4.2.8 | **ContextualAnalyzer — Graph-CoT Iterativo** | `app/agents/contextual_analyzer.py`: implementa loop `Thought → Action → Observation` inspirado no ReAct. Subciclo A: varre nós usando `neighbour_check()` + `node_feature()`, calcula overlap de skills entre pares (≥60% → SIMILAR_TO). Subciclo B: re-roda ProfileAnalyzer com contexto expandido via `get_entity_deep_context(uid, 3)`. Subciclo C: EligibilityCalculator re-scoring com `context_bonus` e `community_relevance`. Halting condition: agente decide quando não há mais clusters significativos a descobrir. |
| 4.2.9 | **Registry de Contextos (Graph-CoT Config)** | `CONTEXT_CADASTRO` (Hop-2, temp=0.3, primitivas: RetrieveNode+NodeFeature), `CONTEXT_ENRICHMENT` (Graph-CoT completo, temp=0.7, TODAS primitivas), `CONTEXT_RECALIBRATION` (Hop-3, temp=0.2, primitivas: NodeFeature+NeighbourCheck). Cada contexto define: profundidade de busca, temperatura do LLM, primitivas Graph-CoT disponíveis, max_steps do loop. |
| 4.2.10 | **Seeds atualizados** | Atualizar seed_native.py com bios realistas, curriculo_texto como exemplo de texto raspado, maturidades pré-calculadas, o_que_busco pré-gerado, deadlines futuras para dados demo. |
| 4.2.11 | **Frontend types** | Atualizar `types/index.ts`: remover `lattes_url`, `level`, `curriculo_url`; adicionar `bio`, `curriculo_texto`, `maturidade`, `o_que_busco`; Edital: `agency` → `instituicao`, `min_level` → `min_maturidade`. |

---

#### 📋 TAREFA 4.3 — Sistema de Autenticação + Rotas Protegidas

**Prioridade:** 🔴 Crítica · **Estimativa:** 5 pontos

**O que é:** Implementar autenticação simples (email + senha) com cookies para persistência, dois perfis simultâneos (user + admin), popup de login que não pode ser ignorado, e proteção de rotas.

**Por que é essencial:** O portal do usuário exige saber quem está logado para mostrar seus matches pessoais. O admin precisa de acesso restrito. A persistência por cookies garante que ao recarregar no Vercel o login se mantém. A possibilidade de estar logado como admin E user simultaneamente facilita a demonstração em sala.

**Arquivos envolvidos:**

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `app/api/auth_routes.py` | **CRIAR** | Endpoints de autenticação (register, login, logout, me) |
| `app/main.py` | MODIFICAR | Incluir auth_routes no router |
| `frontend/src/contexts/AuthContext.tsx` | **CRIAR** | Context React com estado de auth (user + admin) |
| `frontend/src/components/AuthPopup.tsx` | **CRIAR** | Popup de login/registro com shake animation |
| `frontend/src/hooks/useAuth.ts` | **CRIAR** | Hook para login/logout/register |
| `frontend/src/components/ProtectedRoute.tsx` | **CRIAR** | Wrapper que exige auth para renderizar conteúdo |
| `frontend/src/App.tsx` | MODIFICAR | Reestruturar rotas em /user/* e /admin/* |
| `frontend/src/components/layout/Sidebar.tsx` | MODIFICAR | Duas versões: sidebar user e sidebar admin |
| `frontend/src/lib/api.ts` | MODIFICAR | Endpoints de auth |

**Subtarefas:**

| # | Subtarefa | Detalhes |
|---|-----------|---------|
| 4.3.1 | **Backend auth** | `POST /api/auth/register` (cria acadêmico com password_hash bcrypt), `POST /api/auth/login` (verifica senha, retorna cookie JWT `ariano_user` ou `ariano_admin`), `POST /api/auth/logout` (remove cookie), `GET /api/auth/me` (retorna dados do logado via cookie). Cookies HttpOnly, SameSite=Lax, max_age=7 dias. |
| 4.3.2 | **AuthContext** | React Context que mantém `{user: User|null, admin: Admin|null, isLoadingAuth: bool}`. No mount, chama `GET /api/auth/me` para restaurar sessão via cookie. Provê `login()`, `logout()`, `register()`. |
| 4.3.3 | **AuthPopup** | Modal com: campo email, campo senha, botão "Entrar", link "Criar Conta" (redireciona para `/user/cadastro`). Toggle "Entrar como Admin" / "Entrar como Usuário". **Comportamento:** NÃO fecha ao clicar fora — popup faz shake animation (CSS transform: translateX alternando ±5px por 300ms) e campos ficam com border vermelha. Admin popup NÃO tem "Criar Conta". Se admin sem acesso → conteúdo fica em estado de skeleton/loading permanente. |
| 4.3.4 | **ProtectedRoute** | Componente wrapper: verifica AuthContext, se não logado renderiza AuthPopup sobre conteúdo borrado (blur). Recebe prop `requiredRole: "user" | "admin"`. |
| 4.3.5 | **Reestruturar rotas** | `/user/cadastro` (livre), `/user/profile`, `/user/matchs`, `/user/ecossistema` (requer user). `/admin/dashboard`, `/admin/academicos`, `/admin/editais`, `/admin/matches`, `/admin/grafo`, `/admin/comunidades` (requer admin). Root `/` redireciona para `/user/matchs` se logado como user, ou `/admin/dashboard` se logado como admin. |
| 4.3.6 | **Sidebars separadas** | Sidebar User: CORETO logo, itens: Meu Perfil, Meus Matches, Meu Ecossistema, Sair. Sidebar Admin: ARIANO logo, itens: Dashboard, Acadêmicos, Editais, Matches, Grafo, Comunidades, Sair. Indicador visual do perfil logado no footer da sidebar. |

---

#### 📋 TAREFA 4.4 — CORETO — Cadastro de Talento + Match Estratégico Visível

**Prioridade:** 🔴 Crítica — PRINCIPAL ENTREGA DO MVP · **Estimativa:** 8 pontos

**O que é:** A página `/user/cadastro` que simula o onboarding na plataforma CORETO. O usuário preenche seus dados acadêmicos (nome, instituição, curso, semestre, bio, currículo em PDF) e a IA faz o match estratégico **em tempo real de forma visível**: o grafo anima mostrando o nó sendo criado, as skills sendo extraídas, as conexões sendo formadas, e os matches aparecendo. A IA determina automaticamente maturidade, o_que_busco, skills e áreas — o usuário NÃO seleciona tags.

**Diferença crucial:** O match aqui NÃO é O(1). É o processamento real da IA (Nemotron 3 Super) analisando o perfil e criando as conexões. O O(1) é usado DEPOIS, na página `/user/matchs`, para consultar os matches já computados.

**Por que é essencial:** Esta é **A PRINCIPAL entrega do MVP** — o que será demonstrado em sala. O avaliador preenche seus dados → vê a IA raciocinando passo a passo → vê o grafo se formando com animações → entende a profundidade do algoritmo.

**Arquivos envolvidos:**

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/user/CadastroPage.tsx` | **CRIAR** | Página de cadastro CORETO |
| `frontend/src/components/AgentProcessingTimeline.tsx` | **CRIAR** | Timeline visual de processamento dos agentes |
| `frontend/src/components/MatchResultCards.tsx` | **CRIAR** | Cards de resultado com score bars |
| `frontend/src/components/MiniGraph.tsx` | **CRIAR** | Mini-grafo React SVG do nó criado + conexões (posições pre-computadas via NetworkX) |
| `frontend/src/hooks/useAgentPipeline.ts` | **CRIAR** | Hook de execução sequencial dos agentes |
| `frontend/src/lib/api.ts` | MODIFICAR | Chamadas para fluxo de cadastro |

**Subtarefas:**

| # | Subtarefa | Detalhes |
|---|-----------|---------|
| 4.4.1 | **Formulário de Cadastro** | Formulário multi-step glassmorphism. First: tipo de conta (Estudante / Pesquisador / Professor). Campos adaptam por tipo. **Studante:** nome, email, senha, instituição, curso, semestre, bio (textarea), currículo (upload PDF). **Pesquisador:** nome, email, senha, instituição, bio, currículo. **Professor:** nome, email, senha, instituição, departamento, grupo de pesquisa, bio, currículo. **SEM tags de skills/areas** — a IA faz isso sozinha. |
| 4.4.2 | **Hook useAgentPipeline** | Execução sequencial com estado: `{steps, isRunning, runPipeline(data)}`. Steps: (1) "Criando perfil no grafo..." → POST /api/auth/register, (2) "🧠 IA analisando seu perfil..." → ProfileAnalyzer extrai skills, areas, maturidade, o_que_busco, (3) "🔗 Buscando editais compatíveis..." → EligibilityCalculator calcula matches, (4) "✅ Matches encontrados!". Cronometra cada etapa em ms. |
| 4.4.3 | **AgentProcessingTimeline** | Timeline vertical animada com Framer Motion. Cada step: ícone do agente + cor, nome da operação, spinner (running), check (done), X (error), tempo decorrido. Badge "Nemotron 3 Super" ou "Rule-Based". Steps expandíveis para detalhes: skills extraídas, maturidade atribuída com justificativa, o_que_busco gerado, scores breakdown. **O avaliador deve sentir a IA pensando.** |
| 4.4.4 | **Grafo Animado (React SVG + NetworkX)** | Enquanto os agentes processam, um mini-grafo React SVG (com layout pre-computado via NetworkX `spring_layout`) mostra em tempo real: (1) o nó do usuário aparece (pulse glow), (2) skills e areas surgem com animação, (3) arestas HAS_SKILL se desenham, (4) editais aparecem, (5) arestas ELIGIBLE_FOR se formam com gradiente cyan→blue. O grafo "cresce" enquanto a IA trabalha. Backend retorna posições incrementais via API. |
| 4.4.5 | **MatchResultCards** | Após pipeline completar: cards dos matches, ordenados por score decrescente (funding como desempate). Cada card: nome do edital, instituição (era agency), score como barra animada, badge de compatibilidade (🟢 ≥0.85, 🔵 ≥0.7, 🟡 ≥0.5, 🔴 <0.5), justificativa do agente. |
| 4.4.6 | **Redirect pós-cadastro** | Após ver resultados, botão "Ver Meus Matches" → `/user/matchs`. Botão "Ver Meu Ecossistema" → `/user/ecossistema`. Auto-login via cookie após registro. |

---

#### 📋 TAREFA 4.5 — Portal do Usuário (/user/*)

**Prioridade:** 🔴 Crítica · **Estimativa:** 8 pontos

**O que é:** Três páginas exclusivas do usuário logado: Perfil, Matches e Ecossistema. O usuário vê apenas seus dados e conexões, não o sistema inteiro.

**Arquivos envolvidos:**

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/user/ProfilePage.tsx` | **CRIAR** | Visualizar/editar perfil |
| `frontend/src/pages/user/MatchsPage.tsx` | **CRIAR** | Matches pessoais com filtros |
| `frontend/src/pages/user/EcossistemaPage.tsx` | **CRIAR** | Grafo pessoal React SVG (layout NetworkX) |

**Subtarefas:**

| # | Subtarefa | Detalhes |
|---|-----------|---------|
| 4.5.1 | **ProfilePage** | Exibe dados do perfil logado: nome, email, instituição, curso/departamento, bio, maturidade (badge com nota 0-10), o_que_busco. Seção de skills e áreas associadas pela IA (view-only informativo). Botão "Editar Perfil" → formulário inline para alterar bio, currículo. Ao salvar, grava no banco. Na próxima execução do enriquecimento, os agentes re-analisam com base nas alterações. Design simples e limpo. |
| 4.5.2 | **MatchsPage (O(1))** | Query instantânea: `MATCH (a {uid: $me})-[r:ELIGIBLE_FOR]->(e:Edital) RETURN`. Cards de matches com score bars, instituição, funding, badge de compatibilidade. **Filtros:** toggle "Editais" / "Usuários Similares" (se houver SIMILAR_TO). Ordenação por score (desempate por funding). Badge de maturidade do usuário no header. |
| 4.5.3 | **EcossistemaPage** | Grafo React SVG que mostra APENAS: (a) o nó do usuário logado (centralizado, glow accent pulsante), (b) seus vizinhos diretos (skills, areas, editais matchados, acadêmicos similares), (c) arestas entre eles. Layout pre-computado via NetworkX `spring_layout` (backend calcula posições e retorna JSON ao frontend). Nós de outros acadêmicos que NÃO estão conectados não aparecem. Interações: click para detalhes, hover para highlight, drag. Filtros por tipo de conexão. |

---

#### 📋 TAREFA 4.6 — Reestruturação do Portal Admin (/admin/*)

**Prioridade:** 🟡 Alta · **Estimativa:** 3 pontos

**O que é:** Mover todas as páginas existentes (Dashboard, Acadêmicos, Editais, Matches, Grafo) para debaixo de `/admin/*` e adicionar a página Comunidades.

**Subtarefas:**

| # | Subtarefa | Detalhes |
|---|-----------|---------|
| 4.6.1 | **Mover páginas** | Mover os arquivos de `pages/*.tsx` para `pages/admin/*.tsx`. Atualizar imports e rotas no App.tsx. |
| 4.6.2 | **Sidebar Admin** | Atualizar sidebar com itens do admin e indicador "Painel Admin" no header. |
| 4.6.3 | **Atualizar referências** | Ajustar api.ts, links internos, breadcrumbs para usar /admin/* paths. |
| 4.6.4 | **ComunidadesPage** | Adicionar a página de Comunidades no menu admin (detalhada na Tarefa 4.8). |

---

#### 📋 TAREFA 4.7 — Painel de Processamento dos Agentes IA

**Prioridade:** 🟡 Alta · **Estimativa:** 3 pontos

Componente AgentStatusPanel reutilizável mostrando status dos 5 agentes (ProfileAnalyzer, EditalInterpreter, EligibilityCalculator, ContextualAnalyzer, CommunityEnricher). Indicadores LED, detalhes expandíveis, cores por agente. Embutido nas páginas CadastroPage e ComunidadesPage.

---

#### 📋 TAREFA 4.8 — Comunidades de Pensamento — Graph-CoT Iterativo sobre o Grafo

**Prioridade:** 🔴 Crítica · **Estimativa:** 8 pontos

Página `/admin/comunidades` com botão para executar ciclo de enriquecimento manualmente (em produção seria cada 24h). Implementa o **Graph-CoT iterativo completo** (seção 2.4 do Documento de Visão): Orquestrador ativa agentes no contexto `CONTEXT_ENRICHMENT` (temp=0.7, todas primitivas Graph-CoT habilitadas). Loop: `Thought → Action → Observation` até convergência. Subiciclos: A (detecção de clusters via `neighbour_check`+`node_feature`), B (re-análise com contexto expandido via `get_entity_deep_context(uid,3)`), C (re-scoring com `context_bonus` e `community_relevance`). Timeline visual mostrando o scratchpad (raciocínio visível do agente), grafo de comunidades, painel before/after.

---

#### 📋 TAREFA 4.9 — Animações e Transições Fluidas do Grafo

**Prioridade:** 🟡 Alta · **Estimativa:** 5 pontos

Entrance animation melhorada (scale + blur), filter transitions (encolher/crescer), edge drawing animation (stroke-dash), pulse ring em nós selecionados, breathing effect no grafo. *(Detalhes mantidos da v5.0.0 Tarefa 4.6)*

---

#### 📋 TAREFA 4.10 — Polimento UX/UI Global

**Prioridade:** 🟡 Alta · **Estimativa:** 5 pontos

Label collision detection, legenda interativa, dashboard cards animados com contagem progressiva, score bars animadas, skeleton loading states, sidebar active indicator (layoutId), page transitions fade-slide. *(Detalhes mantidos da v5.0.0 Tarefa 4.7)*

---

#### 📋 TAREFA 4.11 — Estabilização, Performance e Error Handling

**Prioridade:** 🟢 Média · **Estimativa:** 3 pontos

Toast notifications (sonner), empty states, error boundary, NetworkX layout caching para grafos >80 nós. *(Detalhes mantidos da v5.0.0 Tarefa 4.8)*

---

#### 📋 TAREFA 4.12 — Documentação Final e Manual

**Prioridade:** 🟢 Média · **Estimativa:** 2 pontos

README atualizado com screenshots de todas as 10+ páginas. Documento de projeto com Sprint 4 completa. Guia de demonstração: roteiro 5 min (login admin → dashboard → grafo → login user → cadastro CORETO → matches → ecossistema → admin comunidades → resultado).

---

#### 📋 TAREFA 4.13 — Verificação Final de UX/UI e Apresentação

**Prioridade:** 🔴 Crítica (último passo obrigatório) · **Estimativa:** 2 pontos

Auditoria visual de todas as 10+ páginas (desktop + mobile). Teste completo: fluxo de cadastro CORETO, fluxo de login dual, fluxo de comunidades. Simulação cronometrada da apresentação (5 min). Deploy final Vercel.

---

### Resumo Sprint 4 — Quadro de Tarefas

| # | Tarefa | Pts | Entrega |
|---|--------|-----|---------|
| 4.1 | Zero-Filter | 2 | Grafo começa cheio |
| 4.2 | Modelo + Graph-CoT Híbrido + Prompts Cognitivos | 10 | Novos campos + primitivas Graph-CoT + agentes cognitivos + orquestrador |
| 4.3 | Autenticação + Rotas | 5 | Login popup, cookies, dual profile, /user/* e /admin/* |
| 4.4 | CORETO — Cadastro + Match Visível | 8 | **PRINCIPAL** — IA faz match em tempo real via Graph-CoT, grafo anima |
| 4.5 | Portal Usuário | 8 | Profile, Matchs (O(1)), Ecossistema (grafo pessoal) |
| 4.6 | Reestruturação Admin | 3 | Mover páginas para /admin/* |
| 4.7 | Painel Agentes IA | 3 | Status visual dos 5 agentes + scratchpad visível |
| 4.8 | Comunidades de Pensamento | 8 | Graph-CoT iterativo, enriquecimento contínuo |
| 4.9 | Animações Grafo | 5 | Breathing, pulse rings, edge draw |
| 4.10 | Polimento UX/UI | 5 | Labels, skeletons, transitions |
| 4.11 | Estabilização | 3 | Toasts, empty states, error boundary |
| 4.12 | Documentação | 2 | README, guia demo |
| 4.13 | Verificação Final | 2 | Gate de qualidade |
| | **TOTAL** | **64 pts** | |

### Ordem de Execução

```
SEMANA 7 (15-22/04) — Fundação + Features Principais:
  ├─ 4.1  Zero-Filter (2pts)          ← Quick win
  ├─ 4.2  Modelo + Graph-CoT (10pts)   ← Fundação Graph-CoT Híbrido + primitivas
  ├─ 4.3  Autenticação (5pts)         ← Necessário para portais
  ├─ 4.6  Reestruturação Admin (3pts) ← Reorganizar rotas existentes
  ├─ 4.4  CORETO Cadastro (8pts)      ← PRINCIPAL ENTREGA
  └─ 4.5  Portal Usuário (8pts)       ← Profile + Matchs + Ecossistema

SEMANA 8 (22-29/04) — Inteligência + Polish + Entrega:
  ├─ 4.7  Painel Agentes (3pts)
  ├─ 4.8  Comunidades (8pts)
  ├─ 4.9  Animações (5pts)
  ├─ 4.10 Polimento (5pts)
  ├─ 4.11 Estabilização (3pts)
  ├─ 4.12 Documentação (2pts)
  └─ 4.13 Verificação Final (2pts)    ← ÚLTIMO PASSO
```

---

## 8. Design — Blue Neon Edition

### Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-void` | `#020810` | Background |
| `--color-surface` | `#0a1420` | Superfícies |
| `--color-accent` | `#0ea5e9` | Accent azul neon |
| `--color-accent-glow` | `#38bdf8` | Glow effect |

### Cores dos nós

| Entidade | Hex |
|----------|-----|
| Edital | `#2563eb` |
| Student | `#00e5ff` |
| Researcher | `#10b981` |
| Professor | `#f59e0b` |
| Skill | `#8b5cf6` |
| Area | `#6366f1` |

---

## 9. Critérios de Aceite (DoD)

- [x] ≥ 15 acadêmicos + ≥ 8 editais no grafo
- [x] Agentes criam/configuram nós e arestas
- [x] Match = Cypher puro O(1) para consultas pós-cadastro
- [x] Design consistente com Blue Neon Edition
- [x] Deploy Fullstack Vercel + CI/CD
- [x] Segurança de credenciais via Secrets
- [ ] Campos bio, currículo, maturidade (IA) e o_que_busco (IA) funcionais (Sprint 4)
- [ ] Graph-CoT Primitives (graph_tools.py) operacionais: retrieve_node, node_feature, neighbour_check, node_degree (Sprint 4)
- [ ] Autenticação com cookies + dual login (user + admin) (Sprint 4)
- [ ] Página CORETO com cadastro + match estratégico visível via Graph-CoT sequencial (Sprint 4)
- [ ] Portal Usuário: Profile, Matchs O(1), Ecossistema (Sprint 4)
- [ ] Portal Admin: todas páginas sob /admin/* (Sprint 4)
- [ ] Comunidades de Pensamento com Graph-CoT iterativo funcional (Sprint 4)
- [ ] Verificação final de UX/UI aprovada (Sprint 4)

---

## 10. Estrutura de Arquivos (Sprint 4)

```
ProjetoARIANO/
├── app/                                   # ⚙️ BACKEND
│   ├── main.py
│   ├── agents/
│   │   ├── __init__.py                    # Registry de contextos (Graph-CoT config)
│   │   ├── profile_analyzer.py            # Graph-CoT sequencial: bio → scratchpad → maturidade + skills
│   │   ├── edital_interpreter.py
│   │   ├── eligibility_calculator.py      # Scoring com maturidade, node_degree, funding desempate
│   │   ├── orchestrator.py                # 🆕 Orquestrador Graph-CoT aware
│   │   └── contextual_analyzer.py         # 🆕 Graph-CoT iterativo: Thought→Action→Observation
│   ├── api/
│   │   ├── routes.py                      # CRUD (campos atualizados)
│   │   ├── agent_routes.py                # Agentes + enrich-graph
│   │   └── auth_routes.py                 # 🆕 Login/Register/Logout/Me
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── neo4j_driver.py                # Deep context queries + novos campos
│   │   └── graph_tools.py                 # 🆕 Primitivas Graph-CoT: retrieve_node, node_feature, neighbour_check, node_degree
│   ├── models/
│   │   ├── graph.py                       # Neomodel (campos atualizados)
│   │   └── schemas.py                     # Pydantic (campos atualizados)
│   └── services/
│       ├── crud.py                        # CRUD (bio, curriculo_texto, maturidade, o_que_busco)
│       ├── pdf_extractor.py               # 🆕 PyMuPDF (fitz) — PDF upload → texto extraído, PDF descartado
│       ├── graph_visualizer.py            # 🆕 NetworkX: spring_layout + louvain_communities → JSON {positions, communities}
│       ├── match_engine.py                # Deadline filter: WHERE e.deadline > date()
│       ├── seed_native.py                 # Seeds com bios e curriculos
│       └── seed_and_configure.py
├── api/
│   └── index.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx                        # Rotas /user/* + /admin/*
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx             # 🆕 Estado de auth dual
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── UserSidebar.tsx         # 🆕 Menu do usuário
│   │   │   │   ├── AdminSidebar.tsx        # 🆕 Menu do admin (ex-Sidebar)
│   │   │   │   └── logo coreto.png
│   │   │   ├── AuthPopup.tsx               # 🆕 Login popup com shake
│   │   │   ├── ProtectedRoute.tsx          # 🆕 Guard de rota
│   │   │   ├── AgentProcessingTimeline.tsx  # 🆕
│   │   │   ├── AgentStatusPanel.tsx         # 🆕
│   │   │   ├── MatchResultCards.tsx         # 🆕
│   │   │   ├── MiniGraph.tsx               # 🆕
│   │   │   ├── EnrichmentTimeline.tsx       # 🆕
│   │   │   ├── CommunityGraph.tsx           # 🆕
│   │   │   └── EmptyState.tsx               # 🆕
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                   # 🆕
│   │   │   └── useAgentPipeline.ts          # 🆕
│   │   ├── lib/
│   │   │   └── api.ts                       # + auth endpoints
│   │   ├── pages/
│   │   │   ├── user/                        # 🆕 PORTAL USUÁRIO
│   │   │   │   ├── CadastroPage.tsx         # CORETO registration
│   │   │   │   ├── ProfilePage.tsx          # View/edit profile
│   │   │   │   ├── MatchsPage.tsx           # Matches O(1) + filtros
│   │   │   │   └── EcossistemaPage.tsx      # Grafo pessoal
│   │   │   └── admin/                       # PORTAL ADMIN (movidos)
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── AcademicosPage.tsx
│   │   │       ├── EditaisPage.tsx
│   │   │       ├── MatchesPage.tsx
│   │   │       ├── GrafoPage.tsx
│   │   │       └── ComunidadesPage.tsx      # 🆕
│   │   └── types/
│   │       └── index.ts                     # Tipos atualizados
│   ├── package.json
│   └── vite.config.ts
├── Prototype v0/
│   ├── Docs/
│   │   └── 01_DOCUMENTO_PROJETO_ARIANO.md
│   └── implementation_plan.md               # ← ESTE DOCUMENTO
├── vercel.json
├── requirements.txt
└── README.md
```

---

**Criado em:** 16/03/2026 · **Última atualização:** 16/04/2026 · **Versão:** 7.0.0
