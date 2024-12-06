from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator

from ...internal.models.relation_database.user import User
from ...internal.utils.password import generate_jwt
from . import ResponseModel


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


class LoginParams(BaseModel):
    email: str
    password: str


class ChangePasswordParams(BaseModel):
    email: str
    old_password: str
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


class ChangeAvatar(BaseModel):
    email: str
    avatar: str


user_router = APIRouter(prefix="/user")


@user_router.post("/register")
async def register_user(params: RegisterParams):
    # 先检查是否已经存在
    user = User.get_user_by_email(params.email)
    if user is not None:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User.register(params.username, params.email, params.password)
    return ResponseModel(data={})


@user_router.post("/login")
async def login_user(params: LoginParams):
    user = User.login(params.email, params.password)
    if user[0]:
        return ResponseModel(data={"jwt": f"Bearer {generate_jwt(user[1].id)}"})
    else:
        raise HTTPException(status_code=400, detail="Login failed")


@user_router.put("/change_password")
async def change_password(params: ChangePasswordParams):
    if User.change_password(params.email, params.old_password, params.new_password):
        return ResponseModel(data={})
    else:
        raise HTTPException(status_code=400, detail="Change password failed")


# TODO:需要jwt验证
@user_router.put("/change_avatar")
async def change_avatar(params: ChangeAvatar):
    user = User.get_user_by_email(params.email)
    user.avatar = params.avatar
    return ResponseModel(data={})
