import { create } from 'zustand'

export type User = {
  email: string,
  avatar: string,
  username: string
}

interface BearState {
  user: User | null
  isLogin: boolean
  setUser: (user: User | null) => void
  updateUser: (user: Partial<User>) => void
  LogOut: () => void
}

export const useUserStore = create<BearState>((set, get) => ({
  user: null,
  isLogin: false,
  setUser: (user) => {
    if (user) {
      set({ user: user, isLogin: true })
      console.log(user)
    } else {
      window.localStorage.removeItem("jwt")
      set({ user: null, isLogin: false })
    }
  },
  LogOut: () => {
    set({ user: null, isLogin: false })
  },
  updateUser: (user) => {
    const oldUser = get().user
    if (!oldUser) return
    const newUser = { ...oldUser, ...user }
    set({ user: newUser })
  },
}))
