# 🚀 ARIANO — Estabilidade Final & Persistência Local (Sprint 16)

## 🎯 Visão Geral
Este plano detalha a transição final da arquitetura de dados do ARIANO: abandonando a dependência do **Neo4j AuraDB (Cloud)** em favor de um modelo **"Neo4j Local"** (motor em memória) persistido de forma robusta via **Vercel KV (Redis)**.

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

## ⚠️ Riscos e Mitigações
- **Risco**: Timeout durante o salvamento de grafos muito grandes.
- **Mitigação**: O salvamento é otimizado e o timeout da Vercel já está em 60s. Futuramente, pode-se implementar salvamento incremental.
