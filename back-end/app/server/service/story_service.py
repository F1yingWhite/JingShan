import base64
from time import sleep
from typing import Optional

from fastapi import APIRouter, Query
from PIL import Image
from pydantic import BaseModel, conset

from ...interlal.models.story import Story
from . import ResponseModel


class StoryQueryParams(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class ContentModel(BaseModel):
    content: str


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


@story_router.get("/detail")
async def get_story_detail(id: int):
    story = Story.get_story_detail(id)
    return ResponseModel(data=story)


@story_router.post("/generate_picture")
async def generate_picture(content_model: ContentModel):
    content = content_model.content
    img_test_path = "./assets/test.jpg"
    sleep(1)
    with open(img_test_path, "rb") as f:
        img = f.read()
        img_base64 = base64.b64encode(img).decode()
    return ResponseModel(data={"img": img_base64})
