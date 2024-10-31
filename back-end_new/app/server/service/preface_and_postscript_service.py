import copy
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ...interlal.models.preface_and_postscript import Preface_And_Postscript
from . import ResponseModel


class PrefaceAndPostscriptQueryParams(BaseModel):
    classic: Optional[str] = None
    translator: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    dynasty: Optional[str] = None
    author: Optional[str] = None
    copy_id: Optional[int] = None
    page_id: Optional[int] = None


preface_and_postscript_router = APIRouter(prefix="/preface_and_postscript")


@preface_and_postscript_router.post("/")
async def get_preface_and_postscript(
    params: PrefaceAndPostscriptQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    preface_and_postscripts = Preface_And_Postscript.get_preface_and_postscript(
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
    return ResponseModel(data=preface_and_postscripts)


@preface_and_postscript_router.post("/total_num")
async def get_preface_and_postscript_total_num(params: PrefaceAndPostscriptQueryParams):
    total_num = Preface_And_Postscript.get_preface_and_postscript_total_num(
        classic=params.classic,
        translator=params.translator,
        title=params.title,
        category=params.category,
        dynasty=params.dynasty,
        author=params.author,
        copy_id=params.copy_id,
        page_id=params.page_id,
    )
    return ResponseModel(data={"total_num": total_num})
