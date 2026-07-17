from fastapi import APIRouter
from services.graph_analyzer import get_graph_analyzer
from services.risk_engine import get_risk_engine

router = APIRouter(prefix="/api", tags=["Graph & Risk"])

@router.get("/network/{phone}")
async def get_fraud_network(phone: str):
    analyzer = get_graph_analyzer()
    network_data = analyzer.find_connected_complaints(phone)
    return network_data

@router.get("/risk/{complaint_id}")
async def get_risk(complaint_id: str):
    # In a real scenario, we might first query the graph to find connected entities
    # to this specific complaint, then pass it to the risk engine.
    analyzer = get_graph_analyzer()
    
    # Mocking that this complaint is connected to a specific phone number
    mock_phone = "9876543210"
    network_data = analyzer.find_connected_complaints(mock_phone)
    
    engine = get_risk_engine()
    risk_score = engine.compute_risk_score(complaint_id, network_data.get("connected_complaints", []))
    
    return risk_score
