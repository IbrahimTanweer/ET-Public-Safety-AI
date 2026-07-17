from database.neo4j_db import get_driver

class ThreatIntel:
    def __init__(self):
        self.driver = get_driver()

    def import_threat_feed(self, blacklisted_entities: list[dict]):
        """
        Mocks importing a government threat feed and flagging entities in Neo4j.
        """
        query = """
        UNWIND $entities AS entity
        MATCH (n) WHERE (n:Phone AND n.number = entity.value) 
                     OR (n:UPI AND n.id = entity.value)
                     OR (n:Website AND n.url = entity.value)
        SET n.is_blacklisted = true, n.threat_source = entity.source
        """
        
        with self.driver.session() as session:
            session.run(query, entities=blacklisted_entities)

threat_intel = ThreatIntel()

def get_threat_intel():
    return threat_intel
