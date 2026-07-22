from google import genai
from config import config
from models.graph import Recommendation, RiskResponse

class RecommendationEngine:
    def __init__(self):
        try:
            self.client = genai.Client(api_key=config.GEMINI_API_KEY)
            self.model_name = 'gemini-3.1-flash-lite'
        except Exception as e:
            print(f"Error configuring Gemini: {e}")
            self.client = None

    def generate_recommendations(self, risk_response: RiskResponse) -> list[Recommendation]:
        """
        Translates risk into actionable recommendations using rule-based actions, 
        and LLM-enhanced reasoning.
        """
        recommendations = []
        
        # Rule-based actions
        if risk_response.risk_score > 90:
            actions = [
                {"action": "Freeze Bank Account", "target": "Bank Accounts linked to UPI"},
                {"action": "Block SIM", "target": "Reported Phone Number"}
            ]
        elif risk_response.risk_score > 60:
            actions = [
                {"action": "Notify Bank", "target": "Receiving Bank"}
            ]
        else:
            actions = [
                {"action": "Monitor", "target": "Reported Entities"}
            ]
            
        for act in actions:
            reason = f"Based on risk score {risk_response.risk_percentage}. Default action."
            if self.client:
                prompt = f"""
                You are a senior cybercrime investigator. A risk score of {risk_response.risk_percentage} was calculated for a complaint.
                The factors are: {', '.join(risk_response.factors) if risk_response.factors else 'None provided'}.
                The system has decided to take the action: '{act['action']}' on target '{act['target']}'.
                In one short, professional sentence, provide the specific reasoning for this action based on the factors. Do not mention the word 'system'.
                """
                try:
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt
                    )
                    reason = response.text.strip()
                except Exception as e:
                    print(f"LLM reason generation failed: {e}")
                    
            recommendations.append(Recommendation(
                action=act["action"],
                target=act["target"],
                reason=reason
            ))
            
        return recommendations

engine = RecommendationEngine()

def get_recommendation_engine():
    return engine
