import json
import pathlib
import re
from uuid import uuid4

import pandas as pd


def process_经名卷数(excel_file: str):
    df = pd.read_excel(excel_file)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    with open("assets/径山藏/经名卷数.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["时间"]):
                continue
            data = {
                "custom_id": str(uuid4()),
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": "4.0Ultra",
                    "messages": [
                        {
                            "role": "user",
                            "content": row["经名卷数"]
                            + """
 请提取出其中的经名和卷数，返回格式为
```json
{"经名": "", "卷数": ""}
```
如果没有卷数则卷数返回空即可 比如 大乘理趣六波罗密多经卷第一 {{卷数:卷第一,经名:大乘理趣六波罗密多}}
分别善恶报应经卷下 {{卷数:卷下,经名:分别善恶报应}} 止观辅行传弘决卷四之四 {{卷数:卷四之四,经名:止观辅行传弘决}}"
""",
                        }
                    ],
                    "max_tokens": 1000,
                },
            }
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def merge_data_经名卷数(origin_file: str, result_jsonl_file: str):
    with open(result_jsonl_file, "r") as f:
        lines = f.readlines()

    with open(origin_file, "r") as f:
        origin_file = f.readlines()
    # 将原始file转换为json列表
    original_dict = {}
    for line in origin_file:
        data = json.loads(line)
        original_dict[data["custom_id"]] = data

    with open("assets/径山藏/经名卷数_result_final.jsonl", "a") as f:
        for i in range(len(lines)):
            result_data = json.loads(lines[i])
            content = (
                result_data.get("response", {})
                .get("body", {})
                .get("choices", [{}])[0]
                .get("message", {})
                .get("content")
            )
            # 使用正则匹配出```json```中的内容
            match = re.search(r"```json(.*?)```", content, re.S)
            if match:
                content = match.group(1)
                content = json.loads(content)
                # 如果是列表,只取第一个
                if isinstance(content, list):
                    content = content[0]
                # content删除 第 和 卷两字
                content["卷数"] = re.sub(r"第", "", content["卷数"])
                content["卷数"] = re.sub(r"卷", "", content["卷数"])
                origin_data = json.loads(origin_file[i])
            else:
                content = {"error": "未找到匹配的数据"}
            origin_data = original_dict[result_data["custom_id"]]
            data = origin_data["body"]["messages"][0]["content"]
            # 按照\n分割,取第一个
            data = data.split("\n")[0]
            content["origin"] = data
            f.write(json.dumps(content, ensure_ascii=False) + "\n")


def merge_data_时间(origin_file: str, result_jsonl_file: str):
    with open(result_jsonl_file, "r") as f:
        lines = f.readlines()

    with open(origin_file, "r") as f:
        origin_file = f.readlines()
    # 将原始file转换为json列表
    original_dict = {}
    for line in origin_file:
        data = json.loads(line)
        original_dict[data["custom_id"]] = data

    with open("assets/径山藏/时间_final.jsonl", "a") as f:
        for i in range(len(lines)):
            result_data = json.loads(lines[i])
            content = (
                result_data.get("response", {})
                .get("body", {})
                .get("choices", [{}])[0]
                .get("message", {})
                .get("content")
            )
            # 使用正则匹配出```json```中的内容
            match = re.search(r"```json(.*?)```", content, re.S)
            if match:
                content = match.group(1)
                content = json.loads(content)
                # 如果是列表,只取第一个
                if isinstance(content, list):
                    content = content[0]
                origin_data = json.loads(origin_file[i])
            else:
                content = {"error": "未找到匹配的数据"}
            origin_data = original_dict[result_data["custom_id"]]
            data = origin_data["body"]["messages"][0]["content"]
            # 按照\n分割,取第一个
            data = data.split("\n")[0]
            content["origin"] = data
            f.write(json.dumps(content, ensure_ascii=False) + "\n")


def process_time_data(excel_file: str):
    df = pd.read_excel(excel_file)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    with open("assets/径山藏/时间.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["时间"]):
                continue
            data = {
                "custom_id": str(uuid4()),
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": "4.0Ultra",
                    "messages": [
                        {
                            "role": "user",
                            "content": row["时间"]
                            + """
 请提取出其中的年和具体月日，返回格式为```json {"年": "", "月日": ""}```
如果没有对应字段则对应字段返回空即可 如 崇祯辛巳孟春 ```json {"年": " 崇祯辛巳", "月日": "孟春"}```
万历戊申春三月  ```json {"年": "万历戊申", "月日": "春三月"}```
""",
                        }
                    ],
                    "max_tokens": 1000,
                },
            }
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def process_对(excel_path: str):
    df = pd.read_excel(excel_path)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    # 删除原始文件
    pathlib.Path("assets/径山藏/对.jsonl").unlink(missing_ok=True)
    with open("assets/径山藏/对.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["对"]):
                continue
            data = row["对"]
            data = re.sub(r"对.*$", "", data)
            data = re.sub(r"校.*$", "", data)
            data = re.sub(r"较.*$", "", data)
            data = re.sub(r"刻.*$", "", data)
            data = {"origin": row["对"], "index": i, "process": [data]}
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def process_书(excel_path: str):
    df = pd.read_excel(excel_path)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    # 删除原始文件
    pathlib.Path("assets/径山藏/书.jsonl").unlink(missing_ok=True)
    with open("assets/径山藏/书.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["书"]):
                continue
            data = row["书"]
            data = re.sub(r"书.*$", "", data)
            data = re.sub(r"刻.*$", "", data)
            data = re.sub(r"写.*$", "", data)
            data = {"origin": row["书"], "index": i, "process": [data]}
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def process_刻(excel_path: str):
    df = pd.read_excel(excel_path)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    # 删除原始文件
    pathlib.Path("assets/径山藏/刻.jsonl").unlink(missing_ok=True)
    with open("assets/径山藏/刻.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["刻工"]):
                continue
            data = row["刻工"]
            data = re.sub(r"刻.*$", "", data)
            data = {"origin": row["刻工"], "index": i, "process": [data]}
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def process_寺庙(excel_path: str):
    df = pd.read_excel(excel_path)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    # 删除原始文件
    pathlib.Path("assets/径山藏/寺庙.jsonl").unlink(missing_ok=True)
    with open("assets/径山藏/寺庙.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["寺庙"]):
                continue
            data = row["寺庙"]
            data = re.sub(r"识.*$", "", data)
            data = re.sub(r"刋.*$", "", data)
            data = {"origin": row["寺庙"], "index": i, "process": [data]}
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def process_地名对(excel_path: str):
    df = pd.read_excel(excel_path)
    df = df[["经名卷数", "地名（对）", "对", "地名（书）", "书", "地名（刻）", "刻工", "时间", "地点", "寺庙"]]
    # 删除原始文件
    pathlib.Path("assets/径山藏/地名（对）.jsonl").unlink(missing_ok=True)
    with open("assets/径山藏/地名（对）.jsonl", "a") as f:
        for i, row in df.iterrows():
            if pd.isna(row["地名（对）"]):
                continue
            data = row["地名（对）"]
            data = re.sub(r"释.*$", "", data)
            data = re.sub(r"校.*$", "", data)
            data = re.sub(r"较.*$", "", data)
            data = re.sub(r"刻.*$", "", data)
            data = {"origin": row["地名（对）"], "index": i, "process": [data]}
            f.write(json.dumps(data, ensure_ascii=False) + "\n")


def merge_excel(excel_path: str):  # noqa: C901
    df = pd.read_excel(excel_path)

    jsonl_path = "./assets/径山藏/经名卷数_result_final.jsonl"
    with open(jsonl_path, "r") as f:
        lines = f.readlines()
    name_dict = {}
    for line in lines:
        data = json.loads(line)
        name_dict[data["origin"]] = data
    for i, row in df.iterrows():
        if pd.isna(row["经名卷数"]):
            continue
        data = row["经名卷数"]
        if data in name_dict:
            data = name_dict[data]
            经名 = data.get("经名")
            卷数 = data.get("卷数")
        else:
            经名 = ""
            卷数 = ""
        df.loc[i, "经名"] = 经名
        df.loc[i, "卷数"] = 卷数

    jsonl_path = "./assets/径山藏/对 copy.jsonl"
    index_dict = {}
    with open(jsonl_path, "r") as f:
        lines = f.readlines()
    for line in lines:
        data = json.loads(line)
        index_dict[data["index"]] = data
    for i, row in df.iterrows():
        if i in index_dict:
            data = index_dict[i]
            df.loc[i, "对(1)"] = str(data.get("process"))

    jsonl_path = "./assets/径山藏/书 copy.jsonl"
    index_dict = {}
    with open(jsonl_path, "r") as f:
        lines = f.readlines()
    for line in lines:
        data = json.loads(line)
        index_dict[data["index"]] = data
    for i, row in df.iterrows():
        if i in index_dict:
            data = index_dict[i]
            df.loc[i, "书(1)"] = str(data.get("process"))

    josnl_path = "./assets/径山藏/刻 copy.jsonl"
    index_dict = {}
    with open(josnl_path, "r") as f:
        lines = f.readlines()
    for line in lines:
        data = json.loads(line)
        index_dict[data["index"]] = data
    for i, row in df.iterrows():
        if i in index_dict:
            data = index_dict[i]
            df.loc[i, "刻工(1)"] = str(data.get("process"))

    df.to_excel("assets/径山藏/各刊刻地牌记_final.xlsx", index=False)


if __name__ == "__main__":
    file_path = "assets/径山藏/各刊刻地牌記.xls"
    merge_excel(file_path)

# from neo4j import GraphDatabase

# # 配置你的 Neo4j 数据库连接
# neo4j_uri = "bolt://localhost:7687"
# neo4j_user = "neo4j"
# neo4j_password = "12345678"

# # 创建 Neo4j 驱动
# driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))

# # 中文数字到阿拉伯数字的映射
# chinese_to_arabic = {
#     "零": 0,
#     "一": 1,
#     "二": 2,
#     "三": 3,
#     "四": 4,
#     "五": 5,
#     "六": 6,
#     "七": 7,
#     "八": 8,
#     "九": 9,
#     "十": 10,
#     "百": 100,
#     "千": 1000,
#     "万": 10000,
# }


# def chinese_to_int(chinese_str):
#     result = 0
#     unit = 1
#     for char in reversed(chinese_str):
#         if char in chinese_to_arabic:
#             num = chinese_to_arabic[char]
#             if num >= 10:
#                 if num > unit:
#                     unit = num
#                 else:
#                     unit *= num
#             else:
#                 result += num * unit
#         else:
#             raise ValueError(f"Invalid character {char} in input")
#     return result


# def convert_generation_to_index():
#     with driver.session() as session:
#         result = session.run(
#             """
#             MATCH (n:ZhiPerson)
#             WHERE n.世代 is not null
#             RETURN n
#             """
#         )
#         persons = result.data()
#         for person in persons:
#             generation_str = person["n"]["世代"]
#             # 提取中文数字部分
#             chinese_digits = "".join(filter(lambda x: x in chinese_to_arabic, generation_str))
#             if chinese_digits:
#                 generation_index = chinese_to_int(chinese_digits)
#                 print(generation_index)
#                 # 更新节点
#                 session.run(
#                     """
#                     MATCH (n:ZhiPerson)
#                     WHERE n.姓名 = $name
#                     SET n.世代Index = $generation_index
#                     """,
#                     name=person["n"]["姓名"],
#                     generation_index=generation_index,
#                 )


# if __name__ == "__main__":
#     convert_generation_to_index()
#     driver.close()
