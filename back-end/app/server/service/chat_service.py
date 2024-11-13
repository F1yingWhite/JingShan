import asyncio
import json
import uuid
from typing import List, Literal

import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ...internal.config import config
from . import ResponseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatQueryParams(BaseModel):
    messages: List[Message]


chat_router = APIRouter(prefix="/chat")


def get_wav_tts(text: str):
    header = {"Authorization": f"Bearer;{config.VOLCENGINE_TOKEN}"}
    request_json = {
        "app": {"appid": config.VOLCENGINE_APPID, "token": "access_token", "cluster": config.VOLCENGINE_CLUSTER},
        "user": {"uid": str(uuid.uuid4())},
        "audio": {
            "voice_type": config.VOLCENGINE_VOICE_TYPE,
            "encoding": "wav",
            "speed_ratio": 1.0,
            "volume_ratio": 1.0,
            "pitch_ratio": 1.0,
        },
        "request": {
            "reqid": str(uuid.uuid4()),
            "text": text,
            "text_type": "plain",
            "operation": "query",
            "with_frontend": 1,
            "frontend_type": "unitTson",
        },
    }
    resp = requests.post(config.VOLCENGINE_URL, json.dumps(request_json), headers=header)
    if "data" in resp.json():
        data = resp.json()["data"]
        return data


@chat_router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            messages = data["messages"]
            data = {"model": config.SPARKAI_DOMAIN, "messages": messages, "stream": True}
            header = {"Authorization": "Bearer " + config.SPARKAI_PASSWORD}
            response = requests.post(url=config.SPARKAI_URL, headers=header, json=data, stream=True)
            response.encoding = "utf-8"
            for line in response.iter_lines(decode_unicode="utf-8"):
                if line.startswith("data:"):
                    line = line[len("data:") :].strip()
                if line:
                    if line == "[DONE]":
                        await websocket.close()
                        return
                    try:
                        data = json.loads(line)
                        content = data["choices"][0]["delta"]["content"]
                        await websocket.send_text(content)
                        await asyncio.sleep(0)  # 确保每条消息立即发送
                    except json.JSONDecodeError as e:
                        print(f"JSONDecodeError: {e} - Line: {line}")

    except WebSocketDisconnect:
        await websocket.close()


class TTSRequest(BaseModel):
    text: str


@chat_router.post("/tts")
async def tts(request: TTSRequest):
    data = get_wav_tts(request.text)
    return ResponseModel(data=data)
