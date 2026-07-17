from fastapi import APIRouter
from services.threat_intel import get_threat_intel
from services.recommendation_engine import get_recommendation_engine
from services.evidence_builder import get_evidence_builder
from services.notification_engine import get_notification_engine
from services.risk_engine import get_risk_engine

router = APIRouter(prefix="/api/actions", tags=["Actions & Output"])

@router.post("/import_threat_feed")
async def import_feed():
    # Mock blacklisted entities
    feed = [
        {"value": "9876543210", "type": "phone", "source": "Cyber Police"},
        {"value": "fakecbi.gov.in", "type": "website", "source": "CERT-In"}
    ]
    intel = get_threat_intel()
    intel.import_threat_feed(feed)
    return {"message": f"Successfully imported {len(feed)} threat indicators into Neo4j."}

@router.get("/recommendations/{complaint_id}")
async def get_recommendations(complaint_id: str):
    # Mock fetch risk score
    risk = get_risk_engine().compute_risk_score(complaint_id, ["C1", "C2", "C3", "C4", "C5", "C6"])
    
    rec_engine = get_recommendation_engine()
    recs = rec_engine.generate_recommendations(risk)
    
    # Trigger notifications if risk is very high
    get_notification_engine().dispatch_alerts(complaint_id, risk.risk_score)
    
    return {"complaint_id": complaint_id, "recommendations": recs}

@router.get("/evidence/{complaint_id}")
async def get_evidence(complaint_id: str):
    builder = get_evidence_builder()
    risk = get_risk_engine().compute_risk_score(complaint_id, [])
    # Mock timeline
    timeline = [] 
    
    package = builder.build_package(complaint_id, risk, timeline)
    return package
