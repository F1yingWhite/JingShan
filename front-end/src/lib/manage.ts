import { get, put } from "./axios";

export function getIndividualDetailById(page: number, page_size: number, model_type: string) {
  return get(`/manage/pending?page=${page}&page_size=${page_size}&model_type=${model_type}`);
}

export function hadleRequest(id: number, model_type: string, action: string) {
  return put(`/manage/update/${id}?model_type=${model_type}`, { "status": action });
}