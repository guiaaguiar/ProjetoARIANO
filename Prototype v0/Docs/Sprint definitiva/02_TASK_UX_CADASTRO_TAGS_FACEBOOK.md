# 🎯 TASK 02: UX DE CADASTRO E EXTRATOR DE TAGS (ESTILO MARKETPLACE)

## 📝 Visão Geral
No fluxo de criação de conta (`/user/cadastro`), o usuário faz upload de um PDF (Currículo). A implementação antiga tentava extrair todo o texto e salvar. A nova abordagem, exigida pelo Tech Lead, é usar a IA **exclusivamente para extrair Tags/Skills** e apresentá-las em uma interface editável estilo Facebook Marketplace.

## 🛠 O que deve ser feito (Step-by-Step)
1.  **Simplificação do Extrator (Backend):**
    * No arquivo `pdf_extractor.py` (ou na rota de upload), altere a chamada da LLM.
    * O Prompt deve ser restrito a: *"Analise este texto de currículo e retorne um array JSON contendo exclusivamente as habilidades técnicas e tags relevantes (ex: ['Python', 'Gestão de Projetos', 'IA'])."*
2.  **Interface de Tags (Frontend):**
    * Crie um componente de Input estilo "Chip/Tag" (digita, Enter cria a tag com botão [x]).
    * Quando o PDF for enviado, a UI deve mostrar um *Loading/Spinner* na área das tags.
    * **REGRA DE NEGÓCIO CRÍTICA:** O botão de "Finalizar Cadastro" deve ficar `disabled` até que a LLM retorne o JSON e preencha o componente de Tags. O usuário não pode pular essa etapa.
    * O usuário pode apagar tags geradas pela IA ou adicionar novas manualmente.
3.  **Injeção de Contexto:**
    * As tags finais (após edição do usuário) devem ser enviadas no payload final de cadastro e inseridas no prompt de contexto (`o_que_busco` / `bio`) que constrói o nó do usuário no grafo.

## ✅ Critérios de Aceitação (DoD)
- [ ] Upload de PDF chama a rota da IA e retorna as tags.
- [ ] Interface de Chips/Tags renderizada no frontend (adicionar/remover funciona).
- [ ] Botão de submit do formulário é bloqueado até a extração concluir.
- [ ] Tags do usuário viram nós `Skill` conectados ao usuário no Neo4j.
