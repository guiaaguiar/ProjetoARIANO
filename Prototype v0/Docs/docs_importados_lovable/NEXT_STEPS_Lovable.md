# Próximos Passos — Plano de Implementação em Cascata

Plano de execução **passo a passo**. Cada passo será entregue em uma mensagem separada, na ordem listada, após validação do anterior. Todo o trabalho respeita o `DESIGN_SYSTEM.md`.

---

## Visão Geral

Adicionar três novas áreas à aplicação:

1. **`/user/matches`** — Painel de matches do usuário (dados mock)
2. **`/admin/dashboard`** — Visão geral do ecossistema ARIANO (dados mock)
3. **`/signup`** — Página de cadastro de usuário

Nenhuma alteração de schema de banco será feita nesta cascata; usaremos **dados mock** em arquivos `src/mocks/*.ts`. Persistência real entra apenas quando solicitada explicitamente.

---

## Passo 1 — Estrutura de rotas e layouts

**Objetivo**: criar a base reutilizável (layouts + rotas) antes de popular conteúdo.

### Entregáveis
- `src/components/UserLayout.tsx`
  - Sidebar lateral esquerda `w-[200px]` (estilo do mock visível na landing logo abaixo do grafo 3D)
  - Header superior fino `h-10` com busca/avatar
  - Itens da sidebar: `Perfil`, `Matches` (ativo), `Skills`, `Editais`, `Configurações`
  - Drawer mobile (`Sheet`) no breakpoint `< md`
  - `AppBackground` continua visível atrás
- `src/components/AdminLayout.tsx`
  - Mesma estrutura, sidebar com: `Dashboard` (ativo), `Estudantes`, `Pesquisadores`, `Professores`, `Editais`, `Skills`, `Áreas`, `Matches`
  - Indicador "Admin" sutil no header
- Atualização de `src/App.tsx`:
  - Rota `/user/matches` → `UserMatches` (envolvida em `ProtectedRoute` + `UserLayout`)
  - Rota `/admin/dashboard` → `AdminDashboard` (envolvida em `ProtectedRoute` + `AdminLayout`)
  - Rota `/signup` → `Signup` (pública)
- Páginas placeholder mínimas para cada rota só para garantir que não quebrem o build

### Critério de aceite
- Navegar para `/user/matches` mostra layout com sidebar User + área central vazia
- Navegar para `/admin/dashboard` mostra layout com sidebar Admin + área central vazia
- `/signup` carrega tela placeholder pública
- Tudo funciona em dark e light, com drawer no mobile

---

## Passo 2 — Página `/user/matches` (mock)

**Objetivo**: replicar visualmente o painel mostrado na landing (logo abaixo do grafo) com conteúdo de matches.

### Entregáveis
- `src/mocks/matches.ts` — 10–12 matches mock com:
  - `id`, `name`, `avatarUrl`, `researchArea`, `score` (0–100), `status` ('novo'|'pendente'|'conectado'), `skills[]`, `commonEditais[]`, `bio`
- `src/pages/user/Matches.tsx`:
  - **Sidebar mock central** com filtros: `Todos`, `Novos`, `Pendentes`, `Conectados` + tags rápidas
  - **Lista central** de match rows: avatar, nome, área de pesquisa, badge de score (cor por faixa), indicador de status, ações (`Ver perfil`, `Conectar`, `Dispensar`)
  - **Painel de detalhe à direita** (`hidden lg:flex`, `w-[280px]`): perfil resumido do match selecionado — bio, skills (chips), áreas em comum, editais em comum, botão CTA "Conectar"
  - Hover suave nas linhas (`bg-accent/50 transition-colors`)
  - Linha selecionada com indicador lateral teal
- Estado local com `useState` para filtro ativo e match selecionado
- Empty state quando filtro não retornar resultados

### Critério de aceite
- Layout idêntico em proporção ao painel da landing
- Filtros funcionam (filtragem client-side sobre o mock)
- Selecionar um match preenche o painel de detalhe
- Responsivo: painel de detalhe colapsa em < lg, aparece como Sheet/Drawer ao tocar

---

## Passo 3 — Página `/admin/dashboard` (mock)

**Objetivo**: dashboard executivo com 7 métricas-chave do ecossistema ARIANO.

### Entregáveis
- `src/mocks/adminMetrics.ts` com 7 métricas:
  ```ts
  export const adminMetrics = [
    { key: 'estudantes',    label: 'Estudantes',     value: 1248, delta: '+4.2%' },
    { key: 'pesquisadores', label: 'Pesquisadores',  value:  342, delta: '+1.8%' },
    { key: 'professores',   label: 'Professores',    value:  187, delta: '0%'    },
    { key: 'editais',       label: 'Editais',        value:   28, delta: '+12%'  },
    { key: 'skills',        label: 'Skills',         value:  563, delta: '+7.5%' },
    { key: 'areas',         label: 'Áreas',          value:   42, delta: '+2.1%' },
    { key: 'matches',       label: 'Matches (Total)',value: 3891, delta: '+18%'  },
  ];
  ```
- `src/pages/admin/Dashboard.tsx`:
  - Header: `h1` "Dashboard" + subtítulo "Visão geral do ecossistema ARIANO"
  - Grid responsivo `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` com 7 `MetricCard`
  - **MetricCard** (componente local):
    - `border bg-card p-6 rounded-lg`
    - Label uppercase `tracking-[0.12em] text-[11px] text-muted-foreground`
    - Valor grande `text-3xl font-medium tabular-nums`
    - Delta com seta (Lucide) em `text-success` / `text-muted-foreground`
    - Ícone Lucide pequeno no canto (Users, GraduationCap, FileText, Sparkles, Layers, GitMerge)
  - Abaixo: área reservada para gráficos futuros — bloco com hatching diagonal e legenda "Gráficos em breve"

### Critério de aceite
- 7 cards renderizando com mock
- Responsivo (1/2/4 colunas)
- Estilo Linear flat: bordas, sem sombras, números tabulares
- Dark/light validados

---

## Passo 4 — Página de cadastro de usuário (`/signup`)

**Objetivo**: formulário público de cadastro consistente com `/auth`.

### Entregáveis
- `src/pages/Signup.tsx`:
  - Caixa central squarish `max-w-[420px]` com borda grid-line (mesmo visual de `Auth.tsx`)
  - Logo `StackedLogo` + título "Criar conta"
  - Campos:
    - Nome completo (`Input`, required, min 2)
    - E-mail (`Input` type="email", required, validação zod)
    - Senha (`Input` type="password", min 8)
    - Confirmar senha (`Input`, deve bater com senha)
    - Tipo de usuário (`Select`: `Estudante`, `Pesquisador`, `Professor`)
    - Áreas de interesse (multi-select mock, máximo 3)
    - Checkbox "Aceito os termos de uso"
  - Validação: `react-hook-form` + `zodResolver`
  - Submit: `supabase.auth.signUp` com `data: { full_name, user_type, interest_areas }` em `options.data`; após sucesso → redirect para `/user/matches`
  - Botão "Continuar com Google" (OAuth) abaixo do submit
  - Link "Já tem conta? Entrar" → `/auth`
  - Toast de erro/sucesso via Sonner

### Critério de aceite
- Validações client-side funcionam
- Cadastro cria usuário no Lovable Cloud
- Erros (e-mail já registrado, senha fraca) mostram toast
- Visual idêntico ao padrão da `/auth`
- Acessível (labels, aria-invalid, focus order)

---

## Passo 5 — Polimento & QA

**Objetivo**: garantir qualidade visual e funcional antes de fechar a cascata.

### Entregáveis
- Verificação manual em dark/light de todas as páginas novas
- Verificação responsiva (mobile 375px, tablet 768px, desktop 1280px)
- Confirmação de que `AppBackground` aparece em todas as rotas novas
- Rotas inválidas (`/user/foo`, `/admin/foo`) caem no `NotFound`
- Atualizar memórias do projeto (`mem://`) com:
  - Novas rotas (`/user/matches`, `/admin/dashboard`, `/signup`)
  - Padrão `UserLayout` / `AdminLayout`
  - Localização dos mocks
- Pequenos ajustes de espaçamento e contraste se necessário

### Critério de aceite
- Nenhum console error
- Build passa
- Navegação fluida entre todas as páginas
- Memória do projeto reflete o novo estado

---

## Dependências entre passos

```
Passo 1 (layouts + rotas)
   ├── Passo 2 (matches)
   ├── Passo 3 (admin dashboard)
   └── Passo 4 (signup)
             └── Passo 5 (QA final)
```

Passos 2, 3 e 4 podem ser entregues em qualquer ordem após o Passo 1, mas a recomendação é seguir 1 → 2 → 3 → 4 → 5.

---

## Observações técnicas

- **Sem migrations** nesta cascata. Tudo mock. Persistência real (tabela `matches`, `editais`, `skills`, `areas`, contadores) entra em uma cascata futura.
- **Proteção por role**: `/admin/*` por enquanto fica só atrás de `ProtectedRoute`. Em iteração futura, adicionar checagem `has_role(uid, 'admin')` via security definer + redirecionar não-admins.
- **Cores e tokens**: tudo via `hsl(var(--token))`. Nenhuma cor hardcoded.
- **Acessibilidade**: labels associadas, navegação por teclado, contraste AA mínimo.
- **i18n**: textos em pt-BR (padrão atual do produto ARIANO).

---

## Fora de escopo desta cascata

- Conexões reais entre usuários (apenas botão mock)
- Algoritmo de matching (apenas score pré-definido no mock)
- Edição de perfil de match
- Gráficos reais no admin (apenas placeholder)
- Permissões granulares por role
- E-mail de boas-vindas no cadastro
