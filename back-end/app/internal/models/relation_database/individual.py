from sqlmodel import Field, Session, SQLModel, func, select

from . import engine


class Individual(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=255)

    @classmethod
    def get_individuals_by_name(cls, name: str):
        # 使用模糊查询
        with Session(engine) as session:
            statement = select(cls).where(cls.name.like(f"%{name}%"))
            individuals = session.exec(statement).all()  # 在会话关闭之前将结果转换为列表
            return individuals

    @classmethod
    def get_random_individuals(cls, size: int):
        size = min(size, 100)
        with Session(engine) as session:
            statement = select(cls).order_by(func.random()).limit(size)
            individuals = session.exec(statement).all()
            return individuals

    @classmethod
    def get_all_individuals(cls, page: int, pageSize: int, name: str):
        with Session(engine) as session:
            # 使用窗口函数获取总数并进行分页
            if name:
                statement = (
                    select(cls, func.count().over().label("total_count"))
                    .where(cls.name.like(f"%{name}%"))
                    .offset((page - 1) * pageSize)
                    .limit(pageSize)
                )
            else:
                statement = (
                    select(cls, func.count().over().label("total_count")).offset((page - 1) * pageSize).limit(pageSize)
                )
            results = session.exec(statement).all()
            individuals = [result[0] for result in results]
            total_count = results[0].total_count if results else 0
            return individuals, total_count

    @classmethod
    def get_individuals_by_id(cls, user_id: int):
        from .colophon import Colophon
        from .ind_col import Ind_Col

        # 使用连表查询
        with Session(engine) as session:
            statement = (
                select(
                    cls.name,
                    Colophon.content,
                    Colophon.scripture_name,
                    Ind_Col.type,
                    Ind_Col.place,
                    Ind_Col.col_id,
                )
                .join(Ind_Col, cls.id == Ind_Col.ind_id)
                .join(Colophon, Ind_Col.col_id == Colophon.id)
                .where(cls.id == user_id)
            )
            results = session.exec(statement)
            return results.all()

    @classmethod
    def search_individuals(cls, name: str = None):
        with Session(engine) as session:
            # 使用模糊查询
            stmt = select(cls)
            if name is not None:
                stmt = stmt.where(cls.name.like(f"%{name}%"))
            individuals = session.exec(stmt).all()
            return individuals

    @classmethod
    def search_individuals_with_page(cls, name: str, current: int, pageSize: int):
        with Session(engine) as session:
            offset = (current - 1) * pageSize

            # 使用窗口函数获取总数并进行分页
            statement = (
                select(cls, func.count().over().label("total_count"))
                .where(cls.name.like(f"%{name}%"))
                .offset(offset)
                .limit(pageSize)
            )

            results = session.exec(statement).all()
            individuals = [result[0] for result in results]
            # 提取总数
            total_count = results[0].total_count if results else 0
            return individuals, total_count

    @classmethod
    def get_individuals_hybrid(cls, page: int, page_size: int, name: str | None, works: list[str], place: list[str]):
        from .ind_col import Ind_Col

        with Session(engine) as session:
            # 基础查询
            base_query = select(cls).join(Ind_Col, cls.id == Ind_Col.ind_id).distinct()
            if name:
                base_query = base_query.where(cls.name.like(f"%{name}%"))
            if works:
                base_query = base_query.where(Ind_Col.type.in_(works))
            if place:
                base_query = base_query.where(Ind_Col.place.in_(place))

            # 获取总数
            count_query = select(func.count().label("total")).select_from(base_query)
            total = session.exec(count_query).one()

            # 获取分页数据
            statement = base_query.offset((page - 1) * page_size).limit(page_size)
            results = session.exec(statement).all()

            return results, total
