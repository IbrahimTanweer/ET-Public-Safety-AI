from database.neo4j_db import get_driver
from models.graph import RiskResponse
import math

class RiskEngine:
    def __init__(self):
        self.driver = get_driver()

    def compute_risk_score(self, complaint_id: str, connected_complaints: list = None) -> RiskResponse:
        """
        Computes an advanced risk score by analyzing entity-specific weights, 
        network overlaps via non-linear scaling, and active threat intelligence signals.
        """
        
        # 1. Single-pass Cypher query capturing the entire local graph context
        advanced_query = """
        MATCH (c:Complaint {id: $complaint_id})
        
        // Find entities directly connected to this complaint
        MATCH (c)-[r:HAS_PHONE|HAS_UPI|HAS_WEBSITE]->(e)
        
        OPTIONAL MATCH (other:Complaint)-[:HAS_PHONE|HAS_UPI|HAS_WEBSITE]->(e)
        WHERE other.id <> c.id
        
        WITH e, type(r) AS rel_type, count(distinct other) AS entity_overlap_count,
             e.is_blacklisted AS blacklisted, e.threat_source AS source
        
        RETURN 
            collect({
                entity_type: labels(e)[0],
                relationship: rel_type,
                overlap_count: entity_overlap_count,
                is_blacklisted: coalesce(blacklisted, false),
                threat_source: source
            }) AS network_profile
        """

        with self.driver.session() as session:
            result = session.run(advanced_query, complaint_id=complaint_id)
            record = result.single()
            network_profile = record["network_profile"] if record else []

        # 2. Advanced Risk Metrics Definition
        base_score = 10.0
        weighted_overlap_score = 0.0
        blacklist_score = 0.0
        factors = []
        
        # Define how much weight a single link carries based on entity type
        # UPI/Websites are harder to duplicate/accidentally share than phones
        ENTITY_SPECIFICITY_WEIGHTS = {
            "UPI": 1.5,
            "Website": 2.0,
            "Phone": 1.0
        }

        # Process the network profile
        total_overlaps = 0
        blacklist_events = []

        for item in network_profile:
            e_type = item["entity_type"]
            weight = ENTITY_SPECIFICITY_WEIGHTS.get(e_type, 1.0)
            overlaps = item["overlap_count"]
            
            if overlaps > 0:
                total_overlaps += overlaps
                # Apply diminished returns using log scaling so massive hubs don't skew linearly
                # log1p handles cases where overlap is 0 safely
                weighted_overlap_score += math.log1p(overlaps) * 20.0 * weight
                factors.append(f"Shared {e_type} linked to {overlaps} prior case(s) (Weight multiplier: {weight}x)")
            
            if item["is_blacklisted"]:
                blacklist_events.append(item)
                # Differentiate score penalty by target impact
                blacklist_score += 30.0 * weight
                factors.append(f"Threat Intelligence Match: {e_type} blacklisted via {item['threat_source']}")

        # 3. Combine risk variables using a bounded logistic function or max caps
        # Caps prevent minor overlaps from blowing past logical boundaries
        capped_overlap = min(weighted_overlap_score, 55.0)
        capped_blacklist = min(blacklist_score, 45.0)
        
        score = base_score + capped_overlap + capped_blacklist
        
        # Soft limit below absolute certainty unless verified blacklists exist
        if not blacklist_events:
            score = min(score, 85.0) 
        
        score = min(round(score, 1), 99.0)
        percentage = f"{int(score)}%"

        # 4. Contextual dynamic explanations
        if score >= 85.0:
            explanation = f"Critical Risk Profile ({percentage}): Highly correlated fraud ring indicators with verified threat intelligence matches."
        elif score >= 60.0:
            explanation = f"High Risk Profile ({percentage}): Significant structural cross-linking discovered across high-specificity identifiers."
        elif score >= 35.0:
            explanation = f"Moderate Risk Profile ({percentage}): Minor infrastructure overlap detected. Requires standard behavioral review."
        else:
            explanation = f"Low Risk Profile ({percentage}): Isolated node with negligible external graph dependencies."
            factors.append("No actionable network overlaps detected.")

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