import { get } from "@/lib/axios";

export type Graph = {
  "type": string;
  "categories":
  {
    name: string;
    keyword: {};
    base?: string;
  }[],
  "nodes":
  {
    name: string;
    category: number;
    symbolSize: number;
    value: string;
    label?: {
      show: boolean;
    }
  }[],
  "links":
  {
    source: number;
    target: number;
    value?: string;
  }[],
}


export function getGraph(name: string) {
  return get(`/graph?name=${name}`);
}

export type GraphDetail = {
  name: string;
  [key: string]: any;
}

export type GraphLists = GraphDetail[];

export function getGraphList(page: number, pageSize: number) {
  return get(`/graph/list?page=${page}&page_size=${pageSize}`);
}