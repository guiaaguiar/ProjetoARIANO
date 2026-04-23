# 📋 PROJETO ARIANO — Documento de Visão e Planejamento do MVP

> **Versão:** 6.1.0  
> **Data:** 23/04/2026  
> **Status:** MVP 1.0.0 Online — Sprint 4 (Graph-CoT Híbrido & Comunidades Semânticas)

## 1. Introdução
O ARIANO é o motor de matchmaking inteligente da plataforma CORETO, conectando Academia e Governo através de Grafos de Conhecimento e Agentes de IA.

## 2. Arquitetura Graph-CoT Híbrida
O sistema opera em três fases:
1. **Cadastro:** Agentes analisam perfis e editais em tempo real.
2. **Enriquecimento:** O ContextualAnalyzer identifica clusters e afinidades.
3. **Consulta:** Matches rápidos via Cypher O(1).

## 3. Comunidades de Pensamento (CoTs)
As comunidades não são apenas grupos matemáticos, mas **Clusters Semânticos**. O motor NetworkX no backend extrai temas-chave (ex: "Inteligência Artificial & Saúde") analisando os metadados dos nós de cada cluster.

## 4. Visualização NetworkX Interativa
A visualização migrou para um modelo interativo premium:
- **Backend (NetworkX):** Detecta comunidades via Louvain e extrai temas semânticos.
- **Frontend (react-force-graph):** Renderiza o grafo dinamicamente, permitindo arraste, zoom e exploração dos temas contextualizados.
- **Design:** Identidade Teal Neon com glows proporcionais à influência (PageRank) de cada nó.

## 5. Próximos Passos
- Expansão dos temas semânticos via LLM.
- Otimização de performance para grafos de grande escala.
