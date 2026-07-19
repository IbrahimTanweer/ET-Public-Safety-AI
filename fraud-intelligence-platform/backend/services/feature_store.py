from database.neo4j_db import get_driver

class FeatureStore:
    def __init__(self):
        self.driver = get_driver()

    def get_entity_features(self, entity_id: str) -> dict:
        """
        Retrieves precalculated features to speed up Risk Engine.
        """
        query = """
        MATCH (n) WHERE (n:Phone AND n.number = $entity_id) 
                     OR (n:UPI AND n.id = $entity_id)
                     OR (n:Website AND n.url = $entity_id)
        MATCH (c:Complaint)-[:HAS_PHONE|HAS_UPI|HAS_WEBSITE]->(n)
        RETURN count(c) AS total_complaints, sum(c.amount) AS total_loss
        """
        with self.driver.session() as session:
            result = session.run(query, entity_id=entity_id)
            for record in result:
                return {
                    "total_complaints": record["total_complaints"],
                    "total_victims": record["total_complaints"],
                    "total_loss": float(record["total_loss"] or 0.0)
                }
        return {
            "total_complaints": 0,
            "total_victims": 0,
            "total_loss": 0.0
        }
        
    def update_entity_features(self, entity_id: str, new_loss: float):
        """
        No-op since features are calculated dynamically from Neo4j now.
        """
        pass

feature_store = FeatureStore()

def get_feature_store():
    return feature_store
