import asyncio
import base64
import json
import uuid
from typing import List, Literal

import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import wave
import io
from ...internal.config import config
from . import ResponseModel


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


class TTSRequest(BaseModel):
    text: str


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


async def get_wav_tts_async(text: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, get_wav_tts, text)


def split_text(text: str, max_length: int):
    return [text[i : i + max_length] for i in range(0, len(text), max_length)]


def merge_wav_files(wav_files):
    output = io.BytesIO()
    with wave.open(output, 'wb') as wav_out:
        for i, wav_file in enumerate(wav_files):
            with wave.open(io.BytesIO(base64.b64decode(wav_file)), 'rb') as wav_in:
                if i == 0:
                    wav_out.setparams(wav_in.getparams())
                while True:
                    frames = wav_in.readframes(1024)
                    if not frames:
                        break
                    wav_out.writeframes(frames)
    output.seek(0)
    return base64.b64encode(output.read()).decode('utf-8')


@chat_router.post("/tts")
async def tts(request: TTSRequest):
    texts = split_text(request.text, 250)
    tasks = [get_wav_tts_async(text) for text in texts]

    wav_data_list = await asyncio.gather(*tasks)
    combined_wav_data = merge_wav_files(wav_data_list)

    return ResponseModel(data=combined_wav_data)
