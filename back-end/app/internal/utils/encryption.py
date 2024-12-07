import base64

import bcrypt
import jwt
from cryptography.fernet import Fernet

from ..bootstrap import config


def encrypt_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()  # 生成盐值
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    hashed_password_str = base64.b64encode(hashed_password).decode("utf-8")
    return hashed_password_str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password_bytes = plain_password.encode("utf-8")
    # 将 Base64 编码的字符串转换回字节
    hashed_password_bytes = base64.b64decode(hashed_password)
    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)


def generate_jwt(id: int) -> str:
    payload = {"sub": id}
    return jwt.encode(payload, config.SECRET_KEY, algorithm="HS256")


def decoder_jwt(token: str) -> dict:
    return jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])


fernet = Fernet(config.SECRET_KEY)


def reversible_encrypt(data: str) -> bytes:
    encrypted_data = fernet.encrypt(data.encode())
    return encrypted_data  # 返回字节类型，不要转换成字符串

def reversible_decrypt(encrypted_data: bytes) -> str:
    decrypted_data = fernet.decrypt(encrypted_data)
    return decrypted_data.decode()


if __name__ == "__main__":
    password = "my_secure_password"
    hashed_password = encrypt_password(password)
    print(f"加密后的密码: {hashed_password}")

    is_correct = verify_password("my_secure_password", hashed_password)
    print(f"密码验证结果: {is_correct}")

    is_correct = verify_password("wrong_password", hashed_password)
    print(f"密码验证结果: {is_correct}")
