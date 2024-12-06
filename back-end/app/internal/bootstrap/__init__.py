import logging

from ..config import Config

CONFIG_PATH = "config.yaml"

config = Config.load(CONFIG_PATH)
# 删除原有的log
open(config.LOG_FILE, "w").close()
logging.basicConfig(
    filename=config.LOG_FILE,
    filemode="a",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
