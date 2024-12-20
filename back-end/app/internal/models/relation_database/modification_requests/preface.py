from pydantic import BaseModel
from sqlmodel import JSON, Column, Field

from . import ModificationRequestBase


class PrefaceValue(BaseModel):
    classic: str | None
    translator: str | None
    title: str | None
    category: str | None
    dynasty: str | None
    author: str | None


class ModificationRequestsPreface(ModificationRequestBase, table=True):
    __tablename__ = "modification_requests_preface"
    old_value: PrefaceValue = Field(sa_column=Column(JSON))
    new_value: PrefaceValue = Field(sa_column=Column(JSON))
