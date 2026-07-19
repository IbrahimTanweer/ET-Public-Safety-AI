from database.neo4j_db import get_driver

class GraphAnalyzer:
    def __init__(self):
        self.driver = get_driver()

    def find_connected_complaints(self, phone: str) -> dict:
        """
        Finds all complaints connected to a given phone number and builds the graph network.
        """
        query = """
        MATCH (p:Phone {number: $phone})<-[:HAS_PHONE]-(c:Complaint)
        OPTIONAL MATCH (c)-[r]->(other)
        RETURN c.id AS comp_id, c.text AS comp_text, c.amount AS comp_amount,
               type(r) AS rel_type,
               labels(other)[0] AS other_label,
               other.number AS phone_num, other.id AS upi_id, other.url AS web_url, other.name AS other_name
        """
        
        nodes_dict = {}
        edges_set = set()
        connected_complaints = set()
        
        # Add the queried phone node itself
        nodes_dict[phone] = {
            "id": phone,
            "label": "Phone",
            "properties": {"number": phone}
        }
        
        with self.driver.session() as session:
            result = session.run(query, phone=phone)
            for record in result:
                comp_id = record.get("comp_id")
                if not comp_id:
                    continue
                    
                connected_complaints.add(comp_id)
                
                # Add Complaint Node
                if comp_id not in nodes_dict:
                    nodes_dict[comp_id] = {
                        "id": comp_id,
                        "label": "Complaint",
                        "properties": {
                            "text": record.get("comp_text") or "",
                            "amount": float(record.get("comp_amount") or 0.0)
                        }
                    }
                
                # Add relation between complaint and queried phone
                edges_set.add((comp_id, phone, "HAS_PHONE"))
                
                # Add other linked entities
                other_label = record.get("other_label")
                if other_label:
                    other_val = None
                    if other_label == "Phone":
                        other_val = record.get("phone_num")
                    elif other_label == "UPI":
                        other_val = record.get("upi_id")
                    elif other_label == "Website":
                        other_val = record.get("web_url")
                    elif other_label in ("Bank", "ScamType", "District", "Officer", "Status"):
                        other_val = record.get("other_name")
                        
                    if other_val:
                        if other_val not in nodes_dict:
                            nodes_dict[other_val] = {
                                "id": other_val,
                                "label": other_label,
                                "properties": {"name": other_val}
                            }
                        rel_type = record.get("rel_type") or "LINKS_TO"
                        edges_set.add((comp_id, other_val, rel_type))
                        
        nodes = list(nodes_dict.values())
        edges = [{"source_id": e[0], "target_id": e[1], "relationship_type": e[2]} for e in edges_set]
        
        return {
            "nodes": nodes,
            "edges": edges,
            "total_complaints": len(connected_complaints),
            "connected_complaints": list(connected_complaints)
        }

analyzer = GraphAnalyzer()

def get_graph_analyzer():
    return analyzer
