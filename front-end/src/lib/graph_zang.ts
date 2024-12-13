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

export function getByScriptureName(scriptName: string, begin: number, length: number) {
  return get(`/graph/zang/by_scripture_name?scripture_name=${scriptName}&begin=${begin}&length=${length}`);
}

export function getColophonGraph(page_size: number) {
  return get(`/graph/zang/colophon/all?page_size=${page_size}`)
}