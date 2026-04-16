import logging
from app.core.config import settings
from app.core.graph_tools import get_entity_deep_context, retrieve_node

logger = logging.getLogger(__name__)

class ContextualAnalyzer:
    """Agent for Graph Chat — Iterative Graph-CoT."""
    
    def __init__(self):
        self.llm = None
        self._init_llm()

    def _init_llm(self):
        if settings.openrouter_api_key:
            try:
                from langchain_openai import ChatOpenAI
                self.llm = ChatOpenAI(
                    model=settings.openrouter_model,
                    openai_api_key=settings.openrouter_api_key,
                    openai_api_base=settings.openrouter_base_url,
                    temperature=0.3,
                    max_tokens=1024,
                )
            except Exception as e:
                logger.warning(f"Could not init LLM for ContextualAnalyzer: {e}")
                self.llm = None

    def answer_query(self, query: str, active_node_uid: str = None) -> str:
        """Answers chat queries using Iterative Graph-CoT."""
        context = ""
        
        # Iteration 1: Deep context from active node
        if active_node_uid:
            deep_context = get_entity_deep_context(active_node_uid)
            context += f"Contexto do nó ativo:\n{deep_context}\n\n"
            
        # Iteration 2: Global retrieval based on query
        similar = retrieve_node(query, k=3)
        context += f"Entidades recuperadas do grafo relacionadas à query:\n{similar}\n\n"
        
        prompt = f"""Você é um assistente contextual do Grafo Híbrido especializado em responder dúvidas acadêmicas num ecossistema.
Você usa o contexto iterativo Graph-CoT para fundamentar suas respostas.

CONTEXTO:
{context}

PERGUNTA: {query}

INSTRUÇÕES:
Explique de maneira natural e inteligente como o contexto responde à pergunta, focando nas conexões (quem tem quais skills, quem bate com quais requerimentos). Responda diretamente.
"""
        
        if self.llm:
            try:
                response = self.llm.invoke(prompt)
                return response.content.strip()
            except Exception as e:
                logger.error(f"ContextualAnalyzer LLM error: {e}")
                
        return "Modo Sem-LLM. O assistente não pôde processar a query, mas o contexto foi recuperado: " + str(similar)
