from sqlmodel import Field, SQLModel


class Story(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str | None = Field(default=None, max_length=100)
    content: str | None = Field(default=None, max_length=10000)
