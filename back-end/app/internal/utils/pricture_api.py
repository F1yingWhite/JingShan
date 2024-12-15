import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

import requests


class DouBaoRequestHandler:
    def __init__(self, access_key, secret_key):
        self.access_key = access_key
        self.secret_key = secret_key

    def request(self, service, version, region, host, content_type, method, query, header, action, body):
        # 第二步：创建身份证明。其中的Service和Region字段是固定的。ak和sk分别代表
        # AccessKeyID和SecretAccessKey。同时需要初始化签名结构体。一些签名计算时需要的属性也在这里处理。
        # 初始化身份证明结构体
        credential = {
            "accessKeyId": self.access_key,
            "secretKeyId": self.secret_key,
            "service": service,
            "region": region,
        }

        # 初始化签名结构体
        query.update({"Action": action, "Version": version})
        query = dict(sorted(query.items()))
        request_param = {
            # body是http请求需要的原生body
            "body": body,
            "host": host,
            "path": "/",
            "method": method,
            "contentType": content_type,
            "date": time.strftime("%Y%m%dT%H%M%SZ", time.gmtime()),
            "query": query,
        }

        # 第三步：接下来开始计算签名。在计算签名前，先准备好用于接收签算结果的signResult变量，并设置一些参数。
        # 初始化签名结果的结构体
        x_date = request_param["date"]
        short_x_date = x_date[:8]
        # 将body转换为JSON字符串后再计算哈希值
        body_str = json.dumps(request_param["body"]) if request_param["body"] else ""
        x_content_sha256 = hashlib.sha256(body_str.encode("utf-8")).hexdigest() if body_str else ""
        sign_result = {
            "Host": request_param["host"],
            "X-Content-Sha256": x_content_sha256,
            "X-Date": x_date,
            "Content-Type": request_param["contentType"],
        }

        # 第四步：计算Signature签名。
        signed_header_str = ";".join(["content-type", "host", "x-content-sha256", "x-date"])
        canonical_request_str = "\n".join(
            [
                request_param["method"],
                request_param["path"],
                urlencode(request_param["query"]),
                "\n".join(
                    [
                        f'content-type:{request_param["contentType"]}',
                        f'host:{request_param["host"]}',
                        f"x-content-sha256:{x_content_sha256}",
                        f"x-date:{x_date}",
                    ]
                ),
                "",
                signed_header_str,
                x_content_sha256,
            ]
        )
        hashed_canonical_request = hashlib.sha256(canonical_request_str.encode("utf-8")).hexdigest()
        credential_scope = "/".join([short_x_date, credential["region"], credential["service"], "request"])
        string_to_sign = "\n".join(["HMAC-SHA256", x_date, credential_scope, hashed_canonical_request])
        k_date = hmac.new(
            credential["secretKeyId"].encode("utf-8"), short_x_date.encode("utf-8"), hashlib.sha256
        ).digest()
        k_region = hmac.new(k_date, credential["region"].encode("utf-8"), hashlib.sha256).digest()
        k_service = hmac.new(k_region, credential["service"].encode("utf-8"), hashlib.sha256).digest()
        k_signing = hmac.new(k_service, "request".encode("utf-8"), hashlib.sha256).digest()
        signature = hmac.new(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
        sign_result["Authorization"] = (
            f"HMAC-SHA256 Credential={credential['accessKeyId']}/{credential_scope}, "
            f"SignedHeaders={signed_header_str}, Signature={signature}"
        )
        header.update(sign_result)

        # 第五步：将Signature签名写入HTTP Header中，并发送HTTP请求。
        url = f"https://{request_param['host']}{request_param['path']}"
        response = requests.request(
            method=request_param["method"],
            url=url,
            headers=header,
            params=request_param["query"],
            data=json.dumps(request_param["body"]) if request_param["body"] else None,
        )
        return response
