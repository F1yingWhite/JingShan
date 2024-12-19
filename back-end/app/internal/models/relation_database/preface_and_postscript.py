from datetime import datetime
from sqlalchemy import TIMESTAMP, Column, func
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
    last_modify: datetime = Field(sa_column=Column(TIMESTAMP, default=func.now(), onupdate=func.now()))
    page_id: int | None = Field(default=None)

    @classmethod
    def get_by_statement_with_num(
        cls,
        page: int,
        page_size: int,
        classic: str = None,
        translator: str = None,
        title: str = None,
        category: str = None,
        dynasty: str = None,
        author: str = None,
        copy_id: int = None,
        page_id: int = None,
    ):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            statement = select(
                cls,
                func.count().over().label("total_count"),
            )

            # 根据提供的参数动态添加条件
            if classic is not None:
                statement = statement.where(cls.classic.like(f"%{classic}%"))
            if translator is not None:
                statement = statement.where(cls.translator.like(f"%{translator}%"))
            if title is not None:
                statement = statement.where(cls.title.like(f"%{title}%"))
            if category is not None:
                statement = statement.where(cls.category.like(f"%{category}%"))
            if dynasty is not None:
                statement = statement.where(cls.dynasty.like(f"%{dynasty}%"))
            if author is not None:
                statement = statement.where(cls.author.like(f"%{author}%"))
            if copy_id is not None:
                statement = statement.where(cls.copy_id == copy_id)
            if page_id is not None:
                statement = statement.where(cls.page_id == page_id)

            # 使用 offset 和 limit 实现分页
            statement = statement.offset(offset).limit(page_size)

            # 执行查询
            results = session.exec(statement).all()

            # 获取总数（来自窗口函数）
            total_count = results[0].total_count if results else 0

            return [result[0] for result in results], total_count

    @classmethod
    def search_by_title_with_num(cls, title: str, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            statement = (
                select(cls, func.count(cls.id).over().label("total_count"))
                .where(cls.title.like(f"%{title}%"))
                .offset(offset)
                .limit(page_size)
            )

            results = session.exec(statement).all()
            data = [result[0] for result in results]  # 提取实际数据
            total_count = results[0].total_count if results else 0  # 提取总数

            return {"total": total_count, "data": data}

    @classmethod
    def get_by_id(cls, id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.id == id)
            result = session.exec(statement).first()
            return result

    @classmethod
    def search_by_classic(cls, title: str):
        with Session(engine) as session:
            statement = select(cls.classic).where(cls.title.like(f"%{title}%")).distinct()
            results = session.exec(statement).all()
            return list(results)

    @classmethod
    def get_by_classic_and_title(cls, classic: str, title: str):
        with Session(engine) as session:
            statement = select(cls).where(cls.classic == classic).where(cls.title.like(f"%{title}%"))
            results = session.exec(statement).all()
            return results

    @classmethod
    def random_get_title(cls, size: int):
        with Session(engine) as session:
            statement = select(cls.title, cls.id).order_by(func.random()).limit(size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_title_with_num(cls, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            statement = (
                select(cls.title, cls.id, func.count(cls.id).over().label("total_count"))
                .offset(offset)
                .limit(page_size)
            )

            results = session.exec(statement).all()
            total_count = results[0].total_count if results else 0

            return {"total_num": total_count, "results": results}

    def update(self, **kwargs):
        with Session(engine) as session:
            for key, value in kwargs.items():
                setattr(self, key, value)
            session.add(self)
            session.commit()
            session.refresh(self)
            return self
