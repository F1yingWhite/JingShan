from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...internal.models import Ind_Col
from ...internal.models import Individual
from ...internal.utils.get_time_place import (
    TIME_LIST,
    get_latitude_and_longitude,
    get_publication_place,
    get_publication_time,
)
from . import ResponseModel

individual_router = APIRouter(prefix="/individuals")


class IndividualQueryParams(BaseModel):
    name: str | None = None


@individual_router.post("/")
async def get_all_individuals(page: int, pageSize: int, params: IndividualQueryParams):
    individuals, count = Individual.get_all_individuals(page, pageSize, params.name)
    return ResponseModel(data={"data": individuals, "total": count})


@individual_router.get("/detail")
async def get_individuals_detail(id: int):
    individuals = Individual.get_by_id_with_related(id)
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


@individual_router.get("/random")
async def get_random_individuals(size: int):
    individuals = Individual.get_random_individuals(size)
    for i, individual in enumerate(individuals):
        individuals[i] = {"name": individual.name, "url": "/individual/" + str(individual.id)}
    return ResponseModel(data={"data": individuals})


@individual_router.get("/works")
async def get_individuals_works(key: str | None = None):
    works = Ind_Col.get_works_type(key)
    return ResponseModel(data=works)


@individual_router.get("/places")
async def get_individuals_places(key: str | None = None):
    works = Ind_Col.get_works_place(key)
    return ResponseModel(data=works)


class IndividualHybridQueryParams(BaseModel):
    works: list[str] = []
    places: list[str] = []
    name: str | None = None


@individual_router.post("/hybrid")
async def get_individuals_hybrid(page: int, page_size: int, params: IndividualHybridQueryParams):
    individuals, count = Individual.get_individuals_hybrid(page, page_size, params.name, params.works, params.places)
    return ResponseModel(data={"data": individuals, "total": count})
