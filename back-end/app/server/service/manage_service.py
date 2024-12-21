from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from ...internal.models import (
    Colophon,
    ModificationRequestsColophon,
    ModificationRequestsIndCol,
    User,
)
from ...internal.models.graph_database.zang_graph import update_colophon as graph_update_colophon
from ...internal.models.graph_database.zang_graph import update_related_individuals as graph_update_related_individuals
from ...internal.models.relation_database.modification_requests import StatusEnum
from ..dependencies.user_auth import user_auth
from . import ResponseModel

manage_router = APIRouter(prefix="/manage", dependencies=[Depends(user_auth)])


class model_type(str, Enum):
    preface = "preface"
    colophon = "colophon"
    indcol = "indcol"


def getModel(model_type):
    if model_type == "preface":
        return ModificationRequestsColophon
    elif model_type == "colophon":
        return ModificationRequestsColophon
    elif model_type == "indcol":
        return ModificationRequestsIndCol
    else:
        raise HTTPException(status_code=400, detail="Invalid model type")


@manage_router.get("/pending")
async def get_pending_list(request: Request, model_type: model_type, page: int = 1, page_size: int = 20):
    user_info = request.state.user_info
    user = User.get_user_by_email(user_info["sub"])
    if user.privilege != 2:
        raise HTTPException(status_code=403, detail="Permission denied")

    model = getModel(model_type)

    res = model.get_pending(page, page_size)
    return ResponseModel(data=res)


class IndividualParams(BaseModel):
    id: int
    name: str | None
    type: str
    place: str | None
    note: str | None = None


class RelatedIndividuals(BaseModel):
    individuals: list[IndividualParams]


def process_related_individuals(params:RelatedIndividuals, colophon: Colophon):  # noqa: C901
    def update_individuals(individuals, colophon_id):
        from ...internal.models.relation_database.ind_col import IndCol
        from ...internal.models.relation_database.individual import Individual

        for individual in individuals:
            if individual.name != "":
                individual_obj = Individual.get_by_name(individual.name)
                if not individual_obj:
                    individual_obj = Individual.create(individual.name)
                ind_col = IndCol.get_by_ids(individual_obj.id, colophon_id)
                if not ind_col:
                    IndCol.create(individual_obj.id, colophon_id, individual.type, individual.place, individual.note)
                elif (
                    ind_col.type != individual.type
                    or ind_col.place != individual.place
                    or ind_col.note != individual.note
                ):
                    ind_col.update(individual.type, individual.place, individual.note)

    def remove_unrelated_individuals(original_individuals, new_individuals, colophon_id):
        from ...internal.models.relation_database.ind_col import IndCol
        from ...internal.models.relation_database.individual import Individual

        for original_individual in original_individuals:
            if original_individual["name"] not in [individual.name for individual in new_individuals]:
                ind_col = IndCol.get_by_ids(original_individual["id"], colophon_id)
                IndCol.delete(ind_col.ind_id, ind_col.col_id)
                individual = Individual.get_by_id_with_related(original_individual["id"])
                if not individual:
                    Individual.delete(original_individual["id"])

    update_individuals(params.individuals, colophon.id)
    remove_unrelated_individuals(colophon["related_individuals"], params.individuals, colophon.id)
    colophon.update()
    graph_update_related_individuals(colophon["volume_id"], colophon["chapter_id"], params.individuals)


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


def process_update_colophon(params: ColophonUpdateParams, colophon: Colophon):
    colophon.update(
        content=params.content,
        qianziwen=params.qianziwen,
        place=params.place,
        scripture_name=params.scripture_name,
        time=params.time,
        words_num=params.words_num,
        money=params.money,
        wish=params.wish,
        pearwood=params.pearwood,
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
        colophon.wish,
        colophon.pearwood,
    )
    return ResponseModel(data={})


class hanldRequestParams(BaseModel):
    status: StatusEnum


@manage_router.put("/update/{id}")
async def handleRequest(request: Request, id: int, params: hanldRequestParams, model_type: model_type):  # noqa: C901
    user_info = request.state.user_info
    user = User.get_user_by_email(user_info["sub"])
    if user.privilege != 2:
        raise HTTPException(status_code=403, detail="Permission denied")

    model = getModel(model_type)
    modicationRequest = model.get_by_id(id)
    if not modicationRequest:
        raise HTTPException(status_code=404, detail="Request not found")

    if params.status == StatusEnum.approved:
        modicationRequest.approve(user.id)
        if model_type == "colophon":
            new_value = modicationRequest.new_value
            colophon = Colophon.get_by_id(id)
            if not colophon:
                raise HTTPException(status_code=404, detail="Colophon not found")
            process_update_colophon(new_value, colophon)
        elif model_type == "indcol":
            new_value = modicationRequest.new_value["individuals"]
            colophon = Colophon.get_by_id(new_value.id)
            if not colophon:
                raise HTTPException(status_code=404, detail="Colophon not found")
            process_related_individuals(new_value, colophon)
        elif model_type == "preface":
            new_value = modicationRequest.new_value
            colophon = Colophon.get_by_id(id)
            if not colophon:
                raise HTTPException(status_code=404, detail="Colophon not found")
            colophon.update(
                classic=new_value.classic,
                translator=new_value.translator,
                title=new_value.title,
                category=new_value.category,
                dynasty=new_value.dynasty,
                author=new_value.author,
            )
    elif params.status == StatusEnum.rejected:
        modicationRequest.reject(user.id)
    else:
        raise HTTPException(status_code=400, detail="Invalid status")

    return ResponseModel(data={})
