import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Neo4j Settings
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j") 
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

    # Postgres Settings
    POSTGRES_URI = os.getenv("POSTGRES_URI", "postgresql://user:password@localhost:5432/db")

    # Gemini Settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

config = Config()
