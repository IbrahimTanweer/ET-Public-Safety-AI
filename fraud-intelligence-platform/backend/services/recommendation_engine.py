from models.graph import Recommendation, RiskResponse

class RecommendationEngine:
    def __init__(self):
        pass

    def generate_recommendations(self, risk_response: RiskResponse) -> list[Recommendation]:
        """
        Translates risk into actionable recommendations.
        """
        recommendations = []
        
        if risk_response.risk_score > 90:
            recommendations.append(Recommendation(
                action="Freeze Bank Account",
                target="Bank Accounts linked to UPI",
                reason="High confidence of coordinated fraud ring."
            ))
            recommendations.append(Recommendation(
                action="Block SIM",
                target="Reported Phone Number",
                reason="Active campaign usage detected."
            ))
        elif risk_response.risk_score > 60:
            recommendations.append(Recommendation(
                action="Notify Bank",
                target="Receiving Bank",
                reason="Suspicious activity matching known patterns."
            ))
            
        return recommendations

engine = RecommendationEngine()

def get_recommendation_engine():
    return engine
