from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Ind_Col(SQLModel, table=True):
    ind_id: int | None = Field(default=None, primary_key=True)
    col_id: int | None = Field(default=None, primary_key=True)
    type: str | None = Field(default=None, max_length=255)
    place: str | None = Field(default=None, max_length=255)

    @classmethod
    def get_works_type(cls, key: None | str):
        if key is None:
            with Session(engine) as session:
                statement = select(cls.type).distinct()
                works = session.exec(statement).all()
                return works
        else:
            with Session(engine) as session:
                statement = select(cls.type).where(cls.type.like(f"%{key}%")).distinct()
                works = session.exec(statement).all()
                return works

    @classmethod
    def get_works_place(cls, key: None | str):
        if key is None:
            with Session(engine) as session:
                statement = select(cls.place).distinct()
                works = session.exec(statement).all()
                return works
        else:
            with Session(engine) as session:
                statement = select(cls.place).where(cls.place.like(f"%{key}%")).distinct()
                works = session.exec(statement).all()
                return works
