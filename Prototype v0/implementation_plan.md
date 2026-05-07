# 🛠️ Plano de Debug: Fluxo de Registro & Persistência KV

> **Versão:** 1.0.0 (Debug Phase)
> **Objetivo:** Identificar e corrigir por que usuários recém-criados "somem" do grafo durante a animação inicial.

## 🎯 Diagnóstico de Hipóteses
1.  **Race Condition (KV Sync)**: O KV do Upstash demora alguns milissegundos para propagar o `SET` entre regiões, e o `GET` do Stage 1 acontece rápido demais.
2.  **Overwriting**: O Orchestrator (background) pode estar carregando uma versão antiga do grafo e sobrescrevendo o novo usuário ao salvar no final do `batch_update`.
3.  **Silent Failure**: O `httpx.post` ao KV pode estar falhando por limite de tamanho de payload (Upstash Free = 1MB) sem logar o erro.

## 🛠️ Próximos Passos (Plano de Ação)

### Fase 1: Visibilidade Total (Logging & Diagnóstico)
- [ ] **Neo4j Driver Logging**: Adicionar logs de `status_code` e `response.text` em todas as chamadas ao Upstash KV.
- [ ] **Endpoint `/api/debug/kv`**: Criar rota para retornar o conteúdo bruto do KV (ariano_graph_persistent).
- [ ] **Endpoint `/api/debug/graph`**: Criar rota para retornar o estado em memória da Lambda atual.

### Fase 2: Correção de Integridade & Sync
- [ ] **Strict Save**: Modificar `save_to_kv` para lançar exceção se o Upstash não retornar `200 OK` (ex: erro de quota).
- [ ] **Safe Load**: Garantir que o `load_from_kv` em `get_memory_store(force_refresh=True)` realmente espere a resposta do KV.
- [ ] **Merge em vez de Overwrite (Opcional)**: Se o problema for o Orchestrator apagando dados, mudar a lógica de salvamento para dar merge em nós novos.

### Fase 3: Frontend Resilience
- [ ] **Pre-Flight Retry**: Aumentar o número de tentativas e o intervalo no `CognitionExperience.tsx`.
- [ ] **Loading Intermediário**: Exibir feedback visual se a sincronização demorar mais que o esperado.

---

## ⚠️ Riscos
- O log do KV pode expor segredos se não for cuidadoso (evitar logar o Token).
- Aumentar o polling pode atingir limites de rate limit da API.
