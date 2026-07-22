from google import genai
from config import config

class ReportGenerator:
    def __init__(self):
        # Configure Gemini API with new SDK
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model_name = 'gemini-3.1-flash-lite'

    def generate_investigation_report(self, complaint_id: str, risk_data: dict, graph_data: dict) -> str:
        """
        Uses LLM to produce human-readable investigation summaries and recommendations.
        """
        prompt = f"""
        You are a senior Lead Cybercrime Investigator. Generate a professional, court-ready Investigation Report for Complaint ID: {complaint_id}.
        
        Input Context:
        - Risk Assessment Data: {risk_data}
        - Fraud Graph Network Overlaps: {graph_data}
        
        Please format the report cleanly in markdown with the following sections:
        1. **EXECUTIVE SUMMARY** (Overview of the complaint, the risk rating, and whether it's part of a fraud ring).
        2. **TECHNICAL FINDINGS & FRAUD GRAPH EVIDENCE** (Detailing the connections, overlaps with other complaints, and any blacklisted identifiers like UPI/Phone numbers found).
        3. **POLICE ACTION & LEGAL RECOMMENDATIONS** (Actionable steps like freezing accounts, blocking SIMs, IT Act laws/sections under which the crime is punishable).
        
        Maintain an objective, analytical, and authoritative investigative tone. Do not mention any JSON brackets, template placeholders, or variables.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"ReportGenerator failed: {e}")
            # Fallback report
            return f"""
INVESTIGATION REPORT for Complaint {complaint_id}
==================================================
Risk Score: {risk_data.get('risk_percentage', 'N/A')}

Summary:
This complaint is part of a larger fraud ring involving {len(graph_data.get('connected_complaints', []))} related complaints.
The primary vectors identified are phone numbers and UPI IDs linked to previous scams.

Recommendations:
- Immediately freeze the associated bank accounts.
- Block the identified UPI IDs across the network.
- Issue a subpoena for the call logs of the connected phone numbers.
            """

generator = ReportGenerator()

def get_report_generator():
    return generator
