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
    def get_history_by_email(cls, email: EmailStr, page: int, page_size: int):
        with Session(engine) as session:
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size
            # 根据时间戳降序排序
            statement = (
                select(cls.id, cls.title)
                .where(cls.email == email)
                .order_by(cls.timestamp.desc())
                .limit(page_size)
                .offset(offset)
            )
            result = session.exec(statement)
            return result.all()

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

    def update(self, history: str):
        with Session(engine) as session:
            self.history = history
            session.add(self)
            session.commit()
            session.refresh(self)
            return self
