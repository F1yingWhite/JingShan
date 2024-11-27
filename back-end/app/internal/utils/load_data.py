from ..models.graph_database import neo4j_driver
import pandas as pd
import pathlib


def load_data(xlsx_path="assets/径山藏/各刊刻地牌記.xls"):
    path = "."
    # 遍历文件夹下的文件
    for file in pathlib.Path(path).iterdir():
        print(file)
    data = pd.read_excel(xlsx_path, sheet_name="全部")
    # 打印列名
    print(data.columns)
    with neo4j_driver.session() as session:
        ...
