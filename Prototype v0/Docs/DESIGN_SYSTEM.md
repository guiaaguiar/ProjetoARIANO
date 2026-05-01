# 🎨 DESIGN_SYSTEM.md — ARIANO v2 (Lovable Edition)

> **Versão:** 1.0.0
> **Data:** 01/05/2026
> **Objetivo:** Padronizar a transição visual do projeto ARIANO para o novo Design System baseado no framework gerado pelo Lovable (shadcn/ui + Tailwind + next-themes).

---

## 1. Fundamentação Visual

O novo Design System abandona o visual puramente "customizado à mão" para adotar uma base sólida, testada e acessível proveniente do ecosistema **shadcn/ui** e **Radix UI**, mantendo a "alma" Neon Teal característica do ARIANO.

A paleta de cores será baseada no tema Dark predominante na antiga arquitetura, agora padronizado através das variáveis CSS injetadas no `:root`.

---

## 2. Tipografia

| Tipo | Fonte | Uso |
|---|---|---|
| **Primária (Sans)** | `Inter`, `system-ui` | Corpo de texto, UI geral, botões, modais |
| **Secundária (Sans)** | `Geist` | Títulos, cabeçalhos, branding |
| **Mono** | `JetBrains Mono` / `Fira Code` | Código, IDs numéricos, hashes |

*Tamanhos:* Baseados na escala tailwind (text-xs a text-6xl), com tracking sutil para títulos (`tracking-tight`).

---

## 3. Paleta de Cores e Tokens (HSL)

O sistema utiliza variáveis nativas HSL para transição transparente entre Light e Dark mode. Abaixo estão os tokens principais (foco no Dark Mode ARIANO):

### Base & Superfícies
- `--background`: `205 65% 5%` (Deep navy/teal escuro, ~ rgb(5,12,20))
- `--foreground`: `190 25% 92%` (Texto principal claro)
- `--card`: `205 55% 8%` (Superfícies de painéis e cards)
- `--card-foreground`: `190 25% 92%`
- `--popover`: `205 55% 8%` (Menus dropdown, modais)
- `--border`: `190 40% 18%` (Bordas sutis com tint de teal)

### Cores de Ação & Identidade (Neon Teal)
A identidade do ARIANO reside no "Teal".
- `--primary`: `188 85% 45%` (Teal Dark Mode) / `190 80% 38%` (Teal Light Mode)
- `--primary-foreground`: `0 0% 100%`
- `--ring`: `188 85% 45%` (Foco de inputs)

### Estado & Feedback (Severity)
- `--severity-critical` / `--destructive`: `345 90% 60%` (Vermelho)
- `--severity-high` / `--warning`: `25 100% 58%` (Laranja)
- `--severity-medium`: `38 100% 55%` (Amarelo)
- `--severity-low` / `--success`: `145 100% 50%` (Verde)
- `--info`: `199 100% 55%` (Azul)

### Nodes do Grafo (Legado Preservado)
As cores dos nós (Edital, Student, etc.) permanecem inalteradas, utilizando HEX diretos (ex: `#2563eb`, `#00e5ff`) definidos na arquitetura original para não quebrar a lógica de renderização do `react-force-graph` no Canvas.

---

## 4. Biblioteca de Componentes (shadcn/ui)

Todos os componentes interativos padrão devem vir da pasta `src/components/ui/` (importados do repositório Lovable). 
- **Botões:** `<Button variant="default|outline|ghost" />`
- **Inputs:** `<Input />`, `<Textarea />`
- **Modais:** `<Dialog />`, `<Sheet />`
- **Feedback:** `<Toaster />` (Sonner), `<Tooltip />`
- **Ícones:** `lucide-react` (não usar outras libs para manter padrão).

---

## 5. Estrutura de Layout e Páginas

### 5.1 Landing Page (`/`)
A raiz do projeto deixará de ser um redirecionamento simples e passará a renderizar o componente `Landing.tsx` (adaptado do projeto Lovable para o contexto do ARIANO).
- **Conteúdo:** Apresentação do CORETO e ARIANO.
- **Visual:** Backgrounds topográficos escuros, Navbar transparente com blur (`backdrop-blur-md`), hero animado.
- **CTA:** Direcionamento para `/auth` ou `/user/cadastro`.

### 5.2 Estrutura Interna (`/user/*` e `/admin/*`)
Todas as páginas internas serão envelopadas pelo:
1. `<AppLayout>`: Container principal.
2. `<AppSidebar>`: Menu de navegação lateral expansível/colapsável.
   - Terá duas versões lógicas (ou itens condicionais) baseadas no `AuthContext` (perfil User vs Admin).
3. `<main>`: Onde o React Router renderizará os filhos (Outlet).

### 5.3 O Motor de Grafo (A Exceção Blindada)
Telas como `/admin/grafo` e `/user/cadastro` possuem um layout "Full-Screen Canvas".
- O `<NetworkXGraphView />` e a lógica do Canvas **não devem sofrer interferência das classes Tailwind de layout**.
- Menus sobrepostos ao grafo usarão classes do novo Design System (`bg-card`, `border-border`, `text-foreground`), mas o posicionamento `absolute` em relação à tela deve ser respeitado para que a detecção de Viewport (Minkowski Sum, Zoom/Center) não seja quebrada.
