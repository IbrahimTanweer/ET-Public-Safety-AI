import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Neo4j Settings
    NEO4J_URI = os.getenv("NEO4J_URI", "")
    NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j") 
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

    # Postgres Settings
    POSTGRES_URI = os.getenv("POSTGRES_URI", "postgresql://user:password@localhost/db")

    # Gemini Settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

config = Config()
