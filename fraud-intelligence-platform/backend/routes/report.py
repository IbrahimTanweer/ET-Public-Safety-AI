from fastapi import APIRouter
from pydantic import BaseModel
from services.report_generator import get_report_generator
from services.graph_analyzer import get_graph_analyzer
from services.risk_engine import get_risk_engine

router = APIRouter(prefix="/api/report", tags=["Reports"])

class ReportRequest(BaseModel):
    complaint_id: str

@router.post("/")
async def generate_report(request: ReportRequest):
    # 1. Fetch risk data
    # In a real app we'd fetch this properly, here we mock the integration
    analyzer = get_graph_analyzer()
    engine = get_risk_engine()
    
    network_data = analyzer.find_connected_complaints("9876543210") # Mock phone
    risk_data = engine.compute_risk_score(request.complaint_id, network_data.get("connected_complaints", []))
    
    # 2. Generate Report via LLM
    generator = get_report_generator()
    report = generator.generate_investigation_report(
        complaint_id=request.complaint_id,
        risk_data=risk_data.model_dump(),
        graph_data=network_data
    )
    
    return {"report": report}
