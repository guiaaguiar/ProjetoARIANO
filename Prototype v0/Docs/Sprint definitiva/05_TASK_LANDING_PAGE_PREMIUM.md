# 🎯 TASK 05: LANDING PAGE PREMIUM E IDENTIDADE VISUAL

## 📝 Visão Geral
A Landing Page é o cartão de visita do CORETO. Ela precisa ter um design sofisticado (vibe Apple / Vercel), animações fluidas (Cinematográficas) e passar imediatamente o valor da plataforma, exibindo um modelo mental de como a IA visualiza um talento.

## 🛠 O que deve ser feito (Step-by-Step)
1.  **Radar Chart de Perfil:**
    * Adicione uma nova sessão (bloco) explicando a tecnologia do ARIANO.
    * Utilize um gráfico Radar (Chart.js, Recharts, ou similar) simulando um perfil fictício (Skills vs. Maturidade vs. Aderência a Editais). Isso tangibiliza o "match" para o visitante.
2.  **Botões do MacOS e Fades:**
    * Nas seções onde há demonstração de "Janelas" de software (como a aba de matches), adicione o cabeçalho clássico do MacOS (bolinhas vermelha, amarela e verde) para dar cara de aplicação de software premium.
    * Ajuste os modais de demonstração para usarem `opacity` fade-ins suaves (Framer Motion).
3.  **Scroll Cinematográfico:**
    * Envolva as seções da Landing Page em componentes do Framer Motion (`whileInView`) para que o conteúdo surja deslizando levemente de baixo para cima (`translateY`) e sumindo do transparente para opaco conforme o usuário rola a página.
4.  **Logo da SECTI:**
    * Encontre o arquivo de logotipo da SECTI no repositório (`logo_SECTI.png` ou similar em `/public`) e inclua-o no Footer da Landing Page na área de "Realização" ou "Apoio Institucional".

## ✅ Critérios de Aceitação (DoD)
- [ ] Sessão explicativa com Radar Chart desenhada e responsiva.
- [ ] Elementos de janela Mac OS adicionados nas imagens/mockups da UI.
- [ ] Componentes aparecem suavemente ao realizar o scroll (Scroll Animations).
- [ ] Logo da SECTI visível e alinhada no rodapé da página.
