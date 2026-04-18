# 📑 Relatório de QA e Plano de Ajustes: UX/UI do Cadastro CORETO
> **Localização:** `Prototype v0/Docs/relatorios/qa_ajustes_sprint4_ux_ui.md`
> **Contexto:** Análise diferencial entre a página de Cadastro implementada (`CadastroPage.tsx` e `CognitionExperience.tsx`) e a documentação técnica (Documento de Projeto e Implementation Plan).

---

## 1. Visão Geral das Discrepâncias Encontradas

A UI e UX atuais seguem perfeitamente a estética "Blue Neon Edition" e a regra do PT-BR com Zero Tags Manuais. No entanto, o fluxo desenhado omite duas entregas visuais **críticas** planejadas na Sprint 4 para a demonstração da plataforma:

1. **Ausência do Mini-Grafo SVG (`MiniGraph`):** Durante o processamento (`CognitionExperience`), o documento dizia que o "grafo cresce enquanto a IA trabalha", mas a tela atual apenas mostra logs e steps (textos/badges).
2. **Ausência dos Cards de Resultado (`MatchResultCards`):** A página finaliza jogando o usuário direto em `/user/ecossistema` via botão, pulando a exibição quantitativa dos Matches recém-computados (Score base, badging, justificativas).

---

## 2. Plano de Implementação: Passo a Passo (Correções)

### PASSO 1: Integração do `MiniGraph` na `CognitionExperience`

O objetivo é substituir o lado vazio e os backgrounds radiais estáticos do componente por uma renderização de rede real em tempo real que acompanha a linha do tempo dos logs.

#### 1. Tecnologias a serem usadas
*   **SVG Nativo + React:** Sem `d3.js` ou `sigma.js` para manter a leveza.
*   **Framer Motion (`motion.circle`, `motion.path`, `motion.g`):** Para as aparições (Scale), translações (x/y) e principalmente para o "Edge Drawing Content" nas arestas via `strokeDasharray`.
*   **JSON Estático / NetworkX O(1):** Ao invés de forçar o backend a calcular o layout de verdade *enquanto* processa o usuário, use um mock de coordenadas geradas previamente pelo `spring_layout` do NetworkX especificamente para a "Demonstração de Experiência", amarrado ao estado interno de progresso do `CognitionExperience`.

#### 2. Estrutura de Animação e Tempo do Grafo

A animação do SVG deve ter seu estado pareado com a variável `currentStep` (0 a 3) do seu array `AGENT_STEPS` já existente.

*   **Tempo (Step 0) - *Orquestrador Iniciado*:**
    *   **Ação Visual:** Apenas 1 círculo gigante pulsante no centro (`r="24"`, `#0ea5e9`, Neon drop-shadow).
    *   **Significado:** Nó "Aluno" criado. Todos os demais componentes invisíveis.
*   **Tempo (Step 1) - *ProfileAnalyzer Extraindo Skills*:**
    *   **Ação Visual:** `motion.circle` menores (tipo `#a78bfa` e `#818cf8` para Skills e Áreas) sofrem `scale: [0, 1]` brotando ao redor (raio de 60-80px).
    *   **Conexões:** As arestas `HAS_SKILL` e `RESEARCHES_AREA` são desenhadas do centro para a ponta. 
    *   **Tecnologia (Edge Draw):** Use `initial={{ pathLength: 0 }}` e `animate={{ pathLength: 1 }}` na tag `<motion.line>` com `transition={{ duration: 1.5 }}`.
*   **Tempo (Step 2) - *Mapeando Grafo de Conhecimento*:**
    *   **Ação Visual:** Elementos "similares" ou "outros alunos" (`#34d399`) aparecem distantes, com arestas pontilhadas ligando as *Skills* recém criadas até ele (`RELATED_TO` / `SIMILAR_TO`).
*   **Tempo (Step 3) - *Calculando Matches Estratégicos*:**
    *   **Ação Visual:** O grande clímax. Nodos Azuis (`#2563eb` - Editais) surgem num halo superior e grandes traços com gradiente (Cyan para Blue) voam do nó central para os Editais (`ELIGIBLE_FOR`).
    *   **Tecnologia:** Adicionar SVG `<defs><linearGradient/></defs>` nas linhas com espessura variável baseada no peso visual (representando a pontuação de corte).

#### 3. Como executar a mudança no Código
*   Crie em `frontend/src/components/MiniGraphAnimation.tsx` todo o componente em SVG estático modular guiado pela `prop` de "fase" (`currentStep`: 0, 1, 2, 3). 
*   Em `CognitionExperience.tsx`, na coluna da esquerda ou num Layer de Backgound isolado (esmaecido atrás de tudo com `<div className="absolute inset-0 max-w-2xl blur-sm...">`), chame `<MiniGraphAnimation step={currentStep} />`.

---

### PASSO 2: Implementação dos `MatchResultCards`

Baseado na "Tarefa 4.4.5", o avaliador PRECISA ver a nota (score) e por quais motivos ele teve "Match" com Editais Governativos *imediatamente ali*.

#### 1. Ação Requerida
Na `CognitionExperience.tsx`, a transição ao final (`showFinish === true`) **NÃO DEVE** mostrar um botão solitário "Explorar Meu Ecossistema".
Ela deve fazer um fade out do terminal, "expandir" o container e mostrar uma Grade (CSS Grid) com **Os Três Melhores Matches Processados**.

#### 2. Design do Componente (`MatchResultCards.tsx`)
*   **Formato de Exibição:** Card Glassmorphism.
*   **Informações Mínimas (Mockadas ou API state):**
    *   Nome do Edital (ex: "FACEPE IA 2026")
    *   Barra de Progresso de Score (ex: 92% compatibilidade) onde se usa `width: 92%` com `bg-gradient-to-r from-teal-500 to-sky-400`.
    *   Badge de Afinidade (Verde Redondo).
    *   Breve "Thought do Agente" (A justificativa): *“Alinhamento perfeito devido a altas combinações em Python e Machine Learning..."*

#### 3. Como executar a mudança
*   O Axios do POST de Registration (`/api/users/register`) precisa devolver algo do tipo `{ success: true, topMatches: [...] }` ou você mocka este payload rapidamente.
*   Ao dar os 12 segundos da máquina de logs, em `showFinish`:
```tsx
{showFinish && (
   <motion.div className="fade-in">
       <h3> Seus Top 3 Matches Estratégicos Imediatos </h3>
       <MatchResultCards data={topMatches} />
       <div className="flex gap-4">
            <button onClick={() => navigate('/user/matchs')}>Ver Todos</button>
            <button className="btn-primary" onClick={() => navigate('/user/ecossistema')}>Ir para meu Ecossistema</button>
       </div>
   </motion.div>
)}
```

---

### PASSO 3: Retoques Secundários no Documento vs Código Existente

1. **Remoção Segura de Tags PDF (Documentação vs UI)**: A página não mostra input de Tags pois entende PDF. Garanta que o backend FastAPI aceite o Multipart Form Data corretamente e utilize de fato as chamadas PyMuPDF (`fitz`), caso contrário, você enviará JSON vazio e não terá match. O Frontend em `CadastroPage` com `FormData` para mandar arquivo e binário está escrito corretamente, mas verifique se a API backend real foi adaptada.
2. **Bloqueio de Fechamento**: O cadastro CORETO é a entrada no sistema. O popup de login (AuthPopup) e fluxos não devem deixar o usuário clicar fora.
3. **Animações (UX)**: Todos os hover em links de "Login/Cadastro" podem ganhar transição sublinhada (underline) via tailwind `group-hover` que compõe com estética neon.

### Conclusão e Entrega da Tarefa
Implementando o `MiniGraphAnimation` estritamente SVG conduzido por CSS + Framer, o app ficará visualmente espetacular. Os passos acima preenchem os "X"s que ainda sobram marcados no seu "Critério de Aceite (DoD)" na sprint (Tarefa 4.4.4 e 4.4.5 do Plano de Implementação).
