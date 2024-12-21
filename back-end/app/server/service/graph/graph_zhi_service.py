from math import sqrt

from fastapi import APIRouter
from pydantic import BaseModel

from ....internal.models.graph_database.zhi_graph import (
    get_random_person,
    person_get_all_node_and_relation,
    person_get_identity_set,
    person_get_list,
    person_get_node_by_name,
    person_get_relation_ship_by_id_in,
    person_get_relation_ship_by_id_out,
    person_total_num,
)
from .. import ResponseModel

zhi_graph_router = APIRouter(prefix="/graph/zhi")


@zhi_graph_router.get("/")
async def get_graph_by_name(name: str):
    res_dict = {
        "type": "force",
        "categories": [],
        "nodes": [],
        "links": [],
    }
    results_in = person_get_relation_ship_by_id_in(name)
    results_out = person_get_relation_ship_by_id_out(name)
    results = results_in + results_out
    category_set = set()
    node_map = {}
    node_category_map = {}
    for result in results:
        if result["subject_identity"] != "-":
            list_of_strings = result["subject_identity"]
        elif result["subject.姓名"] == name:
            list_of_strings = ["查询对象"]
        else:
            list_of_strings = ["-"]
        category_set.add(list_of_strings[0])
        node_category_map[result["subject.姓名"]] = list_of_strings[0]
        if result["object_identity"] != "-":
            list_of_strings = result["object_identity"]
        elif result["object.姓名"] == name:
            list_of_strings = ["查询对象"]
        else:
            list_of_strings = ["-"]
        category_set.add(list_of_strings[0])
        node_category_map[result["object.姓名"]] = list_of_strings[0]
        node_map[result["subject.姓名"]] = node_map.get(result["subject.姓名"], 0) + 1
        node_map[result["object.姓名"]] = node_map.get(result["object.姓名"], 0) + 1

    for category in category_set:
        res_dict["categories"].append({"name": category, "keyword": {}, "base": category})
    for node, count in node_map.items():
        temp_dict = {
            "name": node,
            "category": list(category_set).index(node_category_map[node]),
            "url": "/graph/individual/" + node,
            "symbolSize": sqrt(count) * 5,
            "label": {"show": True},
            "value": count,
        }
        if node == name:
            temp_dict["center"] = True
        res_dict["nodes"].append(temp_dict)
    for result in results:
        res_dict["links"].append(
            {
                "source": next(
                    (index for index, node in enumerate(res_dict["nodes"]) if node["name"] == result["subject.姓名"]),
                    None,
                ),
                "target": next(
                    (index for index, node in enumerate(res_dict["nodes"]) if node["name"] == result["object.姓名"]),
                    None,
                ),
                "value": result["relationship"],
            }
        )
    return ResponseModel(data=res_dict)


@zhi_graph_router.get("/all")
async def get_all():
    all_node = person_get_all_node_and_relation()
    res_dict = {
        "type": "line",
        "categories": [],
        "nodes": [],
        "links": [],
    }

    category_list = {"-"}
    node_category_map = {}
    for node in all_node:
        if "身份" in node["m"]:
            category_list.add(node["m"]["身份"][0])
            node_category_map[node["m"]["姓名"]] = node["m"]["身份"][0]
        else:
            node_category_map[node["m"]["姓名"]] = "-"
        if "身份" in node["n"]:
            category_list.add(node["n"]["身份"][0])
            node_category_map[node["n"]["姓名"]] = node["n"]["身份"][0]
        else:
            node_category_map[node["n"]["姓名"]] = "-"
    category_list = list(category_list)

    # random.shuffle(category_list)
    for category in category_list:
        res_dict["categories"].append({"name": category, "keyword": {}, "base": category})
    node_map = {}
    for node in all_node:
        node_map[node["n"]["姓名"]] = node_map.get(node["n"]["姓名"], 0) + 1
        node_map[node["m"]["姓名"]] = node_map.get(node["m"]["姓名"], 0) + 1
    for node, count in node_map.items():
        temp_dict = {
            "name": node,
            "url": "/graph/individual/" + node,
            "category": list(category_list).index(node_category_map[node]),
            "symbolSize": sqrt(count) * 10,
            "label": {"show": True},
            "value": count,
        }
        res_dict["nodes"].append(temp_dict)
    for node in all_node:
        res_dict["links"].append(
            {
                "source": next(
                    (index for index, n in enumerate(res_dict["nodes"]) if n["name"] == node["n"]["姓名"]),
                    None,
                ),
                "target": next(
                    (index for index, n in enumerate(res_dict["nodes"]) if n["name"] == node["m"]["姓名"]),
                    None,
                ),
                "value": node["r"],
            }
        )
    return ResponseModel(data=res_dict)


class GraphList(BaseModel):
    current: int
    pageSize: int
    title: str | None = None
    role: str | None = None


@zhi_graph_router.post("/list")
async def get_graph_list(graph_data: GraphList):
    results = person_get_list(graph_data.current, graph_data.pageSize, graph_data.title, graph_data.role)
    nums = person_total_num(graph_data.title)
    res_dict = []
    for result in results:
        temp_dict = {}
        for key in result["n"]:
            temp_dict[key] = result["n"][key]
        res_dict.append(temp_dict)
    return ResponseModel(data={"success": True, "total": nums[0]["count(n)"], "data": res_dict})


@zhi_graph_router.get("/detail")
async def get_graph_detail(name: str):
    results = person_get_node_by_name(name)
    res_dict = []
    for result in results:
        temp_dict = {}
        for key in result["n"]:
            temp_dict[key] = result["n"][key]
        res_dict.append(temp_dict)
    return ResponseModel(data=res_dict)


@zhi_graph_router.get("/identity")
async def get_identity():
    results = person_get_identity_set()
    res_dict = []
    for result in results:
        res_dict.append(result["n.身份"])
    return ResponseModel(data=res_dict)


@zhi_graph_router.get("/random")
async def get_random():
    result = get_random_person()
    return ResponseModel(data=result)
