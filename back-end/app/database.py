# 数据处理杂项

import pandas as pd
from sqlalchemy import text
from sqlmodel import Session

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


if __name__ == "__main__":
    excel_path = "./assets/径山藏/各刊刻地牌記_with_id2.xlsx"
    df = pd.read_excel(excel_path)
    # for i in range(len(df)):
    #     id = df.loc[i, "id"]
    #     if pd.isna(id):
    #         continue
    #     时间 = df.loc[i, "时间"]
    #     if pd.isna(时间):
    #         时间 = ""
    #     地点 = df.loc[i, "地点"]
    #     if pd.isna(地点):
    #         地点 = ""
    #     寺庙 = df.loc[i, "寺庙"]
    #     if pd.isna(寺庙):
    #         寺庙 = ""
    #     if 寺庙.endswith("识"):
    #         寺庙 = 寺庙[:-1]
    #     money = df.loc[i, "该银"]
    #     if pd.isna(money):
    #         money = ""
    #     计字 = df.loc[i, "计字"]
    #     if pd.isna(计字):
    #         计字 = ""
    #     # 更新数据库
    #     with Session(engine) as session:
    #         session.exec(
    #             text(
    #                 f"""
    #                 UPDATE colophon
    #                 SET time = '{时间}', place = '{地点}', temple = '{寺庙}',money = '{money}',words_num = '{计字}'
    #                 WHERE id = {id}
    #             """
    #             )
    #         )
    #         session.commit()
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
                                    f"insert into ind_col (ind_id, col_id,place,type) values ({user_id},{colophon_id},'{地名}','对')"
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
                                    f"insert into ind_col (ind_id, col_id,place,type) values ({user_id},{colophon_id},'{地名}','书')"
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
