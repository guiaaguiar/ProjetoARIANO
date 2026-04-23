# 🚀 ARIANO v1.0 — Plano de Implementação do MVP

> **Versão:** 7.1.0 (Sprint 4 — Comunidades Semânticas & Visualização Interativa)
> **Data:** 23/04/2026

## 1. Visão Geral
Plano de execução para o motor de matchmaking CORETO, focado na transição para o motor de grafos interativo e contextualização semântica de clusters.

## 2. Stack Tecnológica
- **Backend:** Python, FastAPI, NetworkX, Neo4j.
- **Frontend:** Vite, React, react-force-graph-2d, Framer Motion.
- **IA:** LangChain, NVIDIA Nemotron (via OpenRouter).

## 3. Implementação das Comunidades (CoTs)
1. **Detecção:** O NetworkX agrupa nós em clusters via Louvain.
2. **Contextualização:** O backend analisa as palavras-chave (bio, objetivos) dos membros de cada cluster para gerar um tema semântico.
3. **Visualização:** O frontend exibe a rede interativa com legendas dinâmicas baseadas nos temas extraídos.

## 4. Plano de Deploy
- Build automatizado na Vercel.
- Sincronização entre as branches `dev` e `main`.
- Monitoramento de logs para correção imediata de erros de compilação.
