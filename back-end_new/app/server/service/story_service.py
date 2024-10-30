from fastapi import APIRouter, Query

from ...interlal.models.story import Story
from . import ResponseModel

story_router = APIRouter(prefix="/story")


@story_router.get("/")
async def get_story(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1)):
    stories = Story.get_story(page, page_size)
    return ResponseModel(data=stories)


@story_router.get("/page_num")
async def get_story_page_num(page_size: int = Query(20, ge=1)):
    page_num = Story.get_story_page_num(page_size)
    return ResponseModel(data={"page_num": page_num})
