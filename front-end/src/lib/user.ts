import { post, get, put } from "./axios";

export type Login = {
  email: string,
  password: string
}

export type Register = Login & {
  username: string,
}

export type User = Register & {
  id: number,
  avatar?: string,
}

export type ChangePassword = {
  old_password: string,
  new_password: string
}

export function login(params: Login) {
  return post(`/user/login/`, params);
}

export function register(params: Register) {
  return post(`/user/register/`, params);
}

export function changePassword(params: ChangePassword) {
  return put(`/user/change_password/`, params);
}

export function changerAvatar(params: { avatar: string }) {
  return put(`/user/change_avatar/`, params);
}

export function changeUsername(params: { username: string }) {
  return put(`/user/change_username/`, params);
}

export function fetchUser() {
  return get(`/user/info/`);
}

export function getResetCode(email: string) {
  return get(`/user/reset_password/code/?email=${email}`);
}

export function resetPassword(params: any) {
  return put(`/user/reset_password/`, params);
}
