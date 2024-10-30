# 序跋
from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Preface_And_Postscript(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    classic: str | None = Field(default=None, max_length=100)
    translator: str | None = Field(default=None, max_length=100)
    title: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=30)
    dynasty: str | None = Field(default=None, max_length=30)
    author: str | None = Field(default=None, max_length=50)
    copy_id: int | None = Field(default=None)
    page_id: int | None = Field(default=None)

    @classmethod
    def get_preface_and_postscript(cls, page: int, page_size: int):
        with Session(engine) as session:
            page_size = page_size if page_size < 100 else 100
            offset = (page - 1) * page_size
            statement = select(cls).offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results
