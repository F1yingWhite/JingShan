from fastapi import APIRouter, Query

from ...interlal.models.preface_and_postscript import Preface_And_Postscript
from . import ResponseModel

preface_and_postscript_router = APIRouter(prefix="/preface_and_postscript")


@preface_and_postscript_router.get("/")
async def get_preface_and_postscript(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1)):
    preface_and_postscripts = Preface_And_Postscript.get_preface_and_postscript(page, page_size)
    return ResponseModel(data=preface_and_postscripts)


@preface_and_postscript_router.get("/page_num")
async def get_preface_and_postscript_page_num(page_size: int = Query(20, ge=1)):
    page_num = Preface_And_Postscript.get_preface_and_postscript_page_num(page_size)
    return ResponseModel(data={"page_num": page_num})
