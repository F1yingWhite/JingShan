import { get, post } from './axios'

export type Stroy = {
    id: number;
    content: string;
    title: string;
}
export function getStoryList(page: number, page_size: number, params: any) {
    return post(`/story/?page=${page}&page_size=${page_size}`, params);
}


export function getStoryTotalNum(params: any) {
    return post(`/story/total_num/`, params);
}