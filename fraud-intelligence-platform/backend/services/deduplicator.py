import hashlib

class Deduplicator:
    def __init__(self):
        # In memory store for mock purposes. Should be Postgres or Redis.
        self.seen_hashes = {}  # Map: hash -> complaint_id

    def is_duplicate(self, complaint_text: str) -> bool:
        """
        Creates a hash of the complaint to detect exact or near duplicates.
        """
        complaint_hash = hashlib.md5(complaint_text.encode('utf-8')).hexdigest()
        return complaint_hash in self.seen_hashes

    def get_existing_id(self, complaint_text: str) -> str | None:
        """
        Returns the existing complaint ID if the complaint is a duplicate.
        """
        complaint_hash = hashlib.md5(complaint_text.encode('utf-8')).hexdigest()
        return self.seen_hashes.get(complaint_hash)

    def register_complaint(self, complaint_text: str, complaint_id: str):
        """
        Registers a new complaint.
        """
        complaint_hash = hashlib.md5(complaint_text.encode('utf-8')).hexdigest()
        self.seen_hashes[complaint_hash] = complaint_id

deduplicator = Deduplicator()

def get_deduplicator():
    return deduplicator
