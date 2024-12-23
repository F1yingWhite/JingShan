from typing import Literal

from pydantic import BaseModel

from . import neo4j_driver


def get_by_scripture_name_with_colophon(scripture_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (n:Scripture {name: $scripture_name})-[r]-(related:Colophon)
            RETURN n,related
        """,
            scripture_name=scripture_name,
        )
        return result.data()


def get_colophon_with_related_data(colophon: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (n:Colophon {content: $colophon})-[r]-(related)
            WHERE related:Time OR related:Place OR related:Temple
            RETURN n,related, type(r) AS relationship_type
        """,
            colophon=colophon,
        )
        return result.data()


def get_colophon_with_person(colophon: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (related:Person)-[r]-(n:Colophon {content: $colophon})
            RETURN r.place AS place, r.type AS type, related
            """,
            colophon=colophon,
        )
        return result.data()


def update_colophon(
    volume_id: str,
    chapter_id: str,
    qianziwen: str | None,
    time: str | None,
    place: str | None,
    words_num: str | None,
    money: str | None,
    content: str | None,
    wish: str | None,
    pearwood: str | None,
):
    with neo4j_driver.session() as session:
        # 如果是none则设为""
        qianziwen = qianziwen if qianziwen else ""
        time = time if time else ""
        place = place if place else ""
        words_num = words_num if words_num else ""
        money = money if money else ""
        content = content if content else ""
        wish = wish if wish else ""
        pearwood = pearwood if pearwood else ""

        result = session.run(
            """
            MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id})
            SET n.qianziwen = $qianziwen,
                n.words_num = $words_num,
                n.money = $money,
                n.content = $content,
                n.wish = $wish,
                n.pearwood = $pearwood
            RETURN n
            """,
            volume_id=volume_id,
            chapter_id=chapter_id,
            qianziwen=qianziwen,
            words_num=words_num,
            content=content,
            money=money,
            wish=wish,
            pearwood=pearwood,
        )
        # 断开之前的时间地点
        session.run(
            """
            MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id})-[r]-(m)
            WHERE m:Time OR m:Place
            DELETE r
            """,
            volume_id=volume_id,
            chapter_id=chapter_id,
        )
        if time:
            time_node = session.run(
                """
                MATCH (n:Time {name: $time})
                RETURN n
                """,
                time=time,
            )
            if not time_node.data():
                session.run(
                    """
                    CREATE (n:Time {name: $time})
                    """,
                    time=time,
                )
            session.run(
                """
                MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id}), (m:Time {name: $time})
                MERGE (n)-[r:TIME]->(m)
                """,
                volume_id=volume_id,
                chapter_id=chapter_id,
                time=time,
            )
        if place:
            place_node = session.run(
                """
                MATCH (n:Place {name: $place})
                RETURN n
                """,
                place=place,
            )
            if not place_node.data():
                session.run(
                    """
                    CREATE (n:Place {name: $place})
                    """,
                    place=place,
                )
            session.run(
                """
                MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id}), (m:Place {name: $place})
                MERGE (n)-[r:PLACE]->(m)
                """,
                volume_id=volume_id,
                chapter_id=chapter_id,
                place=place,
            )
        return result.data()


class Individual(BaseModel):
    id: int
    name: str | None
    type: Literal["书", "刻工", "募", "对", ""]
    place: str | None


def update_related_individuals(
    volume_id: str,
    chapter_id: str,
    individuals: list[Individual],
):
    # 更新关联的Individual, Person-[RELATION:place,type]->Colophon
    with neo4j_driver.session() as session:
        # 先删除之前的关联
        session.run(
            """
            MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id})-[r]-(m:Person)
            DELETE r
            """,
            volume_id=volume_id,
            chapter_id=chapter_id,
        )
        for individual in individuals:
            individual_node = session.run(
                """
                MATCH (n:Person {name: $name})
                RETURN n
                """,
                name=individual.name,
            )
            if not individual_node.data():
                session.run(
                    """
                    CREATE (n:Person {name: $name})
                    """,
                    name=individual.name,
                )
            session.run(
                """
                MATCH (n:Colophon {volume_id: $volume_id, chapter_id: $chapter_id}), (m:Person {name: $name})
                MERGE (m)-[r:RELATION {place: $place, type: $type}]->(n)
                """,
                volume_id=volume_id,
                chapter_id=chapter_id,
                name=individual.name,
                place=individual.place,
                type=individual.type,
            )
    # 删除出度为0的Person
    with neo4j_driver.session() as session:
        session.run(
            """
            MATCH (n:Person)
            WHERE NOT (n)-[:RELATION]-()
            DELETE n
            """
        )


def get_random_individuals_with_colophon_and_scripture(size: int):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (m:Person)
            WITH m ORDER BY rand() LIMIT $size
            MATCH (m)-[r1:RELATION]-(n:Colophon)-[r2]->(p:Scripture)
            WITH m, COLLECT(n)[..50] AS colophons, p, r1
            UNWIND colophons AS n
            RETURN n, m, p, r1.place AS place, r1.type AS type
            """,
            size=size,
        )
        return result.data()
