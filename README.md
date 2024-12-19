# 径山藏

## 数据库运行
```bash
cd script
docker build -t jingshan .
docker run -d -p 3306:3306 --name jingshan-db -e MYSQL_ROOT_PASSWORD=你的密码 jingshan
```


## TODO
- [ ] 径山志文言文
- [ ] 竺阳子冯洪业/竺阳氏冯洪业 同一个人物有多个重名
- [ ] live2d小人样式以及找人绘画
- [x] not found改空
- [x] 增删改查 加祈愿
