"""ARIANO AI Agents — Graph Configurators.

Three specialized agents that implement Phase 1 of the ARIANO architecture:
  1. ProfileAnalyzer — extracts skills and classifies academic profiles
  2. EditalInterpreter — extracts requirements and areas from government calls
  3. EligibilityCalculator — calculates match scores and creates ELIGIBLE_FOR edges

Flow:
  Input data → Agents process → Configure graph (nodes + weighted edges) → Graph ready for O(1) match
"""

from app.agents.profile_analyzer import ProfileAnalyzer
from app.agents.edital_interpreter import EditalInterpreter
from app.agents.eligibility_calculator import EligibilityCalculator

__all__ = ["ProfileAnalyzer", "EditalInterpreter", "EligibilityCalculator"]
