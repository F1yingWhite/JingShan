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


if __name__ == "__main__":
    file_path = "assets/径山藏/各刊刻地牌記.xls"
    process_time_data(file_path)
