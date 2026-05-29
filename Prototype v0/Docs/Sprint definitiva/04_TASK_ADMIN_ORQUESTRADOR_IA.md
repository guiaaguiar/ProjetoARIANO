# 🎯 TASK 04: O ORQUESTRADOR E COMUNIDADES (PAINEL ADMIN)

## 📝 Visão Geral
Para provar que o ARIANO é inteligente, precisamos mostrar que o grafo não é estático. Diariamente, a IA varre o banco para melhorar os matches (encontrar comunidades ocultas, refazer conexões). Isso precisa ser visível para a SECTI no Painel de Admin.

## 🛠 O que deve ser feito (Step-by-Step)
1.  **Job do Orquestrador (Backend):**
    * Verifique (ou crie) o agente `ContextualAnalyzer` ou `Orchestrator`. Ele deve ter uma função que execute um `SELECT *` figurativo no Neo4j (puxar o contexto global).
    * O Prompt deste agente deve orientá-lo a: *"Você é o orquestrador. Reavalie as conexões deste grafo. Atualize as porcentagens de match se necessário e crie novas arestas se identificar perfis similares."*
    * Crie uma rota para disparar este fluxo manualmente (para fins de apresentação/teste).
2.  **Visualização do 'Chain of Thought' (Frontend Admin):**
    * Na página de Admin (`/admin/comunidades`), adicione um console real que escute (via Server-Sent Events ou Polling) os logs de raciocínio da IA durante essa varredura diária. A SECTI precisa ver a IA trabalhando.
3.  **Filtros de Legenda Interativos no Grafo:**
    * Adicione botões/legendas clicáveis acima do grafo do Admin.
    * Se o usuário clicar na legenda "Editais", todos os nós e links desse tipo devem desaparecer (ou esmaecer), mantendo apenas as outras conexões visíveis.
    * Crie filtros similares para as "Comunidades de Pensamento" identificadas pela IA.

## ✅ Critérios de Aceitação (DoD)
- [ ] Existe um botão no Admin que dispara o reprocessamento global do grafo via LLM.
- [ ] Os "pensamentos" da LLM são exibidos em tempo real na tela do Admin.
- [ ] Filtros interativos permitem ocultar/mostrar tipos específicos de nós no grafo sem quebrar a simulação de física.
