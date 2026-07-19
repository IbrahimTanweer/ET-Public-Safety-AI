from fastapi import APIRouter
from services.graph_analyzer import get_graph_analyzer
from services.risk_engine import get_risk_engine
from models.graph import FraudNetworkResponse
from database.postgres import get_pg_db
from database.neo4j_db import get_driver

router = APIRouter(prefix="/api", tags=["Graph & Risk"])

@router.get("/stats")
async def get_dashboard_stats():
    # 1. Fetch Relational Stats from SQLite
    db = get_pg_db()
    rel_stats = db.get_global_metrics()
    
    # 2. Fetch Entity Counts from Graph
    driver = get_driver()
    query = """
    MATCH (c:Complaint)
    OPTIONAL MATCH (c)-[:HAS_PHONE]->(p:Phone)
    OPTIONAL MATCH (c)-[:HAS_UPI]->(u:UPI)
    OPTIONAL MATCH (c)-[:HAS_WEBSITE]->(w:Website)
    RETURN count(distinct p) AS phones, count(distinct u) AS upis, count(distinct w) AS websites
    """
    distinct_entities = {"phones": 0, "upis": 0, "websites": 0}
    try:
        with driver.session() as session:
            result = session.run(query)
            for record in result:
                distinct_entities["phones"] = record["phones"]
                distinct_entities["upis"] = record["upis"]
                distinct_entities["websites"] = record["websites"]
    except Exception as e:
        print(f"Failed to query distinct entities for stats: {e}")
        
    return {
        "total_complaints": rel_stats.get("total_complaints", 0),
        "total_financial_loss": rel_stats.get("total_loss", 0.0),
        "scam_category_distribution": rel_stats.get("scam_types", {}),
        "distinct_tracked_entities": distinct_entities
    }

@router.get("/network/{phone}", response_model=FraudNetworkResponse)
async def get_fraud_network(phone: str):
    analyzer = get_graph_analyzer()
    network_data = analyzer.find_connected_complaints(phone)
    return network_data

@router.get("/risk/{complaint_id}")
async def get_risk(complaint_id: str):
    engine = get_risk_engine()
    risk_score = engine.compute_risk_score(complaint_id)
    return risk_score
