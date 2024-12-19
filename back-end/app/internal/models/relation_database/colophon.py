# 牌记
import json
from datetime import datetime

from sqlmodel import TIMESTAMP, Column, Field, Session, SQLModel, distinct, func, select

from . import CJsonEncoder, engine


class Colophon(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str | None = Field(default=None, max_length=10000)
    scripture_name: str | None = Field(default=None, max_length=200)
    volume_id: str | None = Field(default=None, max_length=200)
    chapter_id: str | None = Field(default=None, max_length=200)
    qianziwen: str | None = Field(default=None, max_length=200)
    pdf_id: int | None = Field(default=None)
    page_id: int | None = Field(default=None)
    time: str | None = Field(default=None, max_length=255)
    place: str | None = Field(default=None, max_length=255)
    temple: str | None = Field(default=None, max_length=255)
    words_num: str | None = Field(default=None, max_length=255)
    money: str | None = Field(default=None, max_length=255)
    wish: str | None = Field(default=None, max_length=1000)
    last_modify: datetime = Field(sa_column=Column(TIMESTAMP, default=func.now(), onupdate=func.now()))

    @classmethod
    def random_get_scripture_name(cls, size: int):
        with Session(engine) as session:
            size = min(size, 100)
            statement = select(distinct(cls.scripture_name)).order_by(func.random()).limit(size)
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_scripture_name(cls, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size
            # 查询总数
            total_statement = select(func.count(cls.scripture_name.distinct()))
            total_count = session.exec(total_statement).one()

            # 查询分页数据并按 scripture_name 排序
            statement = (
                select(cls.scripture_name, func.min(cls.id))
                .group_by(cls.scripture_name)
                .order_by(cls.scripture_name)  # 按 scripture_name 排序
                .offset(offset)
                .limit(page_size)
            )
            results = session.exec(statement).all()

            return {"total_num": total_count, "results": results}

    @classmethod
    def get_name_rank(cls, target_name: str):
        with Session(engine) as session:
            # 获取 distinct 的 scripture_name 列表，按所需顺序排序
            distinct_statement = (
                select(cls.scripture_name).distinct().order_by(cls.scripture_name)  # 根据需要的字段排序
            )
            subquery = distinct_statement.subquery()

            # 增加排序索引
            rank_statement = select(
                subquery.c.scripture_name, func.row_number().over(order_by=subquery.c.scripture_name).label("rank")
            ).subquery()

            # 查找目标 name 的 rank
            statement = select(rank_statement.c.rank).where(rank_statement.c.scripture_name == target_name)
            rank = session.exec(statement).one_or_none()

            return rank if rank else -1

    @classmethod
    def get_colphon_with_num(
        cls,
        page: int,
        page_size: int,
        chapter_id: str = None,
        content: str = None,
        id: int = None,
        qianziwen: str = None,
        scripture_name: str = None,
        volume_id: str = None,
        time: str = None,
        place: str = None,
        temple: str = None,
    ):
        with Session(engine) as session:
            page_size = min(page_size, 100)  # 限制 page_size 不超过 100
            offset = (page - 1) * page_size

            # 构造查询语句
            statement = select(cls, func.count().over().label("total_count"))

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
            if time is not None:
                statement = statement.where(cls.time.like(f"%{time}%"))
            if place is not None:
                statement = statement.where(cls.place.like(f"%{place}%"))
            if temple is not None:
                statement = statement.where(cls.temple.like(f"%{temple}%"))

            statement = statement.offset(offset).limit(page_size)
            results = session.exec(statement).all()
            total_count = results[0].total_count if results else 0
            return [result[0] for result in results], total_count

    @classmethod
    def search_by_content_with_num(cls, content: str, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            # 使用窗口函数获取总数并进行分页
            statement = (
                select(cls.scripture_name, func.count(cls.scripture_name).over().label("total_count"))
                .where(cls.content.like(f"%{content}%"))
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
    def search_by_content_no_page(cls, content: str):
        with Session(engine) as session:
            statement = select(distinct(cls.scripture_name)).where(cls.content.like(f"%{content}%"))

            results = session.exec(statement).all()
            return results

    @classmethod
    def get_by_scripture_name_and_content(cls, scripture_name: str, content: str):
        with Session(engine) as session:
            statement = select(cls).where(cls.scripture_name == scripture_name).where(cls.content.like(f"%{content}%"))
            results = session.exec(statement).all()
            return results

    @classmethod
    def get_with_related_by_id(cls, colophon_id: int):
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
                colophon_json = json.dumps(colophon_dict, cls=CJsonEncoder)
                colophon_json = json.loads(colophon_json)
                colophon_json["related_individuals"] = []
                return colophon_json

            colophon_dict = {key: value for key, value in result[0][0].__dict__.items() if key != "_sa_instance_state"}
            colophon_json = json.dumps(colophon_dict, cls=CJsonEncoder)
            colophon_json = json.loads(colophon_json)
            colophon_json["related_individuals"] = [
                {
                    "name": row[2],
                    "type": row[1].type,
                    "place": row[1].place,
                    "note": row[1].note,
                    "id": row[1].ind_id,
                }
                for row in result
            ]
            return colophon_json

    @classmethod
    def get_by_id(cls, id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.id == id)
            result = session.exec(statement).first()
            return result

    def update(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        with Session(engine) as session:
            session.add(self)
            session.commit()
            session.refresh(self)
            return self
