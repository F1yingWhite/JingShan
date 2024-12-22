import asyncio
import base64
import random
from io import BytesIO

import cachetools
import yagmail
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from PIL import Image
from pydantic import BaseModel, EmailStr, field_validator

from ...internal.bootstrap import config
from ...internal.models import User
from ...internal.utils.encryption import generate_jwt, reversible_decrypt, reversible_encrypt, verify_password
from ..dependencies.user_auth import user_auth
from . import ResponseModel

ttl_cache = cachetools.TTLCache(maxsize=10000, ttl=60 * 15)


async def send_email(target_email: EmailStr, subject: str, content: str):
    sender_email: EmailStr = config.EMAIL.EMAIL
    sender_password: str = config.EMAIL.PASSWORD
    loop = asyncio.get_event_loop()

    def send_email(sender_email, sender_password, target_email, subject, content):
        with yagmail.SMTP(user=sender_email, password=sender_password, host=config.EMAIL.HOST) as yag:
            yag.send(to=target_email, subject=subject, contents=content)

    # 使用 run_in_executor 将阻塞的同步任务放到线程池中执行
    await loop.run_in_executor(None, send_email, sender_email, sender_password, target_email, subject, content)


user_router = APIRouter(prefix="/user")
auth_user_router = APIRouter(prefix="/user", dependencies=[Depends(user_auth)])


class RegisterParams(BaseModel):
    username: str
    password: str
    email: EmailStr

    # 校验密码长度、包含数字、大小写字母
    @field_validator("password")
    def validate_password(cls, password):
        if len(password) < 8:
            raise ValueError("Password length should be longer than 8")
        if not any(char.isdigit() for char in password):
            raise ValueError("Password should contain at least one digit")
        if not any(char.islower() for char in password) or not any(char.isupper() for char in password):
            raise ValueError("Password should contain both uppercase and lowercase letters")
        return password

    # 校验用户名不为空
    @field_validator("username")
    def validate_username(cls, username):
        if not username:
            raise ValueError("Username should not be empty")
        return username


@user_router.post("/register")
async def register_user(params: RegisterParams):
    # 先检查是否已经存在
    user = User.get_by_email(params.email)
    if user is not None:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User.register(params.username, params.email, params.password)
    encryption_email = base64.urlsafe_b64encode(reversible_encrypt(user.email)).decode()
    if config.DEBUG:
        verify_url = f"{config.ENV['DEBUG'].URL}api/user/verify/{encryption_email}"
    else:
        verify_url = f"{config.ENV['NODEBUG'].URL}api/user/verify/{encryption_email}"

    # 生成 HTML 内容
    content = f"""
    <html>
        <body>
            <p>请点击链接确认身份: <a href='{verify_url}'>{verify_url}</a></p>
        </body>
    </html>
    """
    await send_email(params.email, "求是智藏", content)
    return ResponseModel(data={})


@user_router.get("/verify/{token}")
async def verify_user(token: str):
    encrypted_email = base64.urlsafe_b64decode(token.encode())  # 解码
    email = reversible_decrypt(encrypted_email)  # 解密
    print(email)
    user = User.get_by_email_no_verify(email)
    if user is not None:
        user.verify()
        if config.DEBUG:
            return RedirectResponse(url=config.ENV["DEBUG"].FRONT_URL)
        else:
            return RedirectResponse(url=config.ENV["NODEBUG"].FRONT_URL)
    else:
        raise HTTPException(status_code=403, detail="Verify failed")


@user_router.get("/reset_password/code")
async def get_reset_password_code(email: str):
    user = User.get_by_email(email)
    if user:
        # 生成一个四位数的验证码
        reset_code = ""
        for _ in range(4):
            reset_code += str(random.randint(0, 9))
        ttl_cache[email] = reset_code
        content = f"""
        <html>
            <body>
                <div class="container">
                    <h1>求是智藏</h1>
                    <p>请使用以下验证码重置密码: {reset_code}, 验证码15分钟内有效</p>
                </div>
            </body>
        </html>
        """
        await send_email(email, "求是智藏", content)
        return ResponseModel(data={})
    raise HTTPException(status_code=400, detail="User not exists")


class ResetPasswordParams(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    # 校验密码长度、包含数字、大小写字母
    @field_validator("new_password")
    def validate_password(cls, password):
        if len(password) < 8:
            raise ValueError("Password length should be longer than 8")
        if not any(char.isdigit() for char in password):
            raise ValueError("Password should contain at least one digit")
        if not any(char.islower() for char in password) or not any(char.isupper() for char in password):
            raise ValueError("Password should contain both uppercase and lowercase letters")
        return password


@user_router.put("/reset_password")
async def reset_password(params: ResetPasswordParams):
    if params.email in ttl_cache and ttl_cache[params.email] == params.code:
        user = User.get_by_email(params.email)
        if user is None:
            raise HTTPException(status_code=400, detail="User not exists")
        user.change_password(params.new_password)
        return ResponseModel(data={})
    raise HTTPException(status_code=400, detail="Reset password failed")


class LoginParams(BaseModel):
    email: str
    password: str


@user_router.post("/login")
async def login_user(params: LoginParams):
    user = User.get_by_email(params.email)
    if user:
        if user.verified is False:
            raise HTTPException(status_code=400, detail="User not verified")
        if verify_password(params.password, user.password):
            return ResponseModel(
                data={
                    "jwt": generate_jwt(user.email),
                    "user": {
                        "username": user.name,
                        "email": user.email,
                        "avatar": user.avatar,
                        "privilege": user.privilege,
                    },
                }
            )
        else:
            raise HTTPException(status_code=400, detail="Login failed")
    else:
        raise HTTPException(status_code=400, detail="Login failed")


class ChangeAvatar(BaseModel):
    avatar: str


@auth_user_router.put("/change_avatar")
async def change_avatar(request: Request, params: ChangeAvatar):
    current_user = request.state.user_info
    user = User.get_by_email(current_user["sub"])
    if user is None:
        raise HTTPException(status_code=400, detail="User not exists")
    base64_str = params.avatar
    if base64_str.startswith("data:image/"):
        base64_str = base64_str.split(",")[1]

    try:
        decoded_image = base64.b64decode(base64_str)
        image = Image.open(BytesIO(decoded_image))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image format")

    # 调整图片大小为 100x100
    resized_image = image.resize((100, 100))

    buffered = BytesIO()
    resized_image.save(buffered, format="PNG")
    resized_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    final_avatar = f"data:image/png;base64,{resized_base64}"
    user.change_avatar(final_avatar)
    return ResponseModel(data={})


class ChangeUsername(BaseModel):
    username: str

    # 校验用户名不为空
    @field_validator("username")
    def validate_username(cls, username):
        if not username:
            raise ValueError("Username should not be empty")
        return username


@auth_user_router.put("/change_username")
async def change_username(request: Request, params: ChangeUsername):
    current_user = request.state.user_info
    user = User.get_by_email(current_user["sub"])
    if user is None:
        raise HTTPException(status_code=400, detail="User not exists")
    user.change_username(params.username)
    return ResponseModel(data={})


@auth_user_router.get("/info")
async def get_user_info(request: Request):
    current_user = request.state.user_info
    user = User.get_by_email(current_user["sub"])
    if user is None:
        raise HTTPException(status_code=400, detail="User not exists")
    return ResponseModel(
        data={"username": user.name, "email": user.email, "avatar": user.avatar, "privilege": user.privilege}
    )


class ChangePassword(BaseModel):
    new_password: str
    old_password: str


@auth_user_router.put("/change_password")
async def change_password(request: Request, params: ChangePassword):
    current_user = request.state.user_info
    user = User.get_by_email(current_user["sub"])
    if verify_password(params.old_password, user.password):
        user.change_password(params.new_password)
        return ResponseModel(data={})
    raise HTTPException(status_code=400, detail="Change password failed")
