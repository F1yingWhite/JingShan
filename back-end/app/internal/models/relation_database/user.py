# 用户

from enum import IntEnum

from sqlalchemy import Column, Integer
from sqlalchemy_utils import ChoiceType
from sqlmodel import Field, Session, SQLModel, select

from ...utils.encryption import encrypt_password
from . import engine


class UserPrivilege(IntEnum):
    USER = 0
    ADMIN = 1
    SUPERADMIN = 2


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255, unique=True)
    password: str | None = Field(default=None, max_length=255)
    avatar: str | None = Field(default=None)
    verified: bool = Field(default=False)
    privilege: UserPrivilege = Field(
        default=UserPrivilege.USER, sa_column=Column(ChoiceType(UserPrivilege, impl=Integer()))
    )

    @classmethod
    def register(cls, name: str, email: str, password: str):
        password = encrypt_password(password)
        user = cls(name=name, email=email, password=password)
        with Session(engine) as session:
            session.add(user)
            session.commit()
            session.refresh(user)
            return user

    @classmethod
    def get_by_id(cls, user_id: int):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.id == user_id, cls.verified == True)).first()  # noqa: E712
            return user

    @classmethod
    def get_by_email(cls, email: str):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.email == email, cls.verified == True)).first()  # noqa: E712
            return user

    @classmethod
    def get_by_email_no_verify(cls, email: str):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.email == email)).first()  # noqa: E712
            return user

    def change_password(self, new_password: str):
        new_password = encrypt_password(new_password)
        self.password = new_password
        with Session(engine) as session:
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    def verify(self):
        self.verified = True
        with Session(engine) as session:
            session.add(self)
            session.commit()
            session.refresh(self)
            return

    def change_avatar(self, avatar: str):
        self.avatar = avatar
        with Session(engine) as session:
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    def change_username(self, username: str):
        self.name = username
        with Session(engine) as session:
            session.add(self)
            session.commit()
            session.refresh(self)
            return self
