from models.graph import Campaign

class MemoryAgent:
    def __init__(self):
        # In a real scenario, this would connect to a vector DB or Postgres for memory
        self.memory = {}

    def summarize_campaign(self, campaign: Campaign) -> str:
        """
        Uses LLM to summarize a campaign and stores it in memory for future reference.
        """
        summary = f"Campaign '{campaign.name}' targets users with {campaign.summary}. Loss: {campaign.estimated_loss}"
        self.memory[campaign.campaign_id] = summary
        return summary

    def recall_similar_campaigns(self, complaint_text: str) -> list:
        """
        Checks AI memory to see if this complaint matches known campaign patterns.
        """
        # Mock logic
        return ["Similar to Campaign #12: Digital Arrest via Fake CBI Calls"]

memory_agent = MemoryAgent()

def get_memory_agent():
    return memory_agent
