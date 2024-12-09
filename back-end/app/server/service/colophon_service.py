from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ...internal.models.relation_database.colophon import Colophon
from . import ResponseModel


class ColophonQueryParams(BaseModel):
    chapter_id: str | None = None
    content: str | None = None
    id: int | None = None
    qianziwen: str | None = None
    scripture_name: str | None = None
    volume_id: str | None = None


colophon_router = APIRouter(prefix="/colophon")


@colophon_router.post("/")
async def get_colophon(
    params: ColophonQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    # 从请求模型中提取其他参数
    colphons, total = Colophon.get_colphon_with_num(
        page=page,
        page_size=page_size,
        chapter_id=params.chapter_id,
        content=params.content,
        id=params.id,
        qianziwen=params.qianziwen,
        scripture_name=params.scripture_name,
        volume_id=params.volume_id,
    )
    return ResponseModel(data={"data": colphons, "total_num": total})


@colophon_router.get("/detail")
async def get_colophon_detail(id: int):
    results = Colophon.get_by_id(colophon_id=id)
    if not results:
        raise HTTPException(status_code=400, detail="Colophon not found")
    return ResponseModel(data=results)


@colophon_router.get("/search")
async def search_colophon(keyword: str, page: int = 1, page_size: int = 20):
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
    scripture_names, total_num = Colophon.search_by_content_with_num(content=keyword, page=page, page_size=page_size)
    colophons = {}
    colophons["content"] = []
    for name in scripture_names:
        colophons["content"].append(
            {
                "name": name,
                "related_data": Colophon.get_by_scripture_name_and_content(scripture_name=name, content=keyword),
            }
        )
    return ResponseModel(data={"data": colophons, "total": total_num, "success": True})
