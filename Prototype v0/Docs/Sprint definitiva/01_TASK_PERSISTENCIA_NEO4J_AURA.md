# 🎯 TASK 01: ESTABILIZAÇÃO DO NEO4J AURA E LIMPEZA DE DADOS

## 📝 Visão Geral
Você não tem contexto prévio, então entenda: atualmente, o código tenta conectar ao Neo4j, mas se falhar (por timeout no Serverless da Vercel ou credenciais), ele cai para um modo "In-Memory" (`MemoryGraphStore`). Isso é inaceitável para a entrega final, pois os dados se perdem. O banco AuraDB deve ser a única Fonte da Verdade (Single Source of Truth).

## 🛠 O que deve ser feito (Step-by-Step)
1.  **Exterminar o Fallback (In-Memory):**
    * Vá em `app/core/neo4j_driver.py` (ou onde a conexão estiver gerida).
    * Remova/desative completamente qualquer menção a `MemoryGraphStore` ou Vercel KV para armazenamento de nós/arestas.
    * O método `get_driver()` deve levantar uma exceção clara (`HTTP 500`) se o Neo4j Aura não conectar. Aplique lógicas de *Retry* (ex: biblioteca `tenacity`) para lidar com instabilidades de rede no ambiente Serverless.
2.  **Refatoração do Grafo (Datatypes):**
    * No design original, tínhamos nós do tipo `Researcher` e `Professor`. Isso causou redundância.
    * **Ação:** Altere o schema, os modelos (`models/`) e os prompts dos agentes para unificar ambos sob a label genérica **`Docente`**.
    * Onde havia relacionamento para professor e pesquisador, agora é apenas `Docente`.

## ✅ Critérios de Aceitação (DoD)
- [ ] O arquivo de conexão com o banco não possui mais fallback de memória.
- [ ] Criação de conta reflete imediatamente no Neo4j Aura (verificável via console do Neo4j).
- [ ] O Node de `Docente` substituiu as entidades antigas no código backend e nos prompts do LangChain.
