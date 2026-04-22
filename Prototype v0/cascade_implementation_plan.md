# Plano de Implementação em Cascata: Inteligência Relacional com NetworkX

Este plano detalha a reestruturação do ARIANO para integrar a biblioteca **NetworkX** como motor de inteligência analítica, transformando o Grafo de Conhecimento em um sistema de detecção de **Comunidades de Pensamento** e análise de centralidade estratégica.

---

## 🌊 Fase 1: Análise e Especificação (NetworkX Intelligence)
- **Objetivo**: Transmitir inteligência de grafos complexos do backend para a experiência do usuário.
- **Papel do NetworkX**: Realizar cálculos de **Community Detection** (Louvain/Girvan-Newman) e **Centralidade de Grau/Intermediação** para identificar quem são os "pontes" no ecossistema de Recife.
- **Impacto no UX**: O usuário não verá apenas matches, mas em qual "Cluster de Inovação" ele está inserido e qual sua influência relativa na rede.

## 🏗️ Fase 2: Projeto da Solução (Design do Motor Analítico)
- **Componente 1: `NetworkXService`**: Serviço Python que espelha o grafo (Neo4j ou Memory) em um objeto `nx.Graph()` para cálculos intensivos.
- **Componente 2: `CommunityEndpoint`**: Nova rota de API `/api/graph/communities` que retorna os nós agrupados por afinidade algorítmica.
- **Componente 3: `RelationalInsights`**: Módulo de IA que interpreta os clusters do NetworkX e gera explicações em linguagem natural (ex: "Você é um nó conector entre Saúde e IA").

## 🔨 Fase 3: Desenvolvimento (Implementation) 

### Passo 3.1: Integração Backend (O Coração Analítico)
- [ ] Implementar `app/services/graph_analysis.py` utilizando NetworkX.
- [ ] Criar lógica para converter `MemoryGraphStore` ou Neo4j em `nx.MultiDiGraph`.
- [ ] Implementar algoritmo de detecção de comunidades para gerar o campo `cluster_id` nos nós.

### Passo 3.2: Evolução da Experiência (Frontend)
- [ ] Atualizar `UserEcosystemPage.tsx` para colorir os nós baseando-se nos clusters do NetworkX.
- [ ] Implementar visualização de "Clusters de Influência" na `UserCommunitiesPage.tsx`.
- [ ] Integrar os insights do NetworkX na "Dica Cognitiva" do Dashboard.

## 🧪 Fase 4: Testes e Verificação (Testing)
- [ ] Validar a performance da conversão Grafo -> NetworkX em tempo de execução no Vercel.
- [ ] Verificar se a clusterização faz sentido semântico (ex: skills de Python agrupadas).
- [ ] Testar a persistência do `cluster_id` no cache do usuário.

## 🚀 Fase 5: Implantação e Deploy (Branch dev)
- [ ] Garantir que `networkx` está no `requirements.txt`.
- [ ] Realizar merge das features na branch `dev`.
- [ ] Documentar os novos algoritmos no Relatório de Sprint 4.
