import re

import pandas as pd

TIME_LIST = [
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

PLACE_DICT = {
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

PROVINCE_DICT = {
    "寂照庵": (119.758997, 30.381654),
    "化城寺": (119.760628, 30.386138),
    #!
    "顾龙山": (118.80, 31.93),
    "万寿禅寺": (121.546802, 29.862334),
    "接待寺": (119.760628, 30.386138),
    "妙德庵": (113.568582, 39.045599),
    "楞严寺": (120.744066, 30.777128),
    "般若堂": (119.7604, 30.382502),
    "金陵刻经处": (118.80, 31.93),
    #!
    "鸡足观音庵": (102.92, 25.47),
    #!
    "松巅阁": (118.80, 31.93),
    #!
    "戒台寺": (116.52, 39.92),
    "报国院": (120.1775, 30.2928),
    #!
    "万峰禅院": (120.03, 30.05),
    #!
    "理安寺": (120.03, 30.05),
    #!
    "西峰寺": (116.52, 39.92),
    #!
    "玛瑙寺": (120.03, 30.05),
    "崇宁庵": (118.589421, 24.907267),
    #!
    "旃檀寺": (120.03, 30.05),
    #!
    "弘福寺": (116.52, 39.92),
    "大觉庵": (119.758426, 30.3851),
    "径山禅寺": (119.760134, 30.382224),
    #!
    "塔院": (116.02, 28.68),
    #!
    "水月禅院": (118.80, 31.93),
    "径山寺": (119.76521, 30.38028),
    #!
    "报恩院": (120.03, 30.05),
    #!
    "能仁禅院": (108.48, 23.38),
}

file_path = "./assets/Time对照表.csv"
df = pd.read_csv(file_path)
# 第一列为年号一,第二列为年号二,第三列为时间,把前两列当字典的键,第三列当值
time_dict = {}
for i, row in df.iterrows():
    time_dict[row["年号一"]] = row["公元"]
    time_dict[row["年号二"]] = row["公元"]


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
    for time in TIME_LIST:
        if time in to_be_queried:
            return time
    else:
        return "Not found"


def get_publication_place(text):
    to_be_queried = last_segment(text)
    for place in list(PLACE_DICT.keys()):
        if place in to_be_queried:
            return PLACE_DICT[place]
    else:
        return "Not found"


def get_latitude_and_longitude(place):
    if place in PROVINCE_DICT:
        return PROVINCE_DICT[place]
    else:
        return "Not found"


def get_AD(year: str):
    for key in time_dict.keys():
        if key in year:
            time = time_dict[key]
            return time
    return None
