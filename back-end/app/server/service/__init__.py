from typing import Any

from pydantic import BaseModel


class ResponseModel(BaseModel):
    data: Any
    code: int = 200
    msg: str = "success"
