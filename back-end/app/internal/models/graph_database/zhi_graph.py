from . import neo4j_driver


def person_get_all_node_and_relation():
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n:ZhiPerson)-[r]->(m:ZhiPerson) RETURN n, r.type as r, m")
        return result.data()


def person_get_relation_ship_by_id_in(subject_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            "MATCH (subject:ZhiPerson {姓名: $subject_name})-[r]->(object:ZhiPerson) "
            "RETURN subject.姓名, COALESCE(subject.身份, '-') AS subject_identity, "
            "r.type AS relationship, object.姓名, COALESCE(object.身份, '-') AS object_identity",
            subject_name=subject_name,
        )
        return result.data()


def person_get_relation_ship_by_id_out(object_name: str):
    with neo4j_driver.session() as session:
        result = session.run(
            "MATCH (subject:ZhiPerson)-[r]->(object:ZhiPerson {姓名: $object_name}) "
            "RETURN subject.姓名, COALESCE(subject.身份, '-') AS subject_identity, "
            "r.type AS relationship, object.姓名, COALESCE(object.身份, '-') AS object_identity",
            object_name=object_name,
        )
        return result.data()


def person_get_list(page: int, page_size: int, title: str | None, role: str | None):
    with neo4j_driver.session() as session:
        skip = (page - 1) * page_size
        if title and role:
            if role == "外户":
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.姓名 CONTAINS $title AND (n.身份 IS NULL OR SIZE(n.身份) = 0)
                    RETURN n
                    ORDER BY n.姓名
                    SKIP $skip LIMIT $limit
                    """,
                    title=title,
                    skip=skip,
                    limit=page_size,
                )
            else:
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.姓名 CONTAINS $title AND ANY(x IN n.身份 WHERE x CONTAINS $role)
                    RETURN n
                    ORDER BY n.世代Index,n.姓名
                    SKIP $skip LIMIT $limit
                    """,
                    title=title,
                    role=role,
                    skip=skip,
                    limit=page_size,
                )
        elif title:
            result = session.run(
                """
                MATCH (n:ZhiPerson)
                WHERE n.姓名 CONTAINS $title
                RETURN n
                ORDER BY n.姓名
                SKIP $skip LIMIT $limit
                """,
                title=title,
                skip=skip,
                limit=page_size,
            )
        elif role:
            if role == "外户":
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.身份 IS NULL OR SIZE(n.身份) = 0
                    RETURN n
                    ORDER BY n.姓名
                    SKIP $skip LIMIT $limit
                    """,
                    skip=skip,
                    limit=page_size,
                )
            else:
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE ANY(x IN n.身份 WHERE x CONTAINS $role)
                    RETURN n
                    ORDER BY n.世代Index, n.姓名
                    SKIP $skip LIMIT $limit
                    """,
                    role=role,
                    skip=skip,
                    limit=page_size,
                )
        else:
            result = session.run(
                """
                MATCH (n:ZhiPerson)
                RETURN n
                ORDER BY n.身份,n.世代Index, n.姓名
                SKIP $skip LIMIT $limit
                """,
                skip=skip,
                limit=page_size,
            )
        return result.data()


def person_get_list_no_page(title: str):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (n:ZhiPerson)
            WHERE n.姓名 CONTAINS $title
            RETURN n
            ORDER BY n.身份, n.姓名
            """,
            title=title,
        )
        return result.data()


def person_get_identity_set():
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n:ZhiPerson) WHERE n.身份 IS NOT NULL RETURN DISTINCT n.身份")
        return result.data()


def person_total_num(title: str | None, role: str | None):
    with neo4j_driver.session() as session:
        if title and role:
            if role == "外户":
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.姓名 CONTAINS $title AND (n.身份 IS NULL OR SIZE(n.身份) = 0)
                    RETURN count(n)
                    """,
                    title=title,
                )
            else:
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.姓名 CONTAINS $title AND ANY(x IN n.身份 WHERE x CONTAINS $role)
                    RETURN count(n)
                    """,
                    title=title,
                    role=role,
                )
        elif title:
            result = session.run(
                """
                MATCH (n:ZhiPerson)
                WHERE n.姓名 CONTAINS $title
                RETURN count(n)
                """,
                title=title,
            )
        elif role:
            if role == "外户":
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE n.身份 IS NULL OR SIZE(n.身份) = 0
                    RETURN count(n)
                    """,
                )
            else:
                result = session.run(
                    """
                    MATCH (n:ZhiPerson)
                    WHERE ANY(x IN n.身份 WHERE x CONTAINS $role)
                    RETURN count(n)
                    """,
                    role=role,
                )
        else:
            result = session.run(
                """
                MATCH (n:ZhiPerson)
                RETURN count(n)
                """
            )
        return result.single()[0]


def person_get_node_by_name(name: str):
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n:ZhiPerson {姓名: $name}) RETURN n", name=name)
        return result.data()


def get_random_person():
    with neo4j_driver.session() as session:
        result = session.run("MATCH (n:ZhiPerson) WHERE n.身份 IS NOT NULL RETURN n.姓名 ORDER BY rand() LIMIT 1")
        return result.data()
