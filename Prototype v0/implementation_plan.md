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
  > **Expectativa no UX**: O usuário não enfrentará mais interrupções súbitas ou travamentos de sistema decorrentes de conexões com o banco falhando durante o cadastro. A experiência será mais fluida e silenciosa.
- [x] **Batch Updates**: Garantir que o `seed_native` use o contexto `batch_update` para realizar uma ÚNICA escrita no KV ao final do processo.
  > **Expectativa no UX**: A primeira vez que a aplicação for carregada após um tempo inativa ("cold start"), a inicialização será virtualmente instantânea (reduzida de ~15s para <2s), eliminando a percepção de "sistema lento".
- [x] **Lazy Seeding**: Mover o seeding pesado para fora do caminho crítico da requisição de IA, se possível, ou garantir que ele seja ultra-rápido.
  > **Expectativa no UX**: Elimina engasgos sistêmicos, garantindo que o tempo do usuário aguardando os matches se foque apenas na inferência da IA e não na configuração de infraestrutura do backend.

### 2. Otimização do Endpoint de Cognição
- [x] **LLM Timeout**: Adicionar timeout explícito de 25s na chamada do LLM para responder ao frontend antes do gateway da Vercel (que é 60s em pro, mas pode variar).
  > **Expectativa no UX**: O usuário não ficará preso em loading infinito que resulta em tela de erro branca. Caso ocorra lentidão profunda, um erro controlado permitirá redirecionamento suave ou recarregamento.
- [x] **Prompt Tuning**: Reduzir a carga de tokens do prompt do motor de matchmaking para acelerar o tempo de primeira resposta (TTFT).
  > **Expectativa no UX**: A "mágica" (os resultados da inteligência artificial) aparece mais rapidamente na tela (Phase 3 da animação é atingida mais depressa).

### 3. UX Resiliente (Frontend)
- [x] **Immediate Phase Transition**: Iniciar a animação "Fase 1" imediatamente no frontend com dados parciais ou placeholders se a IA demorar mais de 5s.
  > **Expectativa no UX**: Sensação de velocidade e feedback em tempo real. Em vez de uma tela parada "pensando", o usuário vê o sistema "vasculhando" ativamente as bases (efeito cinemático de scan).
- [x] **Soft Error Handling**: Se a IA falhar com 504, oferecer um "Match Fallback" baseado em regras simples em vez de apenas uma tela de erro.
  > **Expectativa no UX**: Mesmo sob falha completa da API de IA, o usuário sentirá que a plataforma cumpriu seu propósito, visualizando recomendações compatíveis baseadas em regra. Foco em manter o encantamento e a retenção, nunca exibindo telas técnicas de erro (zero frustração).

---

## Ordem de Execução Atualizada

### Backend
- [x] **Passo 1**: Refatorar `MemoryGraphStore` para usar cliente persistente e corrigir bug de "client closed".
  > **Expectativa no UX**: Estabilidade robusta e operações de salvamento de perfil que funcionam na primeira tentativa.
- [x] **Passo 2**: Validar `batch_update` no seeding para eliminar spam de KV.
  > **Expectativa no UX**: Cadastro inicial incrivelmente rápido, sem gargalos.
- [x] **Passo 3**: Adicionar logs de performance em `agent_routes.py` para identificar o gargalo exato (LLM vs Grafo).
  > **Expectativa no UX**: (Indireta) Melhoria contínua baseada em telemetria, permitindo aos desenvolvedores manter a experiência sempre otimizada no futuro.
- [x] **Passo 4**: Otimizar prompt do matchmaking (reduzir contexto irrelevante).
  > **Expectativa no UX**: Respostas mais assertivas e geradas na metade do tempo, maximizando o "wow effect".

### Frontend
- [x] **Passo 5**: Ajustar `CognitionExperience.tsx` para iniciar animações visuais antes de receber o JSON completo (usar streams se necessário, ou mock data inicial).
  > **Expectativa no UX**: A experiência se torna uma narrativa interativa. O usuário entra em um "túnel" tecnológico de descoberta que prende a atenção durante os segundos críticos do processamento.
- [x] **Passo 6**: Corrigir validação de e-mail no cadastro para aceitar domínios de teste.
  > **Expectativa no UX**: Flexibilidade e facilidade de onboarding para testadores e stakeholders.

### QA & Deploy
- [x] **Passo 7**: Teste de carga simulado no `/cadastro`.
  > **Expectativa no UX**: Garantia de que a experiência descrita acima ocorrerá até em horários de pico.
- [x] **Passo 8**: Deploy final e verificação de logs no Vercel Dashboard.
  > **Expectativa no UX**: Aplicação acessível globalmente, polida e livre de bloqueios críticos, entregando o prometido.
