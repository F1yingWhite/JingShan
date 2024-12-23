from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from ...internal.models import Colophon, ModificationRequestsColophon, ModificationRequestsIndCol, User
from ..dependencies.user_auth import user_auth
from . import ResponseModel

colophon_router = APIRouter(prefix="/colophon")
auth_colophon_router = APIRouter(prefix="/colophon", dependencies=[Depends(user_auth)])


class ColophonGetParams(BaseModel):
    chapter_id: str | None = None
    content: str | None = None
    qianziwen: str | None = None
    scripture_name: str | None = None


@colophon_router.post("/")
async def get_colophon(
    params: ColophonGetParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    # 从请求模型中提取其他参数
    colphons, total = Colophon.get_colphon_with_num(
        page=page,
        page_size=page_size,
        chapter_id=params.chapter_id,
        content=params.content,
        qianziwen=params.qianziwen,
        scripture_name=params.scripture_name,
    )
    res = Colophon.get_nums_by_AD(
        chapter_id=params.chapter_id,
        content=params.content,
        qianziwen=params.qianziwen,
        scripture_name=params.scripture_name,
    )
    res_count = []
    res_ad = []
    for i in res:
        res_ad.append(i[0])
        res_count.append(i[1])
    return ResponseModel(data={"data": colphons, "total_num": total, "count": res_count, "ad": res_ad})


@colophon_router.get("/scripture_name/random")
async def get_scripture_name_random(size: int = 20):
    results = Colophon.random_get_scripture_name(size)
    for i, result in enumerate(results):
        results[i] = {"name": result, "url": "/graph/scripture/" + result}
    return ResponseModel(data={"data": results})


@colophon_router.get("/scripture_name")
async def get_scripture_name(page: int = 1, page_size: int = 20):
    results = Colophon.get_scripture_name(page=page, page_size=page_size)
    for i, result in enumerate(results["results"]):
        results["results"][i] = {"name": result[0], "url": "/colophon/" + str(result[1])}
    return ResponseModel(data=results)


@colophon_router.get("/scripture_name/id")
async def get_scripture_name_index(name: str):
    result = Colophon.get_name_rank(name)
    if result == -1:
        raise HTTPException(status_code=400, detail="Scripture name not found")
    return ResponseModel(data=result)


@colophon_router.get("/ad/count")
async def get_ad_count():
    res = Colophon.get_nums_by_AD()
    res_count = []
    res_ad = []
    for i in res:
        res_ad.append(i[0])
        res_count.append(i[1])
    return ResponseModel(data={"count": res_count, "ad": res_ad})


@colophon_router.get("/detail")
async def get_colophon_detail(id: int):
    results = Colophon.get_with_related_by_id(colophon_id=id)
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


class ColophonUpdateParams(BaseModel):
    content: str | None = None
    qianziwen: str | None = None
    place: str | None = None
    scripture_name: str | None = None
    time: str | None = None
    words_num: str | None = None
    money: str | None = None
    wish: str | None = None
    pearwood: str | None = None

    class Config:
        from_attributes = True


@auth_colophon_router.put("/update/{id}")
async def update_colophon(request: Request, id: int, params: ColophonUpdateParams):
    user_info = request.state.user_info
    user = User.get_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    colophon = Colophon.get_by_id(id)
    if not colophon:
        raise HTTPException(status_code=400, detail="Colophon not found")
    modificationRequest = ModificationRequestsColophon.get_by_userId_targetId(user.id, colophon.id)
    old_value = ColophonUpdateParams.model_validate(colophon)
    if modificationRequest is None:
        name = colophon.scripture_name + "／" + colophon.volume_id
        ModificationRequestsColophon.create(user.id, colophon.id, name, old_value.model_dump(), params.model_dump())
    else:
        modificationRequest.update(old_value.model_dump(), params.model_dump())
    return ResponseModel(data={})


class IndividualParams(BaseModel):
    id: int
    name: str | None
    type: str
    place: str | None
    note: str | None = None


class RelatedIndividuals(BaseModel):
    individuals: list[IndividualParams]


@auth_colophon_router.put("/related_individuals/{id}")
async def update_related_individuals(request: Request, id: int, params: RelatedIndividuals):
    user_info = request.state.user_info
    user = User.get_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    colophon = Colophon.get_with_related_by_id(id)
    if not colophon:
        raise HTTPException(status_code=400, detail="Colophon not found")
    modifcationRequest = ModificationRequestsIndCol.get_by_userId_targetId(user.id, colophon["id"])
    new_value = {"individuals": [individual.model_dump() for individual in params.individuals]}
    if modifcationRequest is None:
        name = colophon["scripture_name"] + "／" + colophon["volume_id"]
        ModificationRequestsIndCol.create(
            user.id, colophon["id"], name, {"individuals": colophon["related_individuals"]}, new_value
        )
    else:
        modifcationRequest.update({"individuals": colophon["related_individuals"]}, new_value)
    return ResponseModel(data={})
