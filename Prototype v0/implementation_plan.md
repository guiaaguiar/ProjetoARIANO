# Sprint 18 — Fluxo de Cadastro Cinematográfico (Arquitetura Single-Call LLM)

## Contexto & Diagnóstico Root Cause

O erro **"Não foi possível localizar seu perfil no grafo"** persiste porque a arquitetura atual é fundamentalmente quebrada em serverless:

1. **Registro** → Lambda A salva o usuário no KV (chave individual `ariano:node:{uid}`)
2. **Pre-flight check** (`/api/users/check/{uid}`) → Lambda B faz `force_refresh`, mas o índice `ariano:uids` (SADD) pode não ter propagado ainda
3. **Pipeline da IA** → Lambda C não encontra o usuário → erro

A solução definitiva **não é adicionar mais retries** — é **redesenhar a arquitetura** para eliminar a dependência do KV como fonte de verdade durante o fluxo de cadastro. O usuário foi cadastrado, os dados estão **no formData do frontend**. A LLM não precisa buscar o usuário no grafo — ela **recebe o perfil diretamente**.

---

## Nova Arquitetura: Single-Call LLM + Deferred Persistence

```
[Frontend Form] → POST /api/users/register
       ↓
   {uid, token, profile_json} (response imediata ~200ms)
       ↓
[CognitionExperience] — usa profile_json local (sem poll ao grafo)
       ↓
   POST /api/agents/v2/cognition-full  ← UMA ÚNICA CHAMADA LLM
   body: { profile_json, editais_from_db }
       ↓
   LLM retorna JSON estruturado:
   {
     "edital_nodes": [...],      → Fase 1 da animação (3 nomes)
     "network_nodes": [...],     → Fase 2 (professores, alunos)
     "matches": [...],           → Fase 3 (título + justificativa)
   }
       ↓
[Animação cinematográfica em 3 fases]
       ↓
[Usuário clica em Match ou "Ver Perfil"]
       ↓
   POST /api/users/finalize   ← salva tudo no Neo4j/KV
```

---

## Proposed Changes

### Backend

#### [NEW] `app/api/agent_routes.py` → endpoint `/v2/cognition-full`

- Recebe `{ user_profile: dict, uid: str }` — **sem buscar usuário no KV**
- Busca editais disponíveis diretamente do grafo (editais nunca somem)
- Faz **uma única chamada ao LLM** com prompt estruturado
- Retorna JSON validado com `edital_nodes`, `network_nodes`, `matches`

**Prompt ao LLM:**
```
Você é o motor de matchmaking do ARIANO. Analise o perfil e retorne APENAS JSON válido:
{
  "edital_nodes": [{"name": "...", "uid": "..."}],  // 3 editais mais compatíveis
  "network_nodes": [{"name": "...", "type": "professor|student|researcher"}], // até 5 pessoas
  "matches": [
    {
      "edital_name": "...",
      "edital_uid": "...",
      "justification": "...",   // 1-2 frases técnicas por que é um match
      "score": 0.0-1.0
    }
  ]
}
```

#### [MODIFY] `app/api/user_routes.py` → endpoint `POST /register`

- Remove dependência de persistência no KV durante o fluxo
- Retorna `uid` + `profile_json` completo para o frontend usar localmente
- Persiste apenas autenticação (cookie JWT) imediatamente

#### [NEW] `app/api/user_routes.py` → endpoint `POST /finalize`

- Chamado **apenas quando o usuário interage** (clica em match ou "Ver Perfil")
- Body: `{ uid, profile_data, matches_data }`
- Salva tudo no Neo4j (ou KV) de forma síncrona e definitiva
- Cria relacionamentos `ELIGIBLE_FOR`, `HAS_SKILL`, `WORKS_IN_AREA`

---

### Frontend

#### [MODIFY] `CognitionExperience.tsx`

**Remover completamente:**
- Pre-flight check loop (`/api/users/check/{uid}`) — causa raiz do erro
- 4 chamadas separadas ao pipeline de IA
- Toda a lógica de retry e force_refresh

**Novo fluxo:**
```typescript
const runPipeline = async () => {
  // 1. Chama o endpoint único com o profile direto do formData
  setLogs(["🧠 Ativando motor cognitivo ARIANO..."]);
  const result = await fetch('/api/agents/v2/cognition-full', {
    method: 'POST',
    body: JSON.stringify({ user_profile: formData, uid: userId })
  });
  const { edital_nodes, network_nodes, matches } = await result.json();

  // 2. Fase 1: Anima os 3 editais entrando no grafo
  setPhase('editais');
  setEditalNodes(edital_nodes);
  await delay(3000);

  // 3. Fase 2: Anima a rede de pessoas conectadas
  setPhase('network');
  setNetworkNodes(network_nodes);
  await delay(3000);

  // 4. Fase 3: Revela os matches com justificativas
  setPhase('matches');
  setMatches(matches);
  setShowFinish(true);
};
```

**Nova estrutura de fases da animação:**

| Fase | Visual | Dados |
|------|--------|-------|
| `loading` | Partículas orbitando, "Ativando IA..." | — |
| `editais` | 3 nodes de editais aparecem no grafo | `edital_nodes[]` |
| `network` | Professores e alunos conectam-se | `network_nodes[]` |
| `matches` | Cards de match com justificativa da IA | `matches[]` |

#### [NEW] `CognitionGraphView.tsx`

Componente de grafo animado para as fases 1 e 2:
- Node central "Você" (ponto teal)
- Edges animadas conectando aos editais (fase 1)
- Novos nodes de rede aparecem com transição (fase 2)
- Baseado no `MiniGraphAnimation.tsx` existente, mas expandido

#### [MODIFY] `MatchResultCards.tsx`

- Ao clicar em um card de match, navega para `/user/graph?highlight={edital_uid}`
- Passa a justificativa da IA como query param ou via store
- **Antes de navegar**: chama `POST /api/users/finalize` para salvar tudo

---

## Verificação & Critérios de Sucesso

| Critério | Método |
|---|---|
| Zero erros "não encontrado" | Nenhuma busca ao grafo durante animação |
| Animação em 3 fases visuais | Inspeção manual no `/cadastro` |
| LLM responde com JSON válido | Log de servidor + `console.log` |
| Dados salvos só no final | Verificar `/api/users/debug/kv` antes e depois do clique |
| Timeout < 30s (Vercel limit) | Uma única chamada LLM vs 4 chamadas sequenciais |

---

## Ordem de Execução

- [ ] **1.** Criar endpoint `POST /api/agents/v2/cognition-full`
- [ ] **2.** Criar endpoint `POST /api/users/finalize`
- [ ] **3.** Refatorar `CognitionExperience.tsx` — remover pre-flight e pipeline multi-step
- [ ] **4.** Implementar animação em 3 fases (editais → rede → matches)
- [ ] **5.** Conectar clique no match ao `/finalize` + navegação para grafo
- [ ] **6.** Deploy e QA completo
