from datetime import datetime
from enum import Enum

from sqlmodel import Field, Session, SQLModel, select

from .. import engine


class StatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ModificationRequestBase(SQLModel):
    __abstract__ = True
    request_id: int | None = Field(default=None, primary_key=True)
    user_id: int
    target_id: int
    old_value: dict
    new_value: dict
    requested_at: datetime
    status: StatusEnum = Field(default=StatusEnum.pending)
    handle_at: datetime | None = None
    approved_by: int | None = None

    @classmethod
    def create(cls, user_id: int, target_id: int, old_value: dict, new_value: dict):
        with Session(engine) as session:
            request = cls(
                user_id=user_id,
                target_id=target_id,
                old_value=old_value,
                new_value=new_value,
                requested_at=datetime.now(),
            )
            session.add(request)
            session.commit()
            session.refresh(request)
            return request

    @classmethod
    def get_pending(cls, page: int, per_page: int):
        with Session(engine) as session:
            statement = (
                select(cls).where(cls.status == StatusEnum.pending).limit(per_page).offset((page - 1) * per_page)
            )
            result = session.exec(statement)
            return result.all()

    @classmethod
    def get_by_userId_targetId(cls, user_id: int, target_id: int):
        # 相同user_id+target_id且没有pending的请求只能有一个
        with Session(engine) as session:
            statement = select(cls).where(
                cls.user_id == user_id, cls.target_id == target_id, cls.status == StatusEnum.pending
            )
            result = session.exec(statement)
            return result.first()

    @classmethod
    def get_by_id(cls, request_id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.request_id == request_id)
            result = session.exec(statement)
            return result.first()

    def update(self, oldValue, newValue):
        with Session(engine) as session:
            self.old_value = oldValue
            self.new_value = newValue
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    def approve(self, user_id: int):
        with Session(engine) as session:
            self.status = StatusEnum.approved
            self.handle_at = datetime.now()
            self.approved_by = user_id
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    def reject(self, user_id: int):
        with Session(engine) as session:
            self.status = StatusEnum.rejected
            self.handle_at = datetime.now()
            self.approved_by = user_id
            session.add(self)
            session.commit()
            session.refresh(self)
            return self
