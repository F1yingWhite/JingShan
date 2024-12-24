from . import neo4j_driver


def person_get_all_node_and_relation():
    with neo4j_driver.session() as session:
        result = session.run(
            'MATCH (n:Person {type:"径山志"})-[r]->(m:Person {type:"径山志"}) RETURN n, r.type as r, m'
        )
        return result.data()


def person_no_relation():
    with neo4j_driver.session() as session:
        result = session.run('MATCH (n:Person {type:"径山志"}) WHERE NOT (n)-[]-() RETURN n')
        return result.data()


def person_get_relation_ship_by_id_in(subject_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            'MATCH (subject:Person {名号: $subject_name,type:"径山志"})-[r]->(object:Person {type:"径山志"}) '
            "RETURN subject.名号, COALESCE(subject.身份, '-') AS subject_identity, "
            "r.type AS relationship, object.名号, COALESCE(object.身份, '-') AS object_identity",
            subject_name=subject_name,
        )
        return result.data()


def person_get_relation_ship_by_id_out(object_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            'MATCH (subject:Person{type:"径山志"})-[r]->(object:Person {名号: $object_name,type:"径山志"}) '
            "RETURN subject.名号, COALESCE(subject.身份, '-') AS subject_identity, "
            "r.type AS relationship, object.名号, COALESCE(object.身份, '-') AS object_identity",
            object_name=object_name,
        )
        return result.data()


def person_get_list(page: int, page_size: int, title: str | None, role: str | None, dynasty: str | None):
    with neo4j_driver.session() as session:
        skip = (page - 1) * page_size
        conditions = ["n.type = '径山志'"]
        params = {"skip": skip, "limit": page_size}

        if title:
            conditions.append("n.名号 CONTAINS $title")
            params["title"] = title
        if role:
            if role == "外户":
                conditions.append("n.身份 IS NULL")
            else:
                conditions.append("n.身份 CONTAINS $role")
                params["role"] = role
        if dynasty:
            conditions.append("n.朝代 CONTAINS $dynasty")
            params["dynasty"] = dynasty

        where_clause = " AND ".join(conditions)
        query = f"""
            MATCH (n:Person)
            WHERE {where_clause}
            RETURN n
            ORDER BY n.身份, n.世代Index, n.名号
            SKIP $skip LIMIT $limit
        """

        result = session.run(query, **params)
        return result.data()


def person_total_num(title: str | None, role: str | None, dynasty: str | None):
    with neo4j_driver.session() as session:
        conditions = ["n.type = '径山志'"]
        params = {}

        if title:
            conditions.append("n.名号 CONTAINS $title")
            params["title"] = title
        if role:
            if role == "外户":
                conditions.append("n.身份 IS NULL")
            else:
                conditions.append("n.身份 CONTAINS $role")
                params["role"] = role
        if dynasty:
            conditions.append("n.朝代 CONTAINS $dynasty")
            params["dynasty"] = dynasty

        where_clause = " AND ".join(conditions)
        query = f"""
            MATCH (n:Person)
            WHERE {where_clause}
            RETURN count(n)
        """

        result = session.run(query, **params)
        return result.single()[0]


def person_get_list_no_page(title: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (n:Person {type:"径山志"})
            WHERE n.名号 CONTAINS $title
            RETURN n
            ORDER BY n.身份, n.名号
            """,
            title=title,
        )
        return result.data()


def person_get_identity_set():
    with neo4j_driver.session() as session:
        result = session.run('MATCH (n:Person {type:"径山志"}) WHERE n.身份 IS NOT NULL RETURN DISTINCT n.身份')
        return result.data()


def person_get_node_by_name(name: str):
    with neo4j_driver.session() as session:
        result = session.run('MATCH (n:Person {名号: $name,type:"径山志"}) RETURN n', name=name)
        return result.data()


def get_random_person():
    with neo4j_driver.session() as session:
        result = session.run(
            'MATCH (n:Person {type:"径山志"}) WHERE n.身份 IS NOT NULL RETURN n.名号 ORDER BY rand() LIMIT 1'
        )
        return result.data()
