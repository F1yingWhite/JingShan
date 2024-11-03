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


export function getGraph(id: number) {
  return get(`/graph?id=${id}`);
}