from fastapi import APIRouter
from pydantic import BaseModel

from ...interlal.models.individual import Individual
from ...interlal.utils.get_time_place import TIME_LIST, get_publication_time
from . import ResponseModel


class IndividualDetail(BaseModel):
    name: str
    content: str
    scripture_name: str
    type: str
    description: str


individual_router = APIRouter(prefix="/individuals")


@individual_router.get("/")
async def get_individuals_by_name(name: str):
    individuals = Individual.get_individuals_by_name(name)
    return ResponseModel(data=individuals)


@individual_router.get("/detail")
async def get_individuals_detail(id: int):
    individuals = Individual.get_individuals_by_id(id)
    time_cnt = dict.fromkeys(TIME_LIST, 0)
    individuals_dict = {"details": {}}
    for item in individuals:
        individuals_dict["name"] = item.name
        if item.scripture_name not in individuals_dict["details"]:
            individuals_dict["details"][item.scripture_name] = []
        individuals_dict["details"][item.scripture_name].append({"content": item.content, "type": item.type, "description": item.description})
        if (time := get_publication_time(item.content)) != "Not found":
            time_cnt[time] += 1
    has_non_zero_value = any(cnt != 0 for cnt in time_cnt.values())
    if has_non_zero_value:
        keys_to_remove = [time for time, cnt in time_cnt.items() if cnt == 0]
        for time in keys_to_remove:
            time_cnt.pop(time)
    individuals_dict["time"] = time_cnt
    return ResponseModel(data=individuals_dict)


@individual_router.get("/search")
async def search_individuals(name: str):
    individuals = Individual.search_individuals(name)
    return ResponseModel(data=individuals)
