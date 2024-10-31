import { get, post } from './axios'

export type Colophon = {
    id: number;
    content: string;
    scripture_name: string;
    volume_id: number;
    chapter_id: number;
    qianziwen: string;
}
export function getColophonList(page: number, page_size: number, params: any) {
    return post(`/colophon/?page=${page}&page_size=${page_size}`, params);
}


export function getColophonTotalNum(params: any) {
    return post(`/colophon/total_num/`, params);
}