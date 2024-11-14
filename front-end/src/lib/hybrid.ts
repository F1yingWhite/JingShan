import { get, post } from "@/lib/axios";


export function searchHybrid(keyword: string, current: number, pageSize: number) {
    return get(`/hybrid/search?keyword=${keyword}&current=${current}&pageSize=${pageSize}`);
}