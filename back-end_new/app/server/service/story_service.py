from fastapi import APIRouter, Query

from ...interlal.models.story import Story
from . import ResponseModel

story_router = APIRouter(prefix="/story")


@story_router.get("/")
async def get_story(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1)):
    stories = Story.get_story(page, page_size)
    return ResponseModel(data=stories)
