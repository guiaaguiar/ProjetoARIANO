# Sprint 18 — Estabilização do Pipeline Cognitivo & Persistência

## Diagnóstico Atual (Pós-QA)

Apesar da consolidação em uma chamada única (`cognition-full`), o sistema ainda apresenta instabilidade em produção:
1.  **504 Gateway Timeout**: A chamada `/api/agents/v2/cognition-full` excede 10s-60s na Vercel.
2.  **Spam de KV**: O seeding inicial (cold start) tenta salvar centenas de nós individualmente, saturando a conexão.
3.  **Erro de Ciclo de Vida HTTP**: Erros de "client closed" indicam má gestão do cliente `httpx`.
4.  **UX**: O usuário vê uma tela de erro em vez da animação se o backend demorar.

---

## Estratégia de Solução

### 1. Persistência de Alta Performance (Batching)
- [x] **Singleton HTTP Client**: Usar um único cliente `httpx.Client` por instância do `MemoryGraphStore` para evitar o overhead de abrir/fechar conexões.
- [x] **Batch Updates**: Garantir que o `seed_native` use o contexto `batch_update` para realizar uma ÚNICA escrita no KV ao final do processo.
- [x] **Lazy Seeding**: Mover o seeding pesado para fora do caminho crítico da requisição de IA, se possível, ou garantir que ele seja ultra-rápido.

### 2. Otimização do Endpoint de Cognição
- [x] **LLM Timeout**: Adicionar timeout explícito de 25s na chamada do LLM para responder ao frontend antes do gateway da Vercel (que é 60s em pro, mas pode variar).
- [x] **Prompt Tuning**: Reduzir a carga de tokens do prompt do motor de matchmaking para acelerar o tempo de primeira resposta (TTFT).

### 3. UX Resiliente (Frontend)
- [x] **Immediate Phase Transition**: Iniciar a animação "Fase 1" imediatamente no frontend com dados parciais ou placeholders se a IA demorar mais de 5s.
- [x] **Soft Error Handling**: Se a IA falhar com 504, oferecer um "Match Fallback" baseado em regras simples em vez de apenas uma tela de erro.

---

## Ordem de Execução Atualizada

### Backend
- [x] **Passo 1**: Refatorar `MemoryGraphStore` para usar cliente persistente e corrigir bug de "client closed".
- [x] **Passo 2**: Validar `batch_update` no seeding para eliminar spam de KV.
- [x] **Passo 3**: Adicionar logs de performance em `agent_routes.py` para identificar o gargalo exato (LLM vs Grafo).
- [x] **Passo 4**: Otimizar prompt do matchmaking (reduzir contexto irrelevante).

### Frontend
- [x] **Passo 5**: Ajustar `CognitionExperience.tsx` para iniciar animações visuais antes de receber o JSON completo (usar streams se necessário, ou mock data inicial).
- [x] **Passo 6**: Corrigir validação de e-mail no cadastro para aceitar domínios de teste.

### QA & Deploy
- [x] **Passo 7**: Teste de carga simulado no `/cadastro`.
- [x] **Passo 8**: Deploy final e verificação de logs no Vercel Dashboard.
