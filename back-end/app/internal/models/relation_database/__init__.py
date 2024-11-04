from sqlmodel import create_engine

from ...config import config

if config.debug:
    engine = create_engine(config.database_url)
else:
    engine = create_engine(config.database_url)

try:
    with engine.connect() as connection:
        print("数据库连接成功")
except Exception as e:
    print("数据库连接失败:", e)
