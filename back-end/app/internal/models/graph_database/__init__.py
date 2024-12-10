from neo4j import GraphDatabase

from ...bootstrap import config

try:
    neo4j_driver = GraphDatabase.driver(config.NEO4J.URL, auth=(config.NEO4J.AUTH_NAME, config.NEO4J.AUTH_PASSWORD))
    if neo4j_driver:
        with neo4j_driver.session() as session:
            result = session.run("RETURN 1")
            if result.single()[0] == 1:
                print("Neo4j连接成功并且数据库已启动")
            else:
                print("Neo4j连接成功但无法验证数据库状态")
except Exception as e:
    print("Neo4j连接失败:", e)
    exit(1)


def execute_cypher(cypher: str):
    try:
        with neo4j_driver.session() as session:
            result = session.run(cypher)
            return result.data()
    except Exception as e:
        print(f"Unexpected error: {e}")
        return "None"
