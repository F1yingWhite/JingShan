import ast
from collections import defaultdict
from unicodedata import category

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, conset

from ...interlal.models.graph import SPO, EntityAttributes, StringMapping
from . import ResponseModel

graph_router = APIRouter(prefix="/graph")


@graph_router.get("/")
def get_graph_by_id(id: int):
    results = SPO.get_relation_ship_by_id(id)
    res_dict = {
        "type": "force",
        "categories": [],
        "nodes": [],
        "links": [],
    }

    node_count = defaultdict(int)
    node_links = defaultdict(set)
    node_index = {}
    id_set = set()
    id_category_map = {}
    for result in results:
        subject_id = result[0].subject_id
        object_id = result[0].object_id
        id_set.add(subject_id)
        id_set.add(object_id)
        node_count[subject_id] += 1
        node_count[object_id] += 1

        node_links[subject_id].add(object_id)
        node_links[object_id].add(subject_id)

    for node_id in id_set:
        category = EntityAttributes.get_attributes_by_entity_id(node_id)
        if category != "Not Found":
            list_of_strings = ast.literal_eval(category)
        else:
            list_of_strings = ["Not Found"]
        id_category_map[node_id] = list_of_strings[0]
        res_dict["categories"].append({"name": list_of_strings[0], "keyword": {}, "base": list_of_strings[0]})
    for node_id, count in node_count.items():
        node_index[node_id] = len(res_dict["nodes"])
        res_dict["nodes"].append(
            {
                "name": next((result[1].str_value for result in results if result[0].subject_id == node_id), None)
                or next((result[3].str_value for result in results if result[0].object_id == node_id), None),
                "category": list(id_category_map.values()).index(id_category_map[node_id]),
                "symbolSize": len(node_links[node_id]) * 10,
                "label": {"show": True},
                "value": len(node_links[node_id]),
            }
        )

    for result in results:
        subject_id = result[0].subject_id
        object_id = result[0].object_id
        predicate_str_value = result[2].str_value
        res_dict["links"].append({"source": node_index[subject_id], "target": node_index[object_id], "value": predicate_str_value})

    return ResponseModel(data=res_dict)
