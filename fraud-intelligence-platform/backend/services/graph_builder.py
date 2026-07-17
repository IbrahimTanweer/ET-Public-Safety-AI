from database.neo4j_db import get_driver
from models.complaint import ExtractedEntities

class GraphBuilder:
    def __init__(self):
        self.driver = get_driver()

    def build_complaint_graph(self, complaint_id: str, entities: ExtractedEntities):
        """
        Takes extracted entities and builds the corresponding nodes and relationships in Neo4j.
        """
        query = """
        MERGE (c:Complaint {id: $complaint_id})
        
        FOREACH (ignoreMe IN CASE WHEN $phone IS NOT NULL THEN [1] ELSE [] END |
            MERGE (p:Phone {number: $phone})
            MERGE (c)-[:HAS_PHONE]->(p)
        )
        
        FOREACH (ignoreMe IN CASE WHEN $upi IS NOT NULL THEN [1] ELSE [] END |
            MERGE (u:UPI {id: $upi})
            MERGE (c)-[:HAS_UPI]->(u)
        )
        
        FOREACH (ignoreMe IN CASE WHEN $bank IS NOT NULL THEN [1] ELSE [] END |
            MERGE (b:Bank {name: $bank})
            MERGE (c)-[:TARGETED_BANK]->(b)
        )
        
        FOREACH (ignoreMe IN CASE WHEN $website IS NOT NULL THEN [1] ELSE [] END |
            MERGE (w:Website {url: $website})
            MERGE (c)-[:HAS_WEBSITE]->(w)
        )
        
        FOREACH (ignoreMe IN CASE WHEN $scam_type IS NOT NULL THEN [1] ELSE [] END |
            MERGE (s:ScamType {name: $scam_type})
            MERGE (c)-[:CLASSIFIED_AS]->(s)
            
            // Link Scam Type to mock Laws and Sections
            MERGE (l:Law {name: "IT Act"})
            MERGE (sec:Section {name: "Section 420"})
            MERGE (s)-[:PUNISHABLE_UNDER]->(sec)
            MERGE (sec)-[:PART_OF]->(l)
        )
        
        // Mock linking complaint to District, Officer, and Status
        MERGE (d:District {name: "Cyber Cell HQ"})
        MERGE (o:Officer {name: "Insp. Sharma"})
        MERGE (st:Status {name: "Open"})
        MERGE (c)-[:FILED_IN]->(d)
        MERGE (c)-[:ASSIGNED_TO]->(o)
        MERGE (c)-[:HAS_STATUS]->(st)
        """
        
        parameters = {
            "complaint_id": complaint_id,
            "phone": entities.phone,
            "upi": entities.upi,
            "bank": entities.bank,
            "website": entities.website,
            "scam_type": entities.scam_type
        }
        
        with self.driver.session() as session:
            session.run(query, parameters)
            
builder = GraphBuilder()

def get_graph_builder():
    return builder
