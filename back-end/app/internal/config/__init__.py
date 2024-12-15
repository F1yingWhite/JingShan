from typing import Literal

import yaml
from cryptography.fernet import Fernet
from pydantic import AnyUrl, BaseModel, EmailStr, ValidationError


class SparkAIConfig(BaseModel):
    URL: AnyUrl
    DOMAIN: str
    PASSWORD: str


class VolcengineConfig(BaseModel):
    URL: AnyUrl
    APPID: str
    TOKEN: str
    CLUSTER: str
    VOICE_TYPE: str


class EmailConfig(BaseModel):
    EMAIL: EmailStr
    PASSWORD: str
    HOST: str


class Neo4jConfig(BaseModel):
    URL: str
    AUTH_NAME: str
    AUTH_PASSWORD: str


class EnvConfig(BaseModel):
    URL: AnyUrl
    FRONT_URL: AnyUrl


class DOUBAO(BaseModel):
    BASE_URL: AnyUrl
    API_KEY: str
    MODEL: str
    ACCESS_KEY: str
    SECRET_KEY: str


class Config(BaseModel):
    DEBUG: bool
    SECRET_KEY: str
    DATABASE_URL: str
    LOG_FILE: str
    NEO4J: Neo4jConfig
    SPARKAI: SparkAIConfig
    VOLCENGINE: VolcengineConfig
    EMAIL: EmailConfig
    ENV: dict[str, EnvConfig]
    DOUBAO: DOUBAO
    MODEL: Literal["DOUBAO", "SPARKAI"]

    @classmethod
    def load(cls, file_path: str) -> "Config":
        default_config = {
            "DATABASE_URL": "mysql+mysqldb://root:1234567@127.0.0.1:3306/jingshan",
            "MODEL": "DOUBAO",
            "LOG_FILE": "app.log",
            "DEBUG": True,
            "SECRET_KEY": Fernet.generate_key().decode(),
            "NEO4J": {"URL": "bolt://localhost:7687", "AUTH_NAME": "neo4j", "AUTH_PASSWORD": "12345678"},
            "SPARKAI": {
                "URL": "https://spark-api-open.xf-yun.com/v1/chat/completions",
                "DOMAIN": "4.0Ultra",
                "PASSWORD": "your paasword",
            },
            "VOLCENGINE": {
                "URL": "https://openspeech.bytedance.com/api/v1/tts",
                "APPID": "APP_ID",
                "TOKEN": "TOKEN",
                "CLUSTER": "volcano_tts",
                "VOICE_TYPE": "BV700_streaming",
            },
            "EMAIL": {"EMAIL": "xxx@qq.om", "PASSWORD": "your password", "HOST": "smtp.xxx.com"},
            "ENV": {
                "DEBUG": {"URL": "http://localhost:5001", "FRONT_URL": "http://localhost:3000"},
                "NODEBUG": {"URL": "https://jingshanback.cpolar.top", "FRONT_URL": "https://jingshan.cpolar.top"},
            },
            "DOUBAO": {
                "BASE_URL": "https://api.douban.com/v2/movie/search",
                "API_KEY": "your api",
                "MODEL": "model",
                "ACCESS_KEY": "your access key",
                "SECRET_KEY": "your secret key",
            },
        }

        try:
            with open(file_path, "r") as f:
                return cls(**yaml.load(f, Loader=yaml.FullLoader))
        except (FileNotFoundError, ValidationError) as e:
            print(f"加载配置文件失败: {e}")
            print("使用默认配置")
            with open(file_path, "w") as f:
                yaml.dump(default_config, f)
            return cls(**default_config)
