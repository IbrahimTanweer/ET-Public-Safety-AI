from models.graph import Campaign
from database.neo4j_db import get_driver
import uuid

class CampaignDetector:
    def __init__(self):
        self.driver = get_driver()

    def cluster_campaigns(self, complaint_ids: list[str]) -> Campaign:
        """
        Creates a Campaign object out of a specific list of complaint IDs.
        """
        campaign_id = f"CAMP-{str(uuid.uuid4())[:6]}"
        total_victims = len(complaint_ids)
        estimated_loss = total_victims * 50000.0  # Mock estimation
        
        return Campaign(
            campaign_id=campaign_id,
            name=f"Digital Arrest Ring #{campaign_id}",
            total_victims=total_victims,
            estimated_loss=estimated_loss,
            summary=f"A coordinated group targeting individuals. Linked complaints: {', '.join(complaint_ids)}",
            risk_score=min(99.0, (total_victims * 15) + (estimated_loss / 10000)),
            linked_complaints=complaint_ids
        )

    def detect_campaigns(self) -> list[Campaign]:
        """
        Groups complaints by specific High-Risk Indicators (Phone, UPI) rather than DFS connected components.
        This provides clearer, entity-focused campaigns (e.g. "The 9123456780 Ring").
        """
        query = """
        MATCH (c:Complaint)
        OPTIONAL MATCH (c)-[:HAS_PHONE]->(p:Phone)
        OPTIONAL MATCH (c)-[:HAS_UPI]->(u:UPI)
        RETURN c.id AS complaint_id, c.text AS text, c.amount AS amount,
               p.number AS phone, u.id AS upi
        """
        
        entity_clusters = {}
        complaint_meta = {}
        
        with self.driver.session() as session:
            result = session.run(query)
            for record in result:
                c_id = record["complaint_id"]
                if not c_id:
                    continue
                
                complaint_meta[c_id] = {
                    "text": record["text"] or "",
                    "amount": float(record["amount"] or 0.0)
                }
                
                # Group by strong identifiers
                for k in ("phone", "upi"):
                    val = record[k]
                    if val and str(val).lower() not in ("unknown", "n/a", "none", "null") and str(val).strip() != "":
                        entity_key = f"{k.upper()}: {val}"
                        if entity_key not in entity_clusters:
                            entity_clusters[entity_key] = set()
                        entity_clusters[entity_key].add(c_id)
                        
        campaigns = []
        idx = 1
        for entity_key, comp_set in entity_clusters.items():
            comp = list(comp_set)
            # Only create a campaign if multiple complaints share the entity
            if len(comp) > 1:
                camp_id = f"CAMP-{idx:03d}"
                idx += 1
                total_victims = len(comp)
                estimated_loss = sum(complaint_meta[c_id]["amount"] for c_id in comp)
                
                if total_victims > 5:
                    risk_score = 98.0
                elif total_victims > 1:
                    risk_score = 75.0
                else:
                    risk_score = 25.0
                
                campaigns.append(Campaign(
                    campaign_id=camp_id,
                    name=f"Fraud Ring via {entity_key}",
                    total_victims=total_victims,
                    estimated_loss=estimated_loss,
                    summary=f"Coordinated campaign pivoting on {entity_key}. Linked {total_victims} complaints: {', '.join(comp)}",
                    risk_score=risk_score,
                    linked_complaints=comp
                ))
                
        # Sort by victims so largest campaigns show first
        campaigns.sort(key=lambda x: x.total_victims, reverse=True)
            
        return campaigns

detector = CampaignDetector()

def get_campaign_detector():
    return detector
