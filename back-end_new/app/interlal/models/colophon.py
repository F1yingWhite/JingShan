# 牌记
from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Colophon(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str | None = Field(default=None, max_length=10000)
    scripture_name: str | None = Field(default=None, max_length=200)
    volume_id: str | None = Field(default=None, max_length=200)
    chapter_id: str | None = Field(default=None, max_length=200)
    qianziwen: str | None = Field(default=None, max_length=200)
    pdf_id: int | None = Field(default=None)
    page_id: int | None = Field(default=None)

    @classmethod
    def get_colphon(cls, page: int, page_size: int):
        with Session(engine) as session:
            page_size = page_size if page_size < 100 else 100
            offset = (page - 1) * page_size
            statement = select(cls).offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_colphon_page_num(cls, page_size: int):
        with Session(engine) as session:
            page_size = page_size if page_size < 100 else 100
            statement = select(cls)
            results = session.exec(statement).all()
            return len(results) // page_size + 1
