class FeatureStore:
    def __init__(self):
        # Mock in-memory feature store. Would be Redis/Postgres.
        self.features = {}

    def get_entity_features(self, entity_id: str) -> dict:
        """
        Retrieves precalculated features to speed up Risk Engine.
        """
        return self.features.get(entity_id, {
            "total_complaints": 0,
            "total_victims": 0,
            "total_loss": 0.0
        })
        
    def update_entity_features(self, entity_id: str, new_loss: float):
        """
        Updates the feature store when a new complaint arrives.
        """
        if entity_id not in self.features:
            self.features[entity_id] = {"total_complaints": 0, "total_victims": 0, "total_loss": 0.0}
            
        self.features[entity_id]["total_complaints"] += 1
        self.features[entity_id]["total_victims"] += 1
        self.features[entity_id]["total_loss"] += new_loss

feature_store = FeatureStore()

def get_feature_store():
    return feature_store
