class Prioritizer:
    def __init__(self):
        pass

    def rank_investigations(self, campaigns: list) -> list:
        """
        Ranks active investigations/campaigns based on severity (victims and estimated loss).
        """
        # Sort campaigns by estimated loss descending
        ranked = sorted(campaigns, key=lambda c: c.estimated_loss, reverse=True)
        
        results = []
        for index, camp in enumerate(ranked):
            results.append({
                "priority": index + 1,
                "campaign": camp
            })
            
        return results

prioritizer = Prioritizer()

def get_prioritizer():
    return prioritizer
