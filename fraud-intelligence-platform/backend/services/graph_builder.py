from database.neo4j_db import get_driver
from models.complaint import ExtractedEntities

class GraphBuilder:
    def __init__(self):
        self.driver = get_driver()

    def build_complaint_graph(
        self,
        complaint_id: str,
        entities: ExtractedEntities,
        text: str = "",
        amount: float = 0.0,
        hash_val: str = ""
    ):
        query = """
        MERGE (c:Complaint {id: $complaint_id})
        SET
            c.text = $text,
            c.amount = $amount,
            c.hash = $hash_val

        FOREACH (_ IN CASE WHEN $phone IS NOT NULL THEN [1] ELSE [] END |
            MERGE (p:Phone {number: $phone})
            MERGE (c)-[:HAS_PHONE]->(p)
        )

        FOREACH (_ IN CASE WHEN $upi IS NOT NULL THEN [1] ELSE [] END |
            MERGE (u:UPI {id: $upi})
            MERGE (c)-[:HAS_UPI]->(u)
        )

        FOREACH (_ IN CASE WHEN $bank IS NOT NULL THEN [1] ELSE [] END |
            MERGE (b:Bank {name: $bank})
            MERGE (c)-[:TARGETED_BANK]->(b)
        )

        FOREACH (_ IN CASE WHEN $website IS NOT NULL THEN [1] ELSE [] END |
            MERGE (w:Website {url: $website})
            MERGE (c)-[:HAS_WEBSITE]->(w)
        )

        FOREACH (_ IN CASE WHEN $scam_type IS NOT NULL THEN [1] ELSE [] END |
            MERGE (s:ScamType {name: $scam_type})
            MERGE (c)-[:CLASSIFIED_AS]->(s)

            MERGE (l:Law {name: "IT Act"})
            MERGE (sec:Section {name: "Section 420"})
            MERGE (s)-[:PUNISHABLE_UNDER]->(sec)
            MERGE (sec)-[:PART_OF]->(l)
        )

        MERGE (d:District {name: "Cyber Cell HQ"})
        MERGE (o:Officer {name: "Insp. Sharma"})
        MERGE (st:Status {name: "Open"})

        MERGE (c)-[:FILED_IN]->(d)
        MERGE (c)-[:ASSIGNED_TO]->(o)
        MERGE (c)-[:HAS_STATUS]->(st)
        """

        print("=" * 60)
        print("Complaint ID:", complaint_id)
        print("Text:", ascii(text))
        print("Amount:", amount)
        print("Hash:", hash_val)
        print("=" * 60)

        with self.driver.session() as session:

            session.run(
                query,
                complaint_id=complaint_id,
                phone=entities.phone,
                upi=entities.upi,
                bank=entities.bank,
                website=entities.website,
                scam_type=entities.scam_type,
                text=text,
                amount=amount,
                hash_val=hash_val
            )

            verify = session.run(
                """
                MATCH (c:Complaint {id:$complaint_id})
                RETURN properties(c) AS props
                """,
                complaint_id=complaint_id
            ).single()

            print("Stored Complaint:", verify["props"])
            
    def validate_graph_creation(self, complaint_id: str) -> bool:
        """
        Validates that the complaint node and its expected base relationships were created in Neo4j.
        """
        query = """
        MATCH (c:Complaint {id: $complaint_id})
        OPTIONAL MATCH (c)-[r]->(other)
        RETURN count(c) as complaint_count, count(r) as rel_count
        """
        try:
            with self.driver.session() as session:
                result = session.run(query, complaint_id=complaint_id)
                record = result.single()
                if not record or record["complaint_count"] == 0:
                    return False
                # Expect at least FILED_IN, ASSIGNED_TO, HAS_STATUS
                if record["rel_count"] < 3:
                    return False
                return True
        except Exception as e:
            print(f"Graph validation failed for {complaint_id}: {e}")
            return False
            
builder = GraphBuilder()

def get_graph_builder():
    return builder
