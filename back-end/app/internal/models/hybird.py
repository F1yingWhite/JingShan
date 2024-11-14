import ast

from sqlmodel import Session, select

from .graph_database.graph import get_list_no_page
from .relation_database import engine
from .relation_database.colophon import Colophon
from .relation_database.individual import Individual
from .relation_database.preface_and_postscript import Preface_And_Postscript


def is_literal(s):
    try:
        ast.literal_eval(s)
        return True
    except (ValueError, SyntaxError):
        return False


def hybird_search(keyword: str, current: int, pageSize: int):
    with Session(engine) as session:
        keyword_pattern = f"%{keyword}%"

        individual_query = select(Individual).where(Individual.name.like(keyword_pattern))
        preface_and_postscript_query = select(Preface_And_Postscript).where(Preface_And_Postscript.title.like(keyword_pattern))

        individual_results = list(session.exec(individual_query).all())
        preface_and_postscript_results = list(session.exec(preface_and_postscript_query).all())
        colophon_results = Colophon.search_colophon_no_page(keyword)
        graph_results = get_list_no_page(keyword)

        res_num = len(individual_results) + len(preface_and_postscript_results) + len(colophon_results) + len(graph_results)
        res_dict = {"individual": [], "preface_and_postscript": [], "colophon": [], "graph": []}
        res_dict["individual"] = individual_results[(current - 1) * pageSize : current * pageSize]
        res_dict["preface_and_postscript"] = preface_and_postscript_results[
            max(0, (current - 1) * pageSize - len(individual_results)) : max(0, current * pageSize - len(individual_results))
        ]
        colophon_list = colophon_results[
            max(0, (current - 1) * pageSize - len(individual_results) - len(preface_and_postscript_results)) : max(
                0, current * pageSize - len(individual_results) - len(preface_and_postscript_results)
            )
        ]
        for colophon in colophon_list:
            res_dict["colophon"].append(
                {
                    "scripture_name": colophon,
                    "colophon": Colophon.get_results_by_scripture_name_and_keyword(colophon, keyword),
                }
            )
        graph_list = graph_results[
            max(
                0, (current - 1) * pageSize - len(individual_results) - len(preface_and_postscript_results) - len(colophon_results)
            ) : current * pageSize - len(individual_results) - len(preface_and_postscript_results) - len(colophon_results)
        ]
        for graph in graph_list:
            temp_dict = {}
            for key in graph["n"]:
                value = graph["n"][key]
                if is_literal(value):
                    temp_dict[key] = ast.literal_eval(value)
                else:
                    temp_dict[key] = value
            res_dict["graph"].append(temp_dict)
        return res_dict, res_num
