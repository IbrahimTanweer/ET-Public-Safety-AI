import json
from datetime import datetime
from google import genai
from google.genai import types
from config import config
from models.complaint import ExtractedEntities, TimelineEvent, AuditLog

class ExtractorAgent:
    def __init__(self):
        # Configure Gemini API with new SDK
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model_name = 'gemini-3.1-flash-lite'

    def extract_and_audit(self, complaint_text: str) -> tuple[ExtractedEntities, list[TimelineEvent], list[AuditLog]]:
        """
        Uses Gemini to extract entities, build a timeline, and log the decision audit.
        """
        prompt = f"""
        You are a Cybercrime Investigation AI. Analyze the following complaint and extract the requested information.
        Return ONLY a JSON object with the following structure:
        {{
            "entities": {{
                "phone": "extracted phone number or null",
                "upi": "extracted upi id or null",
                "bank": "extracted bank name or null",
                "website": "extracted website or null",
                "amount": float amount or null,
                "scam_type": "short category of the scam"
            }},
            "timeline": [
                {{"event_type": "Short Type", "description": "What happened"}}
            ],
            "audit_logs": [
                {{"decision": "Extracted phone X", "confidence": 0.95}}
            ]
        }}
        
        Complaint:
        "{complaint_text}"
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            clean_text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
            data = json.loads(clean_text)
            
            # Map JSON to Pydantic models
            entities_data = data.get("entities", {})
            entities = ExtractedEntities(
                phone=entities_data.get("phone"),
                upi=entities_data.get("upi"),
                bank=entities_data.get("bank"),
                website=entities_data.get("website"),
                amount=entities_data.get("amount"),
                scam_type=entities_data.get("scam_type")
            )
            
            timeline = []
            for t in data.get("timeline", []):
                timeline.append(TimelineEvent(
                    timestamp=datetime.now(), # Mock timestamp as we can't always parse exact time from text easily
                    event_type=t.get("event_type", "Event"),
                    description=t.get("description", "")
                ))
                
            audit_logs = []
            for a in data.get("audit_logs", []):
                audit_logs.append(AuditLog(
                    agent_name="ExtractorAgent",
                    decision=a.get("decision", ""),
                    confidence=float(a.get("confidence", 0.0))
                ))
                
            return entities, timeline, audit_logs
            
        except Exception as e:
            print(f"Error during extraction: {e}")
            # Fallback to empty if Gemini fails or config is wrong
            return ExtractedEntities(), [], []

extractor_agent = ExtractorAgent()

def get_extractor_agent():
    return extractor_agent
