import { number } from "echarts";
import { get, post } from "./axios";
export type Message = {
  role: "user" | "assistant";
  content: string;
}

export function postChat(params: Message[]) {
  return post("/chat", { "messages": params })
}


export function postTTS(params: string) {
  return post("/chat/tts", { "text": params })
}


export function getHistoryLength() {
  return get("/chat/history/length")
}

export function getHistory(page: number, page_size: number) {
  return get("/chat/history?page=" + page + "&page_size=" + page_size)
}

export function getChatDetail(id: string) {
  return get("/chat/history/" + id)
}