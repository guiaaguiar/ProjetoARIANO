# 🚀 ARIANO — Plano de Reestruturação (IA Real & Auto-Auth)

> **Versão:** 10.0.0 (Sprint Especial)
> **Foco:** Substituir mocks por inteligência real rastreável e garantir persistência de sessão.

---

## 1. Problema Identificado
Apesar das animações estarem fluidas, os dados exibidos são estáticos (placeholders) e a IA não está "falando" com o front. Além disso, o auto-login após o cadastro está falhando, forçando o usuário a logar novamente.

---

## 2. Reestruturação do Backend (IA Transparente)

### 2.1. Rastreamento de Estado da IA
- **Mudança:** Adicionar propriedades `ai_status` e `ai_logs` ao nó de Usuário no Neo4j.
- **Ação:** O `OrchestratorAgent` atualizará o status em tempo real (ex: "Analisando Currículo", "Mapeando Grafo", "Finalizado").
- **Novo Endpoint:** `/api/users/{uid}/status` para permitir que o frontend faça polling da evolução da IA.

### 2.2. Pipeline de IA (Audit & Fix)
- Garantir que o `ProfileAnalyzer` e `EligibilityCalculator` persistam os dados CORRETAMENTE no Neo4j.
- Verificar se as arestas `HAS_SKILL` e `ELIGIBLE_FOR` estão sendo criadas com os pesos calculados pela LLM.

---

## 3. Reestruturação do Frontend (Cognição Real)

### 3.1. Polling de Cognição
- **Componente:** `CognitionExperience.tsx`
- **Lógica:** Substituir a animação de tempo fixo (15s) por um loop de polling que consulta o backend.
- **Visual:** Exibir o `scratchpad` (pensamentos da IA) em tempo real conforme são gerados pela LLM NVIDIA.
- **Matches:** Só exibir a tela de sucesso quando o backend confirmar que os matches estão prontos.

### 3.2. Fix de Autenticação
- Investigar a persistência do cookie `auth_token`.
- Ajustar `checkAuth` para garantir que o estado do Zustand seja atualizado de forma síncrona antes do redirecionamento.

---

## 4. Cronograma de Execução (Cascata)

1.  **Back:** Criar API de status e logs de processamento.
2.  **Back:** Adaptar `OrchestratorAgent` para escrever logs no banco.
3.  **Front:** Implementar polling no `CognitionExperience`.
4.  **Front:** Mapear resultados REAIS do polling nos cards de match.
5.  **Front:** Ajustar fluxo de autenticação e redirecionamento.

---
> [!IMPORTANT]
> Nenhuma linha de código deve ser alterada antes da aprovação deste plano estratégico.
