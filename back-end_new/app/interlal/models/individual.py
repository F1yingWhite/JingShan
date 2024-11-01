from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Individual(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=255)

    @classmethod
    def get_individuals_by_name(cls, name: str):
        # 使用模糊查询
        with Session(engine) as session:
            stmt = select(cls).where(cls.name.like(f"%{name}%"))
            individuals = session.exec(stmt).all()  # 在会话关闭之前将结果转换为列表
            return individuals

    @classmethod
    def get_individuals_by_id(cls, user_id: int):
        from .colophon import Colophon
        from .ind_col import Ind_Col

        # 使用连表查询
        with Session(engine) as session:
            statement = (
                select(cls.name, Colophon.content, Colophon.scripture_name, Ind_Col.type, Ind_Col.description)
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
