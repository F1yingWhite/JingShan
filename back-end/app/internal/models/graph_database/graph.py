from unittest import result

from neo4j import GraphDatabase

from . import neo4j_driver


def get_relation_ship_by_id(subject_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            "MATCH (subject {姓名: $subject_name})-[r]->(object) RETURN subject.姓名, COALESCE(subject.身份, 'Not Found') AS subject_identity, type(r) AS relationship, object.姓名, COALESCE(object.身份, 'Not Found') AS object_identity",
            subject_name=subject_name,
        )
        return result.data()


def get_list(page: int, page_size: int):
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n) RETURN n SKIP $skip LIMIT $limit", skip=(page - 1) * page_size, limit=page_size)
        return result.data()


def total_num():
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n) RETURN count(n)")
        return result.data()
