# Mock PostgreSQL Connection
from config import config

class PostgresDB:
    def __init__(self):
        self.uri = config.POSTGRES_URI
        self.connected = False

    def connect(self):
        self.connected = True
        # print("Connected to PostgreSQL")

    def execute(self, query, params=None):
        if not self.connected:
            raise Exception("Database not connected")
        # Placeholder for executing SQL queries
        return {"status": "success", "data": []}

db = PostgresDB()

def get_pg_db():
    return db
