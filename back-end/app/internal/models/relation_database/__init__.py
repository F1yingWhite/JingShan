import json
from datetime import date, datetime

from sqlmodel import create_engine

from ...bootstrap import config

if config.DEBUG:
    engine = create_engine(config.DATABASE_URL, echo=True)
else:
    engine = create_engine(config.DATABASE_URL)

try:
    with engine.connect() as connection:
        print("数据库连接成功")
except Exception as e:
    print("数据库连接失败:", e)


class CJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        else:
            return json.JSONEncoder.default(self, obj)
