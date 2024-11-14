# 牌记
import json

from sqlalchemy import func
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
    def get_colphon(
        cls,
        page: int,
        page_size: int,
        chapter_id: str = None,
        content: str = None,
        id: int = None,
        qianziwen: str = None,
        scripture_name: str = None,
        volume_id: str = None,
    ):
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
    def get_colphon_total_num(
        cls,
        chapter_id: str = None,
        content: str = None,
        id: int = None,
        qianziwen: str = None,
        scripture_name: str = None,
        volume_id: str = None,
    ):
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

    @classmethod
    def search_colophon(cls, keyword: str, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            # 使用窗口函数获取总数并进行分页
            statement = (
                select(cls.scripture_name, func.count(cls.scripture_name).over().label("total_count"))
                .where(cls.content.like(f"%{keyword}%"))
                .group_by(cls.scripture_name)
                .offset(offset)
                .limit(page_size)
            )

            results = session.exec(statement).all()
            scripture_names = [result.scripture_name for result in results]
            # 提取总数
            total_count = results[0].total_count if results else 0
            return scripture_names, total_count

    @classmethod
    def search_colophon_no_page(cls, keyword: str):
        with Session(engine) as session:
            statement = select(cls.scripture_name).where(cls.content.like(f"%{keyword}%")).group_by(cls.scripture_name)

            results = session.exec(statement).all()
            return results

    @classmethod
    def search_colophon_total_num(cls, keyword: str):
        with Session(engine) as session:
            statement = select(cls.scripture_name).where(cls.content.like(f"%{keyword}%")).group_by(cls.scripture_name)
            results = session.exec(statement).all()
            return len(results)

    @classmethod
    def get_results_by_scripture_name_and_keyword(cls, scripture_name: str, keyword: str):
        with Session(engine) as session:
            statement = select(cls).where(cls.scripture_name == scripture_name).where(cls.content.like(f"%{keyword}%"))
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_colophon_by_id(cls, colophon_id: int):
        from .ind_col import Ind_Col
        from .individual import Individual

        with Session(engine) as session:
            statement = (
                select(cls, Ind_Col, Individual.name)
                .join(Ind_Col, cls.id == Ind_Col.col_id)
                .join(Individual, Individual.id == Ind_Col.ind_id)
                .where(cls.id == colophon_id)
            )
            result = session.exec(statement).all()
            if not result:
                statement = select(cls).where(cls.id == colophon_id)
                result = session.exec(statement).all()
                if not result:
                    return None
                colophon_dict = {key: value for key, value in result[0].__dict__.items() if key != "_sa_instance_state"}
                colophon_json = json.dumps(colophon_dict)
                colophon_json = json.loads(colophon_json)
                colophon_json["related_individuals"] = []
                return colophon_json

            colophon_dict = {key: value for key, value in result[0][0].__dict__.items() if key != "_sa_instance_state"}
            colophon_json = json.dumps(colophon_dict)
            colophon_json = json.loads(colophon_json)
            colophon_json["related_individuals"] = [
                {
                    "name": row[2],
                    "type": row[1].type,
                    "description": row[1].description,
                    "id": row[1].ind_id,
                }
                for row in result
            ]
            return colophon_json
