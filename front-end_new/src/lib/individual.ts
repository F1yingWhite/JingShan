import { get, post } from "@/lib/axios"


export type Details = {
    [key: string]: Array<{
        content: string;
        type: string;
        description: string;
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

export function getindividualByName(name: string) {
    return get(`/individuals?name= {${name}`);
}

export function getIndividualDetailById(id: number) {
    return get(`/individuals/detail?id=${id}`);
}