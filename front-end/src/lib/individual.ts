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

export function getindividualByName(name: string) {
    return get(`/individuals?name= {${name}`);
}

export function getIndividualDetailById(id: number) {
    return get(`/individuals/detail?id=${id}`);
}

export function getAllIndividuals({ page, pageSize, title }: { page: number; pageSize: number; title: string }) {
    if (title === undefined) {
        title = "None"
    }
    return get(`/individuals/all?page=${page}&pageSize=${pageSize}&title=${title}`);
}

export function searchIndividuals(name: string) {
    return get(`/individuals/search?name=${name}`);
}