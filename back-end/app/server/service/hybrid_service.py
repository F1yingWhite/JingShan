from fastapi import APIRouter

from ...internal.models.hybird import hybird_search
from . import ResponseModel

hybrid_router = APIRouter(prefix="/hybrid")


@hybrid_router.get("/search")
async def search(keyword: str, current: int, pageSize: int):
    res, num = hybird_search(keyword, current, pageSize)
    return ResponseModel(data={"data": res, "success": True, "total": num})
