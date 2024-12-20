from pydantic import BaseModel
from sqlmodel import JSON, Column, Field

from . import ModificationRequestBase


class ColophonValue(BaseModel):
    content: str | None
    scripture_name: str | None
    volume_id: str | None
    chapter_id: str | None
    qianziwen: str | None
    time: str | None
    place: str | None
    temple: str | None
    words_num: str | None
    money: str | None
    wish: str | None
    pearwood: str | None


class ModificationRequestsColophon(ModificationRequestBase, table=True):
    __tablename__ = "modification_requests_colophon"
    old_value: ColophonValue = Field(sa_column=Column(JSON))
    new_value: ColophonValue = Field(sa_column=Column(JSON))
