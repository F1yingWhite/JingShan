# 故事
from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Story(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str | None = Field(default=None, max_length=100)
    content: str | None = Field(default=None, max_length=10000)

    @classmethod
    def get_story(cls, page: int, page_size: int):
        with Session(engine) as session:
            page_size = page_size if page_size < 100 else 100
            offset = (page - 1) * page_size
            statement = select(cls).offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results
