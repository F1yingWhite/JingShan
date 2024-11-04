import logging
from doctest import debug
from typing import Optional

import yaml
from pydantic import BaseModel, ValidationError

CONFIG_PATH = "config.yaml"


class Config(BaseModel):
    database_url: str
    log_file: str
    neo4j_url: str
    neo4j_auth_name: str
    neo4j_auth_password: str
    redis_url: Optional[str] = None
    debug: bool

    @classmethod
    def load(cls, file_path: str) -> "Config":
        # 如果加载失败, 抛出异常
        with open(file_path, "r") as f:
            try:
                return cls(**yaml.load(f, Loader=yaml.FullLoader))
            except ValidationError as e:
                print(e)
                raise e


config = Config.load(CONFIG_PATH)
logging.basicConfig(filename=config.log_file, filemode="a", level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
