from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from ...internal.models import Colophon, User
from ...internal.models.graph_database.zang_graph import update_colophon as graph_update_colophon
from ...internal.models.graph_database.zang_graph import update_related_individuals as graph_update_related_individuals
from ..dependencies.user_auth import user_auth
from . import ResponseModel

colophon_router = APIRouter(prefix="/colophon")
auth_colophon_router = APIRouter(prefix="/colophon", dependencies=[Depends(user_auth)])


class ColophonUpdateParams(BaseModel):
    chapter_id: str | None = None
    content: str | None = None
    id: int | None = None
    qianziwen: str | None = None
    scripture_name: str | None = None
    volume_id: str | None = None


@colophon_router.post("/")
async def get_colophon(
    params: ColophonUpdateParams,
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


# 暂时不需要
@colophon_router.get("/scripture_name/id")
async def get_scripture_name_index(name: str):
    result = Colophon.get_name_rank(name)
    if result == -1:
        raise HTTPException(status_code=400, detail="Scripture name not found")
    return ResponseModel(data=result)


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
    last_modify: str | None = None


@auth_colophon_router.put("/update/{id}")
async def update_colophon(request: Request, id: int, params: ColophonUpdateParams):
    user_info = request.state.user_info
    user = User.get_user_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    colophon = Colophon.get_by_id(id)
    if not colophon:
        raise HTTPException(status_code=400, detail="Colophon not found")
    if params.last_modify:
        params.last_modify = datetime.strptime(params.last_modify, "%Y-%m-%dT%H:%M:%S")
        if params.last_modify != colophon.last_modify:
            raise HTTPException(status_code=400, detail="Last modify time not match")
    colophon.update(
        content=params.content,
        qianziwen=params.qianziwen,
        place=params.place,
        scripture_name=params.scripture_name,
        time=params.time,
        words_num=params.words_num,
        money=params.money,
    )
    graph_update_colophon(
        colophon.volume_id,
        colophon.chapter_id,
        colophon.qianziwen,
        colophon.time,
        colophon.place,
        colophon.words_num,
        colophon.money,
        colophon.content,
    )
    return ResponseModel(data={})


class IndividualParams(BaseModel):
    id: int
    name: str | None
    type: Literal["书", "刻工", "募", "对", ""]
    place: str | None
    note: str | None = None


class RelatedIndividuals(BaseModel):
    individuals: list[IndividualParams]


async def update_individuals(individuals, colophon_id):
    from ...internal.models.relation_database.ind_col import Ind_Col
    from ...internal.models.relation_database.individual import Individual

    for individual in individuals:
        if individual.name != "":
            individual_obj = Individual.get_by_name(individual.name)
            if not individual_obj:
                individual_obj = Individual.create(individual.name)
            ind_col = Ind_Col.get_by_ids(individual_obj.id, colophon_id)
            if not ind_col:
                Ind_Col.create(individual_obj.id, colophon_id, individual.type, individual.place, individual.note)
            elif (
                ind_col.type != individual.type or ind_col.place != individual.place or ind_col.note != individual.note
            ):
                ind_col.update(individual.type, individual.place, individual.note)


async def remove_unrelated_individuals(original_individuals, new_individuals, colophon_id):
    from ...internal.models.relation_database.ind_col import Ind_Col
    from ...internal.models.relation_database.individual import Individual

    for original_individual in original_individuals:
        if original_individual["name"] not in [individual.name for individual in new_individuals]:
            ind_col = Ind_Col.get_by_ids(original_individual["id"], colophon_id)
            Ind_Col.delete(ind_col.ind_id, ind_col.col_id)
            individual = Individual.get_by_id_with_related(original_individual["id"])
            if not individual:
                Individual.delete(original_individual["id"])


@auth_colophon_router.put("/related_individuals/{id}")
async def update_related_individuals(request: Request, id: int, params: RelatedIndividuals):
    user_info = request.state.user_info
    user = User.get_user_by_email(user_info["sub"])
    if user.privilege == 0:
        raise HTTPException(status_code=403, detail="Permission denied")
    colophon = Colophon.get_with_related_by_id(id)
    if not colophon:
        raise HTTPException(status_code=400, detail="Colophon not found")
    graph_update_related_individuals(colophon["volume_id"], colophon["chapter_id"], params.individuals)
    await update_individuals(params.individuals, id)
    await remove_unrelated_individuals(colophon["related_individuals"], params.individuals, id)

    return ResponseModel(data={})
