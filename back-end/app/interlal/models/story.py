from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Story(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str | None = Field(default=None, max_length=100)
    content: str | None = Field(default=None, max_length=10000)

    @classmethod
    def get_story(cls, page: int, page_size: int, title: str = None, content: str = None):
        with Session(engine) as session:
            page_size = min(page_size, 100)  # 限制 page_size 不超过 100
            offset = (page - 1) * page_size

            statement = select(cls)

            if title is not None:
                statement = statement.where(cls.title.like(f"%{title}%"))
            if content is not None:
                statement = statement.where(cls.content.like(f"%{content}%"))

            statement = statement.offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_story_total_num(cls, title: str = None, content: str = None):
        with Session(engine) as session:
            statement = select(cls)

            if title is not None:
                statement = statement.where(cls.title.like(f"%{title}%"))
            if content is not None:
                statement = statement.where(cls.content.like(f"%{content}%"))

            results = session.exec(statement).all()
            return len(results)
