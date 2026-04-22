# 📋 PROJETO ARIANO — Documento de Visão e Planejamento do MVP

> **Versão:** 6.0.0  
> **Data:** 16/04/2026  
> **Status:** MVP 1.0.0 Online — Sprint 4 em Andamento (Portais, Graph-CoT Híbrido, Cognição Artificial & Experiência)
> **Metodologia:** SCRUM (adaptado para contexto acadêmico)  
> **Última atualização:** 16/04/2026 — Sprint 4 (Graph-CoT, Cognitive RAG, Autenticação, Portal Usuário, CORETO, Comunidades de Pensamento, Engenharia de Prompt Avançada)

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

## 1. Introdução e Contextualização

### 1.1 O que é o CORETO?

O **CORETO** (**C**onexões para **R**evolução **E**mpreendedora e **T**ecnológica **O**nline) é uma **plataforma digital da Prefeitura do Recife** que funciona como um ecossistema de inovação conectando os quatro pilares da **quádrupla hélice**: **Academia**, **Governo**, **Indústria** e **Sociedade Civil**. A plataforma visa promover a colaboração entre esses eixos para resolver desafios urbanos e fomentar a inovação no ecossistema de Recife.

O nome "Coreto" é uma metáfora ao espaço público de encontro e troca — assim como o coreto de uma praça reúne pessoas, a plataforma reúne solucionadores de problemas (academia, empresas) com donos de problemas (governo, sociedade).

### 1.2 O que é o ARIANO?

O **ARIANO** (**A**rquitetura de **I**nteligência **A**rtificial **N**aturalmente **O**rdenada) é o **motor de matchmaking inteligente** que opera por trás da plataforma CORETO. Ele é responsável por:

1. **Interpretar** perfis de acadêmicos e requisitos de editais governamentais
2. **Classificar** competências, áreas de atuação e níveis acadêmicos
3. **Configurar** um grafo de conhecimento (Knowledge Graph) com relacionamentos ponderados
4. **Executar matches** instantâneos via consulta direta ao grafo pré-configurado

> **Filosofia-chave:** Os agentes de IA **não fazem o match diretamente**. Eles **preparam e configuram o grafo** — interpretam, classificam, enriquecem e criam relacionamentos com pesos calculados. O match em si é apenas uma **query Cypher** que explora a adjacência livre de índice em **O(1)**, garantindo respostas instantâneas independente do volume de dados.

### 1.3 Escopo do MVP — Academia ↔ Governo

> **⚠️ IMPORTANTE:** O MVP (Minimum Viable Product) foca exclusivamente no **matchmaking entre Academia e Governo**, por serem os eixos mais demonstráveis e assertivos para um projeto acadêmico.

| Pilar do MVP | Entidades | Exemplos Concretos |
|---|---|---|
| 🎓 **Academia** | Alunos, Pesquisadores, Docentes | Estudante de CC com skills em ML e NLP |
| 🏛️ **Governo** | Editais FACEPE, Chamadas Públicas, Programas de Fomento | Edital FACEPE 2026 — IA para Saúde |

**Entregas do MVP:**
- ✅ Cadastro de entidades acadêmicas (alunos, pesquisadores, docentes) e editais governamentais
- ✅ Agentes de IA (NVIDIA Nemotron 3 via OpenRouter) que **interpretam e configuram o grafo** (enriquecimento, classificação, criação de arestas ponderadas)
- ✅ Match via **Cypher query pura** ou O(1) de Busca em Memória sobre o grafo instanciado.
- ✅ Interface web robusta e otimizada (Vite, React) consumindo os endpoints backend diretamente via REST Axios
- ✅ Zero-config Execution garantida com in-memory database nativo e transparente ao usuário
- ✅ **Deploy Fullstack (Vercel):** Backend FastAPI (Serverless) e Frontend Vite integrados em monorepo
- ✅ **Segurança de Credenciais:** Gestão de chaves via Environment Variables (Secrets) ocultas em produção
- 🚀 **Autenticação Dual:** Login com email/senha, cookies JWT, dois perfis simultâneos (user + admin) (Sprint 4)
- 🚀 **CORETO — Cadastro de Talento:** Cadastro com match estratégico visível em tempo real pela IA + consulta O(1) posterior (Sprint 4)
- 🚀 **Portal do Usuário:** Perfil, Matches pessoais O(1) e Ecossistema individual em /user/* (Sprint 4)
- 🚀 **Portal Admin:** Dashboard, Grafo completo e Comunidades em /admin/* (Sprint 4)
- 🚀 **Campos Inteligentes:** bio, currículo (PDF), maturidade (0-10 IA) e o_que_busco (IA) — determinados automaticamente pela IA (Sprint 4)
- 🚀 **Comunidades de Pensamento:** Enriquecimento contínuo do grafo via Chain-of-Thought multi-agente e análise de clusters via **NetworkX** (Sprint 4)
- 🚀 **Engenharia de Prompt Avançada:** Agentes especialistas com contexto profundo do grafo (Sprint 4)

---

## 2. Fundamentação Teórica

A arquitetura do ARIANO é fundamentada em cinco pilares teóricos complementares, cada um com contribuições específicas para o sistema de matchmaking inteligente. Esta seção detalha os conceitos teóricos, sua relevância para o domínio de inovação acadêmica e como são implementados na prática.

### 2.1 Grafos de Conhecimento (Knowledge Graphs)

Um **grafo de conhecimento** (Knowledge Graph, KG) é uma estrutura de dados heterogênea composta por entidades representadas como **nós** (vértices) e seus relacionamentos como **arestas** (edges) tipadas e ponderadas. Formalmente, um KG pode ser definido como uma tripla `G = (V, E, R)` onde `V` é o conjunto de nós, `E` o conjunto de arestas e `R` o conjunto de tipos de relação.

No contexto do ARIANO, o grafo de conhecimento modela o ecossistema de inovação acadêmica:

- **Nós** representam: Estudantes, Pesquisadores, Professores, Editais, Skills (competências) e Áreas de atuação
- **Arestas** representam: `HAS_SKILL` (possui competência), `RESEARCHES_AREA` (pesquisa área), `REQUIRES_SKILL` (edital requer), `ELIGIBLE_FOR` (elegível para — **a aresta de match**), `SIMILAR_TO` (afinidade entre perfis) e `RELATED_TO` (complementaridade entre skills)

A vantagem fundamental de um grafo sobre modelos relacionais (SQL) reside na propriedade de **adjacência livre de índice** (index-free adjacency): cada nó mantém ponteiros diretos para seus vizinhos, tornando a travessia entre nós conectados uma operação **O(1)** constante, independente do volume total de dados. Em contraste, operações de JOIN em bancos relacionais crescem de forma quadrática ou exponencial com a complexidade e profundidade das relações — um gargalo crítico em sistemas que precisam cruzar múltiplas dimensões (skills × áreas × maturidade × elegibilidade).

Esta propriedade é o que permite ao ARIANO retornar matches instantaneamente após a pré-configuração do grafo, viabilizando a Fase 3 (consulta O(1)) descrita na architectura do sistema.

### 2.2 Agentes de IA como Configuradores de Grafo (Precomputed Relational Intelligence)

O conceito de **Precomputed Relational Intelligence** (Inteligência Relacional Pré-computada) é a filosofia central do ARIANO, inspirada no projeto **GitNexus** — um motor de inteligência de código que constrói knowledge graphs a partir de repositórios GitHub. A filosofia pode ser sintetizada em duas fases distintas:

```
FASE 1: Agentes IA processam dados → Configuram o grafo (offline, assíncrono)
FASE 2: Match = Query Cypher O(1) sobre grafo pré-configurado (online, instantâneo)
```

Esta separação entre **tempo de configuração** (compute-intensive, IA-driven) e **tempo de consulta** (O(1), query-only) é análoga ao paradigma de **compilação vs. execução** em linguagens de programação: o custo computacional pesado ocorre uma única vez, e todas as consultas subsequentes se beneficiam da estrutura pré-otimizada.

A abordagem difere radicalmente do padrão RAG (Retrieval-Augmented Generation) tradicional e do paradigma Graph-CoT puro:

| Dimensão | RAG Tradicional | Graph-CoT Puro | ARIANO (Precomputed + Graph-CoT Híbrido) |
|----------|----------------|----------------|------------------------------------------|
| **Processamento** | LLM processa dados a cada consulta | LLM raciocina iterativamente por consulta | Agentes processam dados **uma vez**, configuram o grafo. Graph-CoT apenas no enriquecimento |
| **Custo por consulta** | Alto (chamada LLM) | Muito alto (múltiplas chamadas LLM iterativas) | **Zero** (query Cypher pura) |
| **Latência** | Segundos | Dezenas de segundos | **Milissegundos** |
| **Qualidade do raciocínio** | Superficial (contexto limitado) | Profunda (iterativa, multi-hop) | **Profunda na configuração**, instantânea na consulta |
| **Escalabilidade** | Custo linear com consultas | Custo quadrático com consultas | Custo fixo (amortizado na configuração) |
| **Quando a IA atua** | Em cada consulta do usuário | Em cada consulta do usuário | Apenas na configuração (Fase 1) e enriquecimento (Fase 2) |

> **Insight:** O ARIANO combina o melhor dos dois mundos — usa Graph-CoT para **configurar** o grafo com raciocínio profundo (Fases 1 e 2), mas **serve** os resultados via query O(1) direta (Fase 3). Isso resolve o problema fundamental do Graph-CoT puro: latência e custo por consulta.

### 2.3 Quádrupla Hélice da Inovação

O modelo da **Quádrupla Hélice** (Quadruple Helix) é um framework de inovação sistêmica proposto por Carayannis & Campbell (2009) que expande a Tríplice Hélice clássica — definida por Etzkowitz & Leydesdorff (1995) como a interação dinâmica entre Academia, Governo e Indústria — ao incluir a **Sociedade Civil** como quarto pilar de inovação. A premissa central é que inovação sustentável emerge da **co-criação** entre todos os atores do ecossistema, não apenas da transferência tecnológica linear de um pilar para outro.

O CORETO implementa este modelo digitalmente, e o ARIANO é o mecanismo cognitivo que conecta esses pilares através de matchmaking inteligente. No MVP atual, o foco está na interseção **Academia ↔ Governo** (editais de fomento ↔ perfis acadêmicos), com a arquitetura preparada para expansão aos demais pilares.

### 2.4 Graph Chain-of-Thought (Graph-CoT) — Raciocínio Cognitivo sobre Grafos

O **Graph Chain-of-Thought (Graph-CoT)** é um paradigma emergente na intersecção entre Retrieval-Augmented Generation (RAG) e grafos de conhecimento, proposto como evolução do RAG tradicional para domínios com dados altamente relacionais. Diferente do RAG convencional — que trata cada documento como uma unidade independente de conhecimento e realiza lookup estático — o Graph-CoT permite que um LLM **raciocine iterativamente** sobre a estrutura do grafo, decidindo dinamicamente quais nós visitar, que conexões explorar e quando parar.

#### 2.4.1 Fundamentação — O Problema da Alucinação em Grafos

Large Language Models (LLMs) frequentemente geram conteúdo que aparenta ser factual mas carece de fundamentação empírica — o fenômeno conhecido como **alucinação** (Maynez et al., 2020). Modelos RAG tradicionais mitigam este problema ao incorporar corpora textuais externos como fonte de conhecimento, tratando cada documento como unidade isolada.

No entanto, informações do mundo real raramente existem isoladamente — elas estão **interconectadas**, formando redes de relações. Grafos de conhecimento armazenam informação não apenas em formato textual, mas também através de **conexões estruturadas entre entidades**, com arestas tipadas representando relações como `HAS_SKILL`, `REQUIRES_SKILL`, `SIMILAR_TO`. Esta diversidade relacional permite processos de recuperação e raciocínio significativamente mais ricos que abordagens puramente textuais.

#### 2.4.2 RAG Tradicional com Grafos vs. Graph-CoT

A literatura distingue duas abordagens fundamentais para integração de LLMs com grafos:

| Dimensão | RAG Tradicional com Grafos | Graph-CoT |
|----------|---------------------------|-----------|
| **Retrieval** | Queries pré-definidas (Cypher) retornam subgrafos estáticos | LLM decide dinamicamente o que buscar a cada iteração |
| **Raciocínio** | Lookup direto sobre dados estruturados | Raciocínio iterativo com loop `Thought → Action → Observation` |
| **Multi-hop** | Limitado a profundidades pré-definidas (Hop-0, Hop-1, Hop-2) | Dinâmico — o LLM decide a profundidade com base na necessidade |
| **Adaptação** | Estratégia fixa de retrieval | Estratégia adaptativa — ajusta retrieval com base no que já sabe |
| **Evidência** | Subgrafo inteiro como contexto (pode ser ruidoso) | Agregação seletiva — apenas informações relevantes entram no contexto |

#### 2.4.3 O Framework Graph-CoT — Três Sub-Passos Iterativos

Cada iteração do Graph-CoT consiste em três sub-passos, inspirado no paradigma ReAct (Yao et al., 2023):

```
LOOP até suficiência de informação:
  1. REASONING (Pensamento):
     → O LLM analisa a informação atual e determina quais dados adicionais são necessários do grafo
     → Documenta o raciocínio no scratchpad (cadeia de pensamento visível)

  2. INTERACTION (Ação):
     → O LLM formula ações usando primitivas do grafo:
       • RetrieveNode[query]            — busca o nó mais relevante via embeddings
       • NodeFeature[nó, atributo]      — inspeciona atributo específico de um nó
       • NeighbourCheck[nó, tipo]       — lista vizinhos de um tipo específico
       • NodeDegree[nó, tipo]           — conta conexões de um tipo específico

  3. EXECUTION (Observação):
     → O sistema executa a ação e retorna dados reais do grafo
     → O LLM incorpora a observação ao seu contexto e decide se precisa de mais informação
```

> **Referência de implementação:** O framework Cognitive-RAG (Reddy, 2024) implementa este paradigma em Python usando um `GraphAgent` que mantém um scratchpad de raciocínio e executa até `max_steps=15` iterações de Thought-Action-Observation antes de convergir em uma resposta final. Disponível em: https://github.com/Nikhilreddy024/Cognitive-RAG

#### 2.4.4 Aplicação no ARIANO — Graph-CoT Adaptado para Matchmaking

O ARIANO adapta o paradigma Graph-CoT para o domínio de matchmaking acadêmico, com modificações significativas que o tornam um **modelo híbrido** superior tanto ao RAG tradicional quanto ao Graph-CoT puro:

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
│  │  • Identifica clusters de afinidade dinâmicamente         │  │
│  │  • Cria SIMILAR_TO, RELATED_TO, OVERLAPS_WITH            │  │
│  │  • Re-calibra TODOS os scores com contexto expandido     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FASE 3 (CONSULTA) — O(1) DIRETO                         │  │
│  │  Sem IA, sem Graph-CoT, sem custo                        │  │
│  │  Match = query Cypher sobre grafo pré-enriquecido        │  │
│  │  Latência: milissegundos. Custo: zero.                   │  │
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

O paradigma **Cognitive RAG** (Reddy et al., 2024) propõe uma abordagem que imita processos cognitivos biológicos na recuperação e processamento de informação. Assim como o cérebro humano não processa informação em bloco — mas sim em ciclos de **atenção seletiva**, **memória de trabalho** e **raciocínio inferencial** — o Cognitive RAG implementa um loop cognitivo onde:

1. **Atenção Seletiva (Selective Retrieval):** O agente não busca toda informação disponível de uma vez — ele identifica qual informação específica precisa e busca apenas isso (análogo à atenção focal do córtex pré-frontal)

2. **Memória de Trabalho (Scratchpad):** O agente mantém um "rascunho" progressivo de raciocínio — cada observação do grafo é incorporada ao contexto, permitindo raciocínio acumulativo (análogo à memória de trabalho de Baddeley & Hitch, 1974)

3. **Raciocínio Inferencial (Step-wise Reasoning):** O agente conclui informações que não estão explícitas no grafo — se dois perfis compartilham 4 skills em comum e ambos têm alta maturidade, o agente pode inferir uma conexão `SIMILAR_TO` sem que ela exista explicitamente (análogo ao raciocínio dedutivo do neocórtex)

4. **Critério de Suficiência (Halting):** O agente decide autonomamente quando tem informação suficiente para gerar uma resposta — não consome passos desnecessários (análogo à metacognição — "saber que se sabe")

No ARIANO, este paradigma cognitivo se materializa especialmente no **ContextualAnalyzer** (Sprint 4), que opera como o "neocórtex" do sistema — analisando o grafo inteiro, identificando padrões latentes que nenhum agente individualmente perceberia, e criando conexões emergentes que enriquecem todo o ecossistema.

**Comparação com abordagens tradicionais — Profundidade de Raciocínio:**

| Abordagem | Profundidade | Analogia Cognitiva | Aplicação no ARIANO |
|-----------|-------------|--------------------|--------------------|
| **Hop-0** (nó único) | Superficial — apenas o nó mais relevante | Reflexo — resposta automática sem análise | Não utilizado |
| **Hop-1** (vizinhos diretos) | Rasa — nó + vizinhos imediatos | Associação simples — "isso me lembra de..." | Fase 3 (consulta O(1)) |
| **Hop-2** (vizinhos dos vizinhos) | Média — contexto expandido | Memória episódica — conexões indiretas | Fase 1 (cadastro, análise rápida) |
| **Graph-CoT** (dinâmico) | Profunda — iterativo até suficiência | Raciocínio deliberado — análise consciente | Fase 2 (enriquecimento, ContextualAnalyzer) |

> **Referência acadêmica:** O framework Cognitive-RAG demonstrou em benchmarks (datasets MAPLE, BioMedical, Legal, Amazon, GoodReads) que a abordagem Graph-CoT **supera consistentemente** estratégias hop-based em accuracy de resposta, justamente porque a profundidade de traversal é determinada pela complexidade da pergunta, não por um parâmetro fixo.
> Repositório: https://github.com/Nikhilreddy024/Cognitive-RAG

---

## 3. Referência de Design — GitNexus

O design visual e interativo (Dark theme com efeitos neon, hover rings e visualização do conhecimento mapeado em nós) do ARIANO foi inspirado profundamente no projeto **GitNexus**, servindo como modelo estético consolidado de sucesso para o nosso visualizador de grafos em interface web. O conceito original e a referência base que usamos pode ser explorado publicamente:

**Link do Repositório do GitNexus:** [https://github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus)

---

## 4. Arquitetura do Sistema

### 4.1 Visão Geral da Arquitetura

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
                     ┌──────────┴───────────────────────────┐
                     │       BACKEND (Python + FastAPI)       │
                     │                                       │
                     │  Auth (email/password + cookies JWT)   │
                     │  Agente Orquestrador (multi-agent)     │
                     │  ├─ ProfileAnalyzer (bio+CV → skills,  │
                     │  │   maturidade, o_que_busco)          │
                     │  ├─ EditalInterpreter                  │
                     │  ├─ EligibilityCalculator (scoring)    │
                     │  ├─ ContextualAnalyzer (Sprint 4)      │
                     │  └─ CommunityEnricher (Sprint 4)       │
                     │  Match Engine (Cypher O(1))            │
                     └──────────┬───────────────────────────┘
                                │ Bolt / Memory
                     ┌──────────┴───────────────────────────┐
                     │   DATA LAYER = "CÉREBRO" DO ARIANO    │
                     │   Neo4j / In-Memory Graph Database     │
                     │   Nós + Arestas + Comunidades CoT     │
                     │   Campos IA: maturidade, o_que_busco  │
                     └──────────────────────────────────────┘
```

### 4.2 Fluxo de Dados — Três Fases Distintas

#### FASE 1 — Cadastro + Match Estratégico (tempo real, visível ao usuário)

> Este é o fluxo do primeiro contato do usuário com a plataforma, na página `/user/cadastro` (CORETO). A IA faz o match estratégico em tempo real — o usuário vê o processamento acontecendo.

```
Usuário se cadastra em /user/cadastro
  → Preenche: nome, instituição, curso, bio, currículo (PDF)
  → NÃO seleciona tags de skills/áreas — a IA faz isso sozinha
  → Backend cria o nó no grafo
  → Orquestrador aciona agentes EM TEMPO REAL (visível na UI):
    → ProfileAnalyzer lê bio + currículo:
      → Extrai skills e áreas automaticamente
      → Determina maturidade (0-10) com justificativa
      → Gera o_que_busco como texto descritivo
    → EligibilityCalculator calcula matches:
      → Scoring: skills(40%) + area(25%) + maturidade(15%) + priority(10%) + context(10%)
      → o_que_busco como bônus (não eliminatório)
      → Cria arestas ELIGIBLE_FOR com score e justificativa
  → **Diálogo entre Agentes:** A interface exibe a "conversa" entre os agentes especialistas, humanizando o processo cognitivo.
  → **Grafo Vivo:** O grafo atua como o coração visual, expandindo-se e criando conexões de luz (neon) à medida que a IA valida as informações.
  → Usuário vê seus matches com scores e justificativas após a imersão cognitiva.
```

#### FASE 2 — Enriquecimento Contínuo (Comunidades de Pensamento)

> Em produção, este fluxo seria executado automaticamente a cada 24h. No MVP, é acionado manualmente pela página `/admin/comunidades`.

```
Ciclo de enriquecimento acionado (botão manual)
  → Agente Orquestrador analisa estado do grafo e decide ordem de ativação
    → ContextualAnalyzer varre o grafo completo:
      → Identifica clusters de afinidade entre acadêmicos
      → Cria arestas SIMILAR_TO entre perfis com alta sobreposição
      → Cria arestas RELATED_TO entre skills complementares
    → ProfileAnalyzer re-analisa perfis com contexto expandido (vizinhos N-hop)
      → Re-calcula maturidade com base em novas conexões
    → EditalInterpreter re-interpreta editais sabendo quais comunidades existem
    → EligibilityCalculator recalcula TODOS os scores com o grafo enriquecido
      → Scores sobem ou descem com base em raciocínio profundo dos agentes
        → Grafo mais inteligente, matches mais assertivos ✓
```

> **Conceito-chave:** Cada ciclo de enriquecimento faz o grafo funcionar como um **cérebro em evolução**. Um estudante que inicialmente tinha 70% de match com um edital pode subir para 88% porque o ContextualAnalyzer descobriu que colegas com skills similares tiveram excelente performance em editais da mesma agência.

#### FASE 3 — Consulta de Matches O(1) (pós-cadastro, instantâneo)

> Este é o fluxo quando o usuário JÁ está cadastrado e acessa `/user/matchs`. Os matches foram pré-computados na Fase 1 e enriquecidos na Fase 2.

```
Usuário acessa /user/matchs (já cadastrado)
  → Backend executa Cypher:
    MATCH (a {uid: $me})-[r:ELIGIBLE_FOR]->(e:Edital)
    RETURN a, r, e ORDER BY r.score DESC, e.funding DESC
  → O(1) via adjacência livre de índice
    → Matches pré-computados retornados instantaneamente
    → Filtros: editais, usuários similares
    → Desempate por funding quando scores iguais
```

### 4.3 Modelagem do Grafo

```
    ┌─────────────┐     HAS_SKILL     ┌────────────┐
    │  🎓 Student  │──────────────────>│  📚 Skill   │
    └─────────────┘                    └────────────┘
          │                                 ▲
          │ SIMILAR_TO (Sprint 4)           │
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

**Tipos de arestas:**

| Aresta | Tipo | Criada por | Descrição |
|--------|------|------------|----------|
| `HAS_SKILL` | Primária | ProfileAnalyzer | Acadêmico possui competência |
| `RESEARCHES_AREA` | Primária | ProfileAnalyzer | Acadêmico pesquisa área |
| `REQUIRES_SKILL` | Primária | EditalInterpreter | Edital requer competência |
| `TARGETS_AREA` | Primária | EditalInterpreter | Edital foca em área |
| `ELIGIBLE_FOR` | Primária | EligibilityCalculator | **Aresta de match** com score |
| `ADVISES` | Primária | Seed | Professor orienta estudante |
| `SIMILAR_TO` | Enriquecida | ContextualAnalyzer (Sprint 4) | Afinidade entre acadêmicos |
| `RELATED_TO` | Enriquecida | ContextualAnalyzer (Sprint 4) | Skills complementares |
| `OVERLAPS_WITH` | Enriquecida | ContextualAnalyzer (Sprint 4) | Áreas sobrepostas |

**Campos por entidade (atualizado Sprint 4):**

| Entidade | Campos preenchidos pelo usuário | Campos determinados pela IA / Sistema |
|----------|-------------------------------|-----------------------------|
| **Student** | name, email, password, institution, course, semester, bio, currículo (PDF) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills, areas |
| **Researcher** | name, email, password, institution, bio, currículo (PDF) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills, areas |
| **Professor** | name, email, password, institution, department, research_group, bio, currículo (PDF) | curriculo_texto (PyMuPDF), maturidade (0-10), o_que_busco, skills, areas |
| **Edital** | title, description, instituicao, edital_type, funding, deadline, min_maturidade | — (interpretado pelo EditalInterpreter) |

> **Nota:** `maturidade` (0-10) substitui o antigo `level`. É calculado automaticamente pelo ProfileAnalyzer com base em bio, currículo e contexto do grafo. `o_que_busco` é um texto gerado pela IA descrevendo o que o acadêmico busca, usado como bônus no scoring (não eliminatório). `lattes_url` e `curriculo_url` foram removidos. `agency` foi substituído por `instituicao`.
>
> **Extração de Currículo (PDF → Texto):**
> - O usuário faz upload do PDF do currículo **direto do computador** no formulário de cadastro
> - O backend recebe o arquivo temporariamente, extrai todo o texto via **PyMuPDF (fitz)** em <100ms
> - Salva **APENAS o texto extraído** no campo `curriculo_texto` do nó no grafo
> - O arquivo PDF é **descartado** — não é armazenado em nenhum lugar
> - Os agentes de IA usam `curriculo_texto` como contexto para análise profunda do perfil
>
> **Regra de Visibilidade do Edital:**
> - Um edital **só aparece como match visível** se seu `deadline > data de hoje`. Editais com deadline expirado são automaticamente excluídos de todos os resultados de match. É o **único critério eliminatório** do sistema.

**Exemplo de dados:**

```cypher
// Nós Academia (com novos campos Sprint 4)
CREATE (:Student {
  name: "João Pedro", email: "joao@uninassau.edu.br",
  institution: "UNINASSAU", course: "Ciência da Computação", semester: 7,
  bio: "Estudante apaixonado por IA e dados. Estagiei na Porto Digital...",
  curriculo_texto: "João Pedro Almeida. Formação: Ciência da Computação - UNINASSAU. Experiência: Estágio em Data Science na Porto Digital (2024-2025). Projetos: Sistema de recomendação com ML, Análise de sentimentos com NLP...",  // ← texto extraído do PDF via PyMuPDF (PDF descartado)
  maturidade: 6.5,       // ← determinado pela IA
  o_que_busco: "Oportunidades de pesquisa em Machine Learning aplicada à saúde"  // ← gerado pela IA
})

CREATE (:Researcher {
  name: "Dra. Maria Silva", email: "maria@ufpe.br",
  institution: "UFPE",
  bio: "Pesquisadora em NLP e IA generativa. 15 anos de experiência...",
  maturidade: 9.2         // ← determinado pela IA
})

// Nós Governo (campo agency → instituicao)
CREATE (:Edital {
  title: "FACEPE IA 2026", instituicao: "FACEPE",
  funding: 200000, min_maturidade: 5.0
})

// Skills e Areas (atribuídas automaticamente pela IA, sem seleção manual)
CREATE (:Skill {name: "Machine Learning"})
CREATE (:Area {name: "Saúde Digital"})

// Arestas (criadas pelos agentes)
CREATE (s)-[:HAS_SKILL {confidence: 0.95}]->(sk:Skill {name: "ML"})
CREATE (e)-[:REQUIRES_SKILL {priority: "essential"}]->(sk)
CREATE (s)-[:ELIGIBLE_FOR {score: 0.92, justification: "...", context_bonus: 0.05}]->(e)

// Arestas de enriquecimento (Sprint 4)
CREATE (s1:Student)-[:SIMILAR_TO {similarity: 0.87}]->(s2:Researcher)
CREATE (sk1:Skill {name: "ML"})-[:RELATED_TO {strength: 0.9}]->(sk2:Skill {name: "Deep Learning"})
```

**Cálculo de Score (Match):**

```
score = skills(40%) + area(25%) + maturidade(15%) + priority(10%) + context(5%) + community(5%)
```

| Critério extra | Efeito | Comportamento |
|----------------|--------|---------------|
| `o_que_busco` | Bônus | Se alinha com edital_type, adiciona bônus. NÃO eliminatório. |
| `funding` | Desempate | Não entra no score. Desempata quando scores são iguais. |
| `min_maturidade` | Penalizador | Se maturidade < min_maturidade, score é penalizado (não eliminatório). |
| `deadline` | **Eliminatório** | Se `deadline < hoje`, o edital **NÃO aparece** nos resultados. Único critério eliminatório do sistema. |

### 4.4 Comunidades de Pensamento — Graph-CoT Aplicado (Sprint 4)

O conceito de **Comunidades de Pensamento** é a materialização do paradigma Graph-CoT (seção 2.4) no domínio de matchmaking acadêmico. É o mecanismo que transforma o grafo de um banco de dados estático em um **cérebro evolutivo** — onde cada ciclo de enriquecimento cria novas sinapses (arestas) que tornam o sistema progressivamente mais inteligente, análogo ao processo de **potenciação de longo prazo** (LTP) na neurociência.

#### 4.4.1 Ciclo de Enriquecimento via Graph-CoT

O ContextualAnalyzer opera em um loop iterativo de raciocínio inspirado no paradigma ReAct (Thought → Action → Observation), com as seguintes primitivas adaptadas:

```
CICLO DE ENRIQUECIMENTO (ContextualAnalyzer — Graph-CoT):
═══════════════════════════════════════════════════════════

Passo 1 — REASONING (Pensamento):
  "Preciso identificar clusters de afinidade no grafo.
   Vou começar pelo nó com maior grau de conexões."

Passo 2 — ACTION (Interação com o Grafo):
  → NodeDegree[todos, HAS_SKILL]  → ranking de nós por conectividade
  → NeighbourCheck[nó_top, HAS_SKILL] → skills do nó mais conectado
  → RetrieveNode[skills_do_top] → buscar nós com skills similares

Passo 3 — OBSERVATION (Feedback do Grafo):
  "João Pedro (CC/UNINASSAU, maturidade=6.5) compartilha
   4 skills com Maria Silva (UFPE, maturidade=9.2):
   ML, NLP, Python, Data Science.
   Ambos pesquisam na área de Saúde Digital."

Passo 4 — REASONING (Inferência):
  "Há alta sobreposição de skills (4/5 = 80%) e mesma área.
   Devo criar uma aresta SIMILAR_TO com similarity=0.80.
   Maria tem maturidade 9.2 e match 92% com FACEPE IA.
   Isso sugere que João pode ter match subestimado — context_bonus."

Passo 5 — ACTION (Criação de Aresta):
  → CREATE (joao)-[:SIMILAR_TO {similarity: 0.80, shared_skills: 4}]->(maria)
  → UPDATE (joao)-[:ELIGIBLE_FOR]->(facepe) SET score += context_bonus

Passo 6 — OBSERVATION + HALT CHECK:
  "Aresta criada. João agora tem 1 vizinho SIMILAR_TO.
   Preciso verificar se há mais clusters... [CONTINUA LOOP]"
```

> **Analogia biológica:** Cada iteração do loop Graph-CoT é análoga a um ciclo de **atenção-processamento-consolidação** no cérebro humano. O "scratchpad" do agente funciona como a **memória de trabalho** (Baddeley & Hitch, 1974), acumulando informações parciais até que o critério de suficiência (halting condition) seja atingido — momento em que as novas conexões são "consolidadas" no grafo, equivalente à transferência da memória de curto prazo para memória de longo prazo.

#### 4.4.2 Três Subciclos do Enriquecimento

O ciclo completo de enriquecimento, orquestrado pelo Orchestrator Agent, consiste em três subciclos sequenciais:

**Subciclo A — Detecção de Clusters (ContextualAnalyzer):**
1. Varre todos os nós acadêmicos usando `NeighbourCheck[nó, HAS_SKILL]`
2. Calcula overlap de skills entre pares de nós via `NodeFeature[nó, skills]`
3. Quando overlap ≥ 60%, cria aresta `SIMILAR_TO` com o grau de similaridade
4. Skills que co-ocorrem em ≥ 3 perfis bem-sucedidos (com matches ≥ 80%) são conectadas via `RELATED_TO`
5. Áreas com interseção temática detectada pelo LLM recebem arestas `OVERLAPS_WITH`

**Subciclo B — Re-análise com Contexto Expandido (ProfileAnalyzer re-run):**
1. Para cada nó acadêmico, o agente agora recebe o contexto expandido via `get_entity_deep_context(uid, depth=3)` — que inclui vizinhos diretos, vizinhos dos vizinhos, e as novas arestas `SIMILAR_TO`
2. O agente re-calcula `maturidade` com base no novo contexto (um acadêmico cercado por pesquisadores de alta maturidade pode ter sua maturidade ajustada para cima)
3. O agente re-gera `o_que_busco` com consciência de comunidade

**Subciclo C — Re-calibração de Scores (EligibilityCalculator re-scoring):**
1. Todos os scores de match são recalculados usando a fórmula enriquecida:
   ```
   score_final = score_base + context_bonus + community_relevance
   ```
2. `context_bonus` reflete padrões de sucesso descobertos no grafo — se vizinhos SIMILAR_TO do acadêmico têm matches altos com editais similares, o acadêmico recebe um bônus proporcional
3. `community_relevance` mede o quão integrado o acadêmico está na rede — perfis mais conectados (maior grau via `NodeDegree`) recebem scores ligeiramente superiores

**Resultado:** Os próximos matches são mais assertivos porque o agente de match tem acesso a **muito mais contexto** — não apenas as skills diretas do acadêmico, mas toda a rede de afinidades, padrões de sucesso descobertos, e inferências sobre capacidades latentes.

#### 4.4.3 Visualização de Comunidades via NetworkX (Sprint 4)

A detecção e visualização das Comunidades de Pensamento é potencializada pelo **NetworkX 3.x** como motor computacional server-side. A integração funciona em três camadas:

**Camada 1 — Construção do Grafo NetworkX (Backend):**
O serviço `graph_visualizer.py` sincroniza o grafo Neo4j para uma instância NetworkX in-memory. Nós e arestas são importados com seus atributos (tipo, maturidade, skills, scores). Este grafo Python é a base para todos os cálculos de layout e comunidade.

```python
# graph_visualizer.py — Pipeline de Visualização
import networkx as nx

# 1. Carregar grafo do Neo4j para NetworkX
G = nx.Graph()
for node in neo4j_nodes:
    G.add_node(node.uid, type=node.type, label=node.name, ...)
for edge in neo4j_edges:
    G.add_edge(edge.source, edge.target, weight=edge.score, ...)

# 2. Detectar comunidades via Louvain (Graph-CoT materializado)
communities = nx.community.louvain_communities(G, weight='weight')
# → [{uid1, uid2, uid3}, {uid4, uid5}, ...]

# 3. Computar layout com posições estáveis
positions = nx.spring_layout(G, k=2.0, iterations=50, seed=42)
# → {uid: (x, y), ...}

# 4. Retornar JSON para React SVG
return {
    "nodes": [{"id": uid, "x": pos[0], "y": pos[1], 
               "community": community_id, "type": node_type, ...}],
    "edges": [...],
    "communities": [{"id": i, "members": list(c), "color": palette[i]} ...]
}
```

**Camada 2 — API REST (FastAPI):**
Endpoint `GET /api/graph/layout?scope=full|personal&uid=xxx` retorna o JSON com posições pre-computadas. O parâmetro `scope=personal` filtra apenas o ego-network do usuário (vizinhos diretos + comunidade). O backend cacheia resultados por 5 minutos (TTL), invalidando ao receber novos nós ou ao executar o ciclo de enriquecimento.

**Camada 3 — Renderização React SVG (Frontend):**
O componente `MiniGraph.tsx` / `CommunityGraph.tsx` recebe o JSON e renderiza SVG puro com React:
- Nós posicionados pelas coordenadas `(x, y)` do NetworkX
- Cores por comunidade (`community_id` → paleta neon)
- Arestas com gradientes que refletem o score de match
- Interatividade via React event handlers (hover → tooltip, click → detalhes)
- Animações de entrada via Framer Motion (nós "aparecem" por comunidade)

> **Vantagem arquitetural:** Ao mover o cálculo de layout para o backend (NetworkX), o ARIANO unifica num único pipeline Python a detecção de comunidades (`louvain_communities`), o raciocínio dos agentes Graph-CoT (`graph_tools.py`), e a análise de centralidade (`betweenness_centrality`, `degree_centrality`) — eliminando a duplicação que existiria se D3.js calculasse layouts no browser enquanto agentes Python analisassem o mesmo grafo no servidor. O frontend se torna um "thin client" de visualização, recebendo posições prontas e focando apenas em UX/UI — resultado: **menor latência**, **menos JavaScript**, **consistência visual** entre o que a IA "vê" and o que o usuário vê.

### 4.5 Engenharia de Prompt Avançada — Graph-CoT Nativo nos Agentes (Sprint 4)

Os agentes do ARIANO são configurados com prompts especializados que implementam o paradigma Graph-CoT (seção 2.4) diretamente na engenharia de prompt, tornando-os verdadeiros **agentes cognitivos** com capacidade de raciocínio iterativo, memória de trabalho (scratchpad) e critério de suficiência autônomo.

#### 4.5.1 Arquitetura de Prompt — Três Pilares

1. **Contexto Profundo do Grafo (Retrieval Layer):**
   Antes de processar qualquer entidade, o agente recebe o subgrafo expandido via `get_entity_deep_context(uid, depth)`, que inclui:
   - Vizinhos diretos e suas features (skills, áreas, maturidade)
   - Matches existentes de perfis similares (via `SIMILAR_TO`)
   - Padrões de sucesso na comunidade (via `RELATED_TO`)
   - Profundidade de busca ajustada dinamicamente por contexto

2. **Raciocínio em Cadeia com Scratchpad (Reasoning Layer):**
   Baseado no paradigma Graph-CoT, os prompts instruem os agentes a manter um scratchpad de raciocínio explícito:
   ```
   [SCRATCHPAD — ProfileAnalyzer para João Pedro]:
   
   Step 1 — Leitura do perfil:
     Bio: "Estudante de CC, 7º semestre, estagiou na Porto Digital..."
     Currículo: "Formação em CC-UNINASSAU. Experiência: Data Science..."
     → Identifico forte background em dados e ML aplicado.
   
   Step 2 — Contexto do grafo (via get_similar_profiles):
     Perfis similares encontrados: Maria Silva (9.2), Pedro Santos (7.1)
     Skills compartilhadas: ML (3/3), Python (3/3), NLP (2/3)
     → O cluster indica foco em IA aplicada à saúde.
   
   Step 3 — Inferência de maturidade:
     Semestre: 7/10 (0.7)
     Estágio: Porto Digital (+0.5 por experiência prática)
     Bio depth: descrição detalhada (+0.3 por autoconsciência)
     Cluster avg: (9.2 + 7.1) / 2 = 8.15 (referência)
     → Maturidade calculada: 6.5 (abaixo da média do cluster)
     → Justificativa: "Bom potencial, experiência prática sólida,
        mas falta profundidade em pesquisa acadêmica formal."
   
   Step 4 — Geração de o_que_busco:
     Com base nos passos 1-3, infiro que João busca:
     → "Oportunidades de pesquisa aplicada em Machine Learning
        e NLP, preferencialmente em projetos de impacto social
        na área de Saúde Digital."
   
   Step 5 — Extração de skills e áreas (AUTOMÁTICO, sem tags manuais):
     Skills: [ML, NLP, Python, Data Science, Análise de Dados]
     Áreas: [Inteligência Artificial, Saúde Digital, Ciência de Dados]
     Confidence: [0.95, 0.82, 0.98, 0.90, 0.75]
   ```

3. **Contextos Presetados por Fluxo (Orchestration Layer):**
   Os agentes operam com diferentes configurações que ajustam profundidade de raciocínio, temperatura do LLM e number de primitivas Graph-CoT disponíveis:

   | Contexto | Profundidade | Temperatura | Primitivas Graph-CoT | Uso |
   |----------|-------------|-------------|---------------------|-----|
   | `CONTEXT_CADASTRO` | Hop-2 (rápida) | 0.3 (determinística) | RetrieveNode, NodeFeature | Página CORETO — análise rápida + match imediato |
   | `CONTEXT_ENRICHMENT` | Graph-CoT completo | 0.7 (criativa) | Todas (RetrieveNode, NodeFeature, NeighbourCheck, NodeDegree) | Comunidades de Pensamento — análise profunda |
   | `CONTEXT_RECALIBRATION` | Hop-3 (expandida) | 0.2 (mais determinística) | NodeFeature, NeighbourCheck | Re-scoring com novas conexões |

   Cada contexto ajusta os prompts, permitindo que os mesmos agentes sejam ativados em ordens variadas pelo Orquestrador dependendo da necessidade — maximizando a reutilização de código enquanto adapta o comportamento cognitivo.

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
│  ├─ Tailwind CSS v4 (Design System: Teal Neon/Glassmorphism)│
│  ├─ React SVG (renderização de grafo leve e interativa)   │
│  └─ Framer Motion (animações e transições fluídas)        │
│                                                           │
│  ⚙️ BACKEND                                               │
│  ├─ Python 3.12 + FastAPI                                 │
│  ├─ LangChain + LangChain-OpenAI (agentes IA)             │
│  ├─ NVIDIA Nemotron 3 Super 120B via OpenRouter (LLM)     │
│  ├─ NetworkX 3.x (graph layout, community detection,      │
│  │   centrality analysis, Graph-CoT visualization)        │
│  └─ Neomodel (OGM) + Neo4j Driver (Cypher nativo)         │
│                                                           │
│  🗄️ DADOS                                                 │
│  ├─ Neo4j 5.x Community (graph database)                  │
│  └─ Memory Graph Engine (Fallback O(1) nativo)            │
│                                                           │
│  🔧 DEVOPS & DEPLOY                                       │
│  ├─ **Vercel Fullstack Deployment** (Monorepo)            │
│  ├─ **Vercel Secrets / Env Vars** (Gestão Segura)           │
│  └─ GitHub Actions (CI/CD)                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Justificativas Tecnológicas

A arquitetura do desenvolvimento atende rigorosos padrões de Boas Práticas, assegurando escalabilidade limpa e manutenibilidade na transição entre MVP Mockado e Serviço Completo:

| **Vercel Fullstack Deploy** | **Escalabilidade & Agilidade:** O uso do Vercel para hospedar o backend FastAPI (via Serverless Functions) e o frontend Vite em um único repositório garante sincronia total de deploy e latência reduzida nas chamadas de API. |
| **Secrets Management** | **Segurança Pró-Ativa:** Implementação de variáveis de ambiente restritas para chaves LLM (OpenRouter), garantindo que credenciais sensíveis nunca vazem no repositório público. |
| **NetworkX 3.x (Graph Engine Python)** | **Computação Server-Side Nativa:** NetworkX substitui D3.js como motor de grafos, movendo toda computação de layout (`spring_layout`, `forceatlas2_layout`), detecção de comunidades (`louvain_communities`) e análise de centralidade para o backend Python. O frontend recebe posições pré-computadas via API e renderiza SVG leve com React — eliminando cálculos pesados no browser e integrando nativamente com as Comunidades de Pensamento (Graph-CoT). |
| **Arquitetura Vite + React (SPA)** | **Separação de Preocupações (SoC):** Por ser 100% Client-Side focado, eliminamos a complexidade misturada do padrão SSR (como o NextJS traria). Com Vite o desenvolvimento tem Hot Reload menor que 50ms, facilitando UI iterativas robustas como Visualizadores Force Directed. |
| **Banco Mock Matemático Restrito** | **Testabilidade Previsível:** Ao criarmos um Mock com exatas 20 entidades para todos os grupos, testamos nossa interface em bounds de uso claros. Além disso, as atribuições de arestas (`edges`) seguiram permutações predeterminadas garantidas (Ex: 1 aluno para 10 editais precisos), refletindo comportamento em ambiente real previsível. |
| **TypeScript / Zod** | **Segurança de Código (Type Safety):** Ao criar tipos `Entity`, `Match`, `Skill` rígidos garantimos total solidez nas travessias de loops e mapeamentos no layout final, evitando qualquer "undefined" exceptions no navegador do usuário final. |
| **Tailwind CSS e Clean CSS** | **Tokens via Custom Properties:** Variáveis bem definidas para suportar todo o UI (ex: `color-void`, cores de nodes), permitindo padronização visual completa entre módulos. |
| **Design Controlado e Não Poluído** | **Feedback Visual Progressivo:** Interfaces cognitivamente amigáveis. Mostramos ligações nos grafos só em `hovers` sob demanda de nós ou seleções via cliques (estabilização focada), com `dimming` para clarear os entornos, evitando "espaguetes visuais" indesejados no grafo. |
| **Paradigma Neo4j (Backend)** | **Big O Eficiente:** Preparando para uso full Graph-like (Cypher), priorizamos acesso aos vizinhos em memória `O(1)`, substituindo a curva de gargalo de `JOINs O(n^2)` contidos em bancos de dados relacionais. |

---

## 6. Design System — Blue Neon Edition

### 6.1 Paleta de Cores

Adaptada do GitNexus (tema roxo) para **azul neon** do ARIANO:

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-void` | `#020810` | Background principal (tom azulado escuro) |
| `--color-deep` | `#060d18` | Áreas secundárias |
| `--color-surface` | `#0a1420` | Superfícies de painéis |
| `--color-elevated` | `#101c2a` | Elementos elevados |
| `--color-hover` | `#142235` | Hover state |
| `--color-border-subtle` | `#1e2e3a` | Bordas sutis |
| `--color-border-default` | `#2a3a4a` | Bordas padrão |
| `--color-text-primary` | `#e4e4ed` | Texto principal |
| `--color-text-secondary` | `#8888a0` | Texto secundário |
| `--color-accent` | `#0ea5e9` | **Accent principal (azul neon sky-500)** |
| `--color-accent-glow` | `#38bdf8` | Glow effect (sky-400) |
| `--color-accent-dim` | `#0369a1` | Accent dark |

### 6.2 Cores dos Nós

| Entidade | Cor | Hex | Justificativa |
|----------|-----|-----|---------------|
| **Edital** | Azul Escuro | `#2563eb` | Nó central, tom institucional/governamental |
| **Student** | Cyan Brilhante | `#00e5ff` | Tom vibrante ciano, destaque na academia |
| **Researcher** | Emerald | `#10b981` | Ciência, crescimento |
| **Professor** | Amber | `#f59e0b` | Experiência, destaque |
| **Skill** | Violet | `#8b5cf6` | Competências |
| **Area** | Indigo | `#6366f1` | Áreas de atuação |
| **ELIGIBLE_FOR** | Gradiente Cyan→Blue | `#38bdf8` → `#2563eb` | Aresta de match |

### 6.3 Tipografia

| Token | Valor |
|-------|-------|
| `--font-sans` | `'Outfit', system-ui, sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` |

---

## 7. Product Backlog (User Stories)

### Epic 1: Infraestrutura

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-01 | Como desenvolvedor, quero um ambiente Docker configurado para que o Neo4j e o backend rodem em containers | Alta | 3 pts |
| US-02 | Como desenvolvedor, quero CI/CD com GitHub Actions para que cada PR seja validada automaticamente | Média | 2 pts |
| US-03 | Como desenvolvedor, quero a estrutura de pastas do projeto organizada para facilitar a colaboração | Alta | 1 pt |

### Epic 2: Data Layer

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-04 | Como PO, quero nós modelados para Student, Researcher, Professor e Edital no Neo4j | Alta | 3 pts |
| US-05 | Como PO, quero nós auxiliares Skill e Area para conectividade no grafo | Alta | 2 pts |
| US-06 | Como PO, quero arestas HAS_SKILL, RESEARCHES_AREA, REQUIRES_SKILL e ELIGIBLE_FOR | Alta | 3 pts |
| US-07 | Como tester, quero dados seed com ≥15 acadêmicos + ≥8 editais fictícios | Média | 2 pts |

### Epic 3: Agentes IA (Graph Configurators)

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-08 | Como PO, quero que o ProfileAnalyzer extraia skills e classifique áreas de cadastros acadêmicos | Alta | 5 pts |
| US-09 | Como PO, quero que o EditalInterpreter extraia requisitos e áreas de editais | Alta | 5 pts |
| US-10 | Como PO, quero que o EligibilityCalculator calcule scores de match e crie arestas ELIGIBLE_FOR | Alta | 8 pts |
| US-11 | Como usuário, quero que o match seja uma query Cypher pura retornando resultados instantâneos | Alta | 3 pts |

### Epic 4: Frontend

| ID | User Story | Prioridade | Estimativa |
|----|-----------|------------|------------|
| US-12 | Como usuário, quero um dashboard mostrando totais de acadêmicos, editais e matches | Média | 3 pts |
| US-13 | Como usuário, quero cadastrar perfis acadêmicos via formulário | Alta | 3 pts |
| US-14 | Como usuário, quero cadastrar editais governamentais via formulário | Alta | 3 pts |
| US-15 | Como usuário, quero visualizar o grafo interativamente com nós tipados e cores | Alta | 8 pts |
| US-16 | Como usuário, quero ver matches ranqueados com score e justificativa | Alta | 5 pts |
| US-17 | Como usuário, quero clicar em um nó do grafo e ver seus detalhes e conexões | Média | 3 pts |

---

## 8. Sprint Planning — Roadmap (Práticas Ágeis)

A estratégia de desenvolvimento do projeto ARIANO é fortemente pautada nos princípios ágeis utilizando uma adaptação do **framework SCRUM** para o nosso contexto acadêmico. Todas as sprints contaram com sessões de *Sprint Planning* para refinar os requisitos em histórias do usuário, *Sprint Reviews* para garantir as entregas incrementais e *Retrospectives* para contínuos ajustes de rota e validação da equipe.

> **💡 Acompanhamento Online (Kanban):** O detalhamento granular das tarefas, seus respectivos responsáveis (Team Assignees), Story Points e status de execução encontram-se ativamente geridos no nosso painel do **Notion**. Ele serve como fonte da verdade oficial para a entrega ao professor e materialização contínua das responsabilidades. As seções abaixo resumem os escopos gerais e o que foi realizado em cada iteração:

### Sprint 0 — Fundação (Semana 1) ✅ CONCLUÍDA

**Foco:** Planejamento arquitetural e setup do ambiente base.  
Trabalhamos a estruturação institucional de repositórios, documentação e modelagens. Adotamos o SCRUM para fragmentar o entendimento inicial do ecossistema e conceber o conceito do motor ARIANO. Estabelecemos a versão inicial do Design System (Blue Neon), criamos documentos de visão, selecionamos nossa stack principal e nivelamos o ambiente para os times de Frontend, Backend e Infraestrutura trabalharem de modo assíncrono.

### Sprint 1 — Frontend + Visualização de Grafo (Semana 2-3) ✅ CONCLUÍDA

**Foco:** Interface de Usuário (UI) robusta e visualização fidedigna dos nós em simulação controlada.  
O ciclo desta sprint validou nosso modelo abstrato num painel de visualização utilizável e analítico. Consolidando as dailies de alinhamento técnico, fechamos com sucesso a migração tecnológica para visualizadores em rede utilizando grafos interativos. Aplicamos também uma governança restrita de dados em Mock para limitação segura e previsível focando na performance de navegação dos sub-componentes visuais, garantindo os cenários de usabilidade planejados no Design Review. Na Sprint 4, a visualização é migrada para **NetworkX** (backend) com renderização React SVG (frontend), eliminando dependências JavaScript pesadas e integrando nativamente a detecção de Comunidades de Pensamento via `louvain_communities()`.

### Sprint 2 — Data Layer, APIs e Agentes IA (Semana 4-5) ✅ CONCLUÍDA

**Foco:** Construir a "Core Engine" implementando agentes de inteligência artificial (LangChain + NVIDIA Nemotron 3 Super via OpenRouter) interligados com instâncias Neo4j.  
O planejamento desta sprint engloba o nascimento do núcleo matemático do nosso Produto. As cerimônias se voltam para discutir e integrar o motor de inferência aos endpoints via FastAPI. Os agentes assumem a responsabilidade primária de interpretar os dados e arquitetarmos conexões lógicas e ponderadas sob comandos Cypher diretamente no Neo4j, conectando e ativando o banco de dados orientado a grafos.

**Entregáveis técnicos da Sprint 2:**
- **ProfileAnalyzer:** Agente que extrai skills e classifica áreas acadêmicas via Nemotron 3 Super (com fallback rule-based)
- **EditalInterpreter:** Agente que interpreta editais e extrai requisitos técnicos via Nemotron 3 Super
- **EligibilityCalculator:** Agente principal que calcula scores multi-dimensionais (skill 45%, area 25%, level 15%, priority 15%) e cria arestas ELIGIBLE_FOR
- **Match Engine:** Motor de consulta O(1) via Cypher puro sobre arestas pré-computadas
- **Neo4j Driver Nativo:** Wrapper para execução de queries Cypher complexas
- **Agent API Routes:** Endpoints REST completos para operações dos agentes
- **Seed + Pipeline:** Script automatizado para popular banco e executar pipeline de agentes

### Sprint 3 — Integração, Deploy e Security Hardening (Semana 5-6) ✅ CONCLUÍDA

**Foco:** Garantir execução global e proteção de dados sensíveis.  
Finalizamos a integração total E2E, removendo mocks e estabilizando a comunicação via Axios. O grande marco foi o **Deploy Fullstack no Vercel**, onde configuramos um monorepo que hospeda tanto a lógica de IA (Python) quanto a interface. Implementamos camadas de segurança via **Environment Variables (Secrets)** para proteger as chaves do NVIDIA Nemotron, e refatoramos a estrutura de pastas movendo o core do app para a raiz, garantindo que o backend seja nativamente descoberto pelos ambientes de nuvem.

**Expectativas Cumpridas e Entregas (Sprint 3):**
- **Integração Total:** Comunicação fluída entre interface React e motor FastAPI sem dependência de dados estáticos.
- **Ambiente de Produção Vivo:** App acessível publicamente via Vercel com escalabilidade serverless.
- **Segurança Blindada:** API Keys do OpenRouter/NVIDIA tratadas como segredos de infraestrutura, fora do versionamento.
- **Robustez Pydantic:** Configurações de ambiente validadas e corrigidas para suporte a múltiplos contextos (Local vs Prod).
- **Consolidação de Agentes:** Pipeline completo de análise → interpretação → matchmaking rodando em produção.

### Sprint 4 — Inteligência Profunda, Portais & Experiência (Semana 7-8) 🚀 EM ANDAMENTO

**Foco:** Transformar o ARIANO em um produto completo com dois portais (Usuário e Admin), autenticação, cadastro inteligente com match visível em tempo real, comunidades de pensamento e excelência visual.

**Pilares e Entregas:**

| Pilar | Entrega | Impacto |
|-------|---------|--------|
| 🔐 **Autenticação Dual** | Login com cookies JWT, dois perfis simultâneos (user + admin), popup persistente | Base para portais separados |
| 🧠 **Inteligência Profunda** | Modelo de dados atualizado (bio, currículo, maturidade IA, o_que_busco IA) + agentes especialistas + orquestrador | IA determina automaticamente skills, áreas, maturidade e objetivos |
| 🎯 **CORETO — Match Visível** | Cadastro com match estratégico em tempo real pela IA (não O(1)) — o usuário vê a IA trabalhando | **PRINCIPAL ENTREGA DO MVP** — demonstração viva em sala |
| 👤 **Portal do Usuário** | /user/profile, /user/matchs (O(1)), /user/ecossistema (grafo pessoal) | Experiência personalizada para o académico |
| 🔗 **Comunidades de Pensamento** | Ciclo de enriquecimento do grafo via Chain-of-Thought multi-agente | Grafo fica progressivamente mais inteligente |
| ✨ **Excelência Visual** | Animações fluidas, polimento UX/UI, page transitions | Impacto visual máximo na apresentação |
| 🔍 **Verificação Final** | Auditoria completa de UX/UI (10+ páginas, desktop + mobile) | Gate de qualidade antes da entrega |

**Entregas técnicas detalhadas da Sprint 4:**

1. **Modelo de Dados Atualizado + Engenharia de Prompt Avançada:**
   - Novos campos: `bio` (descrição livre), `curriculo_url` (PDF), `maturidade` (0-10, IA), `o_que_busco` (IA)
   - Removidos: `lattes_url`, `level`. Renomeados: `agency` → `instituicao`, `min_level` → `min_maturidade`
   - Novos agentes: `Orchestrator` (controle de fluxo), `ContextualAnalyzer` (análise profunda)
   - Prompts especialistas com Chain-of-Thought — IA atribui skills e áreas automaticamente
   - Scoring: skills(40%) + area(25%) + maturidade(15%) + priority(10%) + context(10%). `o_que_busco` como bônus, `funding` como desempate

2. **Sistema de Autenticação:**
   - Login popup com email/senha, cookies JWT HttpOnly (7 dias)
   - Dois perfis simultâneos: `ariano_user` + `ariano_admin`
   - Popup não pode ser ignorado (shake animation + campos vermelhos)
   - Admin sem opção "Criar Conta" — conteúdo fica em loading se não logado

3. **Página CORETO — Cadastro + Match Estratégico Visível em `/user/cadastro`:**
   - Formulário tipo (Studante/Pesquisador/Professor) com campos adaptados por tipo
   - SEM tags manuais — a IA extrai skills e áreas automaticamente do bio + currículo
   - Pipeline visual mostrando cada agente processando em tempo real (com timing em ms)
   - Grafo SVG (posições pre-computadas via NetworkX) animando a criação do nó e suas conexões enquanto IA trabalha
   - Cards de resultado com score bars + justificativa

4. **Portal do Usuário (`/user/*`):**
   - `/user/profile`: Visualizar/editar perfil. Mostra maturidade e o_que_busco (read-only IA)
   - `/user/matchs`: Matches pessoais via O(1). Filtros: editais vs usuários similares
   - `/user/ecossistema`: Grafo pessoal (layout NetworkX) mostrando APENAS nós conectados ao usuário

5. **Portal Admin (`/admin/*`):**
   - Migração das páginas existentes: Dashboard, Acadêmicos, Editais, Matches, Grafo
   - Nova página: `/admin/comunidades` (enriquecimento do grafo)

6. **Comunidades de Pensamento (`/admin/comunidades`):**
   - Botão para executar ciclo manualmente (prod: cada 24h)
   - Detecção de comunidades via NetworkX `louvain_communities()`, renderização React SVG
   - Timeline do Orquestrador mostrando agentes em cadeia + scratchpad Graph-CoT visível
   - Painel Before/After (ex: "72% → 88% (+16%)")

7. **Animações + Polimento + Estabilização:**
   - Breathing effect, pulse rings, edge drawing, page transitions
   - Label collision, skeletons, toast notifications, error boundary

8. **Verificação Final de UX/UI:**
   - Auditoria visual de 10+ páginas (desktop + mobile)
   - Simulação cronometrada da apresentação (5 min)
   - Deploy final na Vercel

---

## 9. Critérios de Aceite (Definition of Done)

O MVP será considerado **Done** quando:

- [x] Grafo populado com ≥ 15 acadêmicos + ≥ 8 editais + arestas configuradas por agentes
- [x] Agentes IA (NVIDIA Nemotron 3 via OpenRouter) criam e configuram o grafo (nós, arestas, pesos) antes do match
- [x] Match instantâneo e robusto com endpoints de backend integrados com Frontend
- [x] Execução nativa zero-config (A API e Grafo executam no Memory Database O(1))
- [x] Deploy Fullstack funcional em URL pública (Vercel)
- [x] Gestão de Segredos (API Keys) via Environment Variables segura
- [x] Frontend otimizado com dashboard, cadastro e visualizador de grafo interativo 100% dinâmicos
- [x] CI/CD testado
- [x] Design consistente com tema azul neon (Blue Neon Edition)
- [ ] Campos bio, currículo (upload PDF → texto extraído via PyMuPDF, PDF descartado), maturidade (IA) e o_que_busco (IA) funcionais (Sprint 4)
- [ ] Autenticação com cookies JWT + dual login (user + admin simultaneamente) (Sprint 4)
- [ ] Página CORETO com cadastro + match estratégico visível em tempo real (Sprint 4)
- [ ] Portal Usuário: Profile, Matchs O(1), Ecossistema em /user/* (Sprint 4)
- [ ] Portal Admin: todas páginas existentes sob /admin/* (Sprint 4)
- [ ] Graph-CoT Primitives (graph_tools.py) operacionais (Sprint 4)
- [ ] Comunidades de Pensamento com Graph-CoT iterativo funcional em /admin/comunidades (Sprint 4)
- [ ] Verificação final de UX/UI aprovada (10+ páginas, desktop + mobile) (Sprint 4)

---

## 10. Estrutura do Repositório

```text
ProjetoARIANO/
├── .github/workflows/ci.yml
├── app/                               # ⚙️ BACKEND
│   ├── main.py
│   ├── agents/
│   │   ├── __init__.py                # Registry de contextos (Graph-CoT config)
│   │   ├── profile_analyzer.py        # Graph-CoT sequencial: bio+CV → scratchpad → maturidade, skills
│   │   ├── edital_interpreter.py
│   │   ├── eligibility_calculator.py  # Scoring contextual + node_degree
│   │   ├── orchestrator.py            # 🆕 Orquestrador Graph-CoT aware
│   │   └── contextual_analyzer.py     # 🆕 Graph-CoT iterativo: Thought→Action→Observation
│   ├── api/
│   │   ├── routes.py                  # CRUD (campos atualizados)
│   │   ├── agent_routes.py
│   │   └── auth_routes.py             # 🆕 Login/Register/Logout
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── neo4j_driver.py            # Deep context queries
│   │   └── graph_tools.py             # 🆕 Primitivas Graph-CoT: retrieve_node, node_feature, neighbour_check, node_degree
│   ├── models/
│   │   ├── graph.py                   # Neomodel (novos campos)
│   │   └── schemas.py                 # Pydantic (novos campos)
│   └── services/
│       ├── crud.py
│       ├── pdf_extractor.py               # 🆕 PyMuPDF (fitz) — PDF upload → texto extraído, PDF descartado
│       ├── graph_visualizer.py            # 🆕 NetworkX: layout + comunidades → JSON para React SVG
│       ├── match_engine.py                # Deadline filter: WHERE e.deadline > date()
│       ├── seed_native.py
│       └── seed_and_configure.py
├── api/
│   └── index.py                       # 🚀 Vercel serverless
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Rotas /user/* + /admin/*
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx         # 🆕 Auth dual
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── UserSidebar.tsx     # 🆕 Menu usuário
│   │   │   │   └── AdminSidebar.tsx    # 🆕 Menu admin
│   │   │   ├── AuthPopup.tsx           # 🆕 Login popup
│   │   │   ├── ProtectedRoute.tsx      # 🆕 Guard de rota
│   │   │   ├── AgentProcessingTimeline.tsx
│   │   │   ├── MiniGraph.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # 🆕
│   │   │   └── useAgentPipeline.ts    # 🆕
│   │   ├── pages/
│   │   │   ├── user/                  # 🆕 PORTAL USUÁRIO
│   │   │   │   ├── CadastroPage.tsx   # CORETO registration
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── MatchsPage.tsx     # O(1) queries
│   │   │   │   └── EcossistemaPage.tsx # Grafo pessoal
│   │   │   └── admin/                 # PORTAL ADMIN
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── AcademicosPage.tsx
│   │   │       ├── EditaisPage.tsx
│   │   │       ├── MatchesPage.tsx
│   │   │       ├── GrafoPage.tsx
│   │   │       └── ComunidadesPage.tsx # 🆕
│   │   ├── lib/api.ts
│   │   └── types/index.ts
│   └── package.json
├── Prototype v0/                      # 📋 DOCUMENTAÇÃO
│   ├── Docs/01_DOCUMENTO_PROJETO_ARIANO.md
│   └── implementation_plan.md
├── vercel.json
└── README.md
```

---

## 11. Ferramentas e Qualidade

| Ferramenta | Propósito | Quando Executa |
|------------|-----------|---------------|
| **ESLint** | Linting JS/TS | A cada push/PR |
| **Prettier** | Formatação de código | Pre-commit (Husky) |
| **Ruff** | Linting Python | A cada push/PR |
| **Pytest** | Testes unitários/integração (backend) | A cada push/PR |
| **Vitest** | Testes unitários (frontend) | A cada push/PR |
| **Commitlint** | Padronização de commits | Pre-commit |

### Conventional Commits

```
feat(agent): adicionar ProfileAnalyzer para classificação de skills
fix(graph): corrigir cálculo de pesos nas arestas ELIGIBLE_FOR
docs(readme): atualizar instruções de setup
```

---

## 12. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Latência na API do OpenRouter | Média | Médio | Cache de respostas, fallback rule-based, mock para dev |
| Complexidade do ForceAtlas2 | Baixa | Alto | Configurações adaptativas por tamanho do grafo |
| Neo4j Community sem features enterprise | Baixa | Baixo | Todas features necessárias estão na Community |
| Latência no cálculo de layout NetworkX | Baixa | Baixo | spring_layout é O(n²) mas grafo ARIANO tem <200 nós — layout computa em <50ms. Cache de posições no backend. |
| Tempo de desenvolvimento solo | Alta | Alto | MVP enxuto, priorização rigorosa |

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **ARIANO** | Arquitetura de Inteligência Artificial Naturalmente Ordenada |
| **CORETO** | Conexões para Revolução Empreendedora e Tecnológica Online — Plataforma de matchmaking da Prefeitura do Recife |
| **Knowledge Graph** | Grafo de conhecimento — estrutura de dados com nós e arestas tipados. Formalmente: `G = (V, E, R)` |
| **Adjacência livre de índice** | Propriedade de grafos onde navegar entre nós vizinhos é O(1) |
| **Cypher** | Linguagem de consulta declarativa do Neo4j |
| **ELIGIBLE_FOR** | Aresta de match no grafo — conecta acadêmico a edital com score |
| **SIMILAR_TO** | Aresta de enriquecimento — conecta acadêmicos com perfis afins (Sprint 4) |
| **RELATED_TO** | Aresta de enriquecimento — conecta skills complementares que co-ocorrem em perfis bem-sucedidos (Sprint 4) |
| **maturidade** | Grau de 0 a 10 atribuído automaticamente pela IA ao perfil acadêmico, baseado em bio, currículo e contexto do grafo (Sprint 4) |
| **o_que_busco** | Texto gerado pela IA descrevendo os objetivos inferidos do perfil acadêmico, usado como bônus no scoring (Sprint 4) |
| **curriculo_texto** | Texto extraído automaticamente do PDF do currículo via PyMuPDF (fitz). O PDF é descartado após extração (Sprint 4) |
| **Graph-CoT** | Graph Chain-of-Thought — paradigma de raciocínio iterativo sobre grafos onde o LLM decide dinamicamente quais nós visitar e quando parar (Sprint 4) |
| **Cognitive RAG** | Retrieval-Augmented Generation com processos cognitivos bio-inspirados: atenção seletiva, memória de trabalho e raciocínio inferencial (Sprint 4) |
| **Scratchpad** | Memória de trabalho do agente — rascunho progressivo de raciocínio visível em cada iteração do Graph-CoT (Sprint 4) |
| **ReAct** | Paradigma Reasoning + Acting — loop `Thought → Action → Observation` usado pelos agentes Graph-CoT (Yao et al., 2023) |
| **Primitivas do Grafo** | Funções de interação com o grafo: RetrieveNode, NodeFeature, NeighbourCheck, NodeDegree |
| **Halting Condition** | Critério de suficiência — o agente decide autonomamente quando tem informação suficiente para parar o loop cognitivo |
| **Comunidades de Pensamento** | Clusters de afinidade no grafo criados pelo ContextualAnalyzer via Graph-CoT iterativo (Sprint 4) |
| **Chain-of-Thought (CoT)** | Técnica de raciocínio em cadeia onde o agente IA processa informações passo a passo |
| **Agente Orquestrador** | Agente que controla a ordem e ativação dos demais agentes baseado no fluxo e estado do grafo (Sprint 4) |
| **Context Bonus** | Componente do score de match derivado do contexto expandido do grafo (vizinhos indiretos, comunidades) |
| **Engenharia de Prompt** | Técnica de configurar instruções especializadas para LLMs atuarem com expertise em domínios específicos |
| **Portal do Usuário** | Interface personalizada em /user/* onde o acadêmico vê seu perfil, matches e ecossistema individual (Sprint 4) |
| **Portal Admin** | Interface administrativa em /admin/* com visão completa do sistema: dashboard, grafo, comunidades (Sprint 4) |
| **Precomputed Relational Intelligence** | Filosofia central do ARIANO: IA configura o grafo offline, consultas são O(1) online |
| **ForceAtlas2** | Algoritmo de layout force-directed para posicionar nós em grafos |
| **NetworkX** | Biblioteca Python de análise de grafos (v3.x) — usada no backend para layout computation (`spring_layout`, `forceatlas2_layout`), detecção de comunidades (`louvain_communities`), e análise de centralidade. Frontend recebe posições pré-computadas via API |
| **React SVG** | Renderização leve de grafos no frontend — posições pré-computadas pelo NetworkX, com interatividade (hover, click, zoom) via React + Framer Motion |
| **SVG Filters** | Filtros SVG para efeitos visuais como glow neon nos nós do grafo |
| **LangChain** | Framework para orquestração de LLMs e construção de agentes IA |
| **PyMuPDF (fitz)** | Biblioteca Python para extração de texto de arquivos PDF em <100ms |
| **MVP** | Minimum Viable Product — produto mínimo viável |
| **SCRUM** | Framework ágil para gerenciamento de projetos |
| **Sprint** | Ciclo de desenvolvimento iterativo (1-2 semanas) |
| **DoD** | Definition of Done — critérios de aceite de uma entrega |

---

## Referências

1. **GitNexus** — Motor de inteligência de código com knowledge graphs. Disponível em: https://gitnexus.vercel.app/
2. **Neo4j** — Banco de dados de grafos. Disponível em: https://neo4j.com/
3. **NetworkX** — Biblioteca Python de análise e visualização de grafos. Layouts: spring_layout, forceatlas2_layout, kamada_kawai_layout. Comunidades: louvain_communities, girvan_newman. Disponível em: https://networkx.org/
4. **Labcodes — Graph Databases com Python** — Referência visual para grafos acadêmicos. Disponível em: https://labcodes.com.br/blog/pt-br/development/graph-databases-discutindo-o-relacionamento-dos-seus-dados-com-python/
5. **FastAPI** — Framework web moderno para Python. Disponível em: https://fastapi.tiangolo.com/
6. **LangChain** — Framework de orquestração de LLMs. Disponível em: https://python.langchain.com/
7. **NVIDIA Nemotron 3 Super** — Modelo LLM 120B MoE (12B ativo), arquitetura híbrida Mamba-Transformer, 1M context window. Disponível via OpenRouter em: https://openrouter.ai/nvidia/nemotron-3-super-120b-a12b:free
8. **OpenRouter** — Gateway unificado para APIs de LLM com compatibilidade OpenAI. Disponível em: https://openrouter.ai/
9. **Cognitive-RAG** (Reddy, N., 2024) — A RAG model using graph data for improved question answering through cognition. Implementação de referência do paradigma Graph Chain-of-Thought (Graph-CoT) com loop iterativo Thought-Action-Observation sobre grafos de conhecimento. Disponível em: https://github.com/Nikhilreddy024/Cognitive-RAG
10. **ReAct: Synergizing Reasoning and Acting in Language Models** (Yao, S. et al., 2023) — Paradigma que combina raciocínio e ação em LLMs, base teórica para o loop Thought-Action-Observation usado no Graph-CoT. arXiv:2210.03629
11. **Carayannis, E. G. & Campbell, D. F. J.** (2009) — "Mode 3 and Quadruple Helix: toward a 21st century fractal innovation ecosystem." International Journal of Technology Management, 46(3/4), 201–234. Fundamentação teórica do modelo de Quádrupla Hélice implementado no CORETO.
12. **Etzkowitz, H. & Leydesdorff, L.** (1995) — "The Triple Helix: University-Industry-Government Relations." EASST Review, 14(1), 14–19. Modelo original de Tríplice Hélice expandido pelo CORETO.
13. **Baddeley, A. D. & Hitch, G.** (1974) — "Working Memory." Psychology of Learning and Motivation, 8, 47–89. Analogia cognitiva para o scratchpad do Graph-CoT (memória de trabalho dos agentes).
14. **Maynez, J. et al.** (2020) — "On Faithfulness and Factuality in Abstractive Summarization." ACL 2020. Referência sobre o problema de alucinação em LLMs que motiva o uso de Graph-CoT.
15. **PyMuPDF (fitz)** — Biblioteca Python de alto desempenho para extração de texto de PDFs (<100ms por documento). Disponível em: https://pymupdf.readthedocs.io/

---

> **Este documento é um guia vivo atualizado a cada sprint.**  
> **Última atualização:** 16/04/2026 — Sprint 4 (Graph-CoT Híbrido, Cognitive RAG, NetworkX Visualization, Autenticação, Portal Usuário/Admin, CORETO, Comunidades de Pensamento, Engenharia de Prompt Avançada)
