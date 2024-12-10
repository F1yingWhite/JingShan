from datetime import datetime

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, Session, SQLModel, select

from . import engine


class Chat_History(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str | None = Field(default=None, max_length=255)
    history: str | None = Field(default=None, sa_column=Column(JSON))
    timestamp: datetime | None = Field(default=datetime.now)
    title: str | None = Field(default=None, max_length=255)

    @classmethod
    def get_history_length_by_email(cls, email: EmailStr):
        with Session(engine) as session:
            statement = select(cls).where(cls.email == email)
            result = session.exec(statement).all()
            return len(result)

    @classmethod
    def get_history_title_by_email(cls, email: EmailStr):
        with Session(engine) as session:
            # 根据时间戳降序排序
            statement = select(cls.id, cls.title).where(cls.email == email).order_by(cls.timestamp.desc())
            result = session.exec(statement)
            results = result.all()
            res = []
            for item in results:
                res.append({"key": str(item[0]), "label": item[1]})
            return res

    @classmethod
    def get_history_by_id(cls, id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.id == id)
            result = session.exec(statement)
            return result.first()

    @classmethod
    def generate_new_history(cls, email: EmailStr):
        with Session(engine) as session:
            data_time = datetime.now()
            new_history = cls(email=email, history=[], title="", timestamp=data_time)
            session.add(new_history)
            session.commit()
            session.refresh(new_history)
            return new_history

    def update(self, history: str | None, title: str | None):
        with Session(engine) as session:
            if history is not None:
                self.history = history
            if title is not None:
                self.title = title
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    def delete(self):
        with Session(engine) as session:
            session.delete(self)
            session.commit()
            return self
