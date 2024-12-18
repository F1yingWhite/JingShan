import { get, post, put } from './axios'

export type PrefaceAndPostscript = {
    id: number;
    content: string;
    title: string;
    classic: string;
    translator: string;
    category: string;
    author: string;
    page_id: number;
    dynasty: string;
    copy_id: number;
    last_modify: String;
}

export type PrefaceAndPostscriptClassic = {
    name: string,
    related_data: PrefaceAndPostscript[]
}

export function getPrefaceAndPostscriptList(page: number, page_size: number, params: any) {
    return post(`/preface_and_postscript/?page=${page}&page_size=${page_size}`, params);
}

export function searchPrefaceAndPostscript(keyword: string, page: number, page_size: number) {
    return get(`/preface_and_postscript/search/?keyword=${keyword}&page=${page}&page_size=${page_size}`)
}

export function getPrefaceAndPostscriptById(id: number) {
    return get(`/preface_and_postscript/detail/?id=${id}`)
}

export function getPrefaceAndPostscriptListRandom(size: number) {
    return get(`/preface_and_postscript/title/random/?size=${size}`)
}

export function getPrefaceAndPostscriptTitleList(page: number, page_size: number) {
    return get(`/preface_and_postscript/title/?page=${page}&page_size=${page_size}`)
}

export function putPrefaceAndPostscript(id: number, data: any) {
    return put(`/preface_and_postscript/update/${id}`, data)
}