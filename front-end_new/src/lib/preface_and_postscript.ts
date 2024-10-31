import { get, post } from './axios'

export type PrefaceAndPostscript = {
    id: number;
    content: string;
    title:string;
}
export function getPrefaceAndPostscriptList(page: number, page_size: number, params: any) {
    return post(`/preface_and_postscript/?page=${page}&page_size=${page_size}`, params);
}


export function getcPrefaceAndPostscriptTotalNum(params: any) {
    return post(`/preface_and_postscript/total_num/`, params);
}