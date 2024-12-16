import base64
import json
from time import sleep

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ...internal.bootstrap import config
from ...internal.models import Story
from ...internal.utils.pricture_api import DouBaoRequestHandler
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
    return ResponseModel(data={"data": stories, "total_num": num})


@story_router.get("/detail")
async def get_story_detail(id: int):
    story = Story.get_story_detail(id)
    return ResponseModel(data=story)


@story_router.post("/generate_picture")
async def generate_picture(content_model: ContentModel):
    content = content_model.content
    img_test_path = "./assets/test.jpg"
    sleep(2)
    with open(img_test_path, "rb") as f:
        img = f.read()
        img_base64 = base64.b64encode(img).decode()
    return ResponseModel(data={"img": img_base64})
    access_key = config.DOUBAO.ACCESS_KEY
    secret_key = config.DOUBAO.SECRET_KEY
    service = "cv"
    version = "2022-08-31"
    region = "cn-north-1"
    host = "visual.volcengineapi.com"
    content_type = "application/json"
    method = "POST"
    query = {}
    header = {}
    action = "CVProcess"
    body = {
        "req_key": "high_aes_general_v20_L",
        "prompt": content,
        "model_version": "general_v2.0_L",
        "req_schedule_conf": "general_v20_9B_rephraser",
        "seed": -1,
        "scale": 3.5,
        "ddim_steps": 16,
        "width": 512,
        "height": 512,
        "use_sr": True,
        "return_url": False,
        "logo_info": {
            "add_logo": True,
            "position": 0,
            "language": 0,
            "opacity": 0.3,
            "logo_text_content": "求是智藏",
        },
    }

    request_handler = DouBaoRequestHandler(access_key, secret_key)
    response = request_handler.request(
        service, version, region, host, content_type, method, query, header, action, body
    )
    if response.status_code != 200:
        print(response.text)
        raise HTTPException(status_code=400, detail="Failed to generate picture")
    base64_pic = json.loads(response.text)["data"]["binary_data_base64"][0]
    return ResponseModel(data={"img": base64_pic})
