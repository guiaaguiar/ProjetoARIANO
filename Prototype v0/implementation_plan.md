# 🚀 ARIANO — Estabilidade Final & Persistência Local (Sprint 16)

> **Versão:** 12.0.0
> **Status:** 🚧 EM ANDAMENTO (05/05/2026)
> **Foco:** Desacoplamento síncrono da IA, Polling no Frontend e Redução de Latência.

---

## 🧠 Decisões Arquiteturais

### 1. Por que Vercel KV (Redis)?
- **Sinergia Serverless**: Diferente do Neo4j tradicional, o Vercel KV é otimizado para conexões rápidas via HTTP/REST, ideal para as funções serverless da Vercel.
- **Persistência do Cérebro**: O motor `MemoryGraphStore` é extremamente rápido (O(1)), mas volátil. O Redis servirá como o "disco rígido" onde o estado do grafo é salvo e carregado.
- **Custo e Complexidade**: Elimina a necessidade de gerenciar instâncias de banco de dados externas e faturas separadas (AuraDB).

### 2. Fluxo de Persistência
- **Escrita (Sync)**: Toda vez que um agente de IA cria um nó ou aresta, o sistema serializa o grafo em JSON e envia para o Vercel KV.
- **Leitura (Load)**: No início de cada requisição (ou boot do container), o sistema busca o JSON no KV e reconstrói o grafo em memória.

### 3. Segurança e Limites
- **Credenciais**: Uso estrito de `KV_REST_API_URL` e `KV_REST_API_TOKEN` via Environment Variables.
- **Quota**: Monitoramento do limite de 30MB (free tier) do Vercel KV. O grafo JSON atual é leve (~KB), suportando milhares de nós antes de necessitar upgrade.

---

## 🛠️ Próximos Passos (Plano de Ação)

### Fase 1: Provisionamento e Configuração [EM ANDAMENTO]
- [ ] **Criação do KV**: Finalizar o provisionamento do database `ariano-kv` no dashboard da Vercel.
- [ ] **Conexão de Projeto**: Linkar o `ariano-kv` ao projeto `ariano` para injeção automática de variáveis.
- [ ] **Sincronização Local**: Executar `vercel env pull` para validar as credenciais no ambiente de desenvolvimento.

### Fase 2: Integração e Testes de Código
- [ ] **Validação do Driver**: Testar se o `neo4j_driver.py` consegue se comunicar com o KV usando as novas chaves.
- [ ] **Teste de Serialização**: Garantir que grafos complexos (com múltiplos nós e arestas) sejam convertidos em JSON e restaurados sem perda de integridade.

### Fase 3: QA de Persistência (Teste Real)
- [ ] **Simulação de Reinício**: Fazer o deploy, criar um usuário, aguardar o encerramento da função serverless e verificar se os dados permanecem lá em uma nova consulta.
- [ ] **Teste de Stress**: Validar a latência das chamadas de IA com o overhead do salvamento no Redis.

### Fase 4: Entrega e Documentação
- [ ] **Walkthrough Final**: Registrar em vídeo/print o sucesso da persistência.
- [ ] **Checklist de Documentação**: Garantir que o `01_DOCUMENTO_PROJETO_ARIANO.md` reflita exatamente o estado final da infraestrutura.

---

# Implementation Plan - Sprint 17: Performance & Resiliência (Async Pipeline)
> **Status:** 🚧 EM ANDAMENTO (05/05/2026)

## 🎯 Objetivos
1.  **Latência Zero no Registro**: Garantir que o cadastro responda em < 2s, movendo a IA para segundo plano.
2.  **Polling Robusto**: Implementar consulta de status no `CognitionExperience` para evitar timeouts de rede.
3.  **Estabilidade de Conexão**: Resolver o erro visual na animação que ocorre após 30s de espera.

## 🛠️ Próximos Passos (Plano de Ação)

### Fase 1: Backend Assíncrono & Integridade
- [ ] **BackgroundTasks**: Mover `OrchestratorAgent.process_new_entity` para segundo plano.
- [ ] **Registration Return**: Garantir que `/api/users/register` retorne o UID e sucesso em < 500ms.
- [ ] **Memory Optimization**: Revisar imports pesados e globais para reduzir o uso de memória de 440MB para < 300MB.
- [ ] **Health Check Endpoint**: Criar `/api/users/check/{uid}` para confirmar existência no grafo persistente.

### Fase 2: Frontend Resilience & Sync
- [ ] **Wait for UID**: Impedir o início da animação de IA até que o registro retorne um UID válido.
- [ ] **Pre-Flight Check**: Realizar uma chamada ao novo endpoint de check antes de iniciar o `analyze-profile`.
- [ ] **Polling Logic**: Implementar consulta de status no `CognitionExperience.tsx` (intervalo de 2s).

### Fase 3: Infra & Deploy
- [ ] **Deploy de Correção**: Subir as mudanças para `main` e testar com um perfil de alta complexidade.
- [ ] **Monitoramento de Logs**: Validar se a duração da requisição de registro caiu de 50s para < 2s.

---

## ⚠️ Riscos e Mitigações
- **Risco**: A função serverless ser encerrada antes da Background Task terminar.
- **Mitigação**: O tempo limite da Vercel (`maxDuration`) protege a execução, mas a resposta HTTP será enviada antes, liberando o cliente.
