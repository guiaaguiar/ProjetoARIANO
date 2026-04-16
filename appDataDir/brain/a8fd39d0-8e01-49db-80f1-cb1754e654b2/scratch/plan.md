# Plano de Implementação: Experiência de Cognição ARIANO

## Objetivo
Transformar o processo de cadastro e o dashboard do usuário em uma experiência imersiva, onde a Inteligência Artificial ARIANO (Orchestrator, ProfileAnalyzer, EligibilityCalculator) é "vivida" pelo usuário através de feedback visual, simulação de grafos e transições impactantes.

## Fase 1: Interface de Cadastro Imersiva (Phase A)
- [ ] **Novo Estado `analyzing` no `CadastroPage.tsx`**: Após o envio bem-sucedido do formulário, em vez de `navigate('/login')`, entraremos em um modo de "Cognição em Tempo Real".
- [ ] **Terminal de Agentes (Visual)**: Exibir um log estilizado (estilo Matrix/Teal Neon) mostrando o progresso dos agentes:
  - `[Orchestrator] Iniciando pipeline de cognição para {nome}...`
  - `[ProfileAnalyzer] Extraindo inteligência do currículo PDF...`
  - `[ProfileAnalyzer] Mapeando competências: [React, IA, Node.js]...`
  - `[EligibilityCalculator] Cruzando conexões com Editais Governamentais...`
- [ ] **Mini-Grafo de Nascimento**: Exibir uma visualização de grafo simples que começa com o nó do usuário e "gera" nós de Skill e arestas de Match (ELIGIBLE_FOR) à medida que os agentes terminam suas tarefas.
- [ ] **Botão Final**: Após a simulação (que dura ~5-8 segundos), liberar o botão "Acessar Meu Painel".

## Fase 2: Portal do Usuário Expandido (Phase B)
- [ ] **Layout do Usuário com Sidebar**: Adicionar o `Sidebar` (ou uma versão `clean`) ao portal `/user/*`.
- [ ] **Página de Matches Pessoais**: Uma visão limpa e focada dos editais recomendados (semelhante ao admin, mas voltada ao candidato).
- [ ] **Página "Meu Ecossistema"**: Visualização do grafo centrada no usuário, mostrando apenas suas conexões e a "Comunidade de Pensamento" (Cluster Louvain) à qual ele pertence.

## Fase 3: Lógica de Backend e Polling (Phase C)
- [ ] **Simulação vs Realidade**: Como o processamento LLM leva alguns segundos, usaremos o tempo real do backend para alimentar o status do frontend ou uma simulação controlada para garantir o efeito "WOW".

## Cronograma de Execução (Cascata)
1. **Frontend: Componente `AnalysisProgress`** (Log e Mock de Simulação).
2. **Frontend: Atualização `CadastroPage.tsx`** para usar o novo componente.
3. **Frontend: Criação das rotas `/user/matches` e `/user/ecossistema`**.
4. **Backend: Ajuste no endpoint de registro** para retornar os dados necessários para o dashboard imediato.
