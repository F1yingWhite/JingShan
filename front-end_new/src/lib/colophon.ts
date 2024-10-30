import { get, post } from './axios'

export type Colophon = {
    id: number;
    content: string;
    scripture_name: string;
    volume_id: number;
    chapter_id: number;
    qianziwen: string;
}

export function getColophonList(page: number, page_size: number) {
    return get(`/colophon/?page=${page}&page_size=${page_size}`);
}

export function getColophonPageNum(page_size: number) {
    return get(`/colophon/page_num/?page_size=${page_size}`);
}