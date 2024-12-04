from fastapi import APIRouter

from ....internal.models.graph_database.zang_graph import (
    get_by_scripture_name_with_colophon,
    get_colophon_with_person,
    get_colophon_with_related_data,
)
from .. import ResponseModel

zang_graph_router = APIRouter(prefix="/graph/zang")


# TODO:后续考虑封装组成graph的为一个特定函数避免多次复写
@zang_graph_router.get("/by_scripture_name")
async def get_graph_by_scripture_name(scripture_name: str, begin: int, length: int):  # noqa: C901
    res_dict = {
        "type": "force",
        "categories": [],
        "nodes": [],
        "links": [],
    }
    res = get_by_scripture_name_with_colophon(scripture_name)
    if len(res) == 0:
        return ResponseModel(data=res_dict)
    category_list = ["牌记", "卷数", "时间", "地点", "寺庙", "人物"]
    for category in category_list:
        res_dict["categories"].append({"name": category, "keyword": {}, "base": category})
    nodes = [{"name": scripture_name, "type": "牌记", "url": "/graph/scripture/" + scripture_name}]
    links = []
    total_len = len(res)
    res = res[begin : begin + length]
    for i in res:
        colophon = i["related"]["chapter_id"]
        if not any(link for link in links if link["source"] == colophon and link["target"] == scripture_name):
            links.append({"source": colophon, "target": scripture_name, "value": "牌记"})
        if not any(node for node in nodes if node["name"] == i["related"]["chapter_id"]):
            nodes.append(
                {"name": i["related"]["chapter_id"], "type": "卷数", "url": "/colophon/" + str(i["related"]["id"])}
            )

        related_datas = get_colophon_with_related_data(i["related"]["content"])
        for related_data in related_datas:
            if related_data["relationship_type"] == "PLACE":
                if not any(
                    link
                    for link in links
                    if link["source"] == colophon and link["target"] == related_data["related"]["name"]
                ):
                    links.append({"source": related_data["related"]["name"], "target": colophon, "value": "地点"})
                if not any(node for node in nodes if node["name"] == related_data["related"]["name"]):
                    nodes.append({"name": related_data["related"]["name"], "type": "地点"})
            elif related_data["relationship_type"] == "TIME":
                if not any(
                    link
                    for link in links
                    if link["source"] == colophon and link["target"] == related_data["related"]["name"]
                ):
                    links.append({"source": related_data["related"]["name"], "target": colophon, "value": "时间"})
                if not any(node for node in nodes if node["name"] == related_data["related"]["name"]):
                    nodes.append({"name": related_data["related"]["name"], "type": "时间"})
            elif related_data["relationship_type"] == "TEMPLE":
                if not any(
                    link
                    for link in links
                    if link["source"] == colophon and link["target"] == related_data["related"]["name"]
                ):
                    links.append({"source": related_data["related"]["name"], "target": colophon, "value": "寺庙"})
                if not any(node for node in nodes if node["name"] == related_data["related"]["name"]):
                    nodes.append({"name": related_data["related"]["name"], "type": "寺庙"})

        # 再查人物
        related_persons = get_colophon_with_person(i["related"]["content"])
        for person in related_persons:
            if not any(
                link for link in links if link["source"] == colophon and link["target"] == person["related"]["name"]
            ):
                links.append(
                    {
                        "source": person["related"]["name"],
                        "target": colophon,
                        "value": person["place"] + "-" + person["type"],
                    }
                )
            if not any(node for node in nodes if node["name"] == person["related"]["name"]):
                nodes.append(
                    {
                        "name": person["related"]["name"],
                        "type": "人物",
                        "url": "/individual/" + str(person["related"]["id"]),
                    }
                )
    for node in nodes:
        new_node = {
            "name": node["name"],
            "category": category_list.index(node["type"]),
            "label": {"show": True},
            "value": 1,
        }
        if "url" in node:
            new_node["url"] = node["url"]
        res_dict["nodes"].append(new_node)
    for link in links:
        res_dict["links"].append(
            {
                "source": next(
                    (index for index, node in enumerate(res_dict["nodes"]) if node["name"] == link["source"]),
                    None,
                ),
                "target": next(
                    (index for index, node in enumerate(res_dict["nodes"]) if node["name"] == link["target"]),
                    None,
                ),
                "value": link["value"],
            }
        )
    # 更新节点的value为出入度的总和,并更改节点的symbolSize,逻辑为节点的symbolSize = sqrt(节点的value) * 5
    for node in res_dict["nodes"]:
        node["value"] = sum(
            link["source"] == res_dict["nodes"].index(node) or link["target"] == res_dict["nodes"].index(node)
            for link in res_dict["links"]
        )
        node["symbolSize"] = 10.0 * node["value"] ** 0.5
    return ResponseModel(data={"graph": res_dict, "total": total_len})
