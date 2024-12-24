from sqlalchemy import func
from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Story(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str | None = Field(default=None, max_length=100)
    content: str | None = Field(default=None, max_length=10000)
    picture: str | None = Field(default=None)

    @classmethod
    def get_story_with_num(cls, page: int, page_size: int, title: str = None, content: str = None):
        with Session(engine) as session:
            page_size = min(page_size, 100)  # 限制 page_size 不超过 100
            offset = (page - 1) * page_size

            statement = select(cls, func.count().over().label("total_count"))

            if title is not None:
                statement = statement.where(cls.title.like(f"%{title}%"))
            if content is not None:
                statement = statement.where(cls.content.like(f"%{content}%"))

            statement = statement.offset(offset).limit(page_size)
            results = session.exec(statement).all()
            total_count = results[0].total_count if results else 0

            return [
                {"title": result[0].title, "content": result[0].content, "id": result[0].id} for result in results
            ], total_count

    @classmethod
    def get_story_detail(cls, story_id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.id == story_id)
            result = session.exec(statement).first()
            return result
