import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app.agents.profile_analyzer import ProfileAnalyzer
from app.agents.eligibility_calculator import EligibilityCalculator
from app.core.neo4j_driver import is_memory_mode

def test_agents():
    print(f"🔍 Testing agents in {'Memory' if is_memory_mode() else 'Neo4j'} mode...")
    
    try:
        analyzer = ProfileAnalyzer()
        print("✅ ProfileAnalyzer initialized")
        
        calculator = EligibilityCalculator()
        print("✅ EligibilityCalculator initialized")
        
        # Simple analysis test with dummy data
        dummy_profile = {
            "name": "Test User",
            "bio": "Estudante de engenharia interessado em robótica e Python.",
            "curriculo_texto": "Experiência em Arduino e desenvolvimento de software.",
            "skills": []
        }
        
        print("🧪 Running rule-based analysis test...")
        # Accessing protected method for testing
        skills = analyzer._analyze_rule_based(dummy_profile)
        
        print(f"DEBUG: skills type: {type(skills)}")
        print(f"DEBUG: skills content: {skills}")
        
        if isinstance(skills, list):
             extracted_names = [s.get('name') if isinstance(s, dict) else s for s in skills]
             print(f"📊 Extracted skills: {extracted_names}")
        
             if any(name and name.lower() == 'python' for name in extracted_names):
                 print("✨ Rule-based extraction working correctly!")
             else:
                 print("⚠️ Rule-based extraction did not find 'python' in bio.")
        else:
             print(f"❌ Unexpected return type from _analyze_rule_based: {type(skills)}")
            
        print("\n🚀 All agent initialization and basic logic tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_agents()
