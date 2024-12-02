import json
import re

import pandas as pd

if __name__ == "__main__":
    excel_path = "./assets/径山藏/1-18册牌记全部内容.xlsx"
    df = pd.read_excel(excel_path)
    with open("temp.txt", "w") as f:
        for index, row in df.iterrows():
            content = row["内容"]
            # 匹配数字+“经名”开始的所有内容
            pattern = r"经名.*"
            matches = re.findall(pattern, content)
            print(matches)
            if matches:
                f.write(matches[0] + "\n")

    txt_path = "./temp.txt"
    with open(txt_path, "r") as f:
        # 逐行读取
        with open("./colophon.jsonl", "w") as f_out:
            for line in f:
                index_1 = line.find("卷数：")
                jingming = line[3:index_1]
                print(jingming)
                index_2 = line.find("册数：")
                juanshu = line[index_1 + 3 : index_2]
                print(juanshu)
                index_3 = line.find("牌记：")
                cesu = line[index_2 + 3 : index_3]
                print(cesu)
                paiji = line[index_3 + 3 :]
                # 如果paiji以回车结尾, 则去掉回车
                if paiji[-1] == "\n":
                    paiji = paiji[:-1]
                print(paiji)
                f_out.write(
                    json.dumps({"经名": jingming, "卷数": juanshu, "册数": cesu, "牌记": paiji}, ensure_ascii=False)
                    + "\n"
                )
