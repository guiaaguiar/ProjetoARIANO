import logging
import datetime
from typing import Dict, Any

from app.core.graph_tools import get_entity_deep_context
from app.agents.profile_analyzer import ProfileAnalyzer
from app.agents.eligibility_calculator import EligibilityCalculator
from app.core.neo4j_driver import run_cypher

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    """Orchestrator Agent — Graph-CoT aware pipeline executor."""
    
    def __init__(self):
        self.analyzer = ProfileAnalyzer()
        self.calculator = EligibilityCalculator()

    def _update_status(self, entity_uid: str, entity_type: str, status: str, log: str = None):
        """Updates the AI status and appends a log entry to the entity node."""
        query = f"""
        MATCH (ent:{entity_type} {{uid: $uid}})
        SET ent.ai_status = $status,
            ent.ai_logs = coalesce(ent.ai_logs, []) + $log_list
        """
        log_list = [f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {log}"] if log else []
        run_cypher(query, {"uid": entity_uid, "status": status, "log_list": log_list})
        if log:
            logger.info(f"🤖 AI Status [{entity_uid}]: {log}")

    def process_new_entity(self, entity_uid: str, entity_type: str, profile_data: dict) -> Dict[str, Any]:
        """Runs the full intelligence pipeline for a new or updated entity."""
        from app.core.neo4j_driver import get_memory_store, is_memory_mode
        
        logger.info(f"🚀 Orchestrator: Starting pipeline for {entity_type} {entity_uid}")
        
        # Se estivermos em modo memória, usamos batch_update para evitar timeouts no Vercel KV
        if is_memory_mode():
            store = get_memory_store()
            with store.batch_update():
                return self._process_logic(entity_uid, entity_type, profile_data)
        else:
            return self._process_logic(entity_uid, entity_type, profile_data)

    def _process_logic(self, entity_uid: str, entity_type: str, profile_data: dict) -> Dict[str, Any]:
        self._update_status(entity_uid, entity_type, "started", "Iniciando processamento cognitivo...")
        
        try:
            # Step 1: Deep Context Retrieval
            self._update_status(entity_uid, entity_type, "retrieving", "Recuperando contexto profundo do grafo...")
            deep_context = get_entity_deep_context(entity_uid, depth=2)
            
            # Enrich profile data with Graph-CoT context
            profile_data["graph_context"] = deep_context
            
            # Step 2: Sequential CoT Profile Analysis
            self._update_status(entity_uid, entity_type, "analyzing", "Acionando Agente Analista (NVIDIA Nemotron 3 Super)...")
            analysis_result = self.analyzer.analyze_and_configure(entity_uid, entity_type, profile_data)
            
            # Extrair pensamentos da IA para o log real-time
            analysis = analysis_result.get("analysis", {})
            scratchpad = analysis.get("scratchpad", "")
            if scratchpad:
                for line in scratchpad.split('\n'):
                    if "Step" in line or "[SCRATCHPAD]" in line:
                         self._update_status(entity_uid, entity_type, "analyzing", line.strip())
            
            summary = analysis.get("profile_summary")
            if summary:
                 self._update_status(entity_uid, entity_type, "analyzing", f"Resumo: {summary}")

            # Step 3: Match Calculation
            self._update_status(entity_uid, entity_type, "matching", "Calculando matches estratégicos no ecossistema...")
            match_result = self.calculator.calculate_for_entity(entity_uid)
            
            self._update_status(entity_uid, entity_type, "completed", "Processamento concluído com sucesso.")
            
            return {
                "status": "success",
                "entity_uid": entity_uid,
                "analysis": analysis_result,
                "matches": match_result
            }
        except Exception as e:
            error_msg = f"Erro no processamento: {str(e)}"
            self._update_status(entity_uid, entity_type, "failed", error_msg)
            logger.error(f"❌ Orchestrator Error: {error_msg}")
            raise e
