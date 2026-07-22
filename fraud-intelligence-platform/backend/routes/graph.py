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
    
    # 2. Fetch Entity Counts and Top Entities from Graph
    driver = get_driver()
    
    top_entities = {"phones": [], "upis": [], "websites": [], "banks": []}
    distinct_entities = {"phones": 0, "upis": 0, "websites": 0, "banks": 0}
    
    try:
        with driver.session() as session:
            # Distinct counts
            query_counts = """
            MATCH (c:Complaint)
            OPTIONAL MATCH (c)-[:HAS_PHONE]->(p:Phone)
            OPTIONAL MATCH (c)-[:HAS_UPI]->(u:UPI)
            OPTIONAL MATCH (c)-[:HAS_WEBSITE]->(w:Website)
            OPTIONAL MATCH (c)-[:TARGETED_BANK]->(b:Bank)
            RETURN count(distinct p) AS phones, count(distinct u) AS upis, count(distinct w) AS websites, count(distinct b) AS banks
            """
            result = session.run(query_counts)
            for record in result:
                distinct_entities["phones"] = record["phones"]
                distinct_entities["upis"] = record["upis"]
                distinct_entities["websites"] = record["websites"]
                distinct_entities["banks"] = record["banks"]
                
            # Top Phones
            query_phones = "MATCH (c:Complaint)-[:HAS_PHONE]->(p:Phone) RETURN p.number as id, count(c) as count ORDER BY count DESC LIMIT 5"
            for record in session.run(query_phones):
                top_entities["phones"].append({"id": record["id"], "count": record["count"]})
                
            # Top UPIs
            query_upis = "MATCH (c:Complaint)-[:HAS_UPI]->(u:UPI) RETURN u.id as id, count(c) as count ORDER BY count DESC LIMIT 5"
            for record in session.run(query_upis):
                top_entities["upis"].append({"id": record["id"], "count": record["count"]})
                
            # Top Websites
            query_websites = "MATCH (c:Complaint)-[:HAS_WEBSITE]->(w:Website) RETURN w.url as id, count(c) as count ORDER BY count DESC LIMIT 5"
            for record in session.run(query_websites):
                top_entities["websites"].append({"id": record["id"], "count": record["count"]})
                
            # Top Banks
            query_banks = "MATCH (c:Complaint)-[:TARGETED_BANK]->(b:Bank) RETURN b.name as id, count(c) as count ORDER BY count DESC LIMIT 5"
            for record in session.run(query_banks):
                top_entities["banks"].append({"id": record["id"], "count": record["count"]})
                
    except Exception as e:
        print(f"Failed to query distinct entities for stats: {e}")
        
    return {
        "total_complaints": rel_stats.get("total_complaints", 0),
        "total_financial_loss": rel_stats.get("total_loss", 0.0),
        "scam_category_distribution": rel_stats.get("scam_types", {}),
        "distinct_tracked_entities": distinct_entities,
        "top_entities": top_entities
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
