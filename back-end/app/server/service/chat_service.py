import asyncio
import json
from typing import List, Literal

import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ...internal.config import config


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatQueryParams(BaseModel):
    messages: List[Message]


chat_router = APIRouter(prefix="/chat")


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
