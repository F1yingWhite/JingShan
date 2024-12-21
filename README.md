# 径山藏

## 数据库运行
```bash
cd script
docker build -t jingshan .
docker run -d -p 3306:3306 --name jingshan-db -e MYSQL_ROOT_PASSWORD=你的密码 jingshan
```

## 20241220 安乐禅寺会议
- [ ] 后台先记录修改信息（复核），经过确认核实后在前台显示；(√)
- [ ] 序跋里的文本会有贤度法师提取，根据其数字化文本，提取时间地点等信息；(x)
- [ ] 该银里写银、板纸银分开来写；(这里需要分栏目吗?)
- [x] 增加“梨板”数；
- [ ] 刊刻时间：顺治乙未（显示公元多少年），根据公元年份统计刻经数量；(x)
- [ ] 牌记信息中地名粒度不同需规范，https://authority.dila.edu.tw/place/ (x)
- [ ] 根据文库和图谱的功能取一个与“径山”相关的名字；(?)
- [ ] 图谱分为径山藏和径山志（可能改为径山人物），每个图谱部分在主页上显示索引（学习 cngraph），具体每个人物按照 excel 顺序调整一下，某个属性信息没有就不显示；(需要设计一下)
- [ ] 文库的标签中径山志改成径山寺，下分标签为祖师、法侣等人物按时间轴排序，(√)
- [ ] 每个人物的资料出处链接到径山志 pdf（法师发给我 压缩包）；
- [ ] 主页面的背景需要更换，突出径山藏书籍的风格，可以加上走马灯显示径山文化；(走马灯可以加)
- [ ] 具体页面里的纯白背景修改掉（尝试有色纹理背景）；(?)
- [ ] 缘起部分需要法师这边给信息；
- [x] 问答部分，数据库能查询到的信息，可以直接回答出来，若无法查找，贴上径山官网；（无害信息处理）(这里是指?)
- [ ] 序跋页的修改