import { get, put } from "./axios";

export type ModifiactionRequest = {
  user: { avatar?: string; username: string; };
  request_id: number,
  user_id: number,
  target_id: number
  old_value: Record<string, any>
  new_value: Record<string, any>
  requested_at: string,
  status: "pending" | "approved" | "rejected"
  handle_at: string
  approved_by: number
  name: string
}

export function getPending(page: number, page_size: number, model_type: string, status?: string, title?: string) {
  let url = `/manage/pending?page=${page}&page_size=${page_size}&model_type=${model_type}`;
  if (status && status !== 'all') {
    url += `&status=${status}`;
  }
  if (title) {
    url += `&title=${title}`;
  }

  return get(url);
}

export function hadleRequest(id: number, model_type: string, data: any) {
  return put(`/manage/update/${id}?model_type=${model_type}`, { "data": data});
}