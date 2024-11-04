from typing import List, Optional

from sqlalchemy.orm import aliased
from sqlmodel import Field, Relationship, Session, SQLModel, select

from . import engine


class StringMapping(SQLModel, table=True):
    __tablename__ = "string_mapping"
    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="stringmapping.id")
    str_value: Optional[str] = Field(default=None, max_length=10000, foreign_key="stringmapping.id")

    @classmethod
    def get_string_mapping_by_id(cls, id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.id == id)
            results = session.exec(statement).first()
            if results is None:
                return "Not Found"
            return results.str_value


class EntityAttributes(SQLModel, table=True):
    __tablename__ = "entity_attributes"
    entity_id: Optional[int] = Field(default=None, primary_key=True)
    attribute_name_id: Optional[int] = Field(default=None, primary_key=True)
    attribute_value: str = Field(default=None, max_length=10000)

    @classmethod
    def get_attributes_by_entity_id(cls, entity_id: int):
        with Session(engine) as session:
            statement = select(cls).where(cls.entity_id == entity_id, cls.attribute_name_id == 705)
            results = session.exec(statement).first()
            if results is None:
                return "Not Found"
            return results.attribute_value


class SPO(SQLModel, table=True):
    __tablename__ = "SPO"
    subject_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="stringmapping.id")
    predicate_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="stringmapping.id")
    object_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="stringmapping.id")

    @classmethod
    def get_relation_ship_by_id(cls, subject_id: int):
        with Session(engine) as session:
            subject_alias = aliased(StringMapping, name="subject")
            predicate_alias = aliased(StringMapping, name="predicate")
            object_alias = aliased(StringMapping, name="object")

            statement = (
                select(cls, subject_alias, predicate_alias, object_alias)
                .join(subject_alias, cls.subject_id == subject_alias.id)
                .join(predicate_alias, cls.predicate_id == predicate_alias.id)
                .join(object_alias, cls.object_id == object_alias.id)
                .where(cls.subject_id == subject_id)
            )
            results = session.exec(statement).all()
            return results
