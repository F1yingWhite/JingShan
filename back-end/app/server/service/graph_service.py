import ast
from math import sqrt
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ...internal.models.graph_database.graph import (
    get_identity_set,
    get_list,
    get_node_by_name,
    get_relation_ship_by_id_in,
    get_relation_ship_by_id_out,
    total_num,
)
from . import ResponseModel

graph_router = APIRouter(prefix="/graph")


@graph_router.get("/")
async def get_graph_by_name(name: str):
    res_dict = {
        "type": "force",
        "categories": [],
        "nodes": [],
        "links": [],
    }
    results_in = get_relation_ship_by_id_in(name)
    results_out = get_relation_ship_by_id_out(name)
    results = results_in + results_out
    category_set = set()
    node_map = {}
    node_category_map = {}
    for result in results:
        if result["subject_identity"] != "Not Found":
            list_of_strings = ast.literal_eval(result["subject_identity"])
        elif result["subject.姓名"] == name:
            list_of_strings = ["查询对象"]
        else:
            list_of_strings = ["Not Found"]
        category_set.add(list_of_strings[0])
        node_category_map[result["subject.姓名"]] = list_of_strings[0]
        if result["object_identity"] != "Not Found":
            list_of_strings = ast.literal_eval(result["object_identity"])
        elif result["object.姓名"] == name:
            list_of_strings = ["查询对象"]
        else:
            list_of_strings = ["Not Found"]
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


def is_literal(s):
    try:
        ast.literal_eval(s)
        return True
    except (ValueError, SyntaxError):
        return False


class GraphList(BaseModel):
    current: int
    pageSize: int
    title: Optional[str] = None


@graph_router.post("/list")
async def get_graph_list(graph_data: GraphList):
    results = get_list(graph_data.current, graph_data.pageSize, graph_data.title)
    nums = total_num(graph_data.title)
    res_dict = []
    for result in results:
        temp_dict = {}
        for key in result["n"]:
            value = result["n"][key]
            if is_literal(value):
                temp_dict[key] = ast.literal_eval(value)
            else:
                temp_dict[key] = value
        res_dict.append(temp_dict)
    return ResponseModel(data={"success": True, "total": nums[0]["count(n)"], "data": res_dict})


@graph_router.get("/detail")
async def get_graph_detail(name: str):
    results = get_node_by_name(name)
    res_dict = []
    for result in results:
        temp_dict = {}
        for key in result["n"]:
            value = result["n"][key]
            if is_literal(value):
                temp_dict[key] = ast.literal_eval(value)
            else:
                temp_dict[key] = value
        res_dict.append(temp_dict)
    return ResponseModel(data=res_dict)


@graph_router.get("/identity")
async def get_identity():
    results = get_identity_set()
    res_dict = []
    for result in results:
        res_dict.append(ast.literal_eval(result["n.身份"]))
    return ResponseModel(data=res_dict)
