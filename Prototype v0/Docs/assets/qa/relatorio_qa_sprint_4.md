# 🧪 Relatório de QA — Sprint 4

## 📍 Informações Gerais
- **Página:** [Cadastro CORETO](https://projetoariano.vercel.app/cadastro)
- **Data da Inspeção:** 16/04/2026
- **Versão do Sistema:** 7.0.0 (Sprint 4)
- **Status Geral:** 🔴 **REPROVADO (Bloqueante)**

---

## 🎨 1. Avaliação de Design & UX (Aesthetics)
- **Identidade Visual:** O sistema segue rigorosamente o padrão **Teal Neon** e **Glassmorphism** definido no `implementation_plan.md`. O efeito de blur no fundo e os gradientes sutis conferem um aspecto premium.
- **Tipografia:** Uso correto da fonte **Outfit** em títulos e corpo do texto.
- **Responsividade:** A página adapta-se bem ao mobile, mantendo a legibilidade e funcionalidade dos steps.
- **Regra de Ouro (Linguagem):** 100% de conformidade. Toda a interface, placeholders e mensagens de erro/sucesso visualizadas estão em **Português Brasileiro (PT-BR)**.

---

## 🛠️ 2. Verificação Funcional (Checklist)

| Requisito | Status | Observação |
|-----------|-----------|------------|
| Campos Nome, Email, Senha | ✅ Ok | Funcionando com validação de formato. |
| Seleção de Perfil (User Type) | ✅ Ok | Estudante, Pesquisador, Professor. |
| Upload de PDF (Currículo) | ✅ Ok | Validação de obrigatoriedade funcionando no Step 3. |
| Integração com IA (Nemotron) | ⚠️ Inconclusivo | Bloqueado pelo erro de submissão (BUG-02). |
| Visualização de Grafo em Tempo Real | ❌ Falha | Não disparado após 500 no registro. |
| Timeline de Processamento | ❌ Falha | Não disparada após 500 no registro. |

---

## 🐞 3. Inconsistências e Bugs Encontrados

### ❗ BUG-01: Visibilidade Incorreta do Campo "Semestre"
- **Gravidade:** Menor (UX)
- **Descrição:** O campo "Semestre" no Passo 2 permanece visível mesmo quando o usuário seleciona o perfil "Professor" ou "Pesquisador".
- **Impacto:** Confuso para o usuário, pois não faz sentido acadêmico para esses perfis.
- **Referência:** `frontend/src/pages/CadastroPage.tsx:L201-209`

### 🛑 BUG-02: Erro Crítico de Submissão (HTTP 500)
- **Gravidade:** **Bloqueante**
- **Descrição:** Ao clicar em "Finalizar Cadastro", a requisição para `POST /api/users/register` retorna erro interno do servidor (500).
- **Impacto:** Impede a criação de novos usuários e, consequentemente, impossibilita a validação da entrega da Sprint 4 (Análise da IA, Match em tempo real e Grafo animado).
- **Causa Provável:** Erro na persistência no banco (Neo4j/Memory Store) ou na chamada inicial do Orquestrador.

---

## 📊 4. Conformidade com Documentação (MVP)

Análise baseada no `implementation_plan.md` e `01_DOCUMENTO_PROJETO_ARIANO.md`:

1. **Campos Inteligentes:** Estão presentes no formulário (Bio, O que busco).
2. **Extração de PDF:** O formulário orienta corretamente que o PDF não será salvo, apenas lido pela IA.
3. **Match Visível:** Não pôde ser verificado devido ao BUG-02. **Atenção:** Esta é a "Principal Entrega do MVP" e precisa de correção urgente antes da demonstração.

---

## 📝 5. Próximos Passos Recomendados
1. **Corrigir BUG-02 imediatamente:** Verificar por que a rota de registro está falhando no backend.
2. **Refinar CadastroPage:** Aplicar renderização condicional no campo "Semestre".
3. **Validar Experiência de Cognição:** Após correção, testar se os componentes de visualização da IA (MiniGraph/Timeline) estão recebendo os dados corretamente.

---
**Assinado:** Antigravity QA Agent
