# 📋 PROJETO ARIANO — Documento de Visão e Planejamento do MVP

> **Versão:** 2.0.0  
> **Data:** 23/03/2026  
> **Status:** MVP 1.0.0 Finalizado — Integrado Frontend + Backend
> **Metodologia:** SCRUM (adaptado para contexto acadêmico)  
> **Última atualização:** 06/04/2026 — Protótipo 100% Funcional e Entregue

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

O **CORETO** é uma **plataforma digital da Prefeitura do Recife** que funciona como um ecossistema de inovação conectando os quatro pilares da **quádrupla hélice**: **Academia**, **Governo**, **Indústria** e **Sociedade Civil**. A plataforma visa promover a colaboração entre esses eixos para resolver desafios urbanos e fomentar a inovação no ecossistema de Recife.

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
- ✅ Interface web robusta e otimizada (Vite, React, D3.js) consumindo os endpoints backend diretamente via REST Axios
- ✅ Zero-config Execution garantida com in-memory database nativo e transparente ao usuário
- ❌ NÃO inclui: eixos Indústria/Sociedade Civil, RAG avançado, deploy unificado restrito (produção complexa)

---

## 2. Fundamentação Teórica

### 2.1 Grafos de Conhecimento (Knowledge Graphs)

Um **grafo de conhecimento** é uma estrutura de dados que representa entidades como **nós** e seus relacionamentos como **arestas**. No contexto do ARIANO:

- **Nós** representam: Estudantes, Pesquisadores, Professores, Editais, Skills (competências) e Áreas de atuação
- **Arestas** representam: `HAS_SKILL` (possui competência), `RESEARCHES_AREA` (pesquisa área), `REQUIRES_SKILL` (edital requer), `ELIGIBLE_FOR` (elegível para — **a aresta de match**)

A vantagem de um grafo sobre um banco relacional (SQL) é a **adjacência livre de índice**: navegar de um nó para seus vizinhos é uma operação O(1), enquanto JOINs em SQL crescem exponencialmente com a complexidade das relações.

### 2.2 Agentes de IA como Configuradores de Grafo (Precomputed Relational Intelligence)

O conceito de **Precomputed Relational Intelligence** (Inteligência Relacional Pré-computada) foi inspirado no projeto **GitNexus** — um motor de inteligência de código que constrói knowledge graphs a partir de repositórios GitHub. A filosofia é:

```
FASE 1: Agentes IA processam dados → Configuram o grafo (offline, assíncrono)
FASE 2: Match = Query Cypher O(1) sobre grafo pré-configurado (online, instantâneo)
```

Essa abordagem difere radicalmente do RAG (Retrieval-Augmented Generation) tradicional:

| RAG Tradicional | ARIANO (Precomputed) |
|----------------|---------------------|
| LLM processa dados a cada consulta | Agentes processam dados **uma vez**, configuram o grafo |
| Cada match requer chamada à IA (caro, lento) | Match = query Cypher pura (gratuito, instantâneo) |
| Latência de segundos | Latência de milissegundos |
| Custo escala linearmente com consultas | Custo fixo (só na configuração) |

### 2.3 Quádrupla Hélice da Inovação

O modelo da **Quádrupla Hélice** (Quadruple Helix) é um framework de inovação que expande a Tríplice Hélice (Academia-Governo-Indústria) incluindo a **Sociedade Civil** como quarto pilar. O CORETO implementa este modelo digitalmente, e o ARIANO é o mecanismo que conecta esses pilares através de matchmaking inteligente.

---

## 3. Referência de Design — GitNexus

O design visual e interativo (Dark theme com efeitos neon, hover rings e visualização do conhecimento mapeado em nós) do ARIANO foi inspirado profundamente no projeto **GitNexus**, servindo como modelo estético consolidado de sucesso para o nosso visualizador de grafos em interface web. O conceito original e a referência base que usamos pode ser explorado publicamente:

**Link do Repositório do GitNexus:** [https://github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus)

---

## 4. Arquitetura do Sistema

### 4.1 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│          Vite 5 + React 18 + TypeScript                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│   │ Dashboard │  │ Cadastro │  │ Visualizador de Grafo     │  │
│   │ de Matches│  │ Perfis   │  │ (D3.js SVG + Force Sim)   │  │
│   └──────────┘  └──────────┘  └──────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────────────┐
│                        BACKEND                               │
│              Python 3.12 + FastAPI                            │
│                                                              │
│   ┌──────────┐  ┌──────────────────┐  ┌────────────────┐    │
│   │ API REST │  │ Graph Configurator│  │ Match Engine   │    │
│   │ (CRUD)   │  │ (Agentes IA)      │  │ (Cypher Puro)  │    │
│   └──────────┘  └──────────────────┘  └────────────────┘    │
│                         │                      │             │
│   Agentes:              │                      │             │
│   ├─ ProfileAnalyzer    │    Match = Query:     │             │
│   ├─ EditalInterpreter  │    MATCH (a)-[r]->(e) │             │
│   └─ EligibilityCalc    │    WHERE r.score > X  │             │
│                         │    RETURN ...          │             │
└──────────────────────┬──────────────────────────────────────┘
                       │ Bolt Protocol / Cypher
┌──────────────────────┴──────────────────────────────────────┐
│                      DATA LAYER                              │
│   ┌──────────────────────────────────────────────┐          │
│   │           Neo4j (Graph Database)              │          │
│   │  Nós: Student, Researcher, Professor, Edital  │          │
│   │  Arestas: HAS_SKILL, ELIGIBLE_FOR, MATCHES   │          │
│   │  (pré-configuradas pelos agentes com pesos)   │          │
│   └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Fluxo de Dados — Duas Fases Distintas

#### FASE 1 — Configuração do Grafo (Agentes IA)

```
Usuário cadastra perfil/edital
  → Backend recebe dados
    → Agente ProfileAnalyzer/EditalInterpreter (LangChain + Nemotron 3 Super via OpenRouter)
      → Extrai skills, classifica área, calcula embeddings
        → Cria nós + arestas ponderadas no Neo4j (Cypher)
          → Agente EligibilityCalculator calcula scores
            → Cria/atualiza arestas ELIGIBLE_FOR com score (0.0-1.0)
              → Grafo configurado ✓
```

#### FASE 2 — Match Instantâneo (Cypher Query Pura)

```
Usuário solicita matches
  → Backend executa Cypher:
    MATCH (a)-[r:ELIGIBLE_FOR]->(e:Edital)
    WHERE r.score >= 0.7
    RETURN a, r, e ORDER BY r.score DESC
  → O(1) via adjacência livre de índice
    → Resultado instantâneo com scores e justificativas
```

### 4.3 Modelagem do Grafo

```
    ┌─────────────┐     HAS_SKILL     ┌────────────┐
    │  🎓 Student  │──────────────────>│  📚 Skill   │
    └─────────────┘                    └────────────┘
                                            ▲
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
    └─────────────┘   (score, justification)
```

**Exemplo de dados:**

```cypher
// Nós Academia
CREATE (:Researcher {name: "Dra. Maria Silva", institution: "UFPE", level: "doutorado"})
CREATE (:Student {name: "João Pedro", institution: "UNINASSAU", semester: 7, course: "CC"})

// Nós Governo
CREATE (:Edital {title: "FACEPE IA 2026", agency: "FACEPE", funding: 200000})

// Nós Referência (criados pelos agentes)
CREATE (:Skill {name: "Machine Learning"})
CREATE (:Area {name: "Saúde Digital"})

// Arestas (criadas/ponderadas pelos agentes)
CREATE (r)-[:HAS_SKILL {confidence: 0.95}]->(s:Skill {name: "ML"})
CREATE (e)-[:REQUIRES_SKILL {priority: "essential"}]->(s)

// A ARESTA DE MATCH (criada pelo EligibilityCalculator)
CREATE (r)-[:ELIGIBLE_FOR {score: 0.92, justification: "92% aderência..."}]->(e)
```

---

## 5. Stack Tecnológica

### 5.1 Stack Final Aprovada

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
│  ├─ LangChain + LangChain-OpenAI (agentes IA)             │
│  ├─ NVIDIA Nemotron 3 Super 120B via OpenRouter (LLM)     │
│  ├─ Neomodel (OGM) + Neo4j Driver (Cypher nativo)         │
│  └─ Uvicorn (servidor ASGI)                               │
│                                                           │
│  🗄️ DADOS                                                 │
│  └─ Neo4j 5.x Community (graph database)                  │
│                                                           │
│  🔧 DEVOPS                                                │
│  ├─ Neo4j local (Homebrew / Community Edition)             │
│  └─ GitHub Actions (CI/CD)                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Justificativas Tecnológicas

A arquitetura do desenvolvimento atende rigorosos padrões de Boas Práticas, assegurando escalabilidade limpa e manutenibilidade na transição entre MVP Mockado e Serviço Completo:

| Tecnologia e Prática | Justificativas e Normas Atendidas |
|-----------|---------------|
| **D3.js v7 (Gráficos Customizados SVG)** | **Manipulação Clara e Modular:** Tivemos controle absoluto do render engine via subcomponentes, abstraindo logicas de colisão e densidade (ForceAtlas2 equivalente) para dar um ar estético elegante de grafos acadêmicos. |
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
O ciclo desta sprint validou nosso modelo abstrato num painel de visualização utilizável e analítico. Consolidando as dailies de alinhamento técnico, fechamos com sucesso a migração tecnológica para visualizadores em rede utilizando D3.js. Aplicamos também uma governança restrita de dados em Mock para limitação segura e previsível focando na performance de navegação dos sub-componentes visuais, garantindo os cenários de usabilidade planejados no Design Review.

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

### Sprint 3 — Integração, Deploy e Polish (Semana 5-6) ✅ CONCLUÍDA

**Foco:** Garantir execução e interação instantânea entre Front e Back-End.  
Esta foi nossa Sprint de estabilização final. Removemos todos os mocks locais e integramos o Frontend puramente via API REST consumindo dados diretamente do engine de backend (com Fallback em In-Memory Database O(1) para instâncias sem Neo4j). O código foi refinado, erros silenciados para garantir compatibilidade UI sem travamentos e todas conexões estabilizadas para apresentação consolidada do protótipo totalmente funcional, em tempo recorde.

---

## 9. Critérios de Aceite (Definition of Done)

O MVP será considerado **Done** quando:

- [x] Grafo populado com ≥ 15 acadêmicos + ≥ 8 editais + arestas configuradas por agentes
- [x] Agentes IA (NVIDIA Nemotron 3 via OpenRouter) criam e configuram o grafo (nós, arestas, pesos) antes do match
- [x] Match instantâneo e robusto com endpoints de backend integrados com Frontend
- [x] Execução nativa zero-config (A API e Grafo executam no Memory Database O(1) sem necessidade de container ou daemon)
- [x] Frontend otimizado com dashboard, cadastro e visualizador de grafo interativo 100% dinâmicos consumindo dados API
- [x] CI/CD testado
- [x] Design consistente com tema azul neon (Blue Neon Edition)

---

## 10. Estrutura do Repositório

```text
ProjetoARIANO/
├── .github/
│   └── workflows/ci.yml          # CI/CD pipeline
├── frontend/
│   ├── src/
│   │   ├── app/                   # Páginas (Router)
│   │   ├── components/            # Componentes React reutilizáveis
│   │   │   ├── graph/             # Componentes baseados em D3.js
│   │   │   ├── forms/             # Formulários de cadastro
│   │   │   └── ui/                # Design system components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utilitários, API client
│   │   ├── styles/                # CSS global + design tokens
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── app/
│   │   ├── api/                   # Routers FastAPI
│   │   ├── models/                # Neomodel (Nós e Arestas)
│   │   ├── services/              # Lógica de negócio + Match Engine
│   │   ├── agents/                # Agentes IA (Graph Configurators)
│   │   │   ├── profile_analyzer.py
│   │   │   ├── edital_interpreter.py
│   │   │   └── eligibility_calculator.py
│   │   └── core/                  # Config, dependências
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── Prototype v0/
│   ├── Docs/
│   │   ├── arquivos apresentacao/          # 📊 Apresentação da disciplina
│   │   │   └── apresentacao_TIdCC (1).html
│   │   ├── assets/                         # Assets de documentação
│   │   └── 01_DOCUMENTO_PROJETO_ARIANO.md  # 📋 Documento de referência base
│   └── implementation_plan.md               # 🗺️ Plano de implementação
├── docker-compose.yml
├── .env.example
├── .gitignore
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
| Curva de aprendizado D3.js | Média | Médio | GitNexus serve como referência de implementação |
| Tempo de desenvolvimento solo | Alta | Alto | MVP enxuto, priorização rigorosa |

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **ARIANO** | Arquitetura de Inteligência Artificial Naturalmente Ordenada |
| **CORETO** | Plataforma de matchmaking da Prefeitura do Recife |
| **Knowledge Graph** | Grafo de conhecimento — estrutura de dados com nós e arestas tipados |
| **Adjacência livre de índice** | Propriedade de grafos onde navegar entre nós vizinhos é O(1) |
| **Cypher** | Linguagem de consulta declarativa do Neo4j |
| **ELIGIBLE_FOR** | Aresta de match no grafo — conecta acadêmico a edital com score |
| **ForceAtlas2** | Algoritmo de layout force-directed para posicionar nós em grafos |
| **D3.js** | Biblioteca JavaScript de visualização de dados — usada para o grafo interativo com Force Simulation |
| **SVG Filters** | Filtros SVG para efeitos visuais como glow neon nos nós do grafo |
| **LangChain** | Framework para orquestração de LLMs e construção de agentes IA |
| **MVP** | Minimum Viable Product — produto mínimo viável |
| **SCRUM** | Framework ágil para gerenciamento de projetos |
| **Sprint** | Ciclo de desenvolvimento iterativo (1-2 semanas) |
| **DoD** | Definition of Done — critérios de aceite de uma entrega |

---

## Referências

1. **GitNexus** — Motor de inteligência de código com knowledge graphs. Disponível em: https://gitnexus.vercel.app/
2. **Neo4j** — Banco de dados de grafos. Disponível em: https://neo4j.com/
3. **D3.js** — Biblioteca de visualização de dados. Disponível em: https://d3js.org/
4. **Labcodes — Graph Databases com Python** — Referência visual para grafos acadêmicos. Disponível em: https://labcodes.com.br/blog/pt-br/development/graph-databases-discutindo-o-relacionamento-dos-seus-dados-com-python/
5. **FastAPI** — Framework web moderno para Python. Disponível em: https://fastapi.tiangolo.com/
6. **LangChain** — Framework de orquestração de LLMs. Disponível em: https://python.langchain.com/
7. **NVIDIA Nemotron 3 Super** — Modelo LLM 120B MoE (12B ativo), arquitetura híbrida Mamba-Transformer, 1M context window. Disponível via OpenRouter em: https://openrouter.ai/nvidia/nemotron-3-super-120b-a12b:free
8. **OpenRouter** — Gateway unificado para APIs de LLM com compatibilidade OpenAI. Disponível em: https://openrouter.ai/

---

> **Este documento é um guia vivo atualizado a cada sprint.**  
> **Última atualização:** 06/04/2026 — Sprint 2 Concluída (Agentes IA + Neo4j + OpenRouter/Nemotron)
