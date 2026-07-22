from google import genai
from config import config
from models.graph import Campaign

class MemoryAgent:
    def __init__(self):
        # Configure Gemini API with new SDK
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model_name = 'gemini-3.1-flash-lite'
        self.memory = {}

    def summarize_campaign(self, campaign: Campaign) -> str:
        """
        Uses LLM to summarize a campaign and stores it in memory for future reference.
        """
        prompt = f"""
        Summarize the following cybercrime campaign for intelligence dispatch.
        Campaign Name: {campaign.name}
        Linked Details: {campaign.summary}
        Total Estimated Financial Loss: {campaign.estimated_loss} INR
        Number of Victims: {campaign.total_victims}
        
        Write a concise, professional executive intelligence briefing summary (2-3 sentences) detailing the scam vector, threat actors' approach, and immediate dispatch warning.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            summary = response.text.strip()
            self.memory[campaign.campaign_id] = summary
            return summary
        except Exception as e:
            print(f"MemoryAgent summary failed: {e}")
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
