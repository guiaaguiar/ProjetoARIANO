import logging
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

    def process_new_entity(self, entity_uid: str, entity_type: str, profile_data: dict) -> Dict[str, Any]:
        """Runs the full intelligence pipeline for a new or updated entity."""
        logger.info(f"🚀 Orchestrator: Starting pipeline for {entity_type} {entity_uid}")
        
        # Step 1: Deep Context Retrieval
        deep_context = get_entity_deep_context(entity_uid, depth=2)
        logger.info(f"🧠 Orchestrator: Fetched deep context (N-hop) for {entity_uid}")
        
        # Enrich profile data with Graph-CoT context
        profile_data["graph_context"] = deep_context
        
        # Step 2: Sequential CoT Profile Analysis
        logger.info(f"🕵️ Orchestrator: Triggering ProfileAnalyzer")
        analysis_result = self.analyzer.analyze_and_configure(entity_uid, entity_type, profile_data)
        
        # Step 3: Match Calculation
        logger.info(f"⚖️ Orchestrator: Triggering EligibilityCalculator")
        match_result = self.calculator.calculate_for_entity(entity_uid)
        
        return {
            "status": "success",
            "entity_uid": entity_uid,
            "analysis": analysis_result,
            "matches": match_result
        }
