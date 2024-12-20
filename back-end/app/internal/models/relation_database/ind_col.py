from sqlmodel import Field, Session, SQLModel, select

from . import engine


class IndCol(SQLModel, table=True):
    __tablename__ = "ind_col"
    ind_id: int | None = Field(default=None, primary_key=True)
    col_id: int | None = Field(default=None, primary_key=True)
    type: str | None = Field(default=None, max_length=255)
    place: str | None = Field(default=None, max_length=255)
    note: str | None = Field(default=None, max_length=1000)

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

    @classmethod
    def get_by_ids(cls, ind_id: int, col_id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.ind_id == ind_id, cls.col_id == col_id)
            ind_col = session.exec(statement).first()
            return ind_col

    @classmethod
    def create(cls, ind_id: int, col_id: int, type: str, place: str, note: str):
        with Session(engine) as session:
            ind_col = cls(ind_id=ind_id, col_id=col_id, type=type, place=place, note=note)
            session.add(ind_col)
            session.commit()
            session.refresh(ind_col)
            return ind_col

    @classmethod
    def delete(cls, ind_id: int, col_id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.ind_id == ind_id, cls.col_id == col_id)
            ind_col = session.exec(statement).first()
            session.delete(ind_col)
            session.commit()

    def update(self, type: str, place: str, note: str):
        with Session(engine) as session:
            self.type = type
            self.place = place
            self.note = note
            session.add(self)
            session.commit()
            session.refresh(self)
