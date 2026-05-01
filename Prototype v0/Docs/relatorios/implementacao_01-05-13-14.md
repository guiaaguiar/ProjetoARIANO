# 📐 Plano de Implementação — Melhorias do Grafo CoT ARIANO
**Arquivo:** `implementacao_01-05-13-14.md`  
**Data:** 01/05/2026 · 13:14  
**Sprint:** 4 (continuação) — Refinamento Visual & Funcional do Grafo  

---

## 1. Contexto e Objetivo

A versão atual do Grafo CoT (`/admin/grafo`) está funcional após a transição para `react-force-graph` + NetworkX backend. Contudo, o refinamento visual e funcional identificado requer melhorias para elevar a experiência a um nível premium.

**Estado atual (problemas):**
- Labels sumindo ao dar zoom out
- Background totalmente sólido (`#020810`) — isolado da página
- Conexões finas e sem destaque visual
- Tamanho dos nós uniforme (sem hierarquia)
- Arrastar um nó movimenta toda a rede
- Clusters CoT apenas na legenda lateral, sem representação no canvas
- Painel de detalhes com dados estáticos/genéricos

**Objetivo após as mudanças:**
- Grafo visualmente denso com identidade neon premium
- Labels permanentemente legíveis dentro dos nós
- Clusters visíveis como halos/bolhas de fundo no canvas
- Painel lateral rico com dados reais do nó e suas conexões
- Comportamento de arraste individual (sem propagação de força)
- Hierarquia visual clara entre tipos de nó

---

## 2. Frentes de Trabalho (7 no total)

### Frente 1 — Labels Permanentes Dentro dos Nós

**Problema:** Labels só aparecem com `globalScale > 2` — somem ao afastar.

**Solução:**
- Remover condição de `globalScale` para renderização
- Texto centralizado verticalmente **dentro** do círculo
- Fonte `Inter 700` (fonte padrão do site)
- Fundo semi-opaco circular para garantir contraste
- Truncar com `…` em labels longos

**Arquivo:** `NetworkXGraphView.tsx` → função `drawNode`

---

### Frente 2 — Background Semitransparente

**Problema:** Canvas com `backgroundColor="#020810"` sólido.

**Solução:**
- `backgroundColor="transparent"` no `ForceGraph2D`
- Wrapper com `background: rgba(2, 8, 16, 0.75)` + `backdrop-filter: blur(2px)`
- O fundo topográfico da página ficará visível através do grafo

**Arquivo:** `NetworkXGraphView.tsx` → JSX do wrapper

---

### Frente 3 — Estética Neon Aprimorada

**Problema:** Conexões finas e glow fraco não criam impacto visual.

**Solução:**
- **Nós:** `shadowBlur` de 20–30px + segundo anel de glow
- **Conexões:**
  - `linkWidth` dinâmico: 2px básico, 3–4px para `ELIGIBLE_FOR` e `SIMILAR_TO`
  - Cor por tipo de aresta
  - `linkDirectionalParticles` nas arestas de match
- **Nós:** Borda dupla com cor do cluster

**Arquivo:** `NetworkXGraphView.tsx`

---

### Frente 4 — Painel Lateral de Detalhes Rico

**Problema:** Painel mostra apenas cluster_id e influence genéricos. `metadata` está vazio.

**Solução Backend (`graph_analysis.py`):**
- Enriquecer payload de cada nó com campos reais:
  - Acadêmicos: `institution`, `maturidade`, `o_que_busco`, `bio` (truncado)
  - Editais: `funding`, `deadline`, `edital_type`, `instituicao`
  - Skills/Áreas: `category`, `parent_area`
  - Campo `connections`: lista `{uid, label, type, edge_type}` (vizinhos diretos)

**Solução Frontend (`GrafoPage.tsx`):**
- Painel com seções:
  1. Cabeçalho — avatar com iniciais, tipo (badge), CoT badge colorido
  2. Métricas NetworkX — Influência, Conectividade, Cluster
  3. Campos do Nó — tabela de campos reais
  4. Conexões Diretas — lista de vizinhos com tipo e rótulo da aresta
  5. Ações — "Fixar no Grafo" e "Ver Perfil" (se acadêmico)

---

### Frente 5 — Hierarquia de Tamanhos por Tipo de Nó

**Problema:** Todos os nós com tamanho baseado apenas em `influence`.

**Solução:**
```
area   → base: 4px  (menor, cap: 8px)
skill  → base: 6px
edital → base: 10px
student/researcher/professor → base: 12px
```
- `influence` como multiplicador proporcional
- `area` com tamanho máximo fixo

**Arquivo:** `NetworkXGraphView.tsx` → função `drawNode`

---

### Frente 6 — Arrastar Individual (Sem Propagação de Força)

**Problema:** Arrastar um nó movimenta todos os outros ao redor.

**Solução:**
- `onNodeDragStart` → fixar (`fx, fy`) todos os nós
- `onNodeDragEnd` → liberar apenas o nó movido, com posição fixada
- Parâmetros: `d3AlphaDecay={0.02}`, `d3VelocityDecay={0.3}` para estabilização rápida
- Nó arrastado mantém posição fixa após drop

**Arquivo:** `NetworkXGraphView.tsx`

---

### Frente 7 — Clusters CoT no Background do Canvas

**Problema:** Clusters só existem na legenda. No canvas, nenhuma representação visual de agrupamento.

**Solução:**
- Usar `onRenderFramePre` do `ForceGraph2D` para desenhar halos **antes** dos nós
- Para cada cluster: calcular centróide (média x, y) e raio de cobertura
- Desenhar:
  1. Círculo preenchido: `fillStyle: rgba(cor, 0.04)` — halo suave
  2. Borda tracejada: `rgba(cor, 0.15)`, `lineDash([6, 4])`
  3. Label do tema no centróide com fonte pequena e `rgba(cor, 0.4)`
- Halos recalculados a cada frame — deformam organicamente com movimento dos nós

**Arquivo:** `NetworkXGraphView.tsx` → prop `onRenderFramePre`

---

## 3. Arquivos Envolvidos

| Arquivo | Tipo | Frentes |
|---------|------|---------|
| `frontend/src/components/NetworkXGraphView.tsx` | MODIFICAR | 1, 2, 3, 5, 6, 7 |
| `frontend/src/pages/GrafoPage.tsx` | MODIFICAR | 4 (frontend) |
| `app/services/graph_analysis.py` | MODIFICAR | 4 (backend) |

---

## 4. Sequência de Execução

```
1. Backend → enriquecer payload dos nós (Frente 4-backend)
2. NetworkXGraphView → hierarquia de tamanhos (Frente 5)
3. NetworkXGraphView → labels permanentes (Frente 1)
4. NetworkXGraphView → background semitransparente (Frente 2)
5. NetworkXGraphView → estética neon (Frente 3)
6. NetworkXGraphView → arrastar individual (Frente 6)
7. NetworkXGraphView → clusters no background (Frente 7)
8. GrafoPage → painel lateral rico (Frente 4-frontend)
9. Build, debug e deploy
```

---

## 5. O Que Esperamos Após as Mudanças

### Experiência Visual
- Grafo comparável a ferramentas como Gephi ou Neo4j Browser, com estética premium neon
- Clusters **imediatamente legíveis** pelo canvas — sem precisar consultar a legenda
- Labels sempre visíveis tornam o grafo **navegável sem zoom**

### Experiência Funcional
- Painel lateral como **janela de inteligência**: admin vê tudo que o sistema sabe sobre aquele nó
- Arrastar individual torna o grafo **editável com precisão** sem bagunçar o layout

### Alinhamento Documental
- Concretiza a visão da seção **4.4.3** do Documento de Projeto:
  > *"Interatividade Total. Temas de Comunidade: Legendas dinâmicas. Visual Premium: Nós com efeitos de brilho proporcionais à influência."*
- Os halos de cluster materializam as **Comunidades de Pensamento (CoTs)** visualmente — antes eram apenas conceitos matemáticos no servidor

### Impacto no Produto
- `/admin/grafo` deixa de ser "demonstração técnica" e passa a ser uma **ferramenta de análise real**
- A combinação painel lateral + conexões visíveis permite entender **por que** acadêmicos estão no mesmo cluster

---

## 6. Critérios de Aceitação

- [ ] Labels de todos os nós visíveis em qualquer nível de zoom
- [ ] Labels centralizados dentro do círculo, fonte Inter
- [ ] Canvas com fundo semitransparente (fundo da página visível)
- [ ] Conexões com largura ≥ 2px, cor por tipo de aresta
- [ ] Nós com glow neon intenso e borda dupla de cluster
- [ ] Nós de área visivelmente menores que acadêmicos/editais
- [ ] Arrastar um nó não movimenta outros
- [ ] Halos de cluster visíveis no background do canvas
- [ ] Label do tema CoT sobre cada halo
- [ ] Painel lateral: nome, tipo, métricas, campos reais, conexões diretas
- [ ] Deploy estável no Vercel sem erros de build

---

> **Regra:** Nenhuma linha de código escrita antes da aprovação deste plano.
