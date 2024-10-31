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
    def get_preface_and_postscript(
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
        page_id: int = None
    ):
        with Session(engine) as session:
            page_size = min(page_size, 100)  # 限制 page_size 不超过 100
            offset = (page - 1) * page_size

            statement = select(cls)

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
                statement = statement.where(cls.copy_id == copy_id)  # 精确匹配
            if page_id is not None:
                statement = statement.where(cls.page_id == page_id)  # 精确匹配

            statement = statement.offset(offset).limit(page_size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_preface_and_postscript_total_num(
        cls,
        classic: str = None,
        translator: str = None,
        title: str = None,
        category: str = None,
        dynasty: str = None,
        author: str = None,
        copy_id: int = None,
        page_id: int = None
    ):
        with Session(engine) as session:
            statement = select(cls)

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
                statement = statement.where(cls.copy_id == copy_id)  # 精确匹配
            if page_id is not None:
                statement = statement.where(cls.page_id == page_id)  # 精确匹配

            results = session.exec(statement).all()
            return len(results)
