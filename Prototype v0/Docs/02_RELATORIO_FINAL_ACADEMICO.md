# 🏛️ RELATÓRIO FINAL ACADÊMICO
**Projeto ARIANO — Arquitetura de Inteligência Artificial Naturalmente Ordenada**

---

## 1. CABEÇALHO E INFORMAÇÕES DO PROJETO

* **Instituição:** UNINASSAU Graças — Recife/PE
* **Disciplina:** Tópicos Integradores (7º Período — 2026.1)
* **Metodologia:** SCRUM Adaptado para Ambiente Acadêmico

**Equipe de Desenvolvimento:**
* Guilherme Andrade de Aguiar (01606498) — *Product Owner / Tech Lead / Product Manager*
* Pedro Miranda (01607408) — *DevOps / Back-End Developer*
* Ricardo Cezar O. A. de Almeida (01606498) — *AI Agent Architect / Graph Data Engineer*
* Marcio Maycom (01607574) — *UX UI Designer / Front-End Developer*
* Thiago José Falcão de Freitas (01597267) — *Scrum Master / QA*

---

## 2. RESUMO EXECUTIVO

A inovação municipal historicamente esbarra em silos informacionais: talentos na academia frequentemente desenvolvem projetos que não alcançam demandas reais da indústria, enquanto o governo, como principal fomentador (ex. Prefeitura do Recife), tem dificuldades em conectar editais de apoio aos pesquisadores mais capacitados.

O **ARIANO (Arquitetura de Inteligência Artificial Naturalmente Ordenada)** é o motor cognitivo criado para a plataforma municipal **CORETO** (Prefeitura do Recife / SECTI Recife). Ele visa eliminar esses silos por meio de matchmaking inteligente baseado em Grafos de Conhecimento e processamento semântico de linguagem natural (LLM). 

Neste MVP (Sprint Definitiva), entregamos um ecossistema focado no matchmaking entre **Academia e Governo**. O sistema lê currículos, interpreta demandas, configura a rede de relacionamentos de forma assíncrona usando IA (Graph Chain-of-Thought) e possibilita buscas ultra-velozes em tempo real, servido em um ambiente 100% Serverless.

---

## 3. FUNDAMENTAÇÃO TEÓRICA

O projeto ARIANO une três pilares teóricos fundamentais para atingir a excelência no cruzamento de dados heterogêneos:

### 3.1 A Quádrupla Hélice da Inovação
Alicerçado no modelo de Carayannis & Campbell (2009), o ecossistema abrange a tríplice clássica (Governo, Indústria, Academia) acrescida da Sociedade Civil. O ARIANO concretiza digitalmente esse paradigma, transformando editais públicos (fomento) e perfis acadêmicos (conhecimento) em entidades que "conversam" automaticamente.

### 3.2 Grafos de Conhecimento e Adjacência Livre de Índice
Diferente dos pesados bancos relacionais (SQL), os grafos modelam entidades e relacionamentos (`HAS_SKILL`, `ELIGIBLE_FOR`) como ponteiros nativos. A propriedade matemática de **Adjacência Livre de Índice** permite que a travessia de dados seja de ordem `O(1)`. Quando uma consulta precisa achar quais pesquisadores atendem a todos os critérios de um edital, o tempo de busca não degrada com o aumento do volume de usuários, conferindo altíssima escalabilidade.

### 3.3 Graph Chain-of-Thought (Graph-CoT) e Inteligência Pré-computada
Em vez de utilizar a Inteligência Artificial no momento da pesquisa do usuário (o que geraria latência e alto custo, padrão do modelo RAG), o ARIANO orquestra Agentes de IA apenas na *entrada de dados* (Configuração do Grafo). Os agentes avaliam perfis (bio, currículos PDF extraídos em texto) de forma iterativa, extraindo habilidades latentes, maturidade, e criando as conexões antecipadamente (Inteligência Relacional Pré-computada).

---

## 4. METODOLOGIA E ARQUITETURA

O sistema foi desenvolvido sob uma arquitetura distribuída moderna, utilizando os seguintes componentes:

* **Frontend (Apresentação e UX):** Construído em React 18 e Vite 5. Foi concebido com uma interface cinematográfica premium (Dark Mode por padrão), gráficos poligonais interativos via `Recharts`, animações fluidas baseadas em física com `Framer Motion` e representações de rede usando SVG Force Graphs. O Tailwind CSS v4 foi o motor de estilização, permitindo resiliência em temas claro/escuro.
* **Backend (Orquestração e Integração):** Uma aplicação Python Serverless usando `FastAPI`. O framework `LangChain` gerencia os fluxos multi-agente, que invocam o LLM `NVIDIA Nemotron 3 Super 120B` via `OpenRouter` para extração e classificação textual severa com base no currículo em PDF (lido nativamente via PyMuPDF).
* **Camada de Persistência (Cérebro do ARIANO):** Devido à natureza efêmera (stateless) das funções Serverless da Vercel, o backend mantém o grafo in-memory (Neo4j concept) processando os matches, mas sua persistência real agora é híbrida, sincronizada via **Vercel KV (Redis)**. Sempre que há atualizações, o estado é consolidado atomicamente no banco Key-Value da nuvem, resolvendo problemas de reinicialização no deploy.
* **Deploy e CI/CD:** Monorepo orquestrado com Vercel Fullstack Deployment. Frontend e Serverless functions são compiladas em paralelo. Segredos de API estão blindados através de gerenciamento de Environment Variables nativo da Vercel.

---

## 5. RESULTADOS OBTIDOS (O MVP)

O MVP atingiu sucesso operacional na Sprint Definitiva. Os resultados incluem:

1. **UX e Feedback Cognitivo em Tempo Real:** No momento do cadastro do acadêmico, o fluxo exibe os Agentes da NVIDIA trabalhando ("lendo bio", "criando nós"), humanizando a IA e tornando o processo imersivo (transparência de sistema).
2. **Dashboard de Alta Retenção (Radar Chart):** Criação de um gráfico radar (`Recharts`) que exibe a maturidade do acadêmico e de suas competências baseadas na leitura do LLM.
3. **Desempenho O(1) de Latência Oculta:** As queries de recomendação de editais são instantâneas. A IA justificou e precomputou o match, de forma que o sistema só precisa exibir a resposta formatada sem atrasos gerados pela API da OpenAI/NVIDIA.
4. **Acerto Semântico de Perfil:** Acadêmicos que colocam experiências descritivas (ex. "trabalhei na incubadora X", "estagiei no Porto Digital") são mapeados corretamente pelo agente para "Inovação", "Modelagem de Negócios" e recebem maturidade superior (nota 0 a 10).

---

## 6. CONCLUSÃO E TRABALHOS FUTUROS

O projeto ARIANO cumpriu seus objetivos de prova de conceito acadêmica para a disciplina Tópicos Integradores. A estrutura comprova a viabilidade técnica de utilizar Grafos Híbridos Serverless em conjunto com LLMs Avançados para desatar o nó da integração entre Setor Público (SECTI Recife) e Academia (UNINASSAU).

**Próximos Passos (Evolução pós-MVP):**
* Implementação da aba Indústria, incorporando dores do setor privado (Donos de Problemas).
* Detecção contínua e assíncrona de Comunidades de Pensamento via `NetworkX` para recomendações não só de editais, mas de "colegas com perfis similares".
* Autenticação via SSO Municipal (ex: Conecta Recife) para escalada imediata entre universitários e pesquisadores locais.
