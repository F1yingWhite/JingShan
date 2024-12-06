import { get, post } from './axios'

export type Story = {
    id: number;
    content: string;
    title: string;
}
export function getStoryList(page: number, page_size: number, params: any) {
    return post(`/story/?page=${page}&page_size=${page_size}`, params);
}

export function getStoryDetail(id: number) {
    return get(`/story/detail/?id=${id}`);
}

export function generatePicture(params: any) {
    return post(`/story/generate_picture/`, params);
}