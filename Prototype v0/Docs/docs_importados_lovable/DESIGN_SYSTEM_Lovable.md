# Design System — Triage / ARIANO

Documento de referência do framework de front-end. Toda nova tela deve respeitar estes padrões.

---

## 1. Stack & Fundamentos

- **Framework**: React 18 + Vite + TypeScript
- **Estilo**: Tailwind CSS v3 + shadcn/ui (Radix primitives)
- **Tema**: `next-themes` — dark por padrão, com toggle global (`ThemeToggleButton`)
- **3D / Charts**: react-three-fiber (R3F) + drei, Recharts
- **Backend**: Lovable Cloud (Supabase Auth + Postgres + Storage + Realtime)
- **Forms**: react-hook-form + zod
- **Ícones**: Lucide React (exclusivo, tamanho padrão `h-4 w-4`)

### Tipografia
- **Body**: `Geist` 14px (fallback `Inter`, system-ui)
- **Headings**: `font-medium tracking-tight`
- **Marca "Triage"**: sempre `font-bold uppercase tracking-[0.08em]`
- Hero usa `text-[clamp(2rem,4vw,3.2rem)]` para escalonamento fluido

---

## 2. Tokens de Cor (HSL — `src/index.css`)

> **Regra absoluta**: nunca escrever `text-white`, `bg-black`, `#fff` em componentes. Sempre usar tokens semânticos via `hsl(var(--token))` ou classes Tailwind (`bg-background`, `text-foreground`, `border-border`, etc.).

### Light mode
| Token | Valor HSL |
|-------|-----------|
| `--background` | `0 0% 100%` |
| `--foreground` | `0 0% 9%` |
| `--card` | `0 0% 100%` |
| `--primary` | `234 55% 58%` (teal `190 80% 38%` na landing) |
| `--secondary` | `0 0% 96%` |
| `--muted-foreground` | `0 0% 45%` |
| `--border` / `--input` | `0 0% 90%` |
| `--destructive` | `345 72% 51%` |
| `--success` | `142 70% 40%` |
| `--warning` | `38 92% 50%` |
| `--info` | `199 89% 48%` |

### Dark mode (Linear-inspired)
| Token | Valor HSL |
|-------|-----------|
| `--background` | `240 6% 6%` (`#0A0A0B`) — wallpaper override: `205 65% 5%` |
| `--foreground` | `0 0% 90%` |
| `--card` | `240 5% 9%` |
| `--primary` | `188 85% 45%` (teal neon) |
| `--border` / `--input` | `240 4% 26%` |
| `--destructive` | `345 90% 60%` |
| `--success` | `145 100% 50%` |

### Severidades
`--severity-critical | --severity-high | --severity-medium | --severity-low` definidos para light/dark e expostos em `tailwind.config.ts` como `severity.*`.

### Sidebar
Tokens dedicados `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`.

### Acento ARIANO (teal neon)
- Dark: `#3fd4ec` (HSL `188 85% 45%`)
- Light: `#0d7a8c` (HSL `190 80% 38%`)
- Usado em links, focos, glows do grafo 3D, CTAs secundários.

---

## 3. Wallpaper & Background Global

`AppBackground` (renderizado em `App.tsx`) é fixo em **todas** as páginas:
- Dark: `src/assets/wallpaper.png` (topográfico teal sobre navy profundo)
- Light: `src/assets/wallpaper-light.png` (mesmo padrão, off-white)
- Overlay com gradiente para garantir contraste de texto:
  ```ts
  isDark
    ? "linear-gradient(hsl(205 65% 5% / 0.55), hsl(205 65% 5% / 0.85))"
    : "linear-gradient(hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0.80))"
  ```
- `html` e `body` têm `background-color: transparent` para deixar o wallpaper visível.

---

## 4. Layout & Grid

- **Mobile-first**. Containers max:
  - Marketing/landing: `max-w-[1200px]`
  - App autenticado: `max-w-[1400px]` (`2xl`)
- **Navbar landing**: fixa, `h-[56px]`, `bg-background/70 backdrop-blur-md`, `border-b border-border`
- **Sidebar app**: `w-52` (208px), sticky, `h-screen`, header interno `h-11`
- **Mobile (< md = 768px)**: header `h-11` + drawer `Sheet` `w-52` acionado por hambúrguer
- Espaçamentos: `px-6` em seções, `gap-2/3/4`, paddings de cards `p-6` ou `p-8`
- Touch targets ≥ 44px no mobile (botões `h-10`/`h-11`)

### Breakpoints Tailwind
`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1400`

---

## 5. Componentes (shadcn/ui)

### Button (`src/components/ui/button.tsx`)
| Variant | Estilo |
|---------|--------|
| `default` | **Sólido branco com texto preto** — `bg-foreground text-background hover:bg-foreground/90` |
| `outline` | Borda fina `border-foreground/40`, bg transparente, hover inverte |
| `ghost` | Sem fundo, hover `bg-accent` |
| `destructive` | `bg-destructive` |
| `secondary` | `bg-secondary` |
| `link` | Texto `text-primary` com underline no hover |

Sizes: `sm (h-9) | default (h-10) | lg (h-11) | icon (h-10 w-10)`. Cantos `rounded-md`.

### Card
`rounded-lg border bg-card text-card-foreground`. Header/Content/Footer com `p-6`.

### Form / Input / Select / Textarea
Altura 10 (40px), `rounded-md`, foco com `ring-2 ring-ring ring-offset-2`. Validação via `react-hook-form` + `zod`.

### Avatar
- Sidebar: 5×5 (`h-5 w-5`) com iniciais 9px
- Perfil/lista: 8×8 ou maior
- Fallback: `bg-sidebar-primary text-sidebar-primary-foreground`, iniciais em uppercase (máx. 2 letras)

### Badges
- `StatusBadge` para estados de tickets/matches
- `SeverityBadge` usando tokens `severity.*`

### Outros
Sheet, Dialog, AlertDialog, Tooltip, Toast (Sonner), Tabs, Accordion, Collapsible, DropdownMenu, Command (cmdk), Popover, ScrollArea, Skeleton, Switch, Slider, RadioGroup, Checkbox — todos via shadcn padrão.

---

## 6. Padrão Visual "Linear / ARIANO"

- **Cantos predominantemente quadrados** ou levemente arredondados (`rounded` mínimo, `rounded-md` em controles)
- **Hatching diagonal** para áreas vazias / fillers de gráfico:
  ```css
  background-image: repeating-linear-gradient(
    -45deg,
    hsl(190 40% 25% / 0.5) 0px,
    hsl(190 40% 25% / 0.5) 1px,
    transparent 1px,
    transparent 6px
  );
  ```
- **Linhas de grade sutis** dividindo seções (`border-border` 1px)
- **Acentos neon teal** para destaques e estados ativos
- **Zero sombras pesadas** — visual flat, dependendo de borders e contraste de superfície

### Logo
- `StackedLogo`: 3 retângulos empilhados em SVG, `currentColor`, tamanho padrão 16px
- `Logo3D`: versão R3F isométrica wireframe com hatching, usada na landing

---

## 7. Animações & Interações

### Princípios
- Transições padrão: `transition-colors`, `transition-all duration-200`
- Easing implícito do Tailwind (ease-out)
- Movimento sutil; nada que distraia do conteúdo

### Padrões específicos
- **Botões**: troca de cor + leve translate em ícones (`group-hover:translate-x-0.5`)
- **Theme toggle**: Sun/Moon com `rotate/scale` cross-fade
- **Accordion / Sheet**: keyframes shadcn `accordion-down/up 0.2s ease-out`
- **Sidebar nav**: `bg-sidebar-accent` no estado ativo, sem animação explícita
- **Tabela/lista**: hover `bg-accent/50` com `transition-colors`

### Grafo 3D (`Graph3D.tsx`)
- 7 nodes, conexões com raio 2.4
- Lerp frame-rate independent: `smooth = 1 - Math.pow(0.001, delta)`
- Drag suave (target-based easing)
- Glow billboard via `THREE.Sprite` com `AdditiveBlending`
- "Breathing" animado no halo
- Glow do node selecionado usa **a própria cor do node** (não branco), scale 1.3x
- `ySquash: 0.7` para conter os nodes verticalmente

### Charts (Recharts + `use-neon-charts`)
- Outlines de alta vibração teal/neon
- Padrões diagonais como fill
- Fundos translúcidos sobre `bg-card`
- Tooltips com `bg-popover border-border rounded-md`

### Realtime
Supabase channels (`postgres_changes`) para Kanban/lista de bugs e comentários. RLS habilitado nas tabelas.

---

## 8. Responsividade

- Sidebar visível `≥ md`; abaixo vira `Sheet` drawer
- Tipografia hero: `clamp()` para escalar entre mobile e desktop
- Grids de cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` ou `lg:grid-cols-4`
- Painel de detalhe lateral aparece apenas `lg:flex` (≥ 1024px)
- Gráficos R3F com listener de resize; Recharts dentro de `ResponsiveContainer`
- Touch targets 44×44 mínimos; espaçamento generoso entre itens em mobile

---

## 9. Autenticação (UI)

- Página `/auth`: caixa central squarish, `max-w-[420px]`, borda grid-line
- Email/Password + Google OAuth (sempre presente, salvo solicitação contrária)
- Sem confirmação automática de e-mail por padrão
- Sem anonymous sign-in
- Redirect pós-login: `/dashboard` (será `/user/matches` quando implementado)

---

## 10. Segurança & Boas Práticas

- **RLS habilitado por padrão** em todas as tabelas; default deny
- **Roles em tabela separada** `user_roles` + função security definer `has_role()` — nunca em `profiles`
- Nunca checar admin via `localStorage`
- **Nunca editar**: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`
- Lovable AI Gateway para LLMs (sem API keys do usuário)
- Edge functions deployam automaticamente; secrets via tooling

---

## 11. Estrutura de pastas relevante

```
src/
├── App.tsx                    # Rotas + ThemeProvider + AppBackground
├── index.css                  # Tokens HSL light/dark
├── assets/                    # Wallpapers e imagens
├── components/
│   ├── AppBackground.tsx      # Wallpaper fixo
│   ├── AppLayout.tsx          # Layout autenticado (sidebar + header mobile)
│   ├── AppSidebar.tsx         # Sidebar w-52
│   ├── ThemeToggleButton.tsx
│   ├── StackedLogo.tsx
│   ├── Graph3D.tsx
│   ├── Logo3D.tsx
│   └── ui/                    # shadcn primitives
├── contexts/AuthContext.tsx
├── hooks/
├── pages/
└── integrations/supabase/     # NÃO EDITAR
```

---

## 12. Checklist para nova tela

- [ ] Usa apenas tokens semânticos (sem cores literais)
- [ ] Funciona em dark e light
- [ ] Wallpaper visível atrás (sem `bg-background` opaco em wrappers full-screen)
- [ ] Sidebar/Header consistentes com `AppLayout` quando autenticada
- [ ] Mobile: drawer funciona, touch targets ≥ 44px
- [ ] Botões usam variants do shadcn (sem cor custom)
- [ ] Ícones Lucide `h-4 w-4`
- [ ] Tipografia respeita Geist + tracking padrão
- [ ] Estados (hover, active, disabled, loading) implementados
- [ ] RLS configurada se houver tabela nova
