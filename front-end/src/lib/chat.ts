import { post } from "./axios";
export type Message = {
    role: "user" | "assistant";
    content: string;
}


export function postChat(params: Message[]) {
    return post("/chat", { "messages": params })
}