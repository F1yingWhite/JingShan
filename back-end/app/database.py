import ast

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


if __name__ == "__main__":
    file_path = "./assets/径山藏/各刊刻地牌记_final_modified_with_id.xlsx"
    df = pd.read_excel(file_path)
    for i in range(len(df)):
        id_list = map_database(df.loc[i, "经名"], df.loc[i, "卷数"], df.loc[i, "经名卷数"], df.loc[i, "千字文"], i)
        for id in id_list:
            with Session(engine) as session:
                if pd.notna(df.loc[i, "对(1)"]):
                    diming = df.loc[i, "地名（对）"]
                    if pd.notna(diming):
                        if diming[-1] == "县":
                            diming = diming[:-1]
                        if diming[-1] == "释":
                            diming = diming[:-1]
                    dui = ast.literal_eval(df.loc[i, "对(1)"])
                    for d in dui:
                        result = session.execute(text(f"SELECT id FROM individual_new WHERE name = '{d}'")).fetchone()
                        if result is None:
                            print(f"对未找到名称:{i}{d}")
                            continue
                        dui_user_id = result[0]
                        session.execute(
                            text(
                                "insert into ind_col_new (col_id, ind_id, type,place) "
                                "values ({id}, {dui_user_id}, '对','{diming}')"
                            )
                        )
                if pd.notna(df.loc[i, "书(1)"]):
                    diming = df.loc[i, "地名（书）"]
                    if pd.notna(diming):
                        if diming[-1] == "县":
                            diming = diming[:-1]
                        if diming[-1] == "释":
                            diming = diming[:-1]

                    shu = ast.literal_eval(df.loc[i, "书(1)"])
                    for s in shu:
                        result = session.execute(text(f"SELECT id FROM individual_new WHERE name = '{s}'")).fetchone()
                        if result is None:
                            print(f"书未找到名称:{i}{s}")
                            continue
                        shu_user_id = result[0]
                        session.execute(
                            text(
                                f"insert into ind_col_new (col_id, ind_id, type,place) "
                                f"values ({id}, {shu_user_id}, '书','{diming}')"
                            )
                        )
                if pd.notna(df.loc[i, "刻工(1)"]):
                    diming = df.loc[i, "地名（刻）"]
                    if pd.notna(diming):
                        if diming[-1] == "县":
                            diming = diming[:-1]
                        if diming[-1] == "释":
                            diming = diming[:-1]
                    ke = ast.literal_eval(df.loc[i, "刻工(1)"])
                    for k in ke:
                        result = session.execute(text(f"SELECT id FROM individual_new WHERE name = '{k}'")).fetchone()
                        if result is None:
                            print(f"刻工未找到名称: {i}{k}")
                            continue
                        ke_user_id = result[0]
                        session.execute(
                            text(
                                "insert into ind_col_new (col_id, ind_id, type,place) "
                                "values ({id}, {ke_user_id}, '刻工','{diming}')"
                            )
                        )
                session.commit()
