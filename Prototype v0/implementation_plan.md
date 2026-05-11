# 🧠 ARIANO — Sprint de Polimento & Integração (v19.0)

> **Data:** 11/05/2026 · **Status:** 🟡 Aguardando aprovação para execução

---

## Diagnóstico Geral do Estado Atual

Análise completa do código (frontend/backend) e toda a documentação revelou as seguintes incongruências críticas entre o que a doc descreve e o implementado:

### ❌ Problemas Críticos / Alta Prioridade

| # | Problema | Arquivo | Impacto |
|---|----------|---------|---------|
| 1 | Primeira fase do cadastro não exibe "nó vazio com radar" e título correto | `CognitionExperience.tsx` — fase `loading` | 🔴 Alto |
| 2 | Banner "Modo Efêmero" aparece no `UserDashboard.tsx` (linhas 77–90) | `UserDashboard.tsx` | 🔴 Alto |
| 3 | `/user/ecossistema` usa `MiniGraphAnimation` estático (step=3 fixo, sem dados reais) | `UserEcosystemPage.tsx` linha 68 | 🔴 Alto |
| 4 | `neo4j_driver.py` força `memory_mode` quando senha é `ariano2026` fora do localhost — bug que impede o Neo4j local de ser usado | `neo4j_driver.py` linhas 616–619 | 🔴 Crítico |
| 5 | Topologia do ecossistema do usuário tem dados hardcoded (82%, density 0.42) | `UserEcosystemPage.tsx` linhas 116–141 | 🟠 Médio |

---

## GRUPO 1 — Animação do Fluxo de Cadastro

> **Objetivo:** A primeira animação (fase `loading`) deve mostrar um nó vazio (bola sem preenchimento) com animação de radar expandindo, o nome do usuário abaixo e o título: **"ARIANO está processando suas informações…"**

### Passo 1.1 — Criar componente `EmptyNodeRadar`

**Arquivo:** `frontend/src/components/EmptyNodeRadar.tsx` (novo)

- Círculo central: `border-2 border-primary rounded-full` — sem preenchimento sólido (representa nó ainda vazio no grafo)
- 3 ondas de radar: `motion.div` absolutamente posicionados, `rounded-full`, `border border-primary/40`
- Animação: `animate={{ scale: [1, 2.5, 3.5], opacity: [0.5, 0.2, 0] }}` com delays `0s`, `0.5s`, `1s` — ciclo infinito
- Nome do usuário: abaixo do círculo, `text-primary font-mono font-bold text-sm mt-4`
- Ponto de luz central: `w-3 h-3 bg-primary rounded-full animate-pulse`

### Passo 1.2 — Refatorar fase `loading` no `CognitionExperience.tsx`

**Arquivo:** `frontend/src/components/layout/CognitionExperience.tsx`

**O que mudar:**
- Substituir `<CognitionOrb />` por `<EmptyNodeRadar userName={userName} />`
- Título: `"ARIANO está processando suas informações…"` (não "Ativando motor cognitivo")
- Subtítulo: `"Configurando seu nó no Grafo de Conhecimento"`
- Manter a chamada à API em background (já existe) — a fase `loading` dura até a API retornar (min 2s)

---

## GRUPO 2 — Remoção do Aviso "Modo Efêmero"

> **Objetivo:** Remover completamente qualquer banner ou aviso de "Modo Efêmero" de TODA a interface.

### Passo 2.1 — Remover do `UserDashboard.tsx`

**Arquivo:** `frontend/src/pages/UserDashboard.tsx`

Remover:
- `const [isMemoryMode, setIsMemoryMode] = useState(false);` (linha 46)
- O `useEffect` que chama `api.getAgentStatus()` só para checar `is_memory_mode` (linhas 48–56)
- O bloco JSX `{isMemoryMode && (...)}` com `AlertTriangle` (linhas 77–90)
- Import `AlertTriangle` de lucide-react se não usado em outro lugar

### Passo 2.2 — Varredura global por outros avisos

Verificar e limpar em: `DashboardPage.tsx`, `AcademicosPage.tsx`, `EditaisPage.tsx`, `MatchesPage.tsx`, `GrafoPage.tsx`, `UserCommunitiesPage.tsx`, `UserMatchesPage.tsx`

Buscar padrões: `is_memory_mode`, `memory_mode`, `Efêmero`, `ephemeral`

---

## GRUPO 3 — Integração Neo4j: Conectar com o Banco Local

> **Objetivo:** O backend deve sempre usar o Neo4j local quando disponível, sem fallback desnecessário.

### Passo 3.1 — Corrigir lógica de detecção no `neo4j_driver.py`

**Arquivo:** `app/core/neo4j_driver.py`

**Bug atual (linhas 616–619):**
```python
# Força memory mode se senha for "ariano2026" em não-localhost — INCORRETO
if (not settings.neo4j_password or settings.neo4j_password == "ariano2026") and not is_localhost:
    _use_memory = True
    return None
```

**Correção:** Remover esta verificação de senha como trigger de memory mode. A única condição válida para memory mode deve ser **falha real de conexão** (exception no `session.run("RETURN 1")`). O sistema deve tentar conectar e só cair em memory mode se a conexão genuinamente falhar.

### Passo 3.1b — Estratégia de credenciais Neo4j para Vercel (Deploy em produção)

**Contexto:** A senha atual do Neo4j local é desconhecida (o painel admin usa `admin@ariano.gov` / `admin123`, que é a auth da aplicação, não do banco). O Neo4j em produção/Vercel precisa de uma instância acessível remotamente.

**Estratégia para deploy em live no Vercel:**
- Usar **Neo4j Aura Free** (cloud gerenciado gratuito) — cria instância em `neo4j+s://xxx.databases.neo4j.io`
- Configurar as seguintes **Environment Variables no Vercel**:
  ```
  NEO4J_URI=neo4j+s://<sua-instancia>.databases.neo4j.io
  NEO4J_USER=neo4j
  NEO4J_PASSWORD=<senha-gerada-pelo-aura>
  ```
- No ambiente local, continuar usando `bolt://localhost:7687` via `.env`
- O `neo4j_driver.py` já detecta `is_localhost` — funciona para ambos os cenários automaticamente após a remoção do bug

**Passo prático:** Criar conta em https://neo4j.com/cloud/aura-free/, criar instância, copiar credenciais para o Vercel.

### Passo 3.2 — Adicionar endpoint de health do Neo4j

**Endpoint:** `GET /api/health/neo4j`

```json
{
  "neo4j_connected": true,
  "mode": "neo4j" | "memory",
  "node_count": 42,
  "edge_count": 187
}
```

Uso: apenas para debug dos desenvolvedores, nunca exposto no frontend.

### Passo 3.3 — Garantir que seed popula o Neo4j real

**Arquivo:** `app/services/seed_native.py`

- Verificar se usa `run_cypher()` corretamente
- Adicionar log: `"✅ Seed executado no Neo4j real"` vs `"📦 Seed no modo memória"`

### Passo 3.4 — Verificar persistência das arestas ELIGIBLE_FOR

**Arquivo:** `app/agents/eligibility_calculator.py`

- Confirmar que as arestas criadas pelos agentes são persistidas via `run_cypher()` com MERGE no Neo4j
- Query MERGE deve incluir: `score`, `justification`, `matched_skills`, `matched_areas`, `calculated_at`

### Passo 3.5 — Melhorar clareza dos logs do backend (debug estruturado)

**Objetivo:** Tornar os logs do servidor mais legíveis e úteis para depuração futura, sem expor nada no frontend.

**Arquivos:** `app/core/neo4j_driver.py`, `app/main.py`, `app/agents/*.py`, `app/api/agent_routes.py`

**Padrão de logs a adotar:**
```
[NEO4J]  ✅ Conectado em bolt://localhost:7687 (42 nós, 187 arestas)
[NEO4J]  ⚠️  Falha ao conectar. Usando modo memória.
[AGENT]  🧠 ProfileAnalyzer → iniciado para uid=abc123
[AGENT]  ✅ ProfileAnalyzer → concluído em 2340ms | skills=5, areas=3, maturidade=7.2
[AGENT]  ❌ EligibilityCalculator → erro: timeout após 25s
[MATCH]  🎯 3 matches criados para uid=abc123 | top_score=0.91
[SEED]   📦 Modo memória — 15 nós, 8 editais carregados
[SEED]   ✅ Neo4j real — seed executado com sucesso
[AUTH]   🔑 Login: admin@ariano.gov (admin) — sucesso
[AUTH]   🔑 Login: user@test.com — falha (senha incorreta)
```

- Usar prefixo `[MÓDULO]` em todos os logs relevantes
- Emojis para status rápido (✅ sucesso, ⚠️ aviso, ❌ erro, 🧠 IA, 🎯 match)
- Incluir `uid`, tempos de execução (ms) e contagens em logs de agentes

---

## GRUPO 4 — Ecossistema do Usuário: Grafo Real

> **Objetivo:** `/user/ecossistema` deve renderizar o mesmo `NetworkXGraphView` do admin (`/admin/grafo`), filtrado para mostrar apenas o subgrafo do usuário logado (ego-network + cluster CoT).

### Passo 4.1 — Criar endpoint de grafo pessoal

**Arquivo:** `app/services/graph_analysis.py` (ou onde o grafo é servido)

**Endpoint:** `GET /api/graph/layout?scope=personal&uid={uid}`

Comportamento:
1. Carregar grafo completo do Neo4j
2. Filtrar para incluir apenas:
   - Nó do próprio usuário
   - Vizinhos diretos: Skills (`HAS_SKILL`), Areas (`RESEARCHES_AREA`), Editais com match (`ELIGIBLE_FOR`)
   - Acadêmicos do mesmo cluster CoT (`SIMILAR_TO`)
3. Computar `spring_layout` no subgrafo via NetworkX
4. Retornar `{ nodes, edges, communities, density, connectivity_score }`

> **Nota:** O endpoint admin existente `GET /api/graph/layout` (sem parâmetros) continua intacto. O parâmetro `scope=personal&uid=xxx` é adicionado como extensão.

### Passo 4.2 — Adaptar `NetworkXGraphView` para aceitar URL como prop + usar na página de ecossistema

**Confirmado:** A URL do endpoint está **hardcoded** dentro de `NetworkXGraphView.tsx`. É necessário primeiro refatorar o componente para aceitar a URL via prop, depois usá-lo na página do ecossistema.

**Sub-passo 4.2.a — Refatorar `NetworkXGraphView.tsx`:**
- Adicionar prop `apiUrl?: string` (default: `/api/graph/layout` — comportamento atual do admin mantido)
- Usar `apiUrl` na chamada `fetch` interna do componente
- Não quebrar o uso existente em `GrafoPage.tsx` (admin)

**Sub-passo 4.2.b — Atualizar `UserEcosystemPage.tsx`:**
- Importar `NetworkXGraphView` em vez de `MiniGraphAnimation`
- Passar `apiUrl={\`/api/graph/layout?scope=personal&uid=${user.uid}\`}`
- Configurar para o contexto pessoal:
  - Painel de detalhes ao clicar em nó: ✅ ativo
  - Painel de filtros de tipo: opcional (toggle simples)
  - Nó do próprio usuário: maior e destacado visualmente
  - Halos CoT: visíveis mostrando a comunidade do usuário

### Passo 4.3 — Substituir dados hardcoded por dados reais

**Arquivo:** `frontend/src/pages/UserEcosystemPage.tsx`

Substituir:
- `82%` → `connectivity_score` da API
- `"Elite Técnica"` → label calculado por percentil
- `density 0.42` → `density` da API
- `"forte convergência técnica"` → texto do `insight` já vindo da IA

---

## GRUPO 5 — QA e Polimento Final

### Passo 5.1 — Verificar integração das páginas do usuário

- [ ] `/user` — Dashboard: matches reais, sem Modo Efêmero
- [ ] `/user/matches` — usa `api.getMatches()` com UID real
- [ ] `/user/ecossistema` — usa grafo real (após grupo 4)
- [ ] `/user/profile` — dados do usuário real (maturidade, o_que_busco)

### Passo 5.2 — Verificar integração das páginas do admin

- [ ] `/admin` — contagens reais do Neo4j
- [ ] `/admin/academicos` — lista real
- [ ] `/admin/editais` — lista real
- [ ] `/admin/matches` — ELIGIBLE_FOR reais
- [ ] `/admin/grafo` — NetworkXGraphView com dados reais ✅
- [ ] `/admin/comunidades` — pipeline de enriquecimento

### Passo 5.3 — Testar fluxo completo end-to-end

- Formulário → EmptyNodeRadar (loading) → editais → network → matches → done → navigate
- Botão "Pular Animação" deve permanecer funcional e discreto
- Responsividade em mobile (375px) e tablet (768px)

---

## Ordem de Execução (Cascata)

```
GRUPO 2 (Remoção do Aviso)       → Mais rápido, sem dependências
    ↓
GRUPO 1 (Animação de Cadastro)   → Frontend apenas
    ↓
GRUPO 3 (Neo4j Integration)      → Backend, pode ser paralelo ao Grupo 1
    ↓
GRUPO 4 (Ecossistema Real)       → Depende do Grupo 3 (endpoint personal)
    ↓
GRUPO 5 (QA Final)               → Depende de todos os anteriores
```

---

## Critérios de Aceite desta Sprint

- [x] Fase `loading` exibe bola vazia com radar, nome do usuário e título correto
- [x] Nenhuma página exibe o aviso "Modo Efêmero"
- [x] Backend conecta ao Neo4j local sem forçar memory mode indevidamente (bug da senha `ariano2026` removido)
- [x] Endpoint `GET /api/health/neo4j` retorna status correto
- [x] `/user/ecossistema` renderiza `NetworkXGraphView` com subgrafo real do usuário
- [x] Dados de topologia no ecossistema são reais (não hardcoded)
- [x] Seed popula o Neo4j real corretamente (logs `[SEED]` estruturados)
- [x] Fluxo completo de cadastro funciona end-to-end sem erros visíveis
- [x] **Build TypeScript passou sem erros** (`tsc && vite build` ✅)

---

> **Status:** ✅ Sprint concluída com sucesso em 11/05/2026.
> **Build:** `npm run build` passou sem erros de TypeScript.
> **Próximo passo:** Configurar Neo4j Aura Free + env vars no Vercel para habilitar persistência em produção.


---

## Questões Resolvidas

| Questão | Resposta | Impacto no Plano |
|---------|----------|------------------|
| `NetworkXGraphView` tem URL como prop? | **Não — está hardcoded.** | Adicionado sub-passo 4.2.a para refatorar o componente antes de usá-lo no ecossistema |
| Senha do Neo4j local? | **Desconhecida.** `admin123` é da aplicação, não do banco. | Adicionado Passo 3.1b com estratégia Neo4j Aura Free para o Vercel + `.env` local |
| Logs de Modo Efêmero no backend? | **Manter no servidor.** Adicionar logs mais claros para debug. | Adicionado Passo 3.5 com padrão de logging estruturado |

---

> **Próxima ação:** Aguardando aprovação para iniciar execução em cascata.
