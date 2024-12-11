from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query,Request
from pydantic import BaseModel

from ...internal.models.relation_database.preface_and_postscript import Preface_And_Postscript
from ...internal.models.relation_database.user import User
from ..dependencies.user_auth import user_auth
from . import ResponseModel

preface_and_postscript_router = APIRouter(prefix="/preface_and_postscript")
auth_preface_and_postscript_router = APIRouter(prefix="/preface_and_postscript", dependencies=[Depends(user_auth)])


class PrefaceAndPostscriptUpdateParams(BaseModel):
    classic: str | None = None
    translator: str | None = None
    title: str | None = None
    category: str | None = None
    dynasty: str | None = None
    author: str | None = None
    copy_id: int | None = None
    page_id: int | None = None


@preface_and_postscript_router.post("/")
async def get_preface_and_postscript(
    params: PrefaceAndPostscriptUpdateParams,
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


@preface_and_postscript_router.get("/title")
async def get_preface_and_postscript_title_by_page(page: int = 1, page_size: int = 20):
    results = Preface_And_Postscript.get_title_with_num(page, page_size)
    for i, result in enumerate(results["results"]):
        results["results"][i] = {"name": result[0], "url": "/preface_and_postscript/" + str(result[1])}
    return ResponseModel(data=results)


class PrefaceAndPostscriptUpdateParams(BaseModel):
    classic: str | None = None
    translator: str | None = None
    title: str | None = None
    category: str | None = None
    dynasty: str | None = None
    author: str | None = None
    last_modify: str | None = None


@auth_preface_and_postscript_router.put("/update/{id}")
async def change_preface_and_postscript(request: Request, id: int, params: PrefaceAndPostscriptUpdateParams):
    user_info = request.state.user_info
    user = User.get_user_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    preface = Preface_And_Postscript.get_by_id(id)
    if not preface:
        raise HTTPException(status_code=400, detail="Preface or postscript not found")
    if params.last_modify:
        params.last_modify = datetime.strptime(params.last_modify, "%Y-%m-%dT%H:%M:%S")
        if params.last_modify != preface.last_modify:
            raise HTTPException(status_code=400, detail="Last modify time not match")
    preface.update(
        classic=params.classic,
        translator=params.translator,
        title=params.title,
        category=params.category,
        dynasty=params.dynasty,
        author=params.author,
    )
    return ResponseModel(data={})
