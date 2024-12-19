from sqlmodel import Session, select

from .graph_database.zhi_graph import person_get_list_no_page
from .relation_database import engine
from .relation_database.colophon import Colophon
from .relation_database.individual import Individual
from .relation_database.preface_and_postscript import Preface_And_Postscript


def hybird_search(keyword: str, current: int, pageSize: int):
    with Session(engine) as session:
        keyword_pattern = f"%{keyword}%"
        individual_query = select(Individual).where(Individual.name.like(keyword_pattern))
        individual_results = list(session.exec(individual_query).all())
        preface_and_postscript_results = Preface_And_Postscript.search_by_classic(keyword)

        colophon_results = Colophon.search_by_content_no_page(keyword)

        graph_results = person_get_list_no_page(keyword)

        res_list = []
        for i in individual_results:
            res_list.append({"type": "individual", "data": i})
        for i in preface_and_postscript_results:
            res_list.append({"type": "preface_and_postscript", "data": i})
        for i in colophon_results:
            res_list.append({"type": "colophon", "data": i})
        for i in graph_results:
            res_list.append({"type": "graph", "data": i})

        res_num = len(res_list)
        res_dict = {
            "individual": [],
            "preface_and_postscript": [],
            "colophon": [],
            "graph": [],
        }
        if (current - 1) * pageSize > res_num:
            res_list = []
        elif current * pageSize > res_num:
            res_list = res_list[(current - 1) * pageSize :]
        else:
            res_list = res_list[(current - 1) * pageSize : current * pageSize]
        for res in res_list:
            if res["type"] == "individual":
                res_dict["individual"].append(res["data"])
            elif res["type"] == "preface_and_postscript":
                res_dict["preface_and_postscript"].append(
                    {
                        "name": res["data"],
                        "related_data": Preface_And_Postscript.get_by_classic_and_title(res["data"], keyword),
                    }
                )
            elif res["type"] == "colophon":
                res_dict["colophon"].append(
                    {
                        "name": res["data"],
                        "related_data": Colophon.get_by_scripture_name_and_content(res["data"], keyword),
                    }
                )
            elif res["type"] == "graph":
                temp_dict = {}
                for key in res["data"]["n"]:
                    temp_dict[key] = res["data"]["n"][key]
                res_dict["graph"].append(temp_dict)
        return res_dict, res_num
