from re import U
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import true

from ...interlal.models.colophon import Colophon
from ...interlal.utils.get_time_place import get_publication_place, get_publication_time
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


@colophon_router.get("/detail")
async def get_colophon_detail(id: int):
    results = Colophon.get_colophon_by_id(colophon_id=id)
    result_dict = {}
    if len(results) == 0:
        return ResponseModel(data=result_dict)

    colophon_data = results[0]["colophon"].__dict__

    result_dict["content"] = colophon_data.get("content")
    result_dict["scripture_name"] = colophon_data.get("scripture_name")
    result_dict["volume_id"] = colophon_data.get("volume_id")
    result_dict["chapter_id"] = colophon_data.get("chapter_id")
    result_dict["qianziwen"] = colophon_data.get("qianziwen")
    result_dict["pdf_id"] = colophon_data.get("pdf_id")
    result_dict["page_id"] = colophon_data.get("page_id")
    result_dict["time"] = get_publication_time(result_dict["content"])
    result_dict["place"] = get_publication_place(result_dict["content"])
    result_dict["related_individuals"] = []
    for item in results:
        ind_col_data = item["ind_col"].__dict__
        person_dict = {
            "name": item["individual_name"],
            "id": ind_col_data.get("ind_id"),
            "description": ind_col_data.get("description"),
            "type": ind_col_data.get("type"),
        }
        result_dict["related_individuals"].append(person_dict)
    return ResponseModel(data=result_dict)


@colophon_router.get("/search")
async def search_colophon(keyword: str, page: int = 1, page_size: int = 20):
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
    scripture_names, total_num = Colophon.search_colophon(keyword=keyword, page=page, page_size=page_size)
    colophons = {}
    colophons["content"] = []
    for name in scripture_names:
        colophons["content"].append({"name": name, "related_data": Colophon.get_results_by_scripture_name(scripture_name=name)})
    return ResponseModel(data={"data": colophons, "total": total_num, "success": True})
