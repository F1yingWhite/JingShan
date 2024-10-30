import base64
import json
import logging
import os
import random
import re

import mysql.connector
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

# 创建一个 Flask 应用实例
app = Flask(__name__)
# 并允许来自所有域的请求
CORS(app)


# 建立数据库连接
conn = None


def build_query(terms, table, column):
    conditions = " AND ".join([f"INSTR({column}, %s) > 0" for _ in terms])
    return f"SELECT * FROM {table} WHERE {conditions}"


def fetch_related_data(cursor, id_list, related_table, related_column, foreign_key):
    result_set = set()
    query = f"SELECT {related_column} FROM {related_table} WHERE {foreign_key} IN (%s)"
    cursor.execute(query, (tuple(id_list),))
    rows = cursor.fetchall()
    for row in rows:
        result_set.add(row[0])
    return "\n".join(list(result_set))


# 简化内容
def simplify_content(content, terms):
    reserve_signal = [0] * len(content)
    for term in terms:
        # 使用re.finditer()方法查找所有匹配的位置
        matches = [match.start() for match in re.finditer(re.escape(term), content)]
        for match in matches:
            for i in range(max(0, match - 20), min(len(content), match + len(term) + 20)):
                reserve_signal[i] = 1

    brief = ""
    omitted = False
    for i, reserve in enumerate(reserve_signal):
        if reserve == 1:
            brief += content[i]
            omitted = False
        elif not omitted:
            brief += "..."
            omitted = True
    return brief


# 用于截取中文文本中的最后一个子句
def last_segment(str):
    # 使用正则表达式分割字符串，匹配逗号或句号
    substrings = re.split(r"[，。]", str)
    # 找到最后一个非空子串
    last_non_empty_substring = "无"
    for sub in reversed(substrings):
        if sub.strip():
            last_non_empty_substring = sub.strip()
            break
    return last_non_empty_substring


def get_publication_time(text):
    to_be_queried = last_segment(text)
    for time in time_list:
        if time in to_be_queried:
            return time
    else:
        return "Not found"


def get_publication_place(text):
    to_be_queried = last_segment(text)
    for place in list(place_dict.keys()):
        if place in to_be_queried:
            return place_dict[place]
    else:
        return "Not found"


time_list = [
    "洪武",
    "建文",
    "永乐",
    "洪熙",
    "宣德",
    "正统",
    "景泰",
    "天顺",
    "成化",
    "弘治",
    "正德",
    "嘉靖",
    "隆庆",
    "万曆",
    "泰昌",
    "天启",
    "崇祯",
    "弘光",
    "隆武",
    "绍武",
    "永历",
    "顺治",
    "康熙",
    "雍正",
    "乾隆",
    "嘉庆",
    "道光",
    "咸丰",
    "同治",
    "光绪",
    "宣统",
]


place_dict = {
    "寂照": "寂照庵",
    "化城": "化城寺",
    "顾龙": "顾龙山",
    "万寿": "万寿禅寺",
    "接待": "接待寺",
    "抱香": "抱香庵",
    "妙德": "妙德庵",
    "楞严": "楞严寺",
    "般若": "般若堂",
    "青莲": "青莲社",
    "天香": "天香堂",
    "胜果": "胜果园",
    "金陵刻经处": "金陵刻经处",
    "鸡足观音庵": "鸡足观音庵",
    "松巅": "松巅阁",
    "戒台": "戒台寺",
    "白岩": "白岩禅院",
    "报国": "报国院",
    "微笑": "微笑堂",
    "万峰": "万峰禅院",
    "东塔": "东塔禅堂",
    "理安": "理安寺",
    "西峰": "西峰寺",
    "玛瑙": "玛瑙寺",
    "崇宁": "崇宁庵",
    "旃檀": "旃檀寺",
    "弘福": "弘福寺",
    "本庵": "本庵",
    "大觉": "大觉庵",
    "径山禅寺": "径山禅寺",
    "径山寂庵": "寂照庵",
    "塔院": "塔院",
    "妙喜": "妙喜庵",
    "水月": "水月禅院",
    "兜率": "兜率园",
    "径山寺": "径山寺",
    "幻寄": "幻寄斋",
    "报恩": "报恩院",
    "一指": "一指庵",
    "祖堂": "祖堂",
    "清净": "清净禅林",
    "能仁": "能仁禅院",
    "古梅": "古梅庵",
    "紫柏": "紫柏庵",
    "德藏": "德藏寺",
}

province_dict = {
    "寂照庵": "浙江",
    "化城寺": "安徽",
    "顾龙山": "江苏",
    "万寿禅寺": "浙江",
    "接待寺": "浙江",
    "妙德庵": "山西",
    "楞严寺": "山西",
    "般若堂": "江苏",
    "金陵刻经处": "江苏",
    "鸡足观音庵": "云南",
    "松巅阁": "江苏",
    "戒台寺": "北京",
    "报国院": "江苏",
    "万峰禅院": "浙江",
    "理安寺": "浙江",
    "西峰寺": "北京",
    "玛瑙寺": "浙江",
    "崇宁庵": "江苏",
    "旃檀寺": "北京",
    "弘福寺": "贵州",
    "大觉庵": "江西",
    "径山禅寺": "浙江",
    "寂照庵": "浙江",
    "塔院": "江西",
    "水月禅院": "江苏",
    "径山寺": "浙江",
    "报恩院": "浙江",
    "能仁禅院": "广西",
}

coordinate_dict = {
    "浙江": (120.03, 30.05),
    "江苏": (118.80, 31.93),
    "安徽": (117.28, 31.87),
    "山西": (112.33, 37.93),
    "云南": (102.92, 25.47),
    "北京": (116.38, 39.90),
    "贵州": (106.45, 26.73),
    "江西": (116.02, 28.68),
    "广西": (108.48, 23.37),
}


@app.route("/search", methods=["GET"])
def search_data():
    search_terms = request.args.get("wd", default="No search term", type=str)
    term_list = search_terms.split()

    result = {"individual": [], "colophon": [], "preface_and_postscript": []}

    cursor = conn.cursor()
    try:
        individual_query = build_query(term_list, "individual", "name")
        cursor.execute(individual_query, term_list)
        tuple_row_list = cursor.fetchall()

        for tuple_row in tuple_row_list:
            type_set = set()
            type_query = "SELECT type FROM ind_col WHERE ind_id = %s"
            cursor.execute(type_query, (tuple_row[0],))
            type_rows = cursor.fetchall()
            for type_row in type_rows:
                type_set.add(re.sub(r"类型为：|\[|\]", "", type_row[0]))

            scripture_set = set()
            scripture_query = "SELECT col.scripture_name FROM ind_col ic INNER JOIN colophon col ON ic.col_id = col.id WHERE ic.ind_id = %s"
            cursor.execute(scripture_query, (tuple_row[0],))
            scripture_rows = cursor.fetchall()
            for scripture_row in scripture_rows:
                scripture_set.add("《" + scripture_row[0] + "》")

            result["individual"].append(
                {
                    "id": tuple_row[0],
                    "name": tuple_row[1],
                    "type": "；\n".join(list(type_set)),
                    "scripture": "\n".join(list(scripture_set)),
                }
            )

        colophon_query = build_query(term_list, "colophon", "content")
        cursor.execute(colophon_query, term_list)
        tuple_row_list = cursor.fetchall()

        for tuple_row in tuple_row_list:
            result["colophon"].append(
                {
                    "id": tuple_row[0],
                    "content": tuple_row[1],
                    "scripture_name": tuple_row[2],
                    "volume_id": tuple_row[3],
                    "chapter_id": tuple_row[4],
                    "qianziwen": tuple_row[5],
                    "brief": simplify_content(tuple_row[1], term_list),
                }
            )

        colophon_query = build_query(term_list, "preface_and_postscript", "title")
        cursor.execute(colophon_query, term_list)
        tuple_row_list = cursor.fetchall()

        for tuple_row in tuple_row_list:
            result["preface_and_postscript"].append(
                {
                    "id": tuple_row[0],
                    "classic": tuple_row[1],
                    "translator": tuple_row[2],
                    "title": tuple_row[3],
                    "category": tuple_row[4],
                    "dynasty": tuple_row[5],
                    "author": tuple_row[6],
                    "copy_id": tuple_row[7],
                    "page_id": tuple_row[8],
                }
            )

        return jsonify(result)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/individual", methods=["GET"])
def get_individual():
    ind_id = request.args.get("id", default="No individual id", type=str)
    result = {
        "name": "",
        "relation": [],
        "time_cnt": {},
        "place_cnt": {},
        "province_cnt": {},
    }
    relation = []
    time_cnt = dict.fromkeys(time_list, 0)
    place_cnt = dict.fromkeys(place_dict.values(), 0)

    cursor = conn.cursor()
    try:
        # 使用参数化查询来防止SQL注入
        query = "SELECT name FROM individual WHERE id = %s"
        cursor.execute(query, (ind_id,))
        name = cursor.fetchone()[0]
        result["name"] = name

        query = "SELECT col.id, col.scripture_name, col.content, ic.type, ic.description FROM ind_col ic INNER JOIN colophon col ON ic.col_id = col.id WHERE ic.ind_id = %s"
        cursor.execute(query, (ind_id,))
        tuple_row_list = cursor.fetchall()
        for tuple_row in tuple_row_list:
            relation.append(
                {
                    "id": tuple_row[0],
                    "scripture_name": tuple_row[1],
                    "content": tuple_row[2],
                    "type": re.sub(r"类型为：|\[|\]", "", tuple_row[3]),
                    "description": re.sub(r"进一步补充说明|\[|\]", "", tuple_row[4]),
                }
            )
            content = tuple_row[2]
            if (time := get_publication_time(content)) != "Not found":
                time_cnt[time] += 1
            if (place := get_publication_place(content)) != "Not found":
                place_cnt[place] += 1

        result["relation"] = relation

        # 检查是否存在非0值
        has_non_zero_value = any(cnt != 0 for cnt in time_cnt.values())
        # 如果存在非0值，删除值为0的头尾键值对
        if has_non_zero_value:
            keys_to_remove = [time for time, cnt in time_cnt.items() if cnt == 0]
            for time in keys_to_remove:
                time_cnt.pop(time)
            # # 移除头部值为0的键值对，直到遇到非零值
            # while time_cnt and time_cnt.get(next(iter(time_cnt))) == 0:
            #     time = next(iter(time_cnt))
            #     del time_cnt[time]
            # # 移除尾部值为0的键值对，直到遇到非零值
            # keys_to_remove = []
            # for time in reversed(list(time_cnt.keys())):
            #     if time_cnt[time] == 0:
            #         keys_to_xvlizhi2024remove.append(time)
            #     else:
            #         break  # 遇到非零值时停止移除
            # for time in keys_to_remove:
            #     del time_cnt[time]
        result["time_cnt"] = time_cnt

        # 检查是否存在非0值
        has_non_zero_value = any(cnt != 0 for cnt in place_cnt.values())
        # 如果存在非0值，删除值为0的全部键值对
        if has_non_zero_value:
            keys_to_remove = [place for place, cnt in place_cnt.items() if cnt == 0]
            for place in keys_to_remove:
                place_cnt.pop(place)
        result["place_cnt"] = place_cnt

        province_cnt = {}
        province_place = {}
        for place, cnt in place_cnt.items():
            province = province_dict.get(place)
            if province and cnt:
                province_cnt[province] = province_cnt.get(province, 0) + cnt

                if province not in province_place:
                    province_place[province] = [place]
                else:
                    province_place[province].append(place)

        features = []
        for province, cnt in province_cnt.items():
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coordinate_dict.get(province, None),
                    },
                    "properties": {
                        # "名称": province,
                        "名称": ", ".join(province_place[province]),
                        "数量": cnt,
                    },
                }
            )
        visualization = {"type": "FeatureCollection", "features": features}

        result["visualization"] = visualization

        print(result)

        return jsonify(result)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/colophon", methods=["GET"])
def get_colophon():
    col_id = request.args.get("id", default="No colophon id", type=str)
    result = {
        "content": "",
        "scripture_name": "",
        "volume_id": "",
        "chapter_id": "",
        "qianziwen": "",
        "time": "",
        "place": "",
        "pdf_id": "",
        "page_id": "",
        "relation": [],
    }

    cursor = conn.cursor()
    try:
        # 使用参数化查询来防止SQL注入
        query = "SELECT ind.id, ind.name, ic.type, ic.description FROM ind_col ic INNER JOIN individual ind ON ic.ind_id = ind.id WHERE ic.col_id = %s"
        cursor.execute(query, (col_id,))
        tuple_row_list = cursor.fetchall()
        for tuple_row in tuple_row_list:
            result["relation"].append(
                {
                    "id": tuple_row[0],
                    "name": tuple_row[1],
                    "type": re.sub(r"类型为：|\[|\]", "", tuple_row[2]),
                    "description": re.sub(r"进一步补充说明|\[|\]", "", tuple_row[3]),
                }
            )

        query = "SELECT content, scripture_name, volume_id, chapter_id, qianziwen, pdf_id, page_id FROM colophon WHERE id = %s"
        cursor.execute(query, (col_id,))
        info_tuple = cursor.fetchone()
        result["content"] = info_tuple[0]
        result["scripture_name"] = info_tuple[1]
        result["volume_id"] = info_tuple[2]
        result["chapter_id"] = info_tuple[3]
        result["qianziwen"] = info_tuple[4]
        result["pdf_id"] = f"{info_tuple[5]:03}"
        result["page_id"] = info_tuple[6]

        result["time"] = get_publication_time(result["content"])
        result["place"] = get_publication_place(result["content"])

        # print(result)

        return jsonify(result)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/preface-and-postscript", methods=["GET"])
def get_preface_and_postscript():
    pap_id = request.args.get("id", default="No preface and postscript id", type=str)
    result = {
        "title": "",
        "classic": "",
        "author": "",
        "translator": "",
        "category": "",
        "dynasty": "",
        "copy_id": "",
        "page_id": "",
    }

    cursor = conn.cursor()
    try:
        # 使用参数化查询来防止SQL注入
        query = "SELECT title, classic, author, translator, category, dynasty, copy_id, page_id FROM preface_and_postscript WHERE id = %s"
        cursor.execute(query, (pap_id,))
        info_tuple = cursor.fetchone()
        result["title"] = info_tuple[0]
        result["classic"] = info_tuple[1]
        result["author"] = info_tuple[2]
        result["translator"] = info_tuple[3]
        result["category"] = info_tuple[4]
        result["dynasty"] = info_tuple[5]
        result["copy_id"] = "001" if info_tuple[6] == "-1" else f"{info_tuple[6]:03}"
        result["page_id"] = "1" if info_tuple[7] == "-1" else info_tuple[7]

        # print(result)

        return jsonify(result)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/story", methods=["GET"])
def get_story():
    story_id = request.args.get("id", default="No story id", type=str)
    result = {"title": "", "content": "", "image": ""}

    cursor = conn.cursor()
    try:
        # 使用参数化查询来防止SQL注入
        query = "SELECT title, content FROM story WHERE id = %s"
        cursor.execute(query, (story_id,))
        info_tuple = cursor.fetchone()

        if info_tuple:  # 检查是否有结果
            result["title"] = info_tuple[0]
            result["content"] = info_tuple[1]

            url = "http://localhost:3303/text2img"
            data = {"prompt": result["content"]}
            print(result["content"])
            # 发送 POST 请求
            response = requests.post(url, data=data)

            # 检查响应状态
            if response.status_code == 200:
                result1 = response.json()
                # 获取图像的 Base64 编码
                image_base64 = result1.get("image")

                if image_base64:  # 检查 image_base64 是否存在
                    # 提取 Base64 字符串
                    image_data = image_base64.split(",")[1]  # 去掉前缀部分
                    result["image"] = image_data
            else:
                print(f"Error: Received status code {response.status_code}")
                print(response.text)  # 打印错误内容
        else:
            print(f"Error: No story found with id {story_id}")

        return jsonify(result)

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/overview", methods=["GET"])
def get_overview():
    # 从请求中获取查询参数 'page'
    show_page = request.args.get("page", default="No search term", type=int)
    result = {
        "colophon_last": 0,
        "colophon": [],
        "preface_and_postscript_last": 0,
        "preface_and_postscript": [],
        "story_last": 0,
        "story": [],
    }
    entry_per_page = 50

    cursor = conn.cursor()
    try:
        # 牌记查询
        query = "SELECT * FROM colophon"
        cursor.execute(query)
        tuple_row_list = cursor.fetchall()

        last_page = len(tuple_row_list) // entry_per_page + (len(tuple_row_list) % entry_per_page > 0)
        result["colophon_last"] = last_page

        if show_page <= last_page:
            for tuple_row in tuple_row_list[(show_page - 1) * entry_per_page : min(show_page * entry_per_page, len(tuple_row_list))]:
                result["colophon"].append(
                    {
                        "id": tuple_row[0],
                        "content": tuple_row[1],
                        "scripture_name": tuple_row[2],
                        "volume_id": tuple_row[3],
                        "chapter_id": tuple_row[4],
                        "qianziwen": tuple_row[5],
                    }
                )

        # 序跋查询
        query = "SELECT * FROM preface_and_postscript"
        cursor.execute(query)
        tuple_row_list = cursor.fetchall()

        last_page = len(tuple_row_list) // entry_per_page + (len(tuple_row_list) % entry_per_page > 0)
        result["preface_and_postscript_last"] = last_page

        if show_page <= last_page:
            for tuple_row in tuple_row_list[(show_page - 1) * entry_per_page : min(show_page * entry_per_page, len(tuple_row_list))]:
                result["preface_and_postscript"].append(
                    {
                        "id": tuple_row[0],
                        "classic": tuple_row[1],
                        "translator": tuple_row[2],
                        "title": tuple_row[3],
                        "category": tuple_row[4],
                        "dynasty": tuple_row[5],
                        "author": tuple_row[6],
                        "copy_id": tuple_row[7],
                        "page_id": tuple_row[8],
                    }
                )

        # 故事查询
        query = "SELECT * FROM story"
        cursor.execute(query)
        tuple_row_list = cursor.fetchall()

        last_page = len(tuple_row_list) // entry_per_page + (len(tuple_row_list) % entry_per_page > 0)
        result["story_last"] = last_page

        if show_page <= last_page:
            for tuple_row in tuple_row_list[(show_page - 1) * entry_per_page : min(show_page * entry_per_page, len(tuple_row_list))]:
                result["story"].append({"id": tuple_row[0], "title": tuple_row[1], "content": tuple_row[2]})

        return jsonify(result)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(result)
    finally:
        cursor.close()


@app.route("/qa", methods=["POST"])
def get_answer():
    model = "vicuna-7b-v1.5"
    url = "http://localhost:8000/v1/chat/completions"

    # 请求头
    headers = {"Content-Type": "application/json"}

    # 获取messages并验证格式
    data = request.get_json()
    messages = data.get("messages")
    if not isinstance(messages, list):
        return jsonify({"error": "Invalid format: 'messages' should be a list"}), 400

    # 发送请求
    req_data = {"model": model, "messages": messages}

    response = requests.post(url, headers=headers, json=req_data)

    # 处理和打印响应
    if response.status_code == 200:
        response_data = response.json()
        answer = response_data["choices"][0]["message"]["content"]
    else:
        answer = response.text

    return jsonify({"answer": answer})


if __name__ == "__main__":
    try:
        conn = mysql.connector.connect(host="localhost", user="root", password="505066278", database="jingshan")  # 数据库主机地址  # 数据库用户名  # 数据库密码  # 数据库名

        # 检查连接
        if conn.is_connected():
            print("Connected to MySQL database")

        app.run(debug=True)

    except Exception as e:
        print("Error:", e)
    finally:
        if conn and conn.is_connected():
            conn.close()
            print("MySQL connection is closed")
