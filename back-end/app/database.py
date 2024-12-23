# 数据处理杂项

import re

import pandas as pd
import polars as pl
from sqlalchemy import text
from sqlmodel import Session

from .internal.models.graph_database import neo4j_driver
from .internal.models.relation_database import engine


def create_user(df: pd.DataFrame):
    user_set = set()
    for i in range(len(df)):
        for column in ["对(1)", "书(1)", "刻工(1)"]:
            value = df.loc[i, column]
            if pd.notna(value):
                value_list = eval(value)
                if isinstance(value_list, list):
                    for item in value_list:
                        # 去掉空格
                        item = item.strip()
                        user_set.add(item)
    for user in user_set:
        if user != "":
            with Session(engine) as session:
                session.exec(text(f"insert into individual_new (name) values ('{user}')"))
                session.commit()


def create_conn(df: pd.DataFrame):
    for i in range(len(df)):
        for column in ["对(1)", "书(1)", "刻工(1)"]:
            value = df.loc[i, column]
            if pd.notna(value):
                value_list = eval(value)
                if isinstance(value_list, list):
                    for item in value_list:
                        item = item.strip()
                        with Session(engine) as session:
                            session.exec(text(f"insert into conn_new (name) values ('{item}')"))
                            session.commit()


def map_database(jingming: str, juanshu: str, original: str, qianziwen: str, i: int):
    rows = []
    if not pd.isna(qianziwen):
        # 直接根据千字文查询
        with Session(engine) as session:
            query = text("""
                SELECT * FROM colophon
                WHERE qianziwen LIKE :qianziwen
            """)
            result = session.execute(query, {"qianziwen": f"{qianziwen}"})
            rows = result.fetchall()
    if len(rows) != 1:
        if pd.isna(juanshu):
            with Session(engine) as session:
                query = text("""
                    SELECT * FROM colophon
                    WHERE scripture_name LIKE :jingming
                """)
                result = session.execute(query, {"jingming": f"{jingming}"})
                rows = result.fetchall()
        else:
            with Session(engine) as session:
                query = text("""
                    SELECT * FROM colophon
                    WHERE scripture_name LIKE :jingming
                    AND volume_id LIKE :juanshu
                """)
                if juanshu in ["序跋", "目录", "付卷", "附跋", "科文"] or (
                    jingming == "法界次第初门" and ("上" in juanshu or "下" in juanshu)
                ):
                    result = session.execute(query, {"jingming": f"{jingming}", "juanshu": f"%{juanshu}%"})
                elif jingming == "摩诃僧祇律" and ("上" in juanshu or "下" in juanshu):
                    result = session.execute(query, {"jingming": f"{jingming}", "juanshu": f"%{juanshu}/%"})
                elif jingming in [
                    "止观辅行传弘决",
                    "法华文句记",
                    "金光明经文句记",
                    "略释新华严经修行次第决疑论",
                    "摩诃止观",
                    "妙法莲华经解",
                    "释禅波罗蜜次第法门",
                    "楞伽阿跋多罗宝经注解",
                ] or (
                    jingming in ["舍利弗阿毗昙论", "诸经要集", "大唐内典录"] and ("上" in juanshu or "下" in juanshu)
                ):
                    result = session.execute(query, {"jingming": f"{jingming}", "juanshu": f"第{juanshu}%"})
                elif juanshu not in ["上", "中", "下"]:
                    result = session.execute(query, {"jingming": f"{jingming}", "juanshu": f"第{juanshu}卷/%"})
                else:
                    result = session.execute(query, {"jingming": f"{jingming}", "juanshu": f"%卷{juanshu}%"})
                # 如果没查到
                rows = result.fetchall()
    return [row[0] for row in rows]


def process_location(location):
    while (
        location.endswith("县")
        or location.endswith("释")
        or location.endswith("沙弥")
        or location.endswith("沙门")
        or location.endswith("比丘")
        or location.endswith("居士")
    ):
        if location.endswith("县") or location.endswith("释"):
            location = location[:-1]
        if (
            location.endswith("沙弥")
            or location.endswith("沙门")
            or location.endswith("比丘")
            or location.endswith("居士")
        ):
            location = location[:-2]
    return location


def to_database(excel_path):  # noqa: C901
    df = pd.read_excel(excel_path)
    for i in range(len(df)):
        id = df.loc[i, "id"]
        if pd.isna(id):
            continue
        时间 = df.loc[i, "时间"]
        if pd.isna(时间):
            时间 = ""
        地点 = df.loc[i, "地点"]
        if pd.isna(地点):
            地点 = ""
        寺庙 = df.loc[i, "寺庙"]
        if pd.isna(寺庙):
            寺庙 = ""
        if 寺庙.endswith("识"):
            寺庙 = 寺庙[:-1]
        money = df.loc[i, "该银"]
        if pd.isna(money):
            money = ""
        计字 = df.loc[i, "计字"]
        if pd.isna(计字):
            计字 = ""
        # 更新数据库
        with Session(engine) as session:
            session.exec(
                text(
                    f"""
                    UPDATE colophon
                    SET time = '{时间}', place = '{地点}', temple = '{寺庙}',money = '{money}',words_num = '{计字}'
                    WHERE id = {id}
                """
                )
            )
            session.commit()
    # 创建individual表
    with Session(engine) as session:
        session.exec(text("CREATE TABLE individual (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)"))
        session.commit()
    with Session(engine) as session:
        session.exec(text("CREATE TABLE ind_col(ind_id BIGINT, col_id BIGINT,place VARCHAR(255),type VARCHAR(255))"))
        session.commit()
    user_set = set()
    for i in range(len(df)):
        for column in ["对(1)", "书(1)", "刻工(1)"]:
            value = df.loc[i, column]
            if pd.notna(value):
                user_list = eval(value)
                if isinstance(user_list, list):
                    for user in user_list:
                        user_set.add(user)
    for user in user_set:
        with Session(engine) as session:
            if user != "":
                session.exec(text(f"insert into individual (name) values ('{user}')"))
                session.commit()
    user_id_dict = {}
    for i in range(len(df)):
        for column in ["对(1)", "书(1)", "刻工(1)"]:
            value = df.loc[i, column]
            if pd.notna(value):
                # 找到人物的id
                user_list = eval(value)
                if isinstance(user_list, list):
                    for user in user_list:
                        if user != "":
                            with Session(engine) as session:
                                query = text(f"SELECT id FROM individual WHERE name = '{user}'")
                                result = session.execute(query)
                                user_id = result.fetchone()[0]
                                user_id_dict[user] = user_id
    for i in range(len(df)):
        value = df.loc[i, "对(1)"]
        colophon_id = df.loc[i, "id"]
        if pd.isna(colophon_id):
            continue
        if pd.notna(value):
            # 找到人物的id
            user_list = eval(value)
            for user in user_list:
                if user != "":
                    with Session(engine) as session:
                        user_id = user_id_dict[user]
                        地名 = df.loc[i, "地名（对）"]
                        if pd.isna(地名):
                            地名 = ""
                        地名 = process_location(地名)
                        with Session(engine) as session:
                            session.exec(
                                text(
                                    f"insert into ind_col (ind_id, col_id,place,type) "
                                    f"values ({user_id},{colophon_id},'{地名}','对')"
                                )
                            )
                            session.commit()
    for i in range(len(df)):
        value = df.loc[i, "书(1)"]
        colophon_id = df.loc[i, "id"]
        if pd.isna(colophon_id):
            continue
        if pd.notna(value):
            # 找到人物的id
            user_list = eval(value)
            for user in user_list:
                if user != "":
                    with Session(engine) as session:
                        user_id = user_id_dict[user]
                        地名 = df.loc[i, "地名（书）"]
                        if pd.isna(地名):
                            地名 = ""
                        地名 = process_location(地名)
                        with Session(engine) as session:
                            session.exec(
                                text(
                                    f"insert into ind_col (ind_id, col_id,place,type) "
                                    f"values ({user_id},{colophon_id},'{地名}','书')"
                                )
                            )
                            session.commit()

    for i in range(len(df)):
        value = df.loc[i, "刻工(1)"]
        colophon_id = df.loc[i, "id"]
        if pd.isna(colophon_id):
            continue
        if pd.notna(value):
            # 找到人物的id
            user_list = eval(value)
            for user in user_list:
                if user != "":
                    with Session(engine) as session:
                        user_id = user_id_dict[user]
                        地名 = df.loc[i, "地名（刻）"]
                        if pd.isna(地名):
                            地名 = ""
                        地名 = process_location(地名)
                        with Session(engine) as session:
                            session.exec(
                                text(
                                    f"insert into ind_col (ind_id, col_id,place,type) values ({user_id},{colophon_id},'{地名}','刻工')"
                                )
                            )
                            session.commit()


def generate_neo4j_zang(create):  # noqa: C901
    person_set = []
    # 先删除所有neo4j构建节点
    if create:
        with neo4j_driver.session() as session:
            session.run("MATCH (n) WHERE NOT n:人物 DETACH DELETE n")
    with Session(engine) as session:
        query = text("SELECT * FROM individual")
        result = session.exec(query)
        for row in result:
            person_set.append(row)
    # neo4j创建Person节点
    if create:
        with neo4j_driver.session() as session:
            for person in person_set:
                session.run(
                    "CREATE (a:Person {id: $id, name: $name, type: $type})", id=person[0], name=person[1], type="径山藏"
                )
    # 构建colophon节点
    colophon_set = []
    scripture_name_set = set()
    time_set = set()
    place_set = set()
    temple_set = set()
    with Session(engine) as session:
        query = text("SELECT * FROM colophon")
        result = session.exec(query)
        for row in result:
            colophon_set.append(row)
            scripture_name_set.add(row[2])
            if row[9] is not None and row[9] != "":
                place_set.add(row[9])
            if row[8] is not None and row[8] != "":
                time_set.add(row[8])
            if row[10] is not None and row[10] != "":
                temple_set.add(row[10])

    if create:
        with neo4j_driver.session() as session:
            #  先创建scripture节点
            for scripture_name in scripture_name_set:
                session.run("CREATE (a:Scripture {name: $name})", name=scripture_name)
            # 创建place节点
            for place in place_set:
                session.run("CREATE (a:Place {name: $name})", name=place)
            # 创建time节点
            for time in time_set:
                session.run("CREATE (a:Time {name: $name})", name=time)
            # 创建temple节点
            for temple in temple_set:
                session.run("CREATE (a:Temple {name: $name})", name=temple)
            # 创建colophon节点
            for colophon in colophon_set:
                session.run(
                    "CREATE (a:Colophon {id: $id, content: $content,volume_id: $volume_id, chapter_id: $chapter_id, "
                    "qianziwen: $qianziwen,money: $money, words_num: $words_num, pearwood: $pearwood, "
                    "AD: $AD, wish: $wish})",
                    id=colophon[0],
                    content=colophon[1],
                    volume_id=colophon[3],
                    chapter_id=colophon[4],
                    qianziwen=colophon[5],
                    money=colophon[12],
                    words_num=colophon[11],
                    pearwood=colophon[-2],
                    AD=colophon[-1],
                    wish=colophon[-3],
                )

            # 创建关系
            for colophon in colophon_set:
                session.run(
                    """
                    MATCH (a:Colophon {id: $id}), (b:Scripture {name: $scripture_name})
                    CREATE (a)-[:SCRIPTURE {volume_id: $volume_id}]->(b)
                    """,
                    id=colophon[0],
                    scripture_name=colophon[2],
                    volume_id=colophon[3],
                )
                if colophon[9] is not None and colophon[9] != "":
                    session.run(
                        "MATCH (a:Colophon {id: $id}),(b:Place {name: $place}) CREATE (a)-[:PLACE]->(b)",
                        id=colophon[0],
                        place=colophon[9],
                    )
                if colophon[8] is not None and colophon[8] != "":
                    session.run(
                        "MATCH (a:Colophon {id: $id}),(b:Time {name: $time}) CREATE (a)-[:TIME]->(b)",
                        id=colophon[0],
                        time=colophon[8],
                    )
                if colophon[10] is not None and colophon[10] != "":
                    session.run(
                        "MATCH (a:Colophon {id: $id}),(b:Temple {name: $temple}) CREATE (a)-[:TEMPLE]->(b)",
                        id=colophon[0],
                        temple=colophon[10],
                    )

        # 构建关系
        with Session(engine) as session:
            query = text("SELECT * FROM ind_col")
            result = session.exec(query)
            for row in result:
                with neo4j_driver.session() as session:
                    session.run(
                        "MATCH (a:Person {id: $ind_id}), (b:Colophon {id: $col_id}) "
                        "CREATE (a)-[:RELATION {place: $place, type: $type}]->(b)",
                        ind_id=row[0],
                        col_id=row[1],
                        place=row[2],
                        type=row[3],
                    )


def notknow():
    def list_attr_to_str(tx):
        """
        在事务内执行Cypher语句，将“人物”节点中列表类型的属性值转换为字符串
        """
        query = """
        MATCH (p:人物)
        WITH p, keys(p) AS keys
        UNWIND keys AS key
        WITH p, key
        WHERE p[key] IS NOT NULL
        AND (CASE WHEN type(p[key]) IN ['List', 'String'] OR type(p[key]) IS NULL THEN false ELSE true END)
        AND (type(p[key]) IN ['List', 'String'])
        WITH p, key, CASE WHEN type(p[key]) = 'List' THEN p[key] ELSE [] END AS attr_value
        WITH p, key, reduce(s = "", x IN attr_value | s + x + ",") AS combined_str
        SET p[key] = substring(combined_str, 0, size(combined_str) - 1)
        RETURN p
        """
        result = tx.run(query)
        return result

    with neo4j_driver.session() as session:
        # 把所有的人物节点的属性中是列表的属性转换成字符串
        session.execute_write(list_attr_to_str)


def sanitize_key(key):
    # 使用正则表达式替换特殊字符
    return re.sub(r"[^\w]", "_", key)


def generate_neo4j_zhi_person(path):
    # 祖/父/母/亲友 中只有行靖法师 需要手动加一下数据
    # 同学/师承/俗家弟子/出家弟子
    df = pl.read_excel(path, sheet_name="01祖师")
    for row in df.iter_rows(named=True):
        # 过滤掉值为 None 或 "无" 的键
        properties = {
            sanitize_key(k): v
            for k, v in row.items()
            if v is not None and v != "无" and k not in ["同学", "师承", "俗家弟子", "出家弟子"]
        }
        properties["type"] = "径山志"
        # 动态构建 Cypher 查询
        query = "CREATE (a:Person {"
        query += ", ".join([f"{key}: ${key}" for key in properties.keys()])
        query += "})"

        # 运行 Cypher 查询
        with neo4j_driver.session() as session:
            session.run(query, **properties)

    df = pl.read_excel(path, sheet_name="02法侣")
    for row in df.iter_rows(named=True):
        properties = {
            sanitize_key(k): v
            for k, v in row.items()
            if v is not None and v != "无" and k not in ["同学", "师承", "俗家弟子", "出家弟子"]
        }
        properties["type"] = "径山志"
        query = "CREATE (a:Person {"
        query += ", ".join([f"{key}: ${key}" for key in properties.keys()])
        query += "})"

        with neo4j_driver.session() as session:
            session.run(query, **properties)


def generate_person(name, id=None):
    with neo4j_driver.session() as session:
        if id is not None:
            result = session.run("MATCH (a:Person) WHERE a.编号 = $id RETURN a", id=id)
        else:
            result = session.run("MATCH (a:Person) WHERE a.名号 = $name RETURN a", name=name)
        # 如果没找到,看别名的模糊查询 %别名%
        if result.peek() is None:
            result = session.run("MATCH (a:Person) WHERE a.别名 CONTAINS $name RETURN a", name=name)
        # 还没有那就创建
        if result.peek() is None:
            session.run("CREATE (a:Person {名号: $name, type: '径山志'})", name=name)
            return name
        return result.peek()[0]["名号"]


def generate_neo4j_zhi_relation(path):
    for sheet_name in ["01祖师", "02法侣"]:
        df = pl.read_excel(path, sheet_name=sheet_name)
        for row in df.iter_rows(named=True):
            for key in ["同学", "师承", "俗家弟子", "出家弟子"]:
                if row[key] is not None and row[key] != "无":
                    # 按照空格分割
                    disciples = row[key].split(" ")
                    for disciple in disciples:
                        if disciple == "" or disciple == "）" or disciple == "\n":
                            continue
                        with neo4j_driver.session() as session:
                            # 如果其中有中文括号,则取出括号内的内容,并且获得删除括号后的字符串
                            if "（" in disciple:
                                disciple = disciple.split("（")
                            if "(" in disciple:
                                disciple = disciple.split("(")
                            if isinstance(disciple, list):
                                disciple[1] = disciple[1].replace("）", "").replace(")", "")
                                name = generate_person(disciple[0], disciple[1])
                            else:
                                name = generate_person(disciple)
                            # 创建关系
                            person1 = row["名号"]
                            person2 = name
                            if key in ["同学", "师承"]:
                                query = f"""
                                    MATCH (a:Person),(b:Person)
                                    WHERE a.名号 = '{person1}' AND b.名号 = '{person2}'
                                    CREATE (a)-[r:personRelationship {{type: '{key}'}}]->(b)
                                    RETURN type(r)
                                """
                            else:
                                query = f"""
                                    MATCH (a:Person),(b:Person)
                                    WHERE a.名号 = '{person1}' AND b.名号 = '{person2}'
                                    CREATE (a)<-[r:personRelationship {{type: '{key}'}}]-(b)
                                    RETURN type(r)
                                """
                            session.run(query)


if __name__ == "__main__":
    # file_path = "./assets/Time对照表.csv"
    # df = pd.read_csv(file_path)
    # # 第一列为年号一,第二列为年号二,第三列为时间,把前两列当字典的键,第三列当值
    # time_dict = {}
    # for i, row in df.iterrows():
    #     time_dict[row["年号一"]] = row["公元"]
    #     time_dict[row["年号二"]] = row["公元"]
    # # 读取Colophon表的每一行
    # with Session(engine) as session:
    #     query = text("SELECT * FROM colophon")
    #     result = session.exec(query)
    #     for row in result:
    #         time = row[8]
    #         if time is not None and time != "":
    #             # 遍历整个dict,看键是不是在里面
    #             for key in time_dict.keys():
    #                 if key in time:
    #                     time = time_dict[key]
    #                     # 把AD列填为time
    #                     with Session(engine) as session:
    #                         session.exec(
    #                             text(
    #                                 f"""
    #                                 UPDATE colophon
    #                                 SET AD = '{time}'
    #                                 WHERE id = {row[0]}
    #                             """
    #                             )
    #                         )
    #                         session.commit()
    #                     break
    generate_neo4j_zang(True)
    path = "../doc/径山志/徑山歷代祖師基本資料建置 (20190801).xlsx"
    generate_neo4j_zhi_person(path)
    generate_neo4j_zhi_relation(path)
