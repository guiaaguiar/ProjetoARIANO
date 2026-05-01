# 🚀 ARIANO — Plano de Implementação (Novo Design System Lovable)

> **Versão:** 8.0.0 (Sprint Atual)
> **Data:** 01/05/2026
> **Foco:** Migração do Design System Global com preservação estrita do Motor de Grafos

---

## 1. Visão Geral

Esta sprint foca em **mudar radicalmente o Design System do projeto**. O frontend atual será atualizado para incorporar um novo design gerado no Lovable. A integração ocorrerá de forma progressiva, substituindo componentes genéricos de UI, painéis, modais e layouts.

**REGRA DE OURO INEGOCIÁVEL:**
> Todas as páginas e componentes que dependem ou exibem a tecnologia de grafos (NetworkX + react-force-graph) devem permanecer **intactos em sua funcionalidade e lógica**.
> Isso inclui:
> - `/admin/grafo`
> - `/user/cadastro` (processo interativo de IA e formação do grafo)
> - `/user/ecossistema`
> - `NetworkXGraphView.tsx` e suas lógicas associadas.

---

## 2. Passos de Implementação

### Passo 1 — Setup e Importação
- Fazer o download / clone do código gerado pelo Lovable.
- Importar os assets, CSS global (`index.css`), configuração do Tailwind e diretório de componentes (`components/ui` do shadcn/radix, se aplicável) para dentro de `frontend/src/` do ARIANO.
- Mesclar a configuração do Tailwind (Tailwind V4 ou `tailwind.config.js`) garantindo que as cores neon do grafo (`--color-void`, cores de CoT, etc.) coexistam com as novas variáveis do design system do Lovable.

### Passo 2 — Atualização do Layout Global
- Substituir o wrapper principal do App (`AppLayout`, Sidebars de usuário e admin) pelo novo layout importado.
- Atualizar a navegação e cabeçalhos para refletir o novo design system.
- O layout novo deve ser "encaixado" de forma que a área principal (Outlet) ainda receba os componentes das páginas atuais.

### Passo 3 — Refatoração de Páginas Simples
Atualizar as páginas que não possuem interação complexa com grafos para o novo padrão visual:
- `/admin/dashboard`
- `/admin/academicos`
- `/admin/editais`
- `/admin/matches`
- `/user/matchs`
- `/user/profile`
- Modais e popups (como o `AuthPopup` e páginas de erro).

### Passo 4 — Adequação (Sem Quebra) das Páginas de Grafo
As páginas core de grafo deverão ser envelopadas no novo design, **sem tocar no motor do grafo**.
- Em `/admin/grafo`: O menu lateral de filtros e o menu de detalhes flutuante devem adotar as novas classes e estilos (glassmorphism/Lovable styling), mas a lógica de estado, navegação e o componente `<NetworkXGraphView />` devem continuar sendo consumidos exatamente da mesma forma.
- Em `/user/cadastro`: O pipeline animado de IA e a construção step-by-step do grafo devem ser mantidos. Apenas os botões e inputs dos passos anteriores ao grafo precisam herdar o novo UI.

### Passo 5 — Polimento e Testes
- Verificar a responsividade do novo layout (Desktop/Mobile).
- Garantir que as animações de entrada e o z-index do grafo não estejam colidindo com modais ou sidebars novas.
- Testar o fluxo completo de cadastro até a visualização de comunidades para assegurar que a "alma" do projeto (A interatividade dos agentes e grafos) brilhe dentro da nova embalagem premium.

---

## 3. Critérios de Aceite (DoD da Sprint)

- [ ] Novo código (Lovable) importado e rodando sem erros de build.
- [ ] Tailwind configurado corretamente (Design System novo + Cores legado do Grafo).
- [ ] Sidebars e Navbar atualizadas com o novo padrão.
- [ ] Telas de listas e dashboards (admin e user) usando os novos cards e tipografia.
- [ ] `<NetworkXGraphView />` funcionando 100% como antes (Minkowski Sum, Labels, Glow, Zoom/Center intactos).
- [ ] Tela de `/admin/grafo` e `/user/cadastro` continuam imersivas, com os overlays estilizados no novo padrão.

---
> **Próxima Ação:** Executar a integração do código importado do Lovable na branch `dev`.
