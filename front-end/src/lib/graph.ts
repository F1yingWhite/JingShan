import { get, post } from "@/lib/axios";

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
    },
    center?: boolean
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
  姓名: string;
  [key: string]: any;
}


export type GraphLists = GraphDetail[];

export function getGraphList(params: any) {
  return post(`/graph/list`, params);
}

export function getGraphDetailByName(name: string) {
  return get(`/graph/detail?name=${name}`);
}

export function getIdentityList() {
  return get(`/graph/identity`);
}