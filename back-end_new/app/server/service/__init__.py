from typing import Any, List

from pydantic import BaseModel


class ResponseModel(BaseModel):
    data: Any
    code: int = 200
    msg: str = "success"
