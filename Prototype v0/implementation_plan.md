# Refinamento Pós-Cadastro, Neo4j e Design System

Esta etapa do projeto foca em corrigir as quebras de dados após o cadastro e aplicar as regras de negócio e de design exigidas para o Dashboard, Ecossistema e Comunidades.

## Open Questions

> [!WARNING]
> Os dados do Chat da Comunidade serão salvos apenas no LocalStorage temporariamente como mock ou você quer que eu crie uma rota de backend usando Neo4j ou Supabase para armazenar as mensagens? Por padrão, farei um mock simples em memória local, conforme solicitado ("de forma simples mesmo").

> [!WARNING]
> O motor cognitivo retorna Matches e Redes. Vou modificar a rota `/api/agents/cognition/full` para rodar o Cypher de criação destas arestas (`HAS_SKILL`, `BELONGS_TO_CLUSTER`, `ELIGIBLE_FOR`) para que apareçam na tela do dashboard corretamente. Posso seguir?

## Proposed Changes

### Backend: Graph Persistence e Labels
#### [MODIFY] app/api/agent_routes.py
- Na função `cognition_full`, após o resultado da LLM, inseriremos comandos `run_cypher` para vincular o `User` aos `Editais` (Matches) usando a relação `ELIGIBLE_FOR`.
- Inseriremos também relacionamentos com `Skill` ou `Cluster` conforme as "redes" devolvidas pela LLM, resolvendo o bug do "Meu Ecossistema" vazio.

#### [MODIFY] app/services/graph_analysis.py
- Modificar o `get_enriched_graph_data` para resolver a falta de labels, evitando a palavra "Nó" + hash. Se o nó for do tipo Cluster ou Skill, pegaremos a label correta que define o assunto daquele nó.

### Frontend: Comunidades e Ecossistema

#### [MODIFY] frontend/src/pages/UserCommunitiesPage.tsx
- Modificar a geração da `clusterList` para parar de chamar "Cluster 0X" e usar as `topSkills` como o nome e tag do Cluster.
- Alterar o texto "Potencial" para usar o próprio nome do cluster.
- Renomear "Afinidade IA" para apenas "Afinidade".
- Ordernar os clusters sempre pela maior Afinidade (`match` score).
- **Regra de Visibilidade**: Um usuário só pode ver os cards de comunidades às quais ele pertence (quando o cluster fizer intersecção com o do usuário).
- Adicionar evento de clique no Card para invocar o popup de Chat.

#### [NEW] frontend/src/components/CommunityChatModal.tsx
- Criar um componente de Popup modal contendo um chat da comunidade.
- Usará o Design System com tema ciano/Teal, bordas de vidro (glassmorphism).
- Estado simulado para trocar mensagens internamente de "forma simples".

#### [MODIFY] frontend/src/pages/UserEcosystemPage.tsx
- Esconder a palavra "COT #..." da visualização do usuário.
- O grafo só irá puxar e renderizar as comunidades que o próprio perfil do usuário está inserido.
- Se o backend já devolver filtrado via `api.getGraphInsight(user.uid)` (endpoint de grafo pessoal), nós aplicaremos as cores em Teal (Ciano) em vez de Laranja nas janelas/comunidades dessa página específica.
- Garantir a funcionalidade de clicar no nó do grupo e ele mostrar os detalhes do grupo.

#### [MODIFY] frontend/src/components/NetworkXGraphView.tsx
- Alterar hardcodes da cor laranja para usar Ciano/Teal no modo de visão do usuário final. Retirar também "Cluster 0X" e "Nó X".

## Verification Plan

### Manual Verification
1. Criar uma conta nova.
2. Aguardar a animação do terminal (Cognition).
3. Entrar no Dashboard e confirmar que Oportunidades não estão vazias (0).
4. Clicar em "Ver todos os matches" ou no menu esquerdo e garantir que os nós e cards agora possuem nomes reais.
5. Em Comunidades, clicar no card que o usuário tem e verificar o popup de chat abrindo perfeitamente com a cor Teal.
6. Garantir que apenas Comunidades atreladas ao usuário fiquem visíveis para ele.
