# 用户

from sqlmodel import Field, Session, SQLModel, select

from ...utils.password import encrypt_password, verify_password
from . import engine


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255, unique=True)
    password: str | None = Field(default=None, max_length=255)
    avatar: str | None = Field(default=None)

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
    def login(cls, email: str, password: str):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.email == email)).first()
            if user is None:
                return False, user
            return verify_password(password, user.password.encode("utf-8")), user

    @classmethod
    def change_password(cls, email: str, old_password: str, new_password: str):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.email == email)).first()
            if user is None:
                return False
            if not verify_password(old_password, user.password):
                return False
            user.password = encrypt_password(new_password)
            session.add(user)
            session.commit()
            return True

    @classmethod
    def get_user_by_id(cls, user_id: int):
        with Session(engine) as session:
            user = session.get(cls, user_id)
            return user

    @classmethod
    def get_user_by_email(cls, email: str):
        with Session(engine) as session:
            user = session.exec(select(cls).where(cls.email == email)).first()
            return user
