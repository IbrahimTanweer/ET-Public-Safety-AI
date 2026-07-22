from database.neo4j_db import get_driver


class GraphAnalyzer:
    def __init__(self):
        self.driver = get_driver()

    def find_connected_complaints(self, phone: str) -> dict:
        """
        Builds the fraud network for a phone number.
        """

        query = """
        MATCH (c:Complaint)-[]->(n)
        WHERE n.number = $phone OR n.id = $phone OR n.url = $phone OR n.name = $phone
        OPTIONAL MATCH (c)-[r]->(other)
        RETURN c, r, other
        """

        nodes = {}
        edges = set()
        complaints = set()

        with self.driver.session() as session:

            result = session.run(query, phone=phone)
            records = list(result)

            print(f"Searching phone: {phone}")
            print(f"Records returned: {len(records)}")

            for record in records:

                complaint = record["c"]
                relation = record["r"]
                other = record["other"]

                if complaint is None:
                    continue

                comp_id = complaint["id"]
                complaints.add(comp_id)

                if comp_id not in nodes:
                    nodes[comp_id] = {
                        "id": comp_id,
                        "label": "Complaint",
                        "properties": dict(complaint)
                    }

                # Complaint -> Phone edge
                phone_number = None

                if "phone" in complaint:
                    phone_number = complaint["phone"]

                elif other is not None and "number" in other:
                    phone_number = other["number"]

                if phone_number:
                    if phone_number not in nodes:
                        nodes[phone_number] = {
                            "id": phone_number,
                            "label": "Phone",
                            "properties": {
                                "number": phone_number
                            }
                        }

                    edges.add(
                        (
                            comp_id,
                            phone_number,
                            "HAS_PHONE"
                        )
                    )

                if other is None or relation is None:
                    continue

                label = list(other.labels)[0]
                props = dict(other)

                node_id = (
                    props.get("number")
                    or props.get("id")
                    or props.get("url")
                    or props.get("name")
                )

                if node_id is None:
                    continue

                if node_id not in nodes:
                    nodes[node_id] = {
                        "id": str(node_id),
                        "label": label,
                        "properties": props
                    }

                edges.add(
                    (
                        comp_id,
                        str(node_id),
                        relation.type
                    )
                )

        return {
            "nodes": list(nodes.values()),
            "edges": [
                {
                    "source_id": s,
                    "target_id": t,
                    "relationship_type": r
                }
                for s, t, r in edges
            ],
            "total_complaints": len(complaints)
        }


analyzer = GraphAnalyzer()


def get_graph_analyzer():
    return analyzer