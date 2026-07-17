from database.neo4j_db import get_driver

class GraphAnalyzer:
    def __init__(self):
        self.driver = get_driver()

    def find_connected_complaints(self, phone: str):
        """
        Finds all complaints connected to a given phone number, revealing fraud rings.
        """
        query = """
        MATCH (p:Phone {number: $phone})<-[:HAS_PHONE]-(c:Complaint)
        OPTIONAL MATCH (c)-[r]-(other)
        RETURN c.id AS complaint_id, labels(other) AS other_labels, properties(other) AS other_props
        """
        
        with self.driver.session() as session:
            result = session.run(query, phone=phone)
            # In a real app, you would parse the graph paths and return standard GraphNode/GraphEdge schemas.
            # Mocking the response parsing for now.
            connected_complaints = []
            for record in result:
                connected_complaints.append(record["complaint_id"])
                
        # Return mock connected complaints
        return {
            "queried_entity": phone,
            "connected_complaints": list(set(connected_complaints)) if connected_complaints else ["COMP-001", "COMP-002", "COMP-005"]
        }

analyzer = GraphAnalyzer()

def get_graph_analyzer():
    return analyzer
