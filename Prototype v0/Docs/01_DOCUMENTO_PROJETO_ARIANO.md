# 📋 PROJETO ARIANO — Documento de Visão e Planejamento do MVP

> **Versão:** 13.0.0
> **Data:** 04/06/2026
> **Status:** MVP 1.0.0 Online — Sprint Definitiva Concluída
> **Metodologia:** SCRUM (adaptado para contexto acadêmico)
> **Última atualização:** 04/06/2026 — Revisão geral de documentação

---

## Informações do Projeto

| Campo | Detalhe |
|-------|---------|
| **Instituição** | UNINASSAU Graças — Recife/PE |
| **Disciplina** | Tópicos Integradores — 7º Período |
| **Semestre** | 2026.1 |
| **Projeto** | ARIANO — **A**rquitetura de Inteligência **A**rtificial **N**aturalmente **O**rdenada |
| **Produto** | MVP do Módulo de Matchmaking para a plataforma **CORETO** |

### Equipe

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Guilherme Andrade de Aguiar | 01606498 | Product Owner / Tech Lead / Product Manager |
| Pedro Miranda | 01607408 | DevOps / Back-End Developer |
| Ricardo Cezar O. A. de Almeida | 01606498 | AI Agent Architect / Graph Data Engineer |
| Marcio Maycom | 01607574 | UX UI Designer / Front-End Developer |
| Thiago José Falcão de Freitas | 01597267 | Scrum Master / QA |

---

## Sumário

1. [Introdução e Contextualização](#1-introdução-e-contextualização)
2. [Fundamentação Teórica](#2-fundamentação-teórica)
3. [Referência de Design — GitNexus](#3-referência-de-design--gitnexus)
4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)
5. [Stack Tecnológica](#5-stack-tecnológica)
6. [Design System — Teal Neon Edition](#6-design-system--teal-neon-edition)
7. [Product Backlog (User Stories)](#7-product-backlog-user-stories)
8. [Sprint Planning — Roadmap](#8-sprint-planning--roadmap)
9. [Critérios de Aceite (Definition of Done)](#9-critérios-de-aceite-definition-of-done)
10. [Estrutura do Repositório](#10-estrutura-do-repositório)
11. [Ferramentas e Qualidade](#11-ferramentas-e-qualidade)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)
13. [Glossário](#13-glossário)
14. [Referências](#referências)

---

## 1. Introdução e Contextualização

### 1.1 O que é o CORETO?

O **CORETO** (**C**onexões para **R**evolução **E**mpreendedora e **T**ecnológica **O**nline) é uma **plataforma digital da Prefeitura do Recife (SECTI)** que funciona como um ecossistema de inovação, conectando os quatro pilares da **quádrupla hélice**: **Academia**, **Governo**, **Indústria** e **Sociedade Civil**. A plataforma visa promover a colaboração entre esses eixos para resolver desafios urbanos e fomentar a inovação no ecossistema de Recife.

O nome "Coreto" é uma metáfora ao espaço público de encontro e troca — assim como o coreto de uma praça reúne pessoas, a plataforma reúne solucionadores de problemas (academia, empresas) com donos de problemas (governo, sociedade).

### 1.2 O que é o ARIANO?

O **ARIANO** (**A**rquitetura de **I**nteligência **A**rtificial **N**aturalmente **O**rdenada) é o **motor de matchmaking inteligente** que opera por trás da plataforma CORETO. Ele é responsável por:

1. **Interpretar** perfis de acadêmicos (via bio + currículo PDF) e requisitos de editais governamentais
2. **Classificar** competências, áreas de atuação e níveis de maturidade acadêmica automaticamente
3. **Configurar** um grafo de conhecimento (Knowledge Graph) com relacionamentos ponderados
4. **Executar matches** instantâneos via consulta direta ao grafo pré-configurado

> **Filosofia central — Precomputed Relational Intelligence:** Os agentes de IA **não fazem o match diretamente**. Eles **preparam e configuram o grafo** — interpretam, classificam, enriquecem e criam relacionamentos com pesos calculados. O match em si é apenas uma **query Cypher** que explora a adjacência livre de índice em **O(1)**, garantindo respostas instantâneas independente do volume de dados.

### 1.3 Escopo do MVP — Academia ↔ Governo

> **⚠️ IMPORTANTE:** O MVP foca exclusivamente no **matchmaking entre Academia e Governo**, por serem os eixos mais demonstráveis e assertivos para o contexto acadêmico do projeto.

| Pilar do MVP | Entidades | Exemplos Concretos |
|---|---|---|
| 🎓 **Academia** | Alunos, Pesquisadores, Docentes | Estudante de CC com skills em ML e NLP |
| 🏛️ **Governo** | Editais FACEPE, Chamadas Públicas, Programas de Fomento | Edital FACEPE 2026 — IA para Saúde |

### 1.4 Entregas do MVP

**Concluídas (✅):**
- Cadastro de entidades acadêmicas (alunos, pesquisadores, docentes) e editais governamentais
- Agentes de IA (NVIDIA Nemotron 3 via OpenRouter) que **interpretam e configuram o grafo** (enriquecimento, classificação, criação de arestas ponderadas)
- Match via **query Cypher pura** com complexidade O(1) sobre o grafo instanciado
- Interface web robusta e otimizada (Vite, React 18) consumindo endpoints REST via Axios
- **Zero-config Execution:** Motor de grafo in-memory nativo, persistido via **Vercel KV (Redis)** para eliminar o modo efêmero das serverless functions
- **Deploy Fullstack (Vercel):** Backend FastAPI (Serverless) e Frontend Vite integrados em monorepo
- **Segurança de Credenciais:** Gestão de chaves via Environment Variables (Secrets) ocultas em produção
- **Autenticação Dual:** Login com email/senha, cookies JWT HttpOnly, dois perfis simultâneos (user + admin)
- **CORETO — Cadastro Inteligente:** Cadastro com match estratégico visível em tempo real pela IA + consulta O(1) posterior
- **Portal do Usuário:** Perfil, Matches pessoais O(1) e Ecossistema individual em `/user/*`
- **Portal Admin:** Dashboard, Grafo completo e Comunidades em `/admin/*`
- **Campos Inteligentes:** `bio`, `curriculo_texto` (extraído de PDF), `maturidade` (0-10, determinado pela IA) e `o_que_busco` (gerado pela IA)
- **Comunidades de Pensamento:** Enriquecimento contínuo do grafo via Graph-CoT multi-agente e análise de clusters via **NetworkX**
- **Engenharia de Prompt Avançada:** Agentes especialistas com contexto profundo do grafo e scratchpad de raciocínio
- **IA Transparente:** Pipeline multi-step visível ao usuário (`/v2/analyze`, `/v2/extract`, `/v2/match`)
- **Grafo Dinâmico em Tempo Real:** Componente `MiniGraphAnimation` renderiza nós reais extraídos pela LLM

**Em Roadmap (🚀):**
- Renderização orgânica de Comunidades de Pensamento (Minkowski Sum) com labels contidos via clipping em Canvas
- Centralização inteligente de nós com viewport real, zoom contextual e menu em cascata (Esc)
- Navegação em-grafo via ligações do side panel + filtros dinâmicos de tipo e visibilidade

---

## 2. Fundamentação Teórica

A arquitetura do ARIANO é fundamentada em cinco pilares teóricos complementares. Esta seção detalha os conceitos, sua relevância para o domínio de inovação acadêmica e como são implementados na prática.

### 2.1 Grafos de Conhecimento (Knowledge Graphs)

Um **grafo de conhecimento** (Knowledge Graph, KG) é uma estrutura de dados heterogênea composta por entidades representadas como **nós** (vértices) e seus relacionamentos como **arestas** tipadas e ponderadas. Formalmente, um KG é definido como uma tripla `G = (V, E, R)` onde `V` é o conjunto de nós, `E` o conjunto de arestas e `R` o conjunto de tipos de relação.

No contexto do ARIANO, o grafo de conhecimento modela o ecossistema de inovação acadêmica:

- **Nós** representam: Estudantes, Pesquisadores, Professores, Editais, Skills (competências) e Áreas de atuação
- **Arestas** representam: `HAS_SKILL`, `RESEARCHES_AREA`, `REQUIRES_SKILL`, `ELIGIBLE_FOR` (a aresta de match), `SIMILAR_TO` (afinidade entre perfis) e `RELATED_TO` (complementaridade entre skills)

A vantagem fundamental de um grafo sobre modelos relacionais (SQL) reside na propriedade de **adjacência livre de índice** (index-free adjacency): cada nó mantém ponteiros diretos para seus vizinhos, tornando a travessia entre nós conectados uma operação **O(1)** constante, independente do volume total de dados. Em contraste, operações de JOIN em bancos relacionais crescem de forma quadrática ou exponencial com a complexidade e profundidade das relações — um gargalo crítico em sistemas que precisam cruzar múltiplas dimensões (skills × áreas × maturidade × elegibilidade).

Esta propriedade é o que permite ao ARIANO retornar matches instantaneamente após a pré-configuração do grafo, viabilizando a Fase 3 (consulta O(1)) descrita na seção de arquitetura.

### 2.2 Agentes de IA como Configuradores de Grafo (Precomputed Relational Intelligence)

O conceito de **Precomputed Relational Intelligence** (Inteligência Relacional Pré-computada) é a filosofia central do ARIANO, inspirada no projeto **GitNexus** — um motor de inteligência de código que constrói knowledge graphs a partir de repositórios GitHub. A filosofia pode ser sintetizada em duas fases distintas:

```
FASE 1: Agentes IA processam dados → Configuram o grafo (offline, assíncrono)
FASE 2: Match = Query Cypher O(1) sobre grafo pré-configurado (online, instantâneo)
```

Esta separação entre **tempo de configuração** (compute-intensive, IA-driven) e **tempo de consulta** (O(1), query-only) é análoga ao paradigma de **compilação vs. execução** em linguagens de programação: o custo computacional pesado ocorre uma única vez, e todas as consultas subsequentes se beneficiam da estrutura pré-otimizada.

**Comparação com abordagens alternativas:**

| Dimensão | RAG Tradicional | Graph-CoT Puro | ARIANO (Precomputed + Graph-CoT Híbrido) |
|----------|----------------|----------------|------------------------------------------|
| **Processamento** | LLM processa dados a cada consulta | LLM raciocina iterativamente por consulta | Agentes processam dados **uma vez**, configuram o grafo |
| **Custo por consulta** | Alto (chamada LLM) | Muito alto (múltiplas chamadas LLM iterativas) | **Zero** (query Cypher pura) |
| **Latência** | Segundos | Dezenas de segundos | **Milissegundos** |
| **Qualidade do raciocínio** | Superficial (contexto limitado) | Profunda (iterativa, multi-hop) | **Profunda na configuração**, instantânea na consulta |
| **Escalabilidade** | Custo linear com consultas | Custo quadrático com consultas | Custo fixo (amortizado na configuração) |
| **Quando a IA atua** | Em cada consulta do usuário | Em cada consulta do usuário | Apenas na configuração (Fase 1) e enriquecimento (Fase 2) |

> **Insight:** O ARIANO combina o melhor dos dois mundos — usa Graph-CoT para **configurar** o grafo com raciocínio profundo (Fases 1 e 2), mas **serve** os resultados via query O(1) direta (Fase 3). Isso resolve o problema fundamental do Graph-CoT puro: latência e custo por consulta.

### 2.3 Quádrupla Hélice da Inovação

O modelo da **Quádrupla Hélice** (Quadruple Helix) é um framework de inovação sistêmica proposto por Carayannis & Campbell (2009) que expande a Tríplice Hélice clássica — definida por Etzkowitz & Leydesdorff (1995) como a interação dinâmica entre Academia, Governo e Indústria — ao incluir a **Sociedade Civil** como quarto pilar. A premissa central é que inovação sustentável emerge da **co-criação** entre todos os atores do ecossistema.

O CORETO implementa este modelo digitalmente, e o ARIANO é o mecanismo cognitivo que conecta esses pilares através de matchmaking inteligente. No MVP atual, o foco está na interseção **Academia ↔ Governo** (editais de fomento ↔ perfis acadêmicos), com a arquitetura preparada para expansão aos demais pilares.

### 2.4 Graph Chain-of-Thought (Graph-CoT) — Raciocínio Cognitivo sobre Grafos

O **Graph Chain-of-Thought (Graph-CoT)** é um paradigma emergente na intersecção entre Retrieval-Augmented Generation (RAG) e grafos de conhecimento. Diferente do RAG convencional — que trata cada documento como uma unidade independente de conhecimento — o Graph-CoT permite que um LLM **raciocine iterativamente** sobre a estrutura do grafo, decidindo dinamicamente quais nós visitar, que conexões explorar e quando parar.

#### 2.4.1 O Problema da Alucinação em Grafos

Large Language Models (LLMs) frequentemente geram conteúdo que aparenta ser factual mas carece de fundamentação empírica — o fenômeno conhecido como **alucinação** (Maynez et al., 2020). Modelos RAG tradicionais mitigam este problema ao incorporar corpora textuais externos, mas tratam cada documento como unidade isolada.

Informações do mundo real raramente existem isoladamente — elas estão **interconectadas**, formando redes de relações. Grafos de conhecimento armazenam informação não apenas em formato textual, mas também através de **conexões estruturadas entre entidades**, permitindo processos de recuperação e raciocínio significativamente mais ricos.

#### 2.4.2 RAG Tradicional com Grafos vs. Graph-CoT

| Dimensão | RAG Tradicional com Grafos | Graph-CoT |
|----------|---------------------------|-----------| 
| **Retrieval** | Queries pré-definidas retornam subgrafos estáticos | LLM decide dinamicamente o que buscar a cada iteração |
| **Raciocínio** | Lookup direto sobre dados estruturados | Raciocínio iterativo com loop `Thought → Action → Observation` |
| **Multi-hop** | Limitado a profundidades pré-definidas (Hop-0, Hop-1, Hop-2) | Dinâmico — o LLM decide a profundidade com base na necessidade |
| **Adaptação** | Estratégia fixa de retrieval | Estratégia adaptativa — ajusta retrieval com base no que já sabe |
| **Evidência** | Subgrafo inteiro como contexto (pode ser ruidoso) | Agregação seletiva — apenas informações relevantes entram no contexto |

#### 2.4.3 O Framework Graph-CoT — Três Sub-Passos Iterativos

Cada iteração do Graph-CoT consiste em três sub-passos, inspirado no paradigma ReAct (Yao et al., 2023):

```
LOOP até suficiência de informação:
  1. REASONING (Pensamento):
     → O LLM analisa a informação atual e determina quais dados adicionais são necessários
     → Documenta o raciocínio no scratchpad (cadeia de pensamento visível)

  2. INTERACTION (Ação):
     → O LLM formula ações usando primitivas do grafo:
       • RetrieveNode[query]         — busca o nó mais relevante
       • NodeFeature[nó, atributo]   — inspeciona atributo específico de um nó
       • NeighbourCheck[nó, tipo]    — lista vizinhos de um tipo específico
       • NodeDegree[nó, tipo]        — conta conexões de um tipo específico

  3. EXECUTION (Observação):
     → O sistema executa a ação e retorna dados reais do grafo
     → O LLM incorpora a observação ao seu contexto e decide se precisa de mais informação
```

> **Referência de implementação:** O framework Cognitive-RAG (Reddy, 2024) implementa este paradigma em Python usando um `GraphAgent` que mantém um scratchpad de raciocínio e executa até `max_steps=15` iterações de Thought-Action-Observation antes de convergir. Repositório: https://github.com/Nikhilreddy024/Cognitive-RAG

#### 2.4.4 Aplicação no ARIANO — Graph-CoT Adaptado para Matchmaking

O ARIANO adapta o paradigma Graph-CoT para o domínio de matchmaking acadêmico como um **modelo híbrido** superior tanto ao RAG tradicional quanto ao Graph-CoT puro:

```
┌────────────────────────────────────────────────────────────────┐
│              ARIANO: GRAPH-CoT HÍBRIDO                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FASE 1 (CADASTRO) — Graph-CoT SEQUENCIAL               │  │
│  │  ProfileAnalyzer usa Graph-CoT para:                     │  │
│  │  Step 1: Ler bio + curriculo_texto                       │  │
│  │  Step 2: RetrieveNode → buscar perfis similares          │  │
│  │  Step 3: NeighbourCheck → ver skills desses perfis       │  │
│  │  Step 4: Reasoning → inferir maturidade e o_que_busco    │  │
│  │  Step 5: Atribuir skills + áreas automaticamente         │  │
│  │  Resultado: nó configurado com inteligência profunda     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FASE 2 (ENRIQUECIMENTO) — Graph-CoT COMPLETO            │  │
│  │  ContextualAnalyzer usa Graph-CoT ITERATIVO para:        │  │
│  │  Loop: Thought → Action → Observation (até convergência) │  │
│  │  • Identifica clusters de afinidade dinamicamente        │  │
│  │  • Cria SIMILAR_TO, RELATED_TO, OVERLAPS_WITH            │  │
│  │  • Re-calibra TODOS os scores com contexto expandido     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FASE 3 (CONSULTA) — O(1) DIRETO                         │  │
│  │  Sem IA, sem Graph-CoT, sem custo adicional              │  │
│  │  Match = query Cypher sobre grafo pré-enriquecido        │  │
│  │  Latência: milissegundos. Custo LLM: zero.               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Primitivas do Graph-CoT adaptadas para o ARIANO:**

| Primitiva Original | Adaptação no ARIANO | Uso pelo Agente |
|-------------------|--------------------|-----------------| 
| `RetrieveNode[query]` | `get_similar_profiles(bio, curriculo_texto)` | ProfileAnalyzer busca perfis similares para contextualizar análise |
| `NodeFeature[nó, atributo]` | `get_entity_deep_context(uid, depth)` | Agentes inspecionam atributos de nós vizinhos para raciocínio expandido |
| `NeighbourCheck[nó, tipo]` | `get_neighbours(uid, edge_type)` | ContextualAnalyzer lista vizinhos por tipo de relação para identificar clusters |
| `NodeDegree[nó, tipo]` | `count_connections(uid, edge_type)` | EligibilityCalculator usa grau do nó como fator de contexto no scoring |

### 2.5 Cognitive RAG — Da Cognição Biológica à Inteligência Artificial

O paradigma **Cognitive RAG** (Reddy et al., 2024) propõe uma abordagem que imita processos cognitivos biológicos na recuperação e processamento de informação. Assim como o cérebro humano não processa informação em bloco — mas em ciclos de **atenção seletiva**, **memória de trabalho** e **raciocínio inferencial** — o Cognitive RAG implementa um loop cognitivo onde:

1. **Atenção Seletiva (Selective Retrieval):** O agente identifica qual informação específica precisa e busca apenas isso (análogo à atenção focal do córtex pré-frontal)
2. **Memória de Trabalho (Scratchpad):** O agente mantém um "rascunho" progressivo de raciocínio — cada observação do grafo é incorporada ao contexto (análogo à memória de trabalho de Baddeley & Hitch, 1974)
3. **Raciocínio Inferencial (Step-wise Reasoning):** O agente conclui informações que não estão explícitas no grafo — se dois perfis compartilham skills em comum e ambos têm alta maturidade, o agente pode inferir uma conexão `SIMILAR_TO` sem que ela exista explicitamente
4. **Critério de Suficiência (Halting):** O agente decide autonomamente quando tem informação suficiente — não consome passos desnecessários (análogo à metacognição — "saber que se sabe")

No ARIANO, este paradigma cognitivo se materializa especialmente no **ContextualAnalyzer**, que opera como o "neocórtex" do sistema — analisando o grafo inteiro, identificando padrões latentes e criando conexões emergentes.

**Comparação por profundidade de raciocínio:**

| Abordagem | Profundidade | Analogia Cognitiva | Aplicação no ARIANO |
|-----------|-------------|--------------------|---------------------|
| **Hop-0** (nó único) | Superficial — apenas o nó mais relevante | Reflexo — resposta automática sem análise | Não utilizado |
| **Hop-1** (vizinhos diretos) | Rasa — nó + vizinhos imediatos | Associação simples | Fase 3 (consulta O(1)) |
| **Hop-2** (vizinhos dos vizinhos) | Média — contexto expandido | Memória episódica | Fase 1 (cadastro, análise rápida) |
| **Graph-CoT** (dinâmico) | Profunda — iterativo até suficiência | Raciocínio deliberado | Fase 2 (enriquecimento, ContextualAnalyzer) |

> **Referência acadêmica:** O framework Cognitive-RAG demonstrou em benchmarks (datasets MAPLE, BioMedical, Legal, Amazon, GoodReads) que a abordagem Graph-CoT **supera consistentemente** estratégias hop-based em accuracy de resposta, pois a profundidade de traversal é determinada pela complexidade da pergunta, não por um parâmetro fixo.
> Repositório: https://github.com/Nikhilreddy024/Cognitive-RAG

---

## 3. Referência de Design — GitNexus

O design visual e interativo do ARIANO (Dark theme com efeitos neon, hover rings e visualização de grafos em nós iluminados) foi inspirado profundamente no projeto **GitNexus**, servindo como modelo estético de sucesso para o nosso visualizador de grafos em interface web.

**Repositório do GitNexus:** [https://github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus)

A adaptação do tema original (roxo) para o **Teal Neon** do ARIANO mantém a atmosfera tecnológica premium enquanto cria uma identidade visual própria, diferenciando o produto no contexto acadêmico e governamental.

---

## 4. Arquitetura do Sistema

### 4.1 Visão Geral

```
                     ┌──────────────────────────────────────┐
                     │          FRONTEND (Vite+React)        │
                     │                                      │
                     │  /user/* (Usuário)  /admin/* (Admin)  │
                     │  ├ /cadastro        ├ /dashboard      │
                     │  ├ /profile         ├ /academicos     │
                     │  ├ /matchs          ├ /editais        │
                     │  └ /ecossistema     ├ /matches        │
                     │                     ├ /grafo          │
                     │    Auth Popup       └ /comunidades    │
                     │  (cookie-based,                       │
                     │   dual profile)                       │
                     └──────────┬───────────────────────────┘
                                │ REST API (Axios)
                     ┌──────────▼───────────────────────────┐
                     │       BACKEND (Python + FastAPI)       │
                     │                                       │
                     │  Auth (email/password + cookies JWT)   │
                     │  Agente Orquestrador (multi-agent)     │
                     │  ├─ ProfileAnalyzer                   │
                     │  │   (bio+CV → skills, maturidade,    │
                     │  │    o_que_busco) via Graph-CoT       │
                     │  ├─ EditalInterpreter                  │
                     │  ├─ EligibilityCalculator (scoring)    │
                     │  ├─ ContextualAnalyzer (Graph-CoT)     │
                     │  └─ CommunityEnricher                  │
                     │  Match Engine (Cypher O(1))            │
                     └──────────┬───────────────────────────┘
                                │ In-Memory + KV Sync
                     ┌──────────▼───────────────────────────┐
                     │   DATA LAYER = "CÉREBRO" DO ARIANO    │
                     │   MemoryGraphStore (Python)           │
                     │   - Processamento: O(1) in-memory     │
                     │   - Persistência: Vercel KV (Redis)   │
                     │   - Formato: JSON Serialized Graph    │
                     └──────────────────────────────────────┘
```

#### 🗄️ Estratégia de Persistência (Vercel KV)

O ARIANO utiliza um motor de grafos híbrido: processamento em memória para performance O(1), persistência garantida pelo **Vercel KV (Redis)**:

- **Sincronização Atômica:** Cada alteração no grafo dispara um `SET` assíncrono para o Redis da Vercel
- **Recuperação Automática:** No boot da Serverless Function, o estado mais recente é carregado via `GET`
- **Zero-Dependency:** Sem necessidade de gerenciar instâncias externas de Neo4j ou AuraDB

### 4.2 Fluxo de Dados — Três Fases Distintas

#### FASE 1 — Cadastro + Match Estratégico

> Fluxo do primeiro contato do usuário com a plataforma em `/user/cadastro`. A IA faz o match estratégico em tempo real — o usuário vê o processamento acontecendo através do `AgentProcessingTimeline`.

```
Usuário se cadastra em /user/cadastro
  → Preenche: nome, instituição, curso, bio, currículo (PDF)
  → NÃO seleciona tags de skills/áreas — a IA faz isso sozinha
  → Backend cria o nó no grafo
  → Orquestrador aciona agentes EM TEMPO REAL (visível na UI):
    → ProfileAnalyzer (via /v2/analyze):
      → Extrai curriculo_texto do PDF via PyMuPDF (PDF descartado)
      → Executa Graph-CoT sequencial (Hop-2):
        → RetrieveNode → busca perfis similares no grafo
        → NeighbourCheck → analisa skills dos perfis similares
        → Reasoning → infere maturidade (0-10) e o_que_busco
      → Extrai skills e áreas automaticamente (sem intervenção do usuário)
    → EligibilityCalculator (via /v2/match):
      → Scoring multi-dimensional:
          skills (40%) + area (25%) + maturidade (15%)
          + priority (10%) + context (10%)
      → o_que_busco como bônus (não eliminatório)
      → Cria arestas ELIGIBLE_FOR com score e justificativa
  → Interface exibe a "conversa" entre os agentes (scratchpad visível)
  → Grafo SVG anima a criação do nó e conexões em tempo real
  → Usuário vê matches com scores, barras de progresso e justificativas
```

#### FASE 2 — Enriquecimento Contínuo (Comunidades de Pensamento)

> Em produção, este fluxo seria executado automaticamente a cada 24h. No MVP, é acionado manualmente em `/admin/comunidades`.

```
Ciclo de enriquecimento acionado (botão manual ou cron 24h)
  → Agente Orquestrador analisa estado do grafo e decide ordem de ativação
    → ContextualAnalyzer (Graph-CoT ITERATIVO):
      → Loop Thought → Action → Observation (até convergência):
        → Identifica clusters de afinidade entre acadêmicos
        → Cria arestas SIMILAR_TO entre perfis com alta sobreposição
        → Cria arestas RELATED_TO entre skills complementares
        → Cria arestas OVERLAPS_WITH entre áreas sobrepostas
    → ProfileAnalyzer re-analisa perfis com contexto expandido (vizinhos N-hop)
      → Re-calcula maturidade com base em novas conexões
    → EditalInterpreter re-interpreta editais sabendo quais comunidades existem
    → EligibilityCalculator recalcula TODOS os scores com o grafo enriquecido
      → Scores sobem ou descem com base em raciocínio profundo ✓
```

> **Conceito-chave:** Cada ciclo de enriquecimento faz o grafo funcionar como um **cérebro em evolução**. Um estudante que inicialmente tinha 70% de match com um edital pode subir para 88% porque o ContextualAnalyzer descobriu que colegas com skills similares tiveram excelente performance em editais da mesma agência.

#### FASE 3 — Consulta de Matches O(1)

> Fluxo quando o usuário JÁ está cadastrado e acessa `/user/matchs`. Os matches foram pré-computados na Fase 1 e enriquecidos na Fase 2.

```
Usuário acessa /user/matchs (já cadastrado)
  → Backend executa Cypher:
    MATCH (a {uid: $me})-[r:ELIGIBLE_FOR]->(e:Edital)
    WHERE e.deadline > date()
    RETURN a, r, e ORDER BY r.score DESC, e.funding DESC
  → O(1) via adjacência livre de índice
    → Matches pré-computados retornados em milissegundos
    → Filtros: editais vs usuários similares
    → Desempate por funding quando scores iguais
    → Editais com deadline expirado automaticamente excluídos
```

### 4.3 Modelagem do Grafo

```
    ┌─────────────┐     HAS_SKILL     ┌────────────┐
    │  🎓 Student  │──────────────────>│  📚 Skill   │
    └─────────────┘                    └────────────┘
          │                                 ▲
          │ SIMILAR_TO                      │
          ▼                                │
    ┌─────────────┐     HAS_SKILL          │
    │ 🎓 Researcher│──────────────────────>│
    └─────────────┘                        │
         │                                 │
         │ RESEARCHES_AREA    REQUIRES_SKILL│
         ▼                                 │
    ┌─────────────┐                   ┌────────────┐
    │  🔬 Area     │<─────────────────│ 🏛️ Edital   │
    └─────────────┘   TARGETS_AREA    └────────────┘
                                           ▲
    ┌─────────────┐     ELIGIBLE_FOR       │
    │ 🎓 Professor │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ >│
    └─────────────┘   (score, justification, context_bonus)
```

#### 4.3.1 Tipos de Arestas

| Aresta | Tipo | Criada por | Descrição |
|--------|------|------------|-----------|
| `HAS_SKILL` | Primária | ProfileAnalyzer | Acadêmico possui competência |
| `RESEARCHES_AREA` | Primária | ProfileAnalyzer | Acadêmico pesquisa área |
| `REQUIRES_SKILL` | Primária | EditalInterpreter | Edital requer competência |
| `TARGETS_AREA` | Primária | EditalInterpreter | Edital foca em área |
| `ELIGIBLE_FOR` | Primária | EligibilityCalculator | **Aresta de match** com score e justificativa |
| `ADVISES` | Primária | Seed | Professor orienta estudante |
| `SIMILAR_TO` | Enriquecida | ContextualAnalyzer | Afinidade entre acadêmicos |
| `RELATED_TO` | Enriquecida | ContextualAnalyzer | Skills complementares que co-ocorrem |
| `OVERLAPS_WITH` | Enriquecida | ContextualAnalyzer | Áreas com sobreposição semântica |

#### 4.3.2 Campos por Entidade

| Entidade | Campos preenchidos pelo usuário | Campos determinados pela IA / Sistema |
|----------|-------------------------------|---------------------------------------|
| **Student** | name, email, password, institution, course, semester, bio, currículo (PDF upload) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills[], areas[] |
| **Researcher** | name, email, password, institution, bio, currículo (PDF upload) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills[], areas[] |
| **Professor** | name, email, password, institution, department, research_group, bio, currículo (PDF upload) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills[], areas[] |
| **Edital** | title, description, instituicao, edital_type, funding, deadline, min_maturidade | — (campos extraídos pelo EditalInterpreter) |

> **Notas sobre o modelo de dados:**
> - `maturidade` (0-10) substitui o antigo campo `level`. É calculado automaticamente pelo ProfileAnalyzer com base em bio, currículo e contexto do grafo.
> - `o_que_busco` é um texto gerado pela IA descrevendo o que o acadêmico busca, usado como bônus no scoring (não eliminatório).
> - `curriculo_texto` é o texto extraído do PDF via PyMuPDF (fitz). O arquivo PDF é descartado imediatamente após a extração.
> - Um edital **só aparece como match visível** se `deadline > data de hoje`. Este é o **único critério eliminatório** do sistema.
> - Campos removidos em versões anteriores: `lattes_url`, `curriculo_url`, `level`. Campo renomeado: `agency` → `instituicao`.

### 4.4 Subciclos do Enriquecimento (Contextualização Semântica)

O ciclo completo de enriquecimento, orquestrado pelo Orchestrator Agent, consiste em três subciclos sequenciais que transformam dados brutos em **Comunidades de Pensamento (CoTs)** com nomes e temas significativos.

O contexto expandido gerado pelo enriquecimento impacta diretamente o scoring:
- `peer_success` mede o sucesso de vizinhos `SIMILAR_TO` do acadêmico em editais similares
- `community_relevance` mede o quão integrado o acadêmico está na rede — perfis mais conectados recebem scores ligeiramente superiores

**Resultado:** Os próximos matches são mais assertivos porque o agente tem acesso a **muito mais contexto** — não apenas as skills diretas do acadêmico, mas toda a rede de afinidades, padrões de sucesso descobertos, e inferências sobre capacidades latentes.

### 4.5 Visualização de Comunidades via NetworkX

A detecção e visualização das Comunidades de Pensamento é potencializada pelo **NetworkX 3.x** como motor computacional server-side. A integração funciona em três camadas:

**Camada 1 — Construção do Grafo NetworkX (Backend):**

```python
# graph_visualizer.py — Pipeline de Visualização
import networkx as nx

# 1. Carregar grafo do MemoryGraphStore para NetworkX
G = nx.Graph()
for node in graph_nodes:
    G.add_node(node.uid, type=node.type, label=node.name, ...)
for edge in graph_edges:
    G.add_edge(edge.source, edge.target, weight=edge.score, ...)

# 2. Detectar comunidades via Louvain
communities = nx.community.louvain_communities(G, weight='weight')
# → [{uid1, uid2, uid3}, {uid4, uid5}, ...]

# 3. Computar layout com posições estáveis
positions = nx.spring_layout(G, k=2.0, iterations=50, seed=42)
# → {uid: (x, y), ...}

# 4. Retornar JSON para React
return {
    "nodes": [{"id": uid, "x": pos[0], "y": pos[1],
               "community": community_id, "type": node_type, ...}],
    "edges": [...],
    "communities": [{"id": i, "members": list(c), "color": palette[i]} ...]
}
```

**Camada 2 — API REST (FastAPI):**

Endpoint `GET /api/graph/layout?scope=full|personal&uid=xxx` retorna o JSON com posições pré-computadas. O parâmetro `scope=personal` filtra apenas o ego-network do usuário (vizinhos diretos + comunidade). O backend cacheia resultados por 5 minutos (TTL), invalidando ao receber novos nós ou ao executar o ciclo de enriquecimento.

**Camada 3 — Renderização Interativa (React + Canvas):**

O componente `NetworkXGraphView.tsx` / `MiniGraph.tsx` recebe o JSON enriquecido e renderiza a rede usando Canvas HTML5 / WebGL:
- **Interatividade Total:** Arraste de nós, zoom suave e pan
- **Temas de Comunidade:** Legendas dinâmicas exibem os temas extraídos pelo backend
- **Visual Premium:** Nós com efeitos de brilho (glow) proporcionais à influência
- **Animações Fluidas:** Simulação em tempo real para estabilização orgânica do grafo

### 4.6 Engenharia de Prompt Avançada — Graph-CoT Nativo nos Agentes

Os agentes do ARIANO são configurados com prompts especializados que implementam o paradigma Graph-CoT diretamente na engenharia de prompt, tornando-os verdadeiros **agentes cognitivos** com raciocínio iterativo, memória de trabalho (scratchpad) e critério de suficiência autônomo.

#### 4.6.1 Arquitetura de Prompt — Três Pilares

**1. Contexto Profundo do Grafo (Retrieval Layer):**
Antes de processar qualquer entidade, o agente recebe o subgrafo expandido via `get_entity_deep_context(uid, depth)`, que inclui:
- Vizinhos diretos e suas features (skills, áreas, maturidade)
- Matches existentes de perfis similares (via `SIMILAR_TO`)
- Padrões de sucesso na comunidade (via `RELATED_TO`)
- Profundidade de busca ajustada dinamicamente por contexto

**2. Raciocínio em Cadeia com Scratchpad (Reasoning Layer):**
Os prompts instruem os agentes a manter um scratchpad explícito. Exemplo de saída do ProfileAnalyzer:

```
[SCRATCHPAD — ProfileAnalyzer para João Pedro]:

Step 1 — Leitura do perfil:
  Bio: "Estudante de CC, 7º semestre, estagiou na Porto Digital..."
  Currículo: "Formação em CC-UNINASSAU. Experiência: Data Science..."
  → Identifico forte background em dados e ML aplicado.

Step 2 — Contexto do grafo (via get_similar_profiles):
  Perfis similares: Maria Silva (maturidade: 9.2), Pedro Santos (7.1)
  Skills compartilhadas: ML (3/3), Python (3/3), NLP (2/3)
  → O cluster indica foco em IA aplicada à saúde.

Step 3 — Inferência de maturidade:
  Semestre: 7/10 (base: 0.7)
  Estágio Porto Digital: +0.5 (experiência prática relevante)
  Bio detalhada: +0.3 (autoconsciência e clareza)
  Cluster avg: (9.2 + 7.1) / 2 = 8.15 (referência contextual)
  → Maturidade calculada: 6.5
  → Justificativa: "Bom potencial, experiência prática sólida,
     mas falta profundidade em pesquisa acadêmica formal."

Step 4 — Geração de o_que_busco:
  → "Oportunidades de pesquisa aplicada em Machine Learning
     e NLP, preferencialmente em projetos de impacto social
     na área de Saúde Digital."

Step 5 — Extração de skills e áreas (sem seleção manual):
  Skills: [ML, NLP, Python, Data Science, Análise de Dados]
  Áreas: [Inteligência Artificial, Saúde Digital, Ciência de Dados]
  Confidence: [0.95, 0.82, 0.98, 0.90, 0.75]
```

**3. Contextos Presetados por Fluxo (Orchestration Layer):**

| Contexto | Profundidade | Temperatura LLM | Primitivas Graph-CoT | Uso |
|----------|-------------|-----------------|---------------------|-----|
| `CONTEXT_CADASTRO` | Hop-2 (rápida) | 0.3 (determinística) | RetrieveNode, NodeFeature | Análise rápida + match imediato no cadastro |
| `CONTEXT_ENRICHMENT` | Graph-CoT completo | 0.7 (criativa) | Todas as quatro primitivas | Comunidades de Pensamento — análise profunda |
| `CONTEXT_RECALIBRATION` | Hop-3 (expandida) | 0.2 (mais determinística) | NodeFeature, NeighbourCheck | Re-scoring com novas conexões |

---

## 5. Stack Tecnológica

### 5.1 Stack Final Aprovada

```
┌──────────────────────────────────────────────────────────┐
│                   STACK ARIANO v1.0                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🎨 FRONTEND                                              │
│  ├─ Vite 5 + React 18 + TypeScript                       │
│  ├─ Tailwind CSS v4 (tema Teal Neon / Glassmorphism)     │
│  ├─ react-force-graph + Canvas HTML5 (motor interativo)  │
│  ├─ Recharts (gráficos de maturidade e perfil)            │
│  └─ Framer Motion (animações e transições fluídas)        │
│                                                           │
│  ⚙️ BACKEND                                               │
│  ├─ Python 3.12 + FastAPI                                 │
│  ├─ LangChain + LangChain-OpenAI (orquestração de agentes)│
│  ├─ NVIDIA Nemotron 3 Super 120B via OpenRouter (LLM)    │
│  ├─ NetworkX 3.x (layout, community detection, Graph-CoT) │
│  ├─ PyMuPDF / fitz (extração de texto de PDFs)           │
│  └─ Neomodel (OGM) + MemoryGraphStore (grafo in-memory)  │
│                                                           │
│  🗄️ DADOS                                                 │
│  ├─ MemoryGraphStore (processamento O(1) in-memory)       │
│  └─ Vercel KV / Redis (persistência híbrida serverless)   │
│                                                           │
│  🔧 DEVOPS & DEPLOY                                       │
│  ├─ Vercel Fullstack Deployment (monorepo)                │
│  ├─ Vercel Secrets / Env Vars (gestão segura de chaves)  │
│  └─ GitHub Actions (CI/CD)                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Justificativas Tecnológicas

| Tecnologia | Justificativa |
|------------|---------------|
| **Vercel Fullstack Deploy** | Hospeda o backend FastAPI (via Serverless Functions) e o frontend Vite em único repositório, garantindo sincronia total de deploy e latência reduzida nas chamadas de API |
| **Vercel KV (Redis)** | Resolve o problema de state efêmero das serverless functions. Cada alteração no grafo é sincronizada atomicamente via `SET`, e o estado é recuperado no boot via `GET` |
| **NVIDIA Nemotron 3 Super 120B** | Modelo MoE (Mixture of Experts) com 12B de parâmetros ativos, arquitetura híbrida Mamba-Transformer e context window de 1M tokens. Disponível gratuitamente via OpenRouter |
| **NetworkX 3.x** | Motor computacional server-side para detecção de comunidades (`louvain_communities`) e layout de grafo (`spring_layout`). O frontend recebe posições pré-computadas, garantindo fluidez na UI |
| **Vite + React (SPA)** | Hot Reload <50ms facilita desenvolvimento iterativo de UI complexa como visualizadores de grafo force-directed. Sem overhead de SSR (Next.js) |
| **TypeScript + Zod** | Tipos rígidos para `Entity`, `Match`, `Skill` garantem solidez nas travessias do grafo e mapeamentos do layout, evitando exceções de runtime no navegador |
| **LangChain** | Framework maduro para orquestração de LLMs e construção de agentes com ferramentas, memória e chains complexas |
| **PyMuPDF (fitz)** | Extração de texto de PDFs em <100ms por documento — fundamental para processar currículos em tempo real durante o cadastro |

---

## 6. Design System — Teal Neon Edition

### 6.1 Identidade Visual

O ARIANO adota o tema **"Teal Neon"** — uma evolução do tema original Blue Neon Edition, refinado nas Sprints 5-7 para harmonizar melhor com o contexto da plataforma CORETO. O estilo é inspirado na estética de interfaces de dados científicos de alta tecnologia: fundos quase-pretos azulados, destaques em ciano/teal vibrante e efeitos de brilho (glow) nos elementos de dados ativos.

### 6.2 Paleta de Cores

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-void` | `#020810` | Background principal |
| `--color-deep` | `#060d18` | Áreas secundárias |
| `--color-surface` | `#0a1420` | Superfícies de painéis |
| `--color-elevated` | `#101c2a` | Elementos elevados / cards |
| `--color-hover` | `#142235` | Estado hover |
| `--color-border-subtle` | `#1e2e3a` | Bordas sutis |
| `--color-border-default` | `#2a3a4a` | Bordas padrão |
| `--color-text-primary` | `#e4e4ed` | Texto principal |
| `--color-text-secondary` | `#8888a0` | Texto secundário / labels |
| `--color-accent` | `#0ea5e9` | Accent principal (teal/sky-500) |
| `--color-accent-glow` | `#38bdf8` | Glow effect (sky-400) |
| `--color-accent-dim` | `#0369a1` | Accent escuro |

### 6.3 Cores dos Nós do Grafo

| Entidade | Cor | Hex | Justificativa |
|----------|-----|-----|---------------|
| **Edital** | Azul Institucional | `#2563eb` | Nó central, tom governamental |
| **Student** | Cyan Brilhante | `#00e5ff` | Tom vibrante, destaque na academia |
| **Researcher** | Emerald | `#10b981` | Ciência, crescimento |
| **Professor** | Amber | `#f59e0b` | Experiência, autoridade |
| **Skill** | Violet | `#8b5cf6` | Competências abstratas |
| **Area** | Indigo | `#6366f1` | Áreas de atuação |
| **ELIGIBLE_FOR** | Gradiente Cyan→Blue | `#38bdf8` → `#2563eb` | Aresta de match ativa |

### 6.4 Tipografia

| Papel | Família | Token CSS |
|-------|---------|-----------|
| Texto geral (sans) | `Outfit`, system-ui | `--font-sans` |
| Código e dados (mono) | `JetBrains Mono`, `Fira Code` | `--font-mono` |

### 6.5 Princípios de UX do Grafo

- **Feedback Visual Progressivo:** Ligações nos grafos exibidas apenas em `hover` ou seleção — evita "espaguetes visuais" em grafos densos
- **Dimming Contextual:** Ao selecionar um nó, os demais ficam com opacidade reduzida, focando a atenção nas conexões relevantes
- **Efeitos de Glow:** Nós selecionados ou em destaque recebem aumento de `shadowBlur` proporcional à sua influência (NodeDegree)
- **Labels Bulletproof:** `ctx.clip()` no Canvas garante que nenhum nome de nó transborde seu círculo delimitador

---

## 7. Product Backlog (User Stories)

### Epic 1: Infraestrutura

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-01 | Como desenvolvedor, quero um ambiente Docker configurado para que o backend rode em containers | Alta | 3 pts |
| US-02 | Como desenvolvedor, quero CI/CD com GitHub Actions para que cada PR seja validada automaticamente | Média | 2 pts |
| US-03 | Como desenvolvedor, quero a estrutura de pastas do projeto organizada para facilitar a colaboração | Alta | 1 pt |

### Epic 2: Data Layer

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-04 | Como PO, quero nós modelados para Student, Researcher, Professor e Edital no grafo | Alta | 3 pts |
| US-05 | Como PO, quero nós auxiliares Skill e Area para conectividade no grafo | Alta | 2 pts |
| US-06 | Como PO, quero arestas HAS_SKILL, RESEARCHES_AREA, REQUIRES_SKILL e ELIGIBLE_FOR | Alta | 3 pts |
| US-07 | Como tester, quero dados seed com ≥15 acadêmicos + ≥8 editais para validação | Média | 2 pts |

### Epic 3: Agentes IA (Graph Configurators)

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-08 | Como PO, quero que o ProfileAnalyzer extraia skills e classifique áreas de cadastros acadêmicos | Alta | 5 pts |
| US-09 | Como PO, quero que o EditalInterpreter extraia requisitos e áreas de editais | Alta | 5 pts |
| US-10 | Como PO, quero que o EligibilityCalculator calcule scores de match e crie arestas ELIGIBLE_FOR | Alta | 8 pts |
| US-11 | Como usuário, quero que o match seja uma query pura retornando resultados instantâneos | Alta | 3 pts |

### Epic 4: Frontend

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-12 | Como usuário, quero um dashboard mostrando totais de acadêmicos, editais e matches | Média | 3 pts |
| US-13 | Como usuário, quero cadastrar perfis acadêmicos via formulário inteligente | Alta | 3 pts |
| US-14 | Como usuário, quero cadastrar editais governamentais via formulário | Alta | 3 pts |
| US-15 | Como usuário, quero visualizar o grafo interativamente com nós tipados e cores | Alta | 8 pts |
| US-16 | Como usuário, quero ver matches ranqueados com score e justificativa | Alta | 5 pts |
| US-17 | Como usuário, quero clicar em um nó do grafo e ver seus detalhes e conexões | Média | 3 pts |

---

## 8. Sprint Planning — Roadmap (Práticas Ágeis)

A estratégia de desenvolvimento do projeto ARIANO é fortemente pautada nos princípios ágeis utilizando uma adaptação do **framework SCRUM** para o contexto acadêmico. Todas as sprints contaram com sessões de *Sprint Planning* para refinar os requisitos em histórias do usuário, *Sprint Reviews* para garantir as entregas incrementais e *Retrospectives* para ajustes contínuos de rota.

> **💡 Acompanhamento Online (Kanban):** O detalhamento granular das tarefas, responsáveis (Team Assignees), Story Points e status de execução estão geridos no painel do **Notion**, que serve como fonte da verdade oficial para a entrega ao professor.

---

### Sprint 0 — Fundação (Semana 1) ✅ CONCLUÍDA

**Foco:** Planejamento arquitetural e setup do ambiente base.

**Entregas:**
- Estruturação institucional de repositórios, documentação e modelagens
- Adoção do SCRUM para fragmentar o entendimento inicial do ecossistema
- Concepção do conceito do motor ARIANO (Precomputed Relational Intelligence)
- Versão inicial do Design System (Blue Neon)
- Documentos de visão, seleção da stack principal
- Nivelamento do ambiente para times de Frontend, Backend e Infraestrutura trabalharem de modo assíncrono

---

### Sprint 1 — Frontend + Visualização de Grafo (Semanas 2-3) ✅ CONCLUÍDA

**Foco:** Interface de Usuário (UI) robusta e visualização fidedigna dos nós em simulação controlada.

**Entregas:**
- Migração tecnológica para visualizadores de rede com grafos interativos (force-directed)
- Governança restrita de dados em Mock (20 entidades, permutações predeterminadas) para testabilidade previsível
- Validação do modelo abstrato num painel de visualização utilizável e analítico

> **Nota:** Na Sprint 4, a visualização foi migrada para **NetworkX** (backend) com renderização Canvas/React (frontend), eliminando dependências JavaScript pesadas e integrando nativamente a detecção de Comunidades via `louvain_communities()`.

---

### Sprint 2 — Data Layer, APIs e Agentes IA (Semanas 4-5) ✅ CONCLUÍDA

**Foco:** Construir a "Core Engine" implementando agentes de IA (LangChain + NVIDIA Nemotron 3 Super via OpenRouter) interligados com o grafo via FastAPI.

**Entregáveis técnicos:**
- **ProfileAnalyzer:** Agente que extrai skills e classifica áreas acadêmicas via Nemotron 3 Super (com fallback rule-based)
- **EditalInterpreter:** Agente que interpreta editais e extrai requisitos técnicos
- **EligibilityCalculator:** Agente principal que calcula scores multi-dimensionais e cria arestas `ELIGIBLE_FOR`
- **Match Engine:** Motor de consulta O(1) via Cypher puro sobre arestas pré-computadas
- **Agent API Routes:** Endpoints REST completos para operações dos agentes
- **Seed + Pipeline:** Script automatizado para popular o grafo e executar o pipeline de agentes

---

### Sprint 3 — Integração, Deploy e Security Hardening (Semanas 5-6) ✅ CONCLUÍDA

**Foco:** Garantir execução global e proteção de dados sensíveis.

**Entregas:**
- **Integração Total:** Comunicação fluída entre interface React e motor FastAPI sem dependência de dados estáticos
- **Deploy Fullstack no Vercel:** Monorepo hospedando tanto a lógica de IA (Python) quanto a interface
- **Segurança Blindada:** API Keys do OpenRouter/NVIDIA tratadas como segredos de infraestrutura, fora do versionamento
- **Robustez Pydantic:** Configurações de ambiente validadas e corrigidas para suporte a múltiplos contextos (Local vs Prod)
- **Consolidação de Agentes:** Pipeline completo de análise → interpretação → matchmaking rodando em produção

---

### Sprint 4 — Inteligência Profunda, Portais & Experiência (Semanas 7-8) ✅ CONCLUÍDA

**Foco:** Transformar o ARIANO em um produto completo com dois portais (Usuário e Admin), autenticação, cadastro inteligente com match visível em tempo real, comunidades de pensamento e excelência visual.

**Pilares e Entregas:**

| Pilar | Entrega | Impacto |
|-------|---------|---------|
| 🔐 **Autenticação Dual** | Login com cookies JWT HttpOnly, dois perfis simultâneos (user + admin) | Base para portais separados |
| 🧠 **Inteligência Profunda** | Modelo de dados atualizado + agentes especialistas + orquestrador Graph-CoT | IA determina automaticamente skills, áreas, maturidade e objetivos |
| 🎯 **CORETO — Match Visível** | Cadastro com match estratégico em tempo real (não O(1)) — o usuário vê a IA trabalhando | **Principal entrega do MVP** — demonstração viva em sala |
| 👤 **Portal do Usuário** | `/user/profile`, `/user/matchs` (O(1)), `/user/ecossistema` (grafo pessoal) | Experiência personalizada para o acadêmico |
| 🔗 **Comunidades de Pensamento** | Ciclo de enriquecimento via Graph-CoT multi-agente | Grafo progressivamente mais inteligente |
| ✨ **Excelência Visual** | Animações fluídas, polimento UX/UI, page transitions, breathing effects | Impacto visual máximo na apresentação |
| 🔍 **Verificação Final** | Auditoria completa de UX/UI (10+ páginas, desktop + mobile) | Gate de qualidade antes da entrega |

**Detalhes técnicos:**

1. **Modelo de Dados Atualizado:**
   - Novos campos: `bio`, `curriculo_texto` (PDF → texto via PyMuPDF), `maturidade` (0-10, IA), `o_que_busco` (IA)
   - Removidos: `lattes_url`, `level`. Renomeados: `agency` → `instituicao`, `min_level` → `min_maturidade`
   - Scoring revisado: skills(40%) + area(25%) + maturidade(15%) + priority(10%) + context(10%)

2. **Sistema de Autenticação:**
   - Login popup com email/senha, cookies JWT HttpOnly (7 dias de validade)
   - Dois perfis simultâneos: `ariano_user` + `ariano_admin`
   - Popup persistente com shake animation e validação visual

3. **Página CORETO (`/user/cadastro`):**
   - Formulário adaptável por tipo (Estudante/Pesquisador/Professor)
   - SEM seleção manual de tags — a IA extrai skills e áreas automaticamente
   - Pipeline visual mostrando cada agente processando em tempo real (com timing em ms)
   - Grafo SVG/Canvas animando a criação do nó e conexões enquanto a IA trabalha

4. **Portal do Usuário (`/user/*`):**
   - `/user/profile`: Visualizar/editar perfil, exibe maturidade e `o_que_busco` (read-only, gerados por IA)
   - `/user/matchs`: Matches pessoais via O(1) com filtros (editais vs usuários similares)
   - `/user/ecossistema`: Grafo pessoal (layout NetworkX) mostrando APENAS nós conectados ao usuário

5. **Portal Admin (`/admin/*`):**
   - Dashboard, Acadêmicos, Editais, Matches, Grafo (migrados)
   - Nova página: `/admin/comunidades` (ciclo de enriquecimento manual)

6. **Comunidades de Pensamento (`/admin/comunidades`):**
   - Botão para executar ciclo manualmente (em produção: cada 24h via cron)
   - Detecção de comunidades via NetworkX `louvain_communities()`, renderização React Canvas
   - Timeline do Orquestrador mostrando agentes em cadeia + scratchpad Graph-CoT visível
   - Painel Before/After mostrando variação nos scores (ex: "72% → 88% (+16%)")

---

### Sprint 5 — Deploy, Bugfixes e Polimento (Semana 9) ✅ CONCLUÍDA

**Foco:** Refinamento geral, resolução de débitos técnicos e otimização da experiência de autenticação e cadastro.

**Entregas:**
- Refatoração profunda do sistema de autenticação via API com proteção de rotas real (`ProtectedRoute` vs `AuthPopup`)
- Harmonização do tema "Teal Neon" em todas as telas, glassmorphism unificado nos painéis laterais
- Atualização da documentação do projeto e consolidação da migração do monorepo
- Bugfix: Resolução de falhas críticas na criação de usuários com upload de currículo PDF e conversão instantânea

---

### Sprint 6 — Grafo de Alta Precisão & UX Avançada (Semana 10) ✅ CONCLUÍDA

**Foco:** Transformar a visualização de comunidades (Graph-CoT) num painel de altíssima fidelidade estética e usabilidade impecável.

**Entregas técnicas:**
1. **Comunidades Orgânicas (Blob/Minkowski):** Implementação do cálculo matemático de Minkowski Sum para desenhar clusters de pensamento com bordas suaves
2. **Labels Bulletproof:** Uso de `ctx.clip()` no Canvas HTML5 garantindo que nenhum nome de nó transborde seu círculo
3. **Dinâmica de Foco e Glow:** Nós selecionados recebem aumento de `shadowBlur` proporcional à sua influência

---

### Sprint 7 — Landing Page & Design Premium (Semana 11) ✅ CONCLUÍDA

**Foco:** Criação de uma Landing Page impactante e refinamento da identidade visual global.

**Entregas:**
- Nova Landing Page interativa com motor de grafos 3D (Three.js)
- Otimização de builds e code-splitting para performance máxima no Vercel
- Refinamento de tipografia e paleta de cores teal neon

---

### Sprint 8 — IA Transparente & Pipeline Multi-Step (Semana 12) ✅ CONCLUÍDA

**Foco:** Garantir que a inteligência artificial seja visível em tempo real e que a arquitetura seja resiliente ao ambiente serverless do Vercel.

**Entregas técnicas:**
1. **Pipeline de IA Multi-Step:** Substituição do polling genérico por sequência de chamadas síncronas (`/v2/analyze`, `/v2/extract`, `/v2/match`), garantindo transparência total do processo cognitivo
2. **Grafo Dinâmico em Tempo Real:** Componente `MiniGraphAnimation` renderiza nós reais extraídos pela LLM durante o cadastro, eliminando dados mockados
3. **Resiliência Serverless (Stateless):** Implementação de persistência de contexto via payload síncrono, evitando perda de estado durante o processamento da IA
4. **Auto-Auth Robusto:** Correção do fluxo de redirecionamento pós-cadastro com delay de 1.5s para sincronização de cookies JWT no Vercel

---

## 9. Critérios de Aceite (Definition of Done)

O MVP é considerado **Done** quando todos os critérios abaixo são atendidos:

### Critérios Core (MVP)

- [x] Grafo populado com ≥ 15 acadêmicos + ≥ 8 editais + arestas configuradas por agentes
- [x] Agentes de IA (NVIDIA Nemotron 3 via OpenRouter) criam e configuram o grafo (nós, arestas, pesos) antes do match
- [x] Match instantâneo e robusto com endpoints de backend integrados com Frontend
- [x] Execução zero-config (API e grafo executam no MemoryGraphStore O(1))
- [x] Deploy Fullstack funcional em URL pública (Vercel)
- [x] Gestão de Segredos (API Keys) via Environment Variables segura
- [x] Frontend otimizado com dashboard, cadastro e visualizador de grafo interativo 100% dinâmicos
- [x] CI/CD testado via GitHub Actions
- [x] Design consistente com tema Teal Neon Edition

### Critérios Sprint 4 (Inteligência & Portais)

- [x] Campos `bio`, `curriculo_texto` (upload PDF → texto via PyMuPDF, PDF descartado), `maturidade` (IA) e `o_que_busco` (IA) funcionais
- [x] Autenticação com cookies JWT + dual login (user + admin simultâneos)
- [x] Página CORETO com cadastro + match estratégico visível em tempo real
- [x] Portal Usuário: Profile, Matches O(1), Ecossistema em `/user/*`
- [x] Portal Admin: todas páginas existentes sob `/admin/*`
- [x] Graph-CoT Primitives (`graph_tools.py`) operacionais
- [x] Comunidades de Pensamento com Graph-CoT iterativo funcional em `/admin/comunidades`
- [x] Verificação final de UX/UI aprovada (10+ páginas, desktop + mobile)

### Critérios Sprint 5 (Polimento & Estabilização)

- [x] Auth routes unificadas e login popup non-intrusive
- [x] Bugfixes de sessão e re-estilização global no tema Teal Neon

### Critérios Sprint 6-8 (UX Avançada & IA Transparente)

- [x] Pipeline multi-step de IA transparente e visível ao usuário
- [x] Grafo dinâmico com dados reais da LLM durante cadastro
- [x] Landing page Three.js com motor de grafos 3D

### Em Roadmap (Backlog)

- [ ] Renderização orgânica de CoTs (Minkowski Sum) e labels contidos via clipping em Canvas
- [ ] Centralização inteligente de nodes com viewport real, zoom contextual e menu em cascata (Esc)
- [ ] Navegação em-grafo via ligações do side panel + filtros dinâmicos de tipo e visibilidade

---

## 10. Estrutura do Repositório

```text
ProjetoARIANO/
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI/CD: lint, tests, deploy check
├── api/
│   └── index.py                       # 🚀 Entry point Vercel serverless
├── app/                               # ⚙️ BACKEND
│   ├── agents/
│   │   ├── __init__.py                # Registry de contextos Graph-CoT
│   │   ├── profile_analyzer.py        # Graph-CoT sequencial: bio+CV → maturidade, skills, o_que_busco
│   │   ├── edital_interpreter.py      # Interpretação de editais: requisitos e áreas
│   │   ├── eligibility_calculator.py  # Scoring multi-dimensional + arestas ELIGIBLE_FOR
│   │   ├── orchestrator.py            # Controle de fluxo e ordem de ativação dos agentes
│   │   └── contextual_analyzer.py     # Graph-CoT iterativo: Thought→Action→Observation
│   ├── api/
│   │   ├── routes.py                  # Endpoints CRUD de entidades (acadêmicos, editais)
│   │   ├── agent_routes.py            # Endpoints de pipeline de agentes (/v2/analyze, /v2/match)
│   │   └── auth_routes.py             # Login / Register / Logout (JWT cookies)
│   ├── core/
│   │   ├── config.py                  # Configurações e variáveis de ambiente (Pydantic Settings)
│   │   ├── database.py                # Inicialização do MemoryGraphStore
│   │   ├── neo4j_driver.py            # Queries de contexto profundo (deep context, N-hop)
│   │   └── graph_tools.py             # Primitivas Graph-CoT: retrieve_node, node_feature,
│   │                                  #   neighbour_check, node_degree
│   ├── models/
│   │   ├── graph.py                   # Modelos Neomodel (nós e arestas com todos os campos)
│   │   └── schemas.py                 # Schemas Pydantic (validação de entrada/saída da API)
│   └── services/
│       ├── crud.py                    # Operações CRUD sobre o grafo
│       ├── pdf_extractor.py           # PyMuPDF (fitz): PDF upload → curriculo_texto, PDF descartado
│       ├── graph_visualizer.py        # NetworkX: layout + comunidades Louvain → JSON para React
│       ├── match_engine.py            # Consulta O(1) com filtro de deadline ativo
│       ├── seed_native.py             # Seed com dados de exemplo (acadêmicos + editais)
│       └── seed_and_configure.py      # Seed + pipeline completo de agentes
├── frontend/                          # 🎨 FRONTEND
│   ├── src/
│   │   ├── App.tsx                    # Rotas: /user/* e /admin/*
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Auth global com dual profile (user + admin)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── UserSidebar.tsx    # Navegação do Portal Usuário
│   │   │   │   └── AdminSidebar.tsx   # Navegação do Portal Admin
│   │   │   ├── AuthPopup.tsx          # Modal de login persistente
│   │   │   ├── ProtectedRoute.tsx     # Guard de rota (redireciona se não autenticado)
│   │   │   ├── AgentProcessingTimeline.tsx  # Timeline visual do pipeline de agentes
│   │   │   ├── MiniGraph.tsx          # Visualizador de grafo em miniatura (Canvas)
│   │   │   └── EmptyState.tsx         # Componente de estado vazio
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # Hook de autenticação
│   │   │   └── useAgentPipeline.ts    # Hook para polling do pipeline de IA
│   │   ├── pages/
│   │   │   ├── user/                  # Portal do Acadêmico (/user/*)
│   │   │   │   ├── CadastroPage.tsx   # Cadastro CORETO + match estratégico em tempo real
│   │   │   │   ├── ProfilePage.tsx    # Perfil do usuário (visualizar/editar)
│   │   │   │   ├── MatchsPage.tsx     # Matches pessoais O(1)
│   │   │   │   └── EcossistemaPage.tsx # Grafo pessoal (ego-network)
│   │   │   └── admin/                 # Portal Administrador (/admin/*)
│   │   │       ├── DashboardPage.tsx  # Visão geral do sistema
│   │   │       ├── AcademicosPage.tsx # Gerenciar acadêmicos
│   │   │       ├── EditaisPage.tsx    # Gerenciar editais
│   │   │       ├── MatchesPage.tsx    # Ver todos os matches
│   │   │       ├── GrafoPage.tsx      # Visualizador do grafo completo
│   │   │       └── ComunidadesPage.tsx # Ciclo de enriquecimento + detecção Louvain
│   │   ├── lib/
│   │   │   └── api.ts                 # Cliente Axios configurado com interceptors
│   │   └── types/
│   │       └── index.ts               # Tipos TypeScript: Entity, Match, Skill, Area...
│   └── package.json
├── Prototype v0/                      # 📋 DOCUMENTAÇÃO
│   └── Docs/
│       ├── 01_DOCUMENTO_PROJETO_ARIANO.md   # Este arquivo — visão, arquitetura e roadmap
│       └── 02_RELATORIO_FINAL_ACADEMICO.md  # Relatório formal para banca da UNINASSAU
├── .env.example                       # Template de variáveis de ambiente
├── .gitignore
├── requirements.txt                   # Dependências Python
├── vercel.json                        # Configuração de deploy Vercel (rotas e rewrites)
└── README.md                          # Guia rápido de início
```

---

## 11. Ferramentas e Qualidade

| Ferramenta | Propósito | Quando executa |
|-----------|-----------|----------------|
| **ESLint** | Linting JavaScript/TypeScript | A cada push/PR |
| **Prettier** | Formatação de código | Pre-commit (Husky) |
| **Ruff** | Linting Python (substitui flake8 + isort + black) | A cada push/PR |
| **Pytest** | Testes unitários e de integração (backend) | A cada push/PR |
| **Vitest** | Testes unitários (frontend) | A cada push/PR |
| **Commitlint** | Padronização de commits (Conventional Commits) | Pre-commit |

### Conventional Commits

O projeto adota o padrão **Conventional Commits** para histórico de git legível e changelogs automatizados:

```bash
# Formato
<type>(<scope>): <description>

# Exemplos
feat(agent): adicionar ProfileAnalyzer para classificação de skills
fix(graph): corrigir cálculo de pesos nas arestas ELIGIBLE_FOR
docs(readme): atualizar instruções de setup
refactor(api): extrair lógica de auth para módulo separado
test(eligibility): adicionar testes unitários para score calculation
chore(deps): atualizar NetworkX para 3.3.0
```

---

## 12. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Latência na API do OpenRouter | Média | Médio | Cache de respostas de agentes, fallback rule-based, modo mock para desenvolvimento |
| Perda de estado em ambiente serverless Vercel | Baixa | Alto | Persistência atômica via Vercel KV (Redis) com sincronização em cada escrita |
| Tempo limite de Serverless Functions (10s Vercel) | Média | Alto | Pipeline assíncrono via polling, chamadas `/v2/analyze` e `/v2/match` separadas |
| Complexidade do layout ForceAtlas2 | Baixa | Alto | Configurações adaptativas por tamanho do grafo; fallback para `spring_layout` |
| Latência no cálculo de layout NetworkX | Baixa | Baixo | `spring_layout` é O(n²) mas o grafo ARIANO tem <200 nós — compute <50ms; cache de posições por 5min no backend |
| Expiração de chaves gratuitas do OpenRouter | Média | Alto | Configuração de API Key via variável de ambiente facilita rotação; tier gratuito do Nemotron tem quotas generosas |
| Escalabilidade do MemoryGraphStore | Baixa (MVP) | Alto (Prod) | Para MVP, <500 nós é suficiente; para produção, migrar para Neo4j AuraDB mantendo a mesma interface Cypher |

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **ARIANO** | Arquitetura de Inteligência Artificial Naturalmente Ordenada — motor de matchmaking inteligente |
| **CORETO** | Conexões para Revolução Empreendedora e Tecnológica Online — plataforma de matchmaking da Prefeitura do Recife |
| **Knowledge Graph** | Grafo de conhecimento — estrutura de dados com nós e arestas tipados. Formalmente: `G = (V, E, R)` |
| **Adjacência livre de índice** | Propriedade de grafos onde navegar entre nós vizinhos é O(1), independente do volume total de dados |
| **Cypher** | Linguagem de consulta declarativa do Neo4j para grafos de propriedades |
| **MemoryGraphStore** | Motor de grafo in-memory implementado em Python, usado no backend para processamento O(1) |
| **ELIGIBLE_FOR** | Aresta de match no grafo — conecta acadêmico a edital com score e justificativa |
| **SIMILAR_TO** | Aresta de enriquecimento — conecta acadêmicos com perfis afins (criada pelo ContextualAnalyzer) |
| **RELATED_TO** | Aresta de enriquecimento — conecta skills complementares que co-ocorrem em perfis bem-sucedidos |
| **OVERLAPS_WITH** | Aresta de enriquecimento — conecta áreas com sobreposição semântica |
| **maturidade** | Grau de 0 a 10 atribuído automaticamente pela IA ao perfil acadêmico, baseado em bio, currículo e contexto do grafo |
| **o_que_busco** | Texto gerado pela IA descrevendo os objetivos inferidos do perfil acadêmico, usado como bônus no scoring |
| **curriculo_texto** | Texto extraído automaticamente do PDF do currículo via PyMuPDF (fitz). O PDF é descartado após extração |
| **Graph-CoT** | Graph Chain-of-Thought — paradigma de raciocínio iterativo sobre grafos onde o LLM decide dinamicamente quais nós visitar e quando parar |
| **Cognitive RAG** | Retrieval-Augmented Generation com processos cognitivos bio-inspirados: atenção seletiva, memória de trabalho e raciocínio inferencial |
| **Scratchpad** | Memória de trabalho do agente — rascunho progressivo de raciocínio visível em cada iteração do Graph-CoT |
| **ReAct** | Paradigma Reasoning + Acting — loop `Thought → Action → Observation` (Yao et al., 2023) |
| **Primitivas do Grafo** | Funções de interação com o grafo usadas pelos agentes: `RetrieveNode`, `NodeFeature`, `NeighbourCheck`, `NodeDegree` |
| **Halting Condition** | Critério de suficiência — o agente decide autonomamente quando tem informação suficiente para parar o loop cognitivo |
| **Comunidades de Pensamento** | Clusters de afinidade no grafo criados pelo ContextualAnalyzer via Graph-CoT iterativo |
| **Agente Orquestrador** | Agente que controla a ordem e ativação dos demais agentes baseado no fluxo e estado do grafo |
| **Context Bonus** | Componente adicional do score de match derivado do contexto expandido do grafo (vizinhos indiretos, comunidades) |
| **Precomputed Relational Intelligence** | Filosofia central do ARIANO: IA configura o grafo offline (custoso), consultas são O(1) online (instantâneas) |
| **Quádrupla Hélice** | Modelo de inovação sistêmica com quatro pilares: Academia, Governo, Indústria e Sociedade Civil (Carayannis & Campbell, 2009) |
| **NetworkX** | Biblioteca Python de análise de grafos (v3.x) — usada no backend para layout (`spring_layout`), detecção de comunidades (`louvain_communities`) e análise de centralidade |
| **Louvain** | Algoritmo de detecção de comunidades em grafos que maximiza a modularidade da rede |
| **ForceAtlas2** | Algoritmo de layout force-directed para posicionamento de nós em grafos com base em forças de atração/repulsão |
| **LangChain** | Framework Python para orquestração de LLMs, agentes com ferramentas, memória e chains complexas |
| **PyMuPDF (fitz)** | Biblioteca Python de alto desempenho para extração de texto de arquivos PDF (<100ms por documento) |
| **JWT** | JSON Web Token — padrão para transmissão segura de informações de autenticação como cookies HttpOnly |
| **MVP** | Minimum Viable Product — produto mínimo viável com as funcionalidades essenciais |
| **SCRUM** | Framework ágil para gerenciamento de projetos com sprints iterativos |
| **DoD** | Definition of Done — critérios objetivos que determinam quando uma entrega está completa |
| **Hop-N** | Profundidade de traversal no grafo: Hop-0 = nó único, Hop-1 = vizinhos diretos, Hop-2 = vizinhos dos vizinhos |
| **Vercel KV** | Serviço Redis gerenciado da Vercel, usado para persistência do grafo entre invocações serverless |
| **OpenRouter** | Gateway unificado para APIs de LLM com compatibilidade OpenAI — usado para acessar o NVIDIA Nemotron |
| **Neomodel** | OGM (Object Graph Mapper) Python para Neo4j — usado para modelagem declarativa dos nós e arestas |

---

## Referências

1. **GitNexus** — Motor de inteligência de código com knowledge graphs. Disponível em: https://gitnexus.vercel.app/

2. **Neo4j** — Banco de dados de grafos. Disponível em: https://neo4j.com/

3. **NetworkX** — Biblioteca Python de análise e visualização de grafos. Layouts: `spring_layout`, `forceatlas2_layout`, `kamada_kawai_layout`. Comunidades: `louvain_communities`, `girvan_newman`. Disponível em: https://networkx.org/

4. **Labcodes — Graph Databases com Python** — Referência visual para grafos acadêmicos. Disponível em: https://labcodes.com.br/blog/pt-br/development/graph-databases-discutindo-o-relacionamento-dos-seus-dados-com-python/

5. **FastAPI** — Framework web moderno para Python. Disponível em: https://fastapi.tiangolo.com/

6. **LangChain** — Framework de orquestração de LLMs. Disponível em: https://python.langchain.com/

7. **NVIDIA Nemotron 3 Super** — Modelo LLM 120B MoE (12B ativo), arquitetura híbrida Mamba-Transformer, 1M context window. Disponível via OpenRouter em: https://openrouter.ai/nvidia/nemotron-3-super-120b-a12b:free

8. **OpenRouter** — Gateway unificado para APIs de LLM com compatibilidade OpenAI. Disponível em: https://openrouter.ai/

9. **Cognitive-RAG** (Reddy, N., 2024) — A RAG model using graph data for improved question answering through cognition. Implementação de referência do paradigma Graph Chain-of-Thought (Graph-CoT) com loop iterativo Thought-Action-Observation. Disponível em: https://github.com/Nikhilreddy024/Cognitive-RAG

10. **ReAct: Synergizing Reasoning and Acting in Language Models** (Yao, S. et al., 2023) — Paradigma que combina raciocínio e ação em LLMs, base teórica para o loop Thought-Action-Observation do Graph-CoT. arXiv:2210.03629

11. **Carayannis, E. G. & Campbell, D. F. J.** (2009) — "Mode 3 and Quadruple Helix: toward a 21st century fractal innovation ecosystem." *International Journal of Technology Management*, 46(3/4), 201–234.

12. **Etzkowitz, H. & Leydesdorff, L.** (1995) — "The Triple Helix: University-Industry-Government Relations." *EASST Review*, 14(1), 14–19.

13. **Baddeley, A. D. & Hitch, G.** (1974) — "Working Memory." *Psychology of Learning and Motivation*, 8, 47–89.

14. **Maynez, J. et al.** (2020) — "On Faithfulness and Factuality in Abstractive Summarization." *ACL 2020*.

15. **PyMuPDF (fitz)** — Biblioteca Python de alto desempenho para extração de texto de PDFs (<100ms por documento). Disponível em: https://pymupdf.readthedocs.io/

---

> **Este documento é um guia vivo atualizado a cada sprint.**
> **Última atualização:** 04/06/2026 — v13.0.0 (Revisão geral de documentação, correções de formatação e complementação de seções)
