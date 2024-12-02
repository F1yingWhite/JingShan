from fastapi import APIRouter, HTTPException

from ...internal.models.relation_database.individual import Individual
from ...internal.utils.get_time_place import (
    TIME_LIST,
    get_latitude_and_longitude,
    get_publication_place,
    get_publication_time,
)
from . import ResponseModel

individual_router = APIRouter(prefix="/individuals")


@individual_router.get("/all")
async def get_all_individuals(page: int, pageSize: int, title: str):
    individuals, count = Individual.get_all_individuals(page, pageSize, title)
    res = {"data": {"data": individuals, "total": count}}
    return ResponseModel(data=res)


@individual_router.get("/")
async def get_individuals_by_name(name: str):
    individuals = Individual.get_individuals_by_name(name)
    return ResponseModel(data=individuals)


@individual_router.get("/detail")
async def get_individuals_detail(id: int):
    individuals = Individual.get_individuals_by_id(id)
    time_cnt = dict.fromkeys(TIME_LIST, 0)
    individuals_dict = {"details": {}}
    place_dict = {}
    for item in individuals:
        individuals_dict["name"] = item.name
        if item.scripture_name not in individuals_dict["details"]:
            individuals_dict["details"][item.scripture_name] = []
        individuals_dict["details"][item.scripture_name].append(
            {"content": item.content, "type": item.type, "place": item.place, "colophon_id": item.col_id}
        )
        place = get_publication_place(item.content)
        if place != "Not found":
            if place not in place_dict:
                place_dict[place] = 1
            place_dict[place] += 1
        if (time := get_publication_time(item.content)) != "Not found":
            time_cnt[time] += 1

    has_non_zero_value = any(cnt != 0 for cnt in time_cnt.values())
    if has_non_zero_value:
        keys_to_remove = [time for time, cnt in time_cnt.items() if cnt == 0]
        for time in keys_to_remove:
            time_cnt.pop(time)
    individuals_dict["time"] = time_cnt
    id = 1
    individuals_dict["place"] = {"type": "FeatureCollection", "features": []}
    for place, cnt in place_dict.items():
        individuals_dict["place"]["features"].append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": get_latitude_and_longitude(place)},
                "properties": {"name": place, "count": cnt, "id": id},
            }
        )
        id += 1
    return ResponseModel(data=individuals_dict)


@individual_router.get("/search")
async def search_individuals(name: str):
    if not name:
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
    individuals = Individual.search_individuals(name)
    return ResponseModel(data=individuals)
