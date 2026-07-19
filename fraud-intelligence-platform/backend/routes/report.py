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
    engine = get_risk_engine()
    
    # 1. Fetch phone number connected to this complaint
    query = """
    MATCH (c:Complaint {id: $complaint_id})-[:HAS_PHONE]->(p:Phone)
    RETURN p.number AS phone
    """
    phone = None
    try:
        with engine.driver.session() as session:
            result = session.run(query, complaint_id=request.complaint_id)
            for record in result:
                phone = record["phone"]
                break
    except Exception as e:
        print(f"Failed to fetch phone number for complaint {request.complaint_id}: {e}")

    # 2. Fetch network and risk data dynamically
    analyzer = get_graph_analyzer()
    if phone:
        network_data = analyzer.find_connected_complaints(phone)
    else:
        network_data = {"nodes": [], "edges": [], "total_complaints": 0, "connected_complaints": []}
        
    risk_data = engine.compute_risk_score(request.complaint_id, network_data.get("connected_complaints", []))
    
    # 3. Generate Report via LLM
    generator = get_report_generator()
    report = generator.generate_investigation_report(
        complaint_id=request.complaint_id,
        risk_data=risk_data.model_dump(),
        graph_data=network_data
    )
    
    return {"report": report}
