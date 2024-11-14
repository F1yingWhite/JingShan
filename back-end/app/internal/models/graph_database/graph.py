from typing import Optional

from . import neo4j_driver


def get_relation_ship_by_id_in(subject_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            "MATCH (subject {姓名: $subject_name})-[r]->(object) "
            "RETURN subject.姓名, COALESCE(subject.身份, 'Not Found') AS subject_identity, "
            "type(r) AS relationship, object.姓名, COALESCE(object.身份, 'Not Found') AS object_identity",
            subject_name=subject_name,
        )
        return result.data()


def get_relation_ship_by_id_out(object_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            "MATCH (subject)-[r]->(object {姓名: $object_name}) "
            "RETURN subject.姓名, COALESCE(subject.身份, 'Not Found') AS subject_identity, "
            "type(r) AS relationship, object.姓名, COALESCE(object.身份, 'Not Found') AS object_identity",
            object_name=object_name,
        )
        return result.data()


def get_list(page: int, page_size: int, title: Optional[str]):
    with neo4j_driver.session() as session:
        if title:
            result = session.run(
                """
                MATCH (n)
                WHERE n.姓名 CONTAINS $title
                RETURN n
                ORDER BY CASE WHEN n.身份 IS NOT NULL THEN 1 ELSE 0 END DESC
                SKIP $skip LIMIT $limit
                """,
                title=title,
                skip=(page - 1) * page_size,
                limit=page_size,
            )
        else:
            result = session.run(
                """
                MATCH (n)
                RETURN n
                ORDER BY CASE WHEN n.身份 IS NOT NULL THEN 1 ELSE 0 END DESC
                SKIP $skip LIMIT $limit
                """,
                skip=(page - 1) * page_size,
                limit=page_size,
            )
        return result.data()


def get_list_no_page(title: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (n)
            WHERE n.姓名 CONTAINS $title
            RETURN n
            ORDER BY CASE WHEN n.身份 IS
            NOT NULL THEN 1 ELSE 0 END DESC
            """,
            title=title,
        )
        return result.data()


def get_identity_set():
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n) WHERE n.身份 IS NOT NULL RETURN DISTINCT n.身份")
        return result.data()


def total_num(title: Optional[str]):
    with neo4j_driver.session() as session:
        if title:
            result = session.run("MATCH (n) WHERE n.姓名 CONTAINS $title RETURN count(n)", title=title)
        else:
            result = session.run("MATCH (n) RETURN count(n)")
        return result.data()


def get_node_by_name(name: str):
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n {姓名: $name}) RETURN n", name=name)
        return result.data()
