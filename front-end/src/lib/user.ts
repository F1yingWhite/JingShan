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
  email: string,
  old_password: string,
  new_password: string
}

export function login(params: Login) {
  return post(`/user/login/`, params);
}

export function register(params: Register) {
  return post(`/user/register/`, params);
}

export function change_password(params: ChangePassword) {
  return put(`/user/change_password/`, params);
}

export function change_avatar(params: { avatar: string }) {
  return put(`/user/change_avatar/`, params);
}

export function fetch_user() {
  return get(`/user/info/`);
}