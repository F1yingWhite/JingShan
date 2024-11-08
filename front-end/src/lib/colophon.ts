import { get, post } from './axios'

export type RelatedIndividuals = {
    name: string;
    id: number;
    description: string;
    type: string;
}

export type Colophon = {
    id: number;
    content: string;
    scripture_name: string;
    volume_id: number;
    chapter_id: number;
    pdf_id: number;
    page_id: number;
    qianziwen: string;
    place?: string;
    time?: string;
    related_individuals?: RelatedIndividuals[];
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


export function getColophonTotalNum(params: any) {
    return post(`/colophon/total_num/`, params);
}

export function searchColophon(keyword: string, page: number, page_size: number) {
    return get(`/colophon/search/?keyword=${keyword}&page=${page}&page_size=${page_size}`)
}

export function getColophonById(id: number) {
    return get(`/colophon/detail/?id=${id}`)
}