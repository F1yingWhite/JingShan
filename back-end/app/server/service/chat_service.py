import asyncio
import base64
import io
import json
import re
import uuid
import wave
from typing import Any, Literal

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ...internal.bootstrap import config
from ...internal.models.graph_database import execute_cypher
from ...internal.models.relation_database.chat_history import Chat_History
from ...internal.utils.encryption import decode_jwt
from ..dependencies.user_auth import user_auth
from . import ResponseModel


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatQueryParams(BaseModel):
    messages: list[Message]


chat_router = APIRouter(prefix="/chat")
auth_chat_router = APIRouter(prefix="/chat", dependencies=[Depends(user_auth)])

SYSTEM_MESSAGE = {"role": "system", "content": "现在你是一个在径山寺修行的小和尚"}
GRAPH_MESSAGE = {
    "role": "system",
    "content": """
你现在是一个neo4j数据库查询高手,现在有一个径山藏人物关系图数据库
# 所有实体结构：
```
人物(姓名,身份,开悟记述,世代,人名规范资料库,修法,僧腊,别名,卒年,备注,报龄,朝代,法语,生平史传,生年,籍贯,资料出处)
```
注意,除了姓名字段其他都不一定有,一个实例如下:
```
  "labels": [
    "人物"
  ],
  "properties": {
    "资料出处": ["《径山志》卷三"],
    "身份": ["法侣"],
    "卒年": [8240318],
    "别名": ["道林", "香光", "鸟窠禅师", "鹊巢和尚", "圆修禅师"],
    "朝代": ["唐"],
    "籍贯": ["本郡富阳人"],
    "人名规范资料库": "["http://authority.dila.edu.tw/person/?fromInner=A008721"],
    "姓名": "鸟窼道林禅师",
    "报龄": [84],
    "开悟记述": ["诣长安属代宗，诏国一禅师，至阙师乃谒之，遂得正法。"],
    "法语": ["元和中，白居易侍郎出守杭州，因入山谒师，问：「口禅师住处甚危险。」师曰：「太守危险尤甚。」白曰：「弟子位镇江山，何险之有？」师曰：「薪火相交，识性不停，得非险乎！」又问：「如何是佛法大意？」师曰：「诸恶莫作，众善奉行。」白曰：「三岁孩儿也解，恁么道？」师曰：「三岁孩儿虽道得，八十岁老人行不得。」白作礼而退。"],
    "生年": [741],
    "具戒时间": ["二十一岁于荆州果愿寺受戒"]
  },
```


# 关系三元组
[人物 r 人物]

# 要求
请你根据我接下来的问题给出对应的neo4j查询语句，neo4j语句需包含在```cypher```代码块中,如果我的语句不包含问题,那么随便回答些什么
""",  # noqa: E501
}


def get_spark_once(message: list[Message]):
    data = {
        "model": config.SPARKAI.DOMAIN,
        "messages": message,
        "stream": True,
        "max_tokens": 8192,
        "tools.web_search": {"enable": False},
    }
    header = {"Authorization": "Bearer " + config.SPARKAI.PASSWORD}
    response = requests.post(url=config.SPARKAI.URL, headers=header, json=data, stream=True)
    response.encoding = "utf-8"
    total_response = ""
    for line in response.iter_lines(decode_unicode="utf-8"):
        if line.startswith("data:"):
            line = line[len("data:") :].strip()
        if line:
            if line == "[DONE]":
                return total_response
            try:
                data = json.loads(line)
                total_response += data["choices"][0]["delta"]["content"]
            except json.JSONDecodeError as e:
                print(f"JSONDecodeError: {e} - Line: {line}")


def get_query(messages: list[Message]):
    messages = [GRAPH_MESSAGE] + messages
    response = get_spark_once(messages)
    print(response)
    # 使用正则匹配出cypher语句
    cypher_pattern = re.compile(r"```cypher(.*?)```", re.DOTALL)
    match = cypher_pattern.search(response)

    if match:
        cypher = match.group(1).strip()
        return execute_cypher(cypher)
    else:
        return None


async def process_websocket_data(websocket: WebSocket, data: dict):
    messages = data["messages"]
    print(messages)
    jwt = data.get("jwt")
    # 非登录状态下,不需要更新
    history = None
    if jwt is not None:
        user_info = decode_jwt(jwt)
        id = data.get("id")
        if id is not None:
            history = Chat_History.get_history_by_id(id)
            if history is None or history.email != user_info["sub"]:
                await websocket.close()
        else:
            history = Chat_History.generate_new_history(user_info["sub"])
            history.update(history=None, title=messages[0]["content"])
            content = "[CHAT_ID]:" + str(history.id)
            await websocket.send_text(content)
            await asyncio.sleep(0)  # 确保每条消息立即发送
    messages_with_system = [SYSTEM_MESSAGE] + messages
    cypher_data: list[dict[str, Any]] | None = get_query(messages)
    has_cypher = False
    if cypher_data:
        cypher_data = json.dumps(cypher_data, ensure_ascii=False)
        while len(cypher_data) > 4096:
            cypher_data = cypher_data[cypher_data.find("}") + 1 :]
        messages_with_system.append(
            {
                "role": "user",
                "content": "上面的问题从数据库中查询得到的结果如下,请你将他组织为一段话" + cypher_data,
            }
        )
        has_cypher = True
    await send_response(websocket, messages_with_system, history, has_cypher)


async def send_response(websocket: WebSocket, messages: list, history: Chat_History, has_cypher: bool):
    data = {
        "model": config.SPARKAI.DOMAIN,
        "messages": messages,
        "stream": True,
        "presence_penalty": 1,
        "max_tokens": 8192,
    }
    header = {"Authorization": "Bearer " + config.SPARKAI.PASSWORD}
    response = requests.post(url=config.SPARKAI.URL, headers=header, json=data, stream=True)
    response.encoding = "utf-8"
    res = ""
    for line in response.iter_lines(decode_unicode="utf-8"):
        if line.startswith("data:"):
            line = line[len("data:") :].strip()
        if line:
            if line == "[DONE]":
                await websocket.close()
                if history is not None:
                    if has_cypher:
                        messages = messages[1:-1]
                    else:
                        messages = messages[1:]
                    messages.append({"role": "assistant", "content": res})
                    history.update(messages, title=None)
                return
            try:
                data = json.loads(line)
                content = data["choices"][0]["delta"]["content"]
                res += content
                await websocket.send_text(content)
                await asyncio.sleep(0)  # 确保每条消息立即发送
            except json.JSONDecodeError as e:
                print(f"JSONDecodeError: {e} - Line: {line}")


@chat_router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            await process_websocket_data(websocket, data)
    except WebSocketDisconnect:
        await websocket.close()


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
