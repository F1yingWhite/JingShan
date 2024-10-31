from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ...interlal.models.story import Story
from . import ResponseModel


class StoryQueryParams(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


story_router = APIRouter(prefix="/story")


@story_router.post("/")
async def get_story(
    params: StoryQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    stories = Story.get_story(
        page=page,
        page_size=page_size,
        title=params.title,
        content=params.content,
    )
    return ResponseModel(data=stories)


@story_router.post("/total_num")
async def get_story_total_num(params: StoryQueryParams):
    total_num = Story.get_story_total_num(
        title=params.title,
        content=params.content,
    )
    return ResponseModel(data={"total_num": total_num})
