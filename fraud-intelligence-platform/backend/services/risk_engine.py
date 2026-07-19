from database.neo4j_db import get_driver
from models.graph import RiskResponse

class RiskEngine:
    def __init__(self):
        self.driver = get_driver()

    def compute_risk_score(self, complaint_id: str, connected_complaints: list = None) -> RiskResponse:
        """
        Combines graph evidence (like number of connected complaints and blacklists) into a fraud confidence score.
        """
        # Query Neo4j to find linked entities of the complaint
        query_entities = """
        MATCH (c:Complaint {id: $complaint_id})-[:HAS_PHONE|HAS_UPI|HAS_WEBSITE]->(entity)
        RETURN labels(entity)[0] AS type, 
               entity.number AS phone, 
               entity.id AS upi, 
               entity.url AS website
        """
        
        entities_to_check = []
        with self.driver.session() as session:
            result = session.run(query_entities, complaint_id=complaint_id)
            for record in result:
                t = record["type"]
                if t == "Phone":
                    entities_to_check.append((t, record["phone"]))
                elif t == "UPI":
                    entities_to_check.append((t, record["upi"]))
                elif t == "Website":
                    entities_to_check.append((t, record["website"]))
                    
        # Now count overlaps for these entities and see if they are blacklisted
        overlapping_complaints = set()
        blacklist_factors = []
        
        for t, val in entities_to_check:
            if not val:
                continue
            # 1. Overlaps
            q_overlap = """
            MATCH (c:Complaint)-[:HAS_PHONE|HAS_UPI|HAS_WEBSITE]->(n)
            WHERE (n:Phone AND n.number = $val) 
               OR (n:UPI AND n.id = $val)
               OR (n:Website AND n.url = $val)
            RETURN c.id AS comp_id
            """
            with self.driver.session() as session:
                res = session.run(q_overlap, val=val)
                for rec in res:
                    c_id = rec["comp_id"]
                    if c_id != complaint_id:
                        overlapping_complaints.add(c_id)
            
            # 2. Blacklist check
            q_black = """
            MATCH (n) WHERE (n:Phone AND n.number = $val) 
                         OR (n:UPI AND n.id = $val)
                         OR (n:Website AND n.url = $val)
            RETURN n.is_blacklisted AS is_blacklisted, n.threat_source AS source
            """
            with self.driver.session() as session:
                res = session.run(q_black, val=val)
                for rec in res:
                    if rec.get("is_blacklisted"):
                        blacklist_factors.append(f"Blacklisted {t} ID: '{val}' ({rec.get('source')})")
                        
        num_connections = len(overlapping_complaints)
        
        # Calculate Risk Score
        score = 15.0  # Base score for isolated complaint
        factors = []
        
        if num_connections > 0:
            score += min(num_connections * 15.0, 50.0)  # up to 50% for overlaps
            factors.append(f"Linked to {num_connections} other complaints through shared entities")
            
        if blacklist_factors:
            score += 35.0  # 35% for blacklist indicators
            factors.extend(blacklist_factors)
            
        # Ensure upper bound of 99.0
        score = min(score, 99.0)
        
        # Generate percentage and explanation
        percentage = f"{int(score)}%"
        if score > 85:
            explanation = f"Extremely High Risk ({percentage}) due to extensive network overlaps and active blacklisting."
        elif score > 60:
            explanation = f"High Risk ({percentage}) due to multiple shared entities matching existing investigations."
        elif score > 35:
            explanation = f"Moderate Risk ({percentage}) due to some matching entities in database."
        else:
            explanation = f"Low Risk ({percentage}) - Isolated complaint with no prior intelligence matches."
            factors.append("No active overlaps or blacklists found in database")
            
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
