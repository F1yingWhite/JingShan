from fastapi import APIRouter, Query

from ...interlal.models.colophon import Colophon
from . import ResponseModel

colophon_router = APIRouter(prefix="/colophon")


# 传入page和page_size
@colophon_router.get("/")
async def get_colophon(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1)):
    # 假设有一个获取 Colophon 数据的方法
    colphons = Colophon.get_colphon(page, page_size)
    return ResponseModel(data=colphons)
