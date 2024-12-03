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


