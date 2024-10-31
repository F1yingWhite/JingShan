from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ...interlal.models.colophon import Colophon
from . import ResponseModel


class ColophonQueryParams(BaseModel):
    chapter_id: Optional[str] = None
    content: Optional[str] = None
    id: Optional[int] = None
    qianziwen: Optional[str] = None
    scripture_name: Optional[str] = None
    volume_id: Optional[str] = None


colophon_router = APIRouter(prefix="/colophon")


@colophon_router.post("/")
async def get_colophon(
    params: ColophonQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    # 从请求模型中提取其他参数
    colphons = Colophon.get_colphon(
        page=page,
        page_size=page_size,
        chapter_id=params.chapter_id,
        content=params.content,
        id=params.id,
        qianziwen=params.qianziwen,
        scripture_name=params.scripture_name,
        volume_id=params.volume_id,
    )
    return ResponseModel(data=colphons)


@colophon_router.post("/total_num")
async def get_colophon_total_num(params: ColophonQueryParams):
    total_num = Colophon.get_colphon_total_num(
        chapter_id=params.chapter_id,
        content=params.content,
        id=params.id,
        qianziwen=params.qianziwen,
        scripture_name=params.scripture_name,
        volume_id=params.volume_id,
    )
    return ResponseModel(data={"total_num": total_num})
