# 🧠 [CORE] CONTEXTO MASTER & ARQUITETURA GLOBAL - PROJETO ARIANO

## ⚠️ INSTRUÇÃO PARA O AGENTE (LEIA PRIMEIRO)
Você é um Engenheiro de Software Sênior (Tech Lead IA) encarregado de finalizar a **Sprint Definitiva** do projeto **ARIANO**. Você está assumindo este repositório agora e não possui contexto prévio. Leia este documento atentamente para entender a alma, a origem e a arquitetura do projeto antes de executar qualquer código.

---

## 📖 1. O Que é o Projeto? (Origem e Visão)
O **ARIANO** (Arquitetura de Inteligência Artificial Naturalmente Ordenada) nasceu como uma demanda real de mercado para a disciplina de **Tópicos Integradores (7º Período de Ciência da Computação - UNINASSAU)**, liderada pelo aluno e Tech Lead Guilherme Aguiar.

O ARIANO é o **motor de matchmaking inteligente** da plataforma **CORETO**, um hub digital de inovação da **Prefeitura do Recife / SECTI** (Secretaria de Ciência, Tecnologia e Inovação). 

### 1.1 O Problema e a Solução
A plataforma CORETO baseia-se na **Quádrupla Hélice da Inovação**: Academia, Governo, Indústria e Sociedade Civil. O desafio é conectar "Donos de Problemas" (Governo/Indústria) com "Solucionadores" (Academia/Startups).
Para resolver isso de forma escalável e instantânea, o ARIANO utiliza uma arquitetura híbrida de **Bancos de Dados Não Relacionais orientados a Grafos (Neo4j)** combinados com **Sistemas Multi-Agentes (LLMs via LangChain/OpenRouter)**.

* **Como funciona?** A IA **não** faz o match em tempo real. A IA age como um "operário" que trabalha nos bastidores (offline/assíncrono) lendo perfis e editais, estruturando dados não-estruturados, inferindo skills e **construindo o Grafo (nós e arestas)**. Quando o usuário acessa, o match é apenas uma consulta nativa no Neo4j (Cypher Query O(1)), garantindo latência zero.

---

## 🏗 2. Arquitetura e Stack Tecnológica
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, React-Force-Graph / D3.js (para visualização do grafo). Theme: *Teal Neon / Dark Mode*.
* **Backend:** Python 3.12, FastAPI (Serverless na Vercel).
* **IA / LLM:** LangChain, OpenRouter (NVIDIA Nemotron 3 Super).
* **Banco de Dados:** Neo4j (AuraDB - Cloud). *O uso de grafos foi escolhido pela necessidade de mapear relacionamentos complexos sem a rigidez de tabelas SQL (index-free adjacency).*
* **Deploy:** Monorepo implantado na Vercel.

---

## 🚨 3. O Problema Atual (Por que esta Sprint existe?)
Apesar de termos um MVP v1.0.0, o código atual possui **falhas críticas e "gambiarras"** de desenvolvimento inicial que precisam ser exterminadas para a entrega final:
1.  **Persistência Falsa:** O backend (ex: `neo4j_driver.py`) tem um fallback chamado `MemoryGraphStore` (usando Vercel KV ou memória RAM) que mascara erros do Neo4j. Isso causa perda de dados.
2.  **UX Travada no Cadastro:** O extrator de currículo em PDF está complexo. Precisamos de um extrator simples que retorne apenas Tags/Skills e não deixe o usuário avançar até que a IA termine.
3.  **Animações sem Coreografia:** O grafo web joga todos os nós na tela de uma vez. Precisamos de uma coreografia lúdica e temporal (Usuário -> Skills -> Editais).
4.  **Caixa Preta da IA:** O administrador e o usuário não veem a IA "pensando". Precisamos expor os logs/scratchpads (Chain of Thought) na UI.

---

## 🎯 4. Como Executar Esta Sprint
Nos próximos arquivos Markdown, você encontrará as **Tasks Detalhadas**. Trate cada arquivo como uma Épica. Siga rigorosamente os Critérios de Aceitação (DoD - Definition of Done). O objetivo é deixar o projeto **Lindo (nível Apple/Cinematográfico), Funcional, à prova de falhas e 100% integrado ao Neo4j Aura.**
