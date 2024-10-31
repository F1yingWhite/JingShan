from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Ind_Col(SQLModel, table=True):
    ind_id: int | None = Field(default=None, primary_key=True)
    col_id: int | None = Field(default=None, primary_key=True)
    type: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=300)
