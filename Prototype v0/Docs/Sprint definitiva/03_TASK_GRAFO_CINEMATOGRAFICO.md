# 🎯 TASK 03: GRAFO CINEMATOGRÁFICO E COREOGRAFIA (UI)

## 📝 Visão Geral
Após o cadastro, o usuário vê o ecossistema ARIANO trabalhando. A visualização atual (com `react-force-graph` ou D3) joga tudo na tela ao mesmo tempo de forma confusa. Queremos uma animação sequencial, dramática e temporizada, mostrando como o usuário se conecta ao ecossistema.

## 🛠 O que deve ser feito (Step-by-Step)
1.  **Coreografia Temporal (Time Delays):**
    Modifique o ciclo de renderização dos dados do grafo no Frontend para injetar os nós em etapas (fases):
    * **T=0s:** Aparece apenas o nó central do Usuário (com seu nome).
    * **T=5s:** Surgem os nós de **Skills**. Eles devem brotar do vazio e se conectar ao usuário. **Atenção:** Os nós de Skill devem ter o raio/tamanho (`val` ou `radius`) fisicamente menores que os demais.
    * **T=10s:** Começam a surgir os nós de **Editais** (relacionamento `ELIGIBLE_FOR`), conectando-se ao usuário.
    * **T=15s:** Surgem os nós de **Docentes** relacionados.
2.  **Console Lúdico Lateral (Pensamento da IA):**
    * Enquanto o grafo carrega e anima, um painel lateral falso-terminal deve exibir os "pensamentos" simulados (ou reais) da IA processando aquelas conexões (ex: `[Agent] Avaliando skills...`, `[Agent] Match encontrado com Edital X...`).
3.  **Top 3 Matches e Replay:**
    * Após o término da animação, destacar em Cards laterais ou modal os **3 Editais com maior porcentagem de match**.
    * Implementar um botão flutuante **"Replay da Animação"**, que zera o estado do grafo e repete a coreografia fluida desde o T=0.

## ✅ Critérios de Aceitação (DoD)
- [ ] A animação do grafo obedece aos atrasos estipulados (User -> Skills -> Editais -> Docentes).
- [ ] Os nós de Skill são visivelmente menores.
- [ ] O botão de replay funciona perfeitamente sem necessidade de recarregar a página (F5).
- [ ] O painel de top 3 matches aparece ao fim do processo.
