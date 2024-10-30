import { get, post } from './axios'

export function getStoryList(page: number, page_size: number) {
    return get('/story')
}