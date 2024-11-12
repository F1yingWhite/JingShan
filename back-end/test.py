import asyncio
import json
import sys

import websockets


async def test_chat_endpoint():
    uri = "ws://localhost:5001/api/chat/ws"
    try:
        async with websockets.connect(uri) as websocket:
            message = {"messages": [{"role": "user", "content": "你好"}, {"role": "assistant", "content": "你好，有什么我可以帮助的吗？"}, {"role": "user", "content": "请告诉我今天的天气"}]}
            await websocket.send(json.dumps(message))
            while True:
                try:
                    response = await websocket.recv()
                    print(f"Received: {response}")
                    sys.stdout.flush()  # 立即刷新输出
                except websockets.exceptions.ConnectionClosedOK:
                    print("Connection closed normally")
                    break
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"Connection failed with status code: {e.status_code}")


# 运行异步事件循环
asyncio.run(test_chat_endpoint())
