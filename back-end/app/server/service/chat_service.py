import asyncio
import base64
import io
import json
import uuid
import wave

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket
from pydantic import BaseModel

from ...internal.bootstrap import config
from ...internal.models import Chat_History
from ..dependencies.user_auth import user_auth
from . import ResponseModel
from ...internal.utils.llm_chat import process_websocket_data

chat_router = APIRouter(prefix="/chat")
auth_chat_router = APIRouter(prefix="/chat", dependencies=[Depends(user_auth)])


@chat_router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_json()
    await process_websocket_data(websocket, data)


class TTSRequest(BaseModel):
    text: str


def get_wav_tts(text: str):
    header = {"Authorization": f"Bearer;{config.VOLCENGINE.TOKEN}"}
    request_json = {
        "app": {"appid": config.VOLCENGINE.APPID, "token": "access_token", "cluster": config.VOLCENGINE.CLUSTER},
        "user": {"uid": str(uuid.uuid4())},
        "audio": {
            "voice_type": config.VOLCENGINE.VOICE_TYPE,
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
    resp = requests.post(config.VOLCENGINE.URL, json.dumps(request_json), headers=header)
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
    with wave.open(output, "wb") as wav_out:
        for i, wav_file in enumerate(wav_files):
            with wave.open(io.BytesIO(base64.b64decode(wav_file)), "rb") as wav_in:
                if i == 0:
                    wav_out.setparams(wav_in.getparams())
                while True:
                    frames = wav_in.readframes(1024)
                    if not frames:
                        break
                    wav_out.writeframes(frames)
    output.seek(0)
    return base64.b64encode(output.read()).decode("utf-8")


@chat_router.post("/tts")
async def tts(request: TTSRequest):
    texts = split_text(request.text, 250)
    tasks = [get_wav_tts_async(text) for text in texts]

    wav_data_list = await asyncio.gather(*tasks)
    combined_wav_data = merge_wav_files(wav_data_list)

    return ResponseModel(data=combined_wav_data)


@auth_chat_router.get("/history")
async def get_chat_history(request: Request):
    user_info = request.state.user_info
    items = Chat_History.get_history_title_by_email(user_info["sub"])
    return ResponseModel(data=items)


@auth_chat_router.get("/history/length")
async def get_chat_history_length(request: Request):
    user_info = request.state.user_info
    res = Chat_History.get_history_length_by_email(user_info["sub"])
    return ResponseModel(data={"length": res})


@auth_chat_router.get("/history/{id}")
async def get_chat_history_by_id(id: int, request: Request):
    res = Chat_History.get_history_by_id(id)
    if res is None:
        raise HTTPException(status_code=400, detail="未找到对应历史记录")
    user_info = request.state.user_info
    if res.email != user_info["sub"]:
        raise HTTPException(status_code=403, detail="无权访问")
    return ResponseModel(data=res.history)


@auth_chat_router.delete("/history/{id}")
async def delete_chat_history_by_id(id: int, request: Request):
    user_info = request.state.user_info
    res = Chat_History.get_history_by_id(id)
    if res is None:
        raise HTTPException(status_code=400, detail="未找到对应历史记录")
    if res.email != user_info["sub"]:
        raise HTTPException(status_code=403, detail="无权访问")
    res.delete()
    return ResponseModel(data={})


class ChangeTitle(BaseModel):
    title: str


@auth_chat_router.put("/history/{id}")
async def update_title_by_id(id: int, request: Request, title: ChangeTitle):
    user_info = request.state.user_info
    res = Chat_History.get_history_by_id(id)
    if res is None:
        raise HTTPException(status_code=400, detail="未找到对应历史记录")
    if res.email != user_info["sub"]:
        raise HTTPException(status_code=403, detail="无权访问")
    res.update(history=None, title=title.title)
    return ResponseModel(data={})
