import base64
from time import sleep

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ...internal.models.relation_database.story import Story
from . import ResponseModel


class StoryQueryParams(BaseModel):
    title: str | None = None
    content: str | None = None


class ContentModel(BaseModel):
    content: str


story_router = APIRouter(prefix="/story")


@story_router.post("/")
async def get_story(
    params: StoryQueryParams,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
):
    stories, num = Story.get_story_with_num(
        page=page,
        page_size=page_size,
        title=params.title,
        content=params.content,
    )
    return ResponseModel(data={"data": stories, "total": num})


@story_router.get("/detail")
async def get_story_detail(id: int):
    story = Story.get_story_detail(id)
    return ResponseModel(data=story)


# TODO:文生图的后续调用
@story_router.post("/generate_picture")
async def generate_picture(content_model: ContentModel):
    # content = content_model.content
    img_test_path = "./assets/test.jpg"
    sleep(1)
    with open(img_test_path, "rb") as f:
        img = f.read()
        img_base64 = base64.b64encode(img).decode()
    return ResponseModel(data={"img": img_base64})
