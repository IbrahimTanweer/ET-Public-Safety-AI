from neo4j import GraphDatabase
from config import config

driver = GraphDatabase.driver(
    config.NEO4J_URI,
    auth=(config.NEO4J_USERNAME, config.NEO4J_PASSWORD)
)

def get_driver():
    return driver

def close_driver():
    driver.close()
