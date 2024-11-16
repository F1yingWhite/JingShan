import asyncio
import base64
import io
import json
import re
import uuid
import wave
from typing import List, Literal

import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ...internal.config import config
from ...internal.models.graph_database.graph import execute_cypher
from . import ResponseModel


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatQueryParams(BaseModel):
    messages: List[Message]


chat_router = APIRouter(prefix="/chat")

SYSTEM_MESSAGE = {"role": "system", "content": "现在你是一个小和尚,能够根据知识图谱返回的信息专门为外人介绍径山寺"}
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
人名规范资料库	["http://authority.dila.edu.tw/person/?fromInner=A008721"]
具戒时间	["二十一岁于荆州果愿寺受戒"]
别名	["道林", "香光", "鸟窠禅师", "鹊巢和尚", "圆修禅师"]
卒年	[8240318]
姓名	鸟窼道林禅师
开悟记述	["诣长安属代宗，诏国一禅师，至阙师乃谒之，遂得正法。"]
报龄	[84]
朝代	["唐"]
法语	["元和中，白居易侍郎出守杭州，因入山谒师，问：「口禅师住处甚危险。」师曰：「太守危险尤甚。」白曰：「弟子位镇江山，何险之有？」师曰：「薪火相交，识性不停，得非险乎！」又问：「如何是佛法大意？」师曰：「诸恶莫作，众善奉行。」白曰：「三岁孩儿也解，恁么道？」师曰：「三岁孩儿虽道得，八十岁老人行不得。」白作礼而退。"]
生年	[741]
籍贯	["本郡富阳人"]
资料出处	["《径山志》卷三"]
身份	["法侣"]
```

# 关系三元组
[人物 关系类型 人物]

# 要求
请你根据我接下来的问题给出对应的neo4j查询语句，neo4j语句需包含在```cypher```代码块中,如果我的语句不包含问题,那么随便回答些什么
""",  # noqa: E501
}


def get_spark_once(message: List[Message]):
    data = {"model": config.SPARKAI_DOMAIN, "messages": message, "stream": True}
    header = {"Authorization": "Bearer " + config.SPARKAI_PASSWORD}
    response = requests.post(url=config.SPARKAI_URL, headers=header, json=data, stream=True)
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


def get_query(messages: ChatQueryParams):
    messages = [GRAPH_MESSAGE] + [message.model_dump() for message in messages.messages]
    response = get_spark_once(messages)
    # 使用正则匹配出cypher语句
    cypher_pattern = re.compile(r"```cypher(.*?)```", re.DOTALL)
    match = cypher_pattern.search(response)

    if match:
        cypher = match.group(1).strip()
        print(cypher)
        return execute_cypher(cypher)
    else:
        return None


@chat_router.post("/query")
async def query(messages: ChatQueryParams):
    response = get_query(messages)
    return ResponseModel(data=response)


@chat_router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            messages = data["messages"]
            messages = [SYSTEM_MESSAGE] + messages
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
