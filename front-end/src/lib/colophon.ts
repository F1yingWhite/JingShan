import { get, post, put } from './axios'

export type RelatedIndividual = {
    name: string;
    id: number;
    place: string;
    type: string;
    note: string;
}

export type Colophon = {
    id: number;
    content: string;
    last_modify: String;
    scripture_name: string;
    volume_id: number;
    chapter_id: number;
    pdf_id: number;
    page_id: number;
    qianziwen: string;
    place?: string;
    time?: string;
    temple?: string;
    words_num?: string;
    wish?: string;
    money?: string;
    pearwood?: string;
    related_individuals?: RelatedIndividual[];
}

export type ContentItem = {
    name: string;
    related_data: Colophon[];
};

export type ContentData = {
    content: ContentItem[];
};

export function getColophonList(page: number, page_size: number, params: any) {
    return post(`/colophon/?page=${page}&page_size=${page_size}`, params);
}

export function searchColophon(keyword: string, page: number, page_size: number) {
    return get(`/colophon/search/?keyword=${keyword}&page=${page}&page_size=${page_size}`)
}

export function getColophonById(id: number) {
    return get(`/colophon/detail/?id=${id}`)
}

export function getScriptureListRandom(size: number) {
    return get(`/colophon/scripture_name/random/?size=${size}`)
}

export function getScriptureList(page: number, page_size: number) {
    return get(`/colophon/scripture_name/?page=${page}&page_size=${page_size}`)
}

export function putColophon(id: number, data: any) {
    return put(`/colophon/update/${id}`, data)
}

export function updateRelatedIndividual(id: number, data: RelatedIndividual[]) {
    return put(`/colophon/related_individuals/${id}`, { "individuals": data })
}