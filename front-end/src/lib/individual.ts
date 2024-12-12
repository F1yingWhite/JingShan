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

export function getIndividualRandom(size: number) {
    return get(`/individuals/random?size=${size}`);
}


export function getWorksList(key: string) {
    if (key === "") {
        return get(`/individuals/works/`);
    } else {
        return get(`/individuals/works/?key=${key}`);
    }
}


export function getPlaceList(key: string) {
    if (key === "") {
        return get(`/individuals/places/`);
    } else {
        return get(`/individuals/places/?key=${key}`);
    }
}

export function getIndividualHybrid(places: string[], works: string[], name: string, page: number, page_size: number) {
    return post(`/individuals/hybrid/?page=${page}&page_size=${page_size}`, { "places": places, "works": works, "name": name });
}