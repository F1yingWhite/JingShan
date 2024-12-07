from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator

from ...internal.models.relation_database.user import User
from ...internal.utils.password import generate_jwt, verify_password
from . import ResponseModel

user_router = APIRouter(prefix="/user")


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
    user = User.get_user_by_email(params.email)
    if user is not None:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User.register(params.username, params.email, params.password)
    return ResponseModel(data={})


class LoginParams(BaseModel):
    email: str
    password: str


@user_router.post("/login")
async def login_user(params: LoginParams):
    user = User.get_user_by_email(params.email)
    if user:
        if user.verified is False:
            raise HTTPException(status_code=400, detail="User not verified")
        if verify_password(params.password, user.password):
            return ResponseModel(data={"jwt": f"Bearer {generate_jwt(user.id)}"})
    else:
        raise HTTPException(status_code=400, detail="Login failed")


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


@user_router.put("/change_password")
async def change_password(params: ChangePasswordParams):
    user = User.get_user_by_email(params.email)
    if user:
        if user.verified is False:
            raise HTTPException(status_code=400, detail="User not verified")
        if verify_password(params.old_password, user.password):
            user.change_password(params.new_password)
            return ResponseModel(data={})
    raise HTTPException(status_code=400, detail="Change password failed")


class ChangeAvatar(BaseModel):
    email: str
    avatar: str


# TODO:需要jwt验证
@user_router.put("/change_avatar")
async def change_avatar(params: ChangeAvatar):
    user = User.get_user_by_email(params.email)
    user.avatar = params.avatar
    return ResponseModel(data={})
