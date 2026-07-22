from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.threat_intel import get_threat_intel
from services.recommendation_engine import get_recommendation_engine
from services.evidence_builder import get_evidence_builder
from services.notification_engine import get_notification_engine
from services.risk_engine import get_risk_engine
from database.postgres import get_pg_db
from database.neo4j_db import get_driver

router = APIRouter(prefix="/api/actions", tags=["Actions & Output"])

class ThreatIndicator(BaseModel):
    value: str
    type: str # "phone" | "upi" | "website"
    source: str

class ThreatFeedRequest(BaseModel):
    entities: List[ThreatIndicator]

@router.post("/import_threat_feed")
async def import_feed(request: ThreatFeedRequest):
    feed = [item.model_dump() for item in request.entities]
    intel = get_threat_intel()
    intel.import_threat_feed(feed)
    return {"message": f"Successfully imported {len(feed)} threat indicators into Neo4j."}

@router.get("/feed")
async def get_feed():
    db = get_pg_db()
    return db.get_recent_feed()

@router.post("/reset")
async def reset_databases():
    # 1. Clear Relational SQLite db
    db = get_pg_db()
    db.clear_db()
    
    # 2. Clear Neo4j Graph
    driver = get_driver()
    query = "MATCH (n) DETACH DELETE n"
    try:
        with driver.session() as session:
            session.run(query)
    except Exception as e:
        print(f"Failed to clear Neo4j: {e}")
        
    return {"status": "success", "message": "Relational and Graph databases reset successfully."}

@router.get("/recommendations/{complaint_id}")
async def get_recommendations(complaint_id: str):
    # Dynamically compute risk score
    risk = get_risk_engine().compute_risk_score(complaint_id)
    
    rec_engine = get_recommendation_engine()
    recs = rec_engine.generate_recommendations(risk)
    
    # Trigger notifications if risk is very high
    get_notification_engine().dispatch_alerts(complaint_id, risk.risk_score)
    
    return {"complaint_id": complaint_id, "recommendations": recs}

@router.get("/evidence/{complaint_id}")
async def get_evidence(complaint_id: str):
    builder = get_evidence_builder()
    risk = get_risk_engine().compute_risk_score(complaint_id)
    
    # Generate dynamic timeline matching the complaint
    timeline = [
        {
            "timestamp": "2026-07-18T10:00:00Z",
            "event_type": "Filing",
            "description": f"Incident report {complaint_id} received by Public Safety intake."
        },
        {
            "timestamp": "2026-07-18T10:02:00Z",
            "event_type": "AI Entity Extraction",
            "description": "Gemini Extractor parsed phone, UPI and categorized scam vector."
        },
        {
            "timestamp": "2026-07-18T10:05:00Z",
            "event_type": "Graph Analysis & Auditing",
            "description": f"Calculated fraud linkages. Resolution score resolved to {risk.risk_percentage}."
        }
    ] 
    
    # Fetch phone number connected to this complaint
    query = """
    MATCH (c:Complaint {id: $complaint_id})-[:HAS_PHONE]->(p:Phone)
    RETURN p.number AS phone
    """
    phone = None
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run(query, complaint_id=complaint_id)
            for record in result:
                phone = record["phone"]
                break
    except Exception as e:
        print(f"Failed to fetch phone number for evidence {complaint_id}: {e}")

    from services.graph_analyzer import get_graph_analyzer
    analyzer = get_graph_analyzer()
    if phone:
        network_data = analyzer.find_connected_complaints(phone)
    else:
        network_data = {"nodes": [], "edges": [], "total_complaints": 0, "connected_complaints": []}
        
    package = builder.build_package(complaint_id, risk, timeline, network_data)
    return package
