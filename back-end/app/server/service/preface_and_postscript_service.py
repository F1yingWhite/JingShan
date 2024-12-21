from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from ...internal.models import ModificationRequestsPreface, PrefaceAndPostscript, User
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
    preface_and_postscripts, num = PrefaceAndPostscript.get_by_statement_with_num(
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
    preface_and_postscripts = PrefaceAndPostscript.search_by_title_with_num(keyword, page, page_size)
    preface_and_postscripts["success"] = True
    return ResponseModel(data=preface_and_postscripts)


@preface_and_postscript_router.get("/detail")
async def get_preface_and_postscript_by_id(id: int):
    preface_and_postscript = PrefaceAndPostscript.get_by_id(id)
    return ResponseModel(data=preface_and_postscript)


@preface_and_postscript_router.get("/title/random")
async def get_preface_and_postscript_title(size: int = 20):
    results = PrefaceAndPostscript.random_get_title(size)
    for i, result in enumerate(results):
        results[i] = {"name": result[0], "url": "/preface_and_postscript/" + str(result[1])}
    return ResponseModel(data={"data": results})


@preface_and_postscript_router.get("/title")
async def get_preface_and_postscript_title_by_page(page: int = 1, page_size: int = 20):
    results = PrefaceAndPostscript.get_title_with_num(page, page_size)
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

    class Config:
        from_attributes = True


@auth_preface_and_postscript_router.put("/update/{id}")
async def change_preface_and_postscript(request: Request, id: int, params: PrefaceAndPostscriptUpdateParams):
    user_info = request.state.user_info
    user = User.get_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    preface = PrefaceAndPostscript.get_by_id(id)
    if not preface:
        raise HTTPException(status_code=400, detail="Preface or postscript not found")
    modifcationRequest = ModificationRequestsPreface.get_by_userId_targetId(user.id, id)
    old_value = PrefaceAndPostscriptUpdateParams.model_validate(preface)
    if modifcationRequest is None:
        name = preface.classic + "／" + preface.title
        ModificationRequestsPreface.create(
            user.id,
            preface.id,
            name,
            old_value.model_dump(),
            params.model_dump(),
        )
    else:
        modifcationRequest.update(old_value.model_dump(), params.model_dump())
    return ResponseModel(data={})
