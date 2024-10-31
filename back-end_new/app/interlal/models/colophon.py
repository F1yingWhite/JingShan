# 牌记
from shutil import which

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
    def get_colphon(cls, page: int, page_size: int, chapter_id: str = None, content: str = None, id: int = None, qianziwen: str = None, scripture_name: str = None, volume_id: str = None):
        with Session(engine) as session:
            page_size = min(page_size, 100)  # 限制 page_size 不超过 100
            offset = (page - 1) * page_size

            statement = select(cls)

            # 根据提供的参数动态添加条件
            if chapter_id is not None:
                statement = statement.where(cls.chapter_id.like(f"%{chapter_id}%"))
            if content is not None:
                statement = statement.where(cls.content.like(f"%{content}%"))
            if id is not None:
                statement = statement.where(cls.id == id)
            if qianziwen is not None:
                statement = statement.where(cls.qianziwen.like(f"%{qianziwen}%"))
            if scripture_name is not None:
                statement = statement.where(cls.scripture_name.like(f"%{scripture_name}%"))
            if volume_id is not None:
                statement = statement.where(cls.volume_id.like(f"%{volume_id}%"))

            statement = statement.offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_colphon_total_num(cls, chapter_id: str = None, content: str = None, id: int = None, qianziwen: str = None, scripture_name: str = None, volume_id: str = None):
        with Session(engine) as session:
            statement = select(cls)

            # 根据提供的参数动态添加条件
            if chapter_id is not None:
                statement = statement.where(cls.chapter_id.like(f"%{chapter_id}%"))
            if content is not None:
                statement = statement.where(cls.content.like(f"%{content}%"))
            if id is not None:
                statement = statement.where(cls.id == id)
            if qianziwen is not None:
                statement = statement.where(cls.qianziwen.like(f"%{qianziwen}%"))
            if scripture_name is not None:
                statement = statement.where(cls.scripture_name.like(f"%{scripture_name}%"))
            if volume_id is not None:
                statement = statement.where(cls.volume_id.like(f"%{volume_id}%"))

            results = session.exec(statement).all()
            return len(results)
