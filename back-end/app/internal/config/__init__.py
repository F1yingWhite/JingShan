import logging

import yaml
from pydantic import BaseModel, ValidationError

CONFIG_PATH = "config.yaml"


class SparkAIConfig(BaseModel):
    URL: str
    DOMAIN: str
    PASSWORD: str


class VolcengineConfig(BaseModel):
    URL: str
    APPID: str
    TOKEN: str
    CLUSTER: str
    VOICE_TYPE: str


class EmailConfig(BaseModel):
    EMAIL: str
    PASSWORD: str


class Neo4jConfig(BaseModel):
    URL: str
    AUTH_NAME: str
    AUTH_PASSWORD: str


class Config(BaseModel):
    DATABASE_URL: str
    LOG_FILE: str
    DEBUG: bool
    NEO4J: Neo4jConfig
    SECRET_KEY: str
    SPARKAI: SparkAIConfig
    VOLCENGINE: VolcengineConfig
    EMAIL: EmailConfig

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
# 删除原有的log
open(config.LOG_FILE, "w").close()
logging.basicConfig(
    filename=config.LOG_FILE,
    filemode="a",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
