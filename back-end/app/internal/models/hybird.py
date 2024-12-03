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

        preface_and_postscript_results = Preface_And_Postscript.search_preface_and_postscript_classic_no_page(keyword)

        colophon_results = Colophon.search_colophon_no_page(keyword)

        graph_results = person_get_list_no_page(keyword)

        res_num = (
            len(individual_results) + len(preface_and_postscript_results) + len(colophon_results) + len(graph_results)
        )
        res_dict = {
            "individual": [],
            "preface_and_postscript": [],
            "colophon": [],
            "graph": [],
        }
        res_dict["individual"] = individual_results[(current - 1) * pageSize : current * pageSize]

        preface_and_postscript_classic_list = preface_and_postscript_results[
            max(0, (current - 1) * pageSize - len(individual_results)) : max(
                0, current * pageSize - len(individual_results)
            )
        ]
        print(preface_and_postscript_classic_list)
        for preface_and_postscript_classic in preface_and_postscript_classic_list:
            res_dict["preface_and_postscript"].append(
                {
                    "name": preface_and_postscript_classic,
                    "related_data": Preface_And_Postscript.get_preface_and_postscript_by_classic(
                        preface_and_postscript_classic, keyword
                    ),
                }
            )

        colophon_list = colophon_results[
            max(
                0,
                (current - 1) * pageSize - len(individual_results) - len(preface_and_postscript_results),
            ) : max(
                0,
                current * pageSize - len(individual_results) - len(preface_and_postscript_results),
            )
        ]
        for colophon in colophon_list:
            res_dict["colophon"].append(
                {
                    "name": colophon,
                    "related_data": Colophon.get_results_by_scripture_name_and_keyword(colophon, keyword),
                }
            )
        graph_list = graph_results[
            max(
                0,
                (current - 1) * pageSize
                - len(individual_results)
                - len(preface_and_postscript_results)
                - len(colophon_results),
            ) : current * pageSize
            - len(individual_results)
            - len(preface_and_postscript_results)
            - len(colophon_results)
        ]
        for graph in graph_list:
            temp_dict = {}
            for key in graph["n"]:
                temp_dict[key] = graph["n"][key]
            res_dict["graph"].append(temp_dict)
        return res_dict, res_num
