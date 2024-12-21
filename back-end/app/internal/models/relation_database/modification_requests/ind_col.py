from pydantic import BaseModel
from sqlmodel import JSON, Column, Field

from . import ModificationRequestBase


class IndividualParams(BaseModel):
    id: int
    name: str | None
    type: str
    place: str | None
    note: str | None = None


class RelatedIndividuals(BaseModel):
    individuals: list[IndividualParams]


class ModificationRequestsIndCol(ModificationRequestBase, table=True):
    __tablename__ = "modification_requests_indcol"
    old_value: RelatedIndividuals = Field(sa_column=Column(JSON))
    new_value: RelatedIndividuals = Field(sa_column=Column(JSON))
