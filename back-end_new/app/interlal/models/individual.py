from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Individual(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=255)
