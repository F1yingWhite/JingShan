import { get, post } from "@/lib/axios"


export type Details = {
    [key: string]: Array<{
        content: string;
        type: string;
        place: string;
        colophon_id: number
    }>;
};

export type PersonTime = {
    [key: string]: number;
}

export type IndividualDetail = {
    name: string;
    details: Details;
    time: PersonTime;
}

export type Person = {
    name: string;
    id: number;
}

export function getIndividualDetailById(id: number) {
    return get(`/individuals/detail?id=${id}`);
}

export function getAllIndividuals(page: number, pageSize: number, name: string) {
    return post(`/individuals/?page=${page}&pageSize=${pageSize}`, { "name": name });
}

export function searchIndividuals(name: string) {
    return get(`/individuals/search?name=${name}`);
}