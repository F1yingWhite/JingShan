import yaml
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


class Config(BaseModel):
    DATABASE_URL: str
    LOG_FILE: str
    DEBUG: bool
    DEBUG_URL: AnyUrl
    NODEBUG_URL: AnyUrl
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
