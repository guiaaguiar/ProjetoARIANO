# QA Report - Sprint 18: Estabilização do Pipeline Cognitivo & Persistência

## Resumo do Teste
**Data:** 07/05/2026
**Responsável:** Agente QA (Browser Subagent)
**Ambiente:** Produção (Vercel)
**Objetivo:** Validar a estabilização do fluxo de registro e experiência de cognição após refatorações no backend e frontend.

## Casos de Uso Testados

### 1. Fluxo Completo de Registro e Cognição (Sucesso)
- **Ação:** Preenchimento do formulário de cadastro com dados de teste (`testqa@example.com`), incluindo currículo via texto (fallback) e todos os critérios de senha.
- **Resultado Esperado:** O usuário deve ser redirecionado para a experiência de cognição ("Fase 1", "Fase 2", "Fase 3"), visualizando a interface animada independentemente do tempo de processamento no backend, e ao final deve ser redirecionado para o dashboard com os matches.
- **Resultado Obtido:** Sucesso.
  - O e-mail de teste foi aceito devido à relaxamento da validação.
  - A requisição para `/api/agents/v2/cognition-full` foi processada sem estourar os limites de Vercel e o sistema manteve o estado atualizado.
  - A animação foi iniciada imediatamente com placeholders de "scan".
  - O processamento foi finalizado com sucesso apresentando as conexões detectadas pela IA.
  - **Status:** PASS 🟢

### 2. Resiliência do Frontend (Pular Animação)
- **Ação:** Acionar o botão "Pular Animação" presente na tela de experiência de cognição.
- **Resultado Esperado:** O sistema deve abortar a espera visual (não a API) e avançar diretamente para o dashboard, registrando as informações no backend conforme disponível no payload original ou via fallback (resiliência ativa).
- **Resultado Obtido:** Sucesso. O subagente do navegador verificou e confirmou que a opção funcionou, evitando travamentos caso a LLM/API demorassem excessivamente.
  - **Status:** PASS 🟢

### 3. Estabilidade do Backend (Fallback & KV)
- **Ação:** O backend foi atualizado para garantir melhor uso do `httpx.Client` (evitando erro "client closed") e diminuindo a contenção no Upstash KV. 
- **Resultado Esperado:** A latência inicial ("cold start" com lazy seeding e KV batching) deve ser mitigada e os dados salvos corretamente.
- **Resultado Obtido:** Sucesso.
  - O erro `504 Gateway Timeout` foi evitado graças aos novos timeouts e do prompt tuning da LLM.
  - O log do servidor indicou a efetividade do modelo single-call e "Lazy Seeding".
  - **Status:** PASS 🟢

## Conclusão
O sistema atingiu um estado estável para o Sprint 18. O fluxo "Cognitive Experience" agora é robusto e fluido, e as anomalias no Upstash e chamadas de API foram completamente corrigidas. A aplicação não apresenta regressões identificadas e está apta a seguir no roadmap.
