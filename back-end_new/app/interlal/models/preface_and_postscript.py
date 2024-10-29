from sqlmodel import Field, SQLModel


# 序跋
class PrefaceAndPostscript(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    classic: str | None = Field(default=None, max_length=100)
    translator: str | None = Field(default=None, max_length=100)
    title: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=30)
    dynasty: str | None = Field(default=None, max_length=30)
    author: str | None = Field(default=None, max_length=50)
    copy_id: int | None = Field(default=None)
    page_id: int | None = Field(default=None)
