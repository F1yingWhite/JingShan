from typing import List, Literal

from fastapi import APIRouter
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatQueryParams(BaseModel):
    messages: List[Message]


chat_router = APIRouter(prefix="/chat")


@chat_router.post("/")
async def get_chat(history: ChatQueryParams):
    return {"response": "你好，有什么我可以帮助的吗？"}
