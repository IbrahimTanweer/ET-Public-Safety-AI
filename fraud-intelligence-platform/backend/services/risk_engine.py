from models.graph import RiskResponse

class RiskEngine:
    def __init__(self):
        pass

    def compute_risk_score(self, complaint_id: str, connected_complaints: list) -> RiskResponse:
        """
        Combines graph evidence (like number of connected complaints) into a fraud confidence score.
        """
        # Simple mock logic for demonstration:
        # If there are many connected complaints, the risk score is high.
        num_connections = len(connected_complaints)
        
        if num_connections > 5:
            score = 98.0
            percentage = "98%"
            explanation = f"98% because Phone appears in {num_connections} complaints and UPI is blacklisted."
            factors = ["High number of connected complaints", "Known fraudulent UPI identified"]
        elif num_connections > 1:
            score = 75.0
            percentage = "75%"
            explanation = f"75% because entities match {num_connections} existing complaints."
            factors = ["Multiple complaints linked to the same entity"]
        else:
            score = 25.0
            percentage = "25%"
            explanation = "25% because this appears to be an isolated incident with no prior graph history."
            factors = ["Isolated incident, insufficient graph evidence"]
            
        return RiskResponse(
            complaint_id=complaint_id,
            risk_score=score,
            risk_percentage=percentage,
            explanation=explanation,
            factors=factors
        )

engine = RiskEngine()

def get_risk_engine():
    return engine
