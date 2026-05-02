# 🎨 DESIGN_SYSTEM.md — ARIANO v2 (Lovable Edition)

> **Versão:** 3.0.0
> **Data:** 01/05/2026
> **Objetivo:** Padronizar a transição visual do projeto ARIANO para o novo Design System (framework Lovable - shadcn/ui + Tailwind V4 + next-themes), estabelecendo restrições rigorosas de layout, tipografia e stack.

---

## 1. Stack & Fundamentos

- **Framework**: React 18 + Vite + TypeScript
- **Estilo**: Tailwind CSS V4 + shadcn/ui (Radix primitives adaptadas para V4 no `index.css`)
- **Tema**: `next-themes` — dark por padrão, com toggle global (`ThemeToggleButton`)
- **3D / Gráficos**: react-three-fiber (R3F) + drei, Recharts + motor customizado de grafo (`react-force-graph` / Canvas)
- **Forms e Autenticação**: react-hook-form + zod
- **Ícones**: Lucide React (exclusivo, tamanho padrão `h-4 w-4`)

### Tipografia
- **Body**: `Inter`, fallback `system-ui`
- **Headings**: `Geist` `font-medium tracking-tight`
- **Marca "ARIANO"**: sempre `font-bold uppercase tracking-[0.08em]`
- Hero usa `text-[clamp(2rem,4vw,3.2rem)]` para escalonamento fluido
- **Mono**: `JetBrains Mono` / `Fira Code` para IDs numéricos e código.

---

## 2. Tokens de Cor (HSL — `src/index.css`)

> **Regra Absoluta**: Nunca escrever cores hardcoded como `text-white`, `bg-black`, `#fff` em componentes. Sempre usar tokens semânticos via classes Tailwind (`bg-background`, `text-foreground`, `border-border`, `bg-card`).

O sistema utiliza variáveis nativas HSL configuradas via `@theme` no Tailwind V4 para transição transparente entre Light e Dark mode.

### Base & Superfícies (Dark Mode / Wallpaper-derived)
- `--background`: `205 65% 5%` (navy profundo/teal escuro)
- `--foreground`: `190 25% 92%` (texto claro)
- `--card`: `205 55% 8%` (superfícies de painéis)
- `--popover`: `205 55% 8%` (menus dropdown, modais)
- `--border` / `--input`: `190 40% 18%` (bordas sutis com tint de teal)

### Acento ARIANO (Teal Neon)
A identidade do ARIANO reside no "Teal". Usado em links, focos, glows do grafo 3D e CTAs.
- `--primary`: `188 85% 45%` (Dark Mode) / `190 80% 38%` (Light Mode)
- `--ring`: `188 85% 45%`

### Severidades & Feedback
- `--destructive` / `--severity-critical`: `345 90% 60%`
- `--warning` / `--severity-high`: `25 100% 58%`
- `--severity-medium`: `38 100% 55%`
- `--success` / `--severity-low`: `145 100% 50%`

### Nodes do Grafo (Exceção)
As cores dos nós (Edital, Student, etc.) permanecem inalteradas, utilizando variáveis nativas (ex: `--color-node-edital: #38bdf8`) injetadas no CSS para não quebrar a lógica de renderização do motor `NetworkXGraphView`.

---

## 3. Wallpaper & Background Global (Regra Crítica)

Para que o tema topográfico do Lovable funcione perfeitamente:

1. **`AppBackground` é global**: O componente `<AppBackground />` (renderizado em `App.tsx` dentro do `BrowserRouter`) deve ser fixo em **todas** as páginas.
   - Dark: `src/assets/wallpaper.png`
   - Light: `src/assets/wallpaper-light.png`
2. **NUNCA OPACIFICAR O LAYOUT BASE**:
   - Layouts globais (`AppLayout`, `UserLayout`) **não devem ter** classes como `bg-background` na sua raiz (ex: usar `<div className="flex min-h-screen">` em vez de `<div className="flex min-h-screen bg-background">`). O fundo sólido esconde o wallpaper.
3. As seções internas das páginas (como cards ou seções Hero) devem usar fundos translúcidos como `bg-background/70 backdrop-blur-md` ou `bg-card/30` para criar o efeito glassmorphism e revelar o background topográfico.

---

## 4. Layout, Grid e Posicionamento (Regras Estritas)

- **Mobile-first**: Containers max para Landing (`max-w-[1200px]`) e App autenticado (`max-w-[1400px]`).
- **Sidebar (App e User)**: `w-52` (208px), sticky, `h-screen`, shrink-0, header interno `h-11`. No mobile `< md`, usa um `Sheet` drawer.
- **Navbar Landing**: Fixa no topo, `h-[56px]`, `bg-background/70 backdrop-blur-md`, z-index 50.

### 4.1. Erros a Evitar no Posicionamento (Lições Aprendidas)
- **Corte de elementos no Topo**: **Nenhum elemento deve estar "muito acima" escondido**. Atenção redobrada aos padding/margins em relação à barra de navegação/header (`pt-16`, `h-11` header height). Se um grafo, dashboard ou painel ficar encostado ou cortado no limite superior da tela, ajuste as margens do `main` utilizando `flex-1 overflow-auto relative p-4 sm:p-8`. A Navbar fixa exige `pt-16` em elementos relativos abaixo dela (como na seção Hero da Landing).
- **Integridade Estrutural em Adaptações**: Ao migrar layouts do repositório Lovable para o ARIANO, **NUNCA DELETAR** a estrutura HTML base (divs de wrapper, alinhamentos flex, dimensões fixas de height e width) para "limpar código". Elementos decorativos vitais (como mockups visuais e blocos de detalhes) devem ter apenas seus **textos adaptados**, preservando rigorosamente as classes CSS originais para não quebrar proporções.

---

## 5. Biblioteca de Componentes e Dependências

- **Componentes Base**: Localizados em `src/components/ui/` (importados via shadcn).
- **Botões**: Utilizar variants originais do shadcn (`default`, `outline`, `ghost`, `link`). Nenhuma cor background injetada manualmente (ex: usar `bg-foreground text-background`).
- **Formulários**: Integrados via `react-hook-form` e validados via `zod`.
- **Dependências no Vercel (Crítico)**: Sempre que portar ou utilizar um novo componente da biblioteca (ex: pacotes radix-ui, bibliotecas como `framer-motion` ou o plugin `@plugin "tailwindcss-animate"` no `index.css`), verificar se a respectiva dependência foi **instalada no `package.json`** (`npm i tailwindcss-animate`) para não quebrar a pipeline de deploy do Vercel.

---

## 6. Padrão Visual "ARIANO / Linear"

- **Cantos**: Predominantemente quadrados ou levemente arredondados (`rounded-md` em botões/inputs, `rounded-xl` ou `rounded-lg` em cards maiores).
- **Hatching Diagonal**:
  Áreas vazias ou elementos de destaque estéticos devem utilizar um gradiente de hachura sutil:
  ```css
  background-image: repeating-linear-gradient(
    -45deg,
    hsl(190 40% 25% / 0.5) 0px,
    hsl(190 40% 25% / 0.5) 1px,
    transparent 1px,
    transparent 6px
  );
  ```
- **Sombras**: Evitar sombras pesadas; privilegiar fronteiras `border border-border` e fundos contrastantes com backdrop filter (flat design moderno).
- **Animações**: Transições globais fluidas (`transition-all duration-200` e Easing `ease-out`). 
- **Theme Toggle**: Utiliza `framer-motion` para uma transição rotacional de 360° e escala entre o Sol e a Lua, garantindo um feedback visual premium.
- **Cognition Experience**: Padrão de pipeline visual com timeline de agentes, scratchpad de raciocínio e transição suave para resultados reais de matchmaking.

---

## 7. Estrutura de Páginas e Planejamento em Cascata

Seguindo o roteiro do plano de implementação, eis as restrições para as telas:

1. **Estrutura de Rotas e Layouts**:
   - `UserLayout` envelopa o ecossistema do pesquisador (`/user/*`).
   - `AppLayout` envelopa as páginas do CORETO (`/admin/*`).
2. **Dashboard e Matches do Usuário**: 
   - Deve replicar visualmente a estrutura de mock da Landing Page (o painel logo abaixo do Hero).
   - A lista de matches inclui avatars coloridos, badges numéricos e layout em linhas que ativam `bg-accent/50` no hover, abrindo um painel lateral dinâmico `<div className="w-[280px] hidden lg:flex">`.
3. **Página de Cadastro (`/signup` ou `/cadastro`)**: 
   - Caixa centralizada com grid e linhas angulares, max-width `420px`. Visual limpo inspirado no padrão Auth e com o logotipo SVG `StackedLogo`.
4. **Dashboard Administrativo**:
   - Visão grid em `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` utilizando componentes semânticos (`MetricCard`) seguindo design flat: números grandes, subtítulos em uppercase tracking largo (`tracking-[0.15em]`) e badge Lucide.

### 7.1 O Motor de Grafo (A Exceção Blindada)
- O `<NetworkXGraphView />` nas rotas `/admin/grafo` não deve ter seu container distorcido ou influenciado pelas reestruturações.
- As UIs sobrepostas ao grafo (como as barras de filtro e as Sidebars transparentes de detalhes dos Nodes) devem usar as diretrizes deste arquivo (`bg-card backdrop-blur-md`, `border-border`, `text-foreground`), porém seu posicionamento fixo/absoluto deve ser mantido de acordo com a lógica legada.

---

## 8. Checklist Obrigatório para Implementação de UI

- [ ] A página/componente utiliza estritamente tokens HSL (`bg-card`, `text-primary`)?
- [ ] Foi testado visualmente com alternância entre Dark e Light Mode?
- [ ] O componente layout que a envolve foi verificado contra opacificação (Não usar `bg-background` que oculte `<AppBackground />`)?
- [ ] O layout portado de mockups Lovable manteve todas as divs e classes originais relativas ao tamanho e posicionamento?
- [ ] O componente não tem "clipping" superior (está descolado do Header através de margin ou padding apropriado)?
- [ ] Todas as dependências NPM (plugins, libs Shadcn) portadas estão efetivamente declaradas no `package.json`?
