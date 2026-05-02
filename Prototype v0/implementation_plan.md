# 🚀 ARIANO — Plano de Implementação (Integração Real de IA)

> **Versão:** 9.0.0 (Sprint Atual)
> **Data:** 01/05/2026
> **Foco:** Transição de dados mock para integração real com NVIDIA Nemotron-3 via OpenRouter e automação do ecossistema.

---

## 1. Visão Geral

Esta sprint marca a transição do ARIANO de uma interface de simulação para um sistema de matchmaking real e produtivo. Substituiremos todos os dados mockados da animação de cadastro por resultados gerados em tempo real pela nossa pipeline de agentes IA, além de implementar o auto-login após o registro.

---

## 2. Pilares de Execução

### Passo 1 — Estabilização do Backend (Python)
- Refinar o `OrchestratorAgent` para garantir que a análise de perfil, configuração de grafo e cálculo de elegibilidade ocorram de forma atômica ou sequencial rastreável.
- Mapear chamadas de LLM para utilizar o modelo NVIDIA Nemotron-3 Super (120B) via OpenRouter com prompts otimizados para o ecossistema de Recife.
- Garantir que o endpoint `/api/users/register` retorne o contexto necessário para o frontend.

### Passo 2 — Refinamento da Experiência de Cognição (UI/UX)
- **Atualização de Textos:** Alterar de "O ARIANO está processando seu futuro" para "Nosso motor de IA está realizando os matches estratégicos para seu perfil...".
- **Limpeza Visual:** Remover o badge "Sincronização ativa" para um visual mais limpo e focado.
- **Dados Reais:** O componente `CognitionExperience` deve consumir o resultado real da `apiPromise`, exibindo o Top 3 Matches calculados pela IA com justificativas geradas pelo agente.

### Passo 3 — Automação e Fluxo de Autenticação
- **Auto-Login:** Implementar a chamada automática ao `checkAuth()` após o sucesso do cadastro, garantindo que o usuário entre no dashboard já autenticado sem precisar de um novo login manual.
- **Botões Funcionais:** Garantir que todos os botões da tela final ("Ver cada match", "Explorar Meu Perfil") redirecionem corretamente para as rotas funcionais do app.

### Passo 4 — Design System & Micro-interações
- **Theme Toggle:** Atualizar o botão de alternância de tema (Sol/Lua) com animações fluidas via `framer-motion`, garantindo consistência em todas as páginas (Landing e Dashboard).
- **Polimento de Cards:** Ajustar os `MatchResultCards` para exibir as justificativas da LLM com a estética premium do projeto.

---

## 3. Arquitetura da Pipeline IA (Mapeamento)

1. **ProfileAnalyzer (Fase 1):** Extração de skills + Classificação de áreas + Cálculo de Maturidade (0-10).
2. **EditalInterpreter (Fase 1):** Interpretação de requisitos e fomento.
3. **EligibilityCalculator (Fase 2):** Scoring (45% Skill, 25% Area, 15% Maturidade, 15% Priority) + Justificativa LLM.
4. **ContextualAnalyzer (Fase 3 - 24h):** Ciclo diário de configuração de nodes e montagem de Chain-of-Thought (CoT) para evolução do grafo.

---

## 4. Critérios de Aceite (DoD)

- [ ] Cadastro gera nós reais no Neo4j com skills e maturidade extraídas por IA.
- [ ] Usuário é autenticado automaticamente via cookie após o cadastro.
- [ ] Animação de processamento exibe matches reais gerados pela pipeline.
- [ ] Botão de tema animado e funcional em toda a plataforma.
- [ ] Documentação do projeto (`01_DOCUMENTO_PROJETO_ARIANO.md`) atualizada com o novo status.

---
> **Próxima Ação:** Iniciar a implementação do auto-login no frontend e atualização da `CognitionExperience`.
