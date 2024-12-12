# 径山藏

## 数据库运行
```bash
cd script
docker build -t jingshan .
docker run -d -p 3306:3306 --name jingshan-db -e MYSQL_ROOT_PASSWORD=你的密码 jingshan
```


## TODO
- [x]  人物知识图谱构建
- [x]  牌记知识图谱 先重新校对提取的特征
- [ ]  文生图(先找图片)
- [x]  前端招人设计
- [ ]  live2d找人画
- [ ]  RAG
- [ ]  雕塑站起来
- [x]  聊天历史管理