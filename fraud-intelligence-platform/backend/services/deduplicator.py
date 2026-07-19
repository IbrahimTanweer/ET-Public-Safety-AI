import hashlib

from database.neo4j_db import get_driver
import hashlib

class Deduplicator:
    def __init__(self):
        self.driver = get_driver()

    def is_duplicate(self, complaint_text: str) -> bool:
        """
        Creates a hash of the complaint to detect duplicate.
        """
        return self.get_existing_id(complaint_text) is not None

    def get_existing_id(self, complaint_text: str) -> str | None:
        """
        Returns the existing complaint ID if the complaint is a duplicate.
        """
        complaint_hash = hashlib.md5(complaint_text.encode('utf-8')).hexdigest()
        query = "MATCH (c:Complaint {hash: $hash}) RETURN c.id AS complaint_id"
        with self.driver.session() as session:
            result = session.run(query, hash=complaint_hash)
            for record in result:
                return record["complaint_id"]
        return None

    def register_complaint(self, complaint_text: str, complaint_id: str):
        """
        No-op, as actual registration is done via graph_builder.py
        """
        pass

deduplicator = Deduplicator()

def get_deduplicator():
    return deduplicator
