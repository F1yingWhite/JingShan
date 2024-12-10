from datetime import datetime

from fastapi import HTTPException, Request

from ...internal.utils.encryption import decode_jwt


async def user_auth(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing or incorrect format")
    token = token[7:]  # 去掉 "Bearer " 部分

    try:
        user_info = decode_jwt(token)
        if datetime.fromtimestamp(user_info["exp"]) < datetime.now():
            raise HTTPException(status_code=401, detail="Token expired")
        # 将 user_info 存入 request.state，后续路由可以通过 request.state.user_info 访问
        request.state.user_info = user_info
    except Exception:
        raise HTTPException(status_code=401, detail="Token missing or incorrect format")
