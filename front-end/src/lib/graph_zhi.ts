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
    url?: string;
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

export function getAllGraph() {
  return get(`/graph/zhi/all`);
}

export function getGraphByName(name: string) {
  return get(`/graph/zhi?name=${name}`);
}

export type GraphDetail = {
  姓名: string;
  [key: string]: any;
}


export type GraphLists = GraphDetail[];

export function getGraphList(params: any) {
  if (params.role === "全部") {
    delete params.role;
  }
  return post(`/graph/zhi/list`, params);
}

export function getGraphDetailByName(name: string) {
  return get(`/graph/zhi/detail?name=${name}`);
}

export function getIdentityList() {
  return get(`/graph/zhi/identity`);
}

export function getRandomPerson() {
  return get(`/graph/zhi/random`);
}