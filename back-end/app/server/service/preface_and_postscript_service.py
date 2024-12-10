from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ...internal.models.relation_database.preface_and_postscript import Preface_And_Postscript
from . import ResponseModel


class PrefaceAndPostscriptQueryParams(BaseModel):
    classic: str | None = None
    translator: str | None = None
    title: str | None = None
    category: str | None = None
    dynasty: str | None = None
    author: str | None = None
    copy_id: int | None = None
    page_id: int | None = None


preface_and_postscript_router = APIRouter(prefix="/preface_and_postscript")


@preface_and_postscript_router.post("/")
async def get_preface_and_postscript(
    params: PrefaceAndPostscriptQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    preface_and_postscripts, num = Preface_And_Postscript.get_by_statement_with_num(
        page=page,
        page_size=page_size,
        classic=params.classic,
        translator=params.translator,
        title=params.title,
        category=params.category,
        dynasty=params.dynasty,
        author=params.author,
        copy_id=params.copy_id,
        page_id=params.page_id,
    )
    return ResponseModel(data={"data": preface_and_postscripts, "total_num": num})


@preface_and_postscript_router.get("/search")
async def search_preface_and_postscript(keyword: str, page: int, page_size: int):
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
    preface_and_postscripts = Preface_And_Postscript.search_by_title_with_num(keyword, page, page_size)
    preface_and_postscripts["success"] = True
    return ResponseModel(data=preface_and_postscripts)


@preface_and_postscript_router.get("/detail")
async def get_preface_and_postscript_by_id(id: int):
    preface_and_postscript = Preface_And_Postscript.get_by_id(id)
    return ResponseModel(data=preface_and_postscript)


@preface_and_postscript_router.get("/title/random")
async def get_preface_and_postscript_title(size: int = 20):
    results = Preface_And_Postscript.random_get_title(size)
    for i, result in enumerate(results):
        results[i] = {"name": result[0], "url": "/preface_and_postscript/" + str(result[1])}
    return ResponseModel(data={"data": results})
