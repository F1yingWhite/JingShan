from neo4j import GraphDatabase

from ...config import config

try:
    neo4j_driver = GraphDatabase.driver(config.neo4j_url, auth=(config.neo4j_auth_name, config.neo4j_auth_password))
    if neo4j_driver:
        print("Neo4j连接成功")
except Exception as e:
    print("Neo4j连接失败:", e)

