from neo4j import GraphDatabase
from config import config

class InMemoryDB:
    def __init__(self):
        self.complaints = {}  # complaint_id -> dict of properties
        self.blacklisted = []  # list of {"value": str, "type": str, "source": str}

db_store = InMemoryDB()

class MockSession:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
    def run(self, query, parameters=None, **kwargs):
        p = parameters or {}
        
        # 1. Insert/Merge Complaint Node
        if "MERGE (c:Complaint" in query:
            c_id = p.get("complaint_id")
            if c_id:
                db_store.complaints[c_id] = {
                    "id": c_id,
                    "phone": p.get("phone"),
                    "upi": p.get("upi"),
                    "bank": p.get("bank"),
                    "website": p.get("website"),
                    "scam_type": p.get("scam_type"),
                    "amount": p.get("amount", 0.0),
                    "text": p.get("text", ""),
                    "hash": p.get("hash", "")
                }
            return []
            
        # 2. Check Hash for Deduplication
        if "MATCH (c:Complaint" in query and "hash" in query:
            target_hash = p.get("hash") or kwargs.get("hash")
            for c_id, c in db_store.complaints.items():
                if c.get("hash") == target_hash:
                    return [{"complaint_id": c_id}]
            return []
            
        # 3. Find Connected Complaints (by entity type)
        if "MATCH (p:Phone" in query:
            target_phone = p.get("phone") or kwargs.get("phone")
            records = []
            for c_id, c in db_store.complaints.items():
                if c.get("phone") == target_phone:
                    records.append({"complaint_id": c_id})
            return records
            
        if "MATCH (u:UPI" in query:
            target_upi = p.get("upi") or kwargs.get("upi")
            records = []
            for c_id, c in db_store.complaints.items():
                if c.get("upi") == target_upi:
                    records.append({"complaint_id": c_id})
            return records
            
        if "MATCH (w:Website" in query:
            target_website = p.get("website") or kwargs.get("website")
            records = []
            for c_id, c in db_store.complaints.items():
                if c.get("website") == target_website:
                    records.append({"complaint_id": c_id})
            return records

        # 4. Campaign detection - list all complaints with their entity connections
        if "RETURN c.id AS complaint_id" in query and ("p.number" in query or "upi" in query):
            records = []
            for c_id, c in db_store.complaints.items():
                records.append({
                    "complaint_id": c_id,
                    "phone": c.get("phone"),
                    "upi": c.get("upi"),
                    "website": c.get("website"),
                    "amount": c.get("amount", 0.0),
                    "text": c.get("text", "")
                })
            return records

        # 5. Threat intel import
        if "UNWIND $entities AS entity" in query:
            entities = p.get("entities", []) or kwargs.get("entities", [])
            for e in entities:
                db_store.blacklisted.append(e)
            return []

        # 6. Check if entity is blacklisted
        if "MATCH (n) WHERE (n:Phone" in query:
            val = p.get("value") or kwargs.get("value")
            for b in db_store.blacklisted:
                if b.get("value") == val:
                    return [{"is_blacklisted": True, "threat_source": b.get("source")}]
            return [{"is_blacklisted": False, "threat_source": None}]

        # 7. Distinct entity counts for statistics
        if "count(distinct p)" in query:
            phones = set()
            upis = set()
            websites = set()
            for c in db_store.complaints.values():
                if c.get("phone"): phones.add(c.get("phone"))
                if c.get("upi"): upis.add(c.get("upi"))
                if c.get("website"): websites.add(c.get("website"))
            return [{"phones": len(phones), "upis": len(upis), "websites": len(websites)}]

        # 8. Reset/Wipe database
        if "DETACH DELETE" in query:
            db_store.complaints.clear()
            db_store.blacklisted.clear()
            return []

        return []

class MockDriver:
    def session(self, **kwargs):
        return MockSession()
    def close(self):
        pass

# Check if Neo4j configuration is provided
if config.NEO4J_URI:
    try:
        driver = GraphDatabase.driver(
            config.NEO4J_URI,
            auth=(config.NEO4J_USERNAME, config.NEO4J_PASSWORD)
        )
    except Exception as e:
        print(f"Failed to initialize Neo4j driver: {e}. Using mock Neo4j driver.")
        driver = MockDriver()
else:
    print("NEO4J_URI not set. Using mock Neo4j driver.")
    driver = MockDriver()

def get_driver():
    return driver

def close_driver():
    driver.close()
