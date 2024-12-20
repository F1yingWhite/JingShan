from datetime import datetime
from enum import Enum

from sqlmodel import Field, Session, SQLModel

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
    reason: str | None = None

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
