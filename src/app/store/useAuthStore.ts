/*import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@types'
import { ROLES, type Role } from '@lib/constants'

type AuthState = {
  user?: User
  token?: string
}

type AuthActions = {
  login: (payload: { token: string; user: User }) => void
  logout: () => void
  setUser: (user?: User) => void
  setToken: (token?: string) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: undefined,
      token: undefined,
      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: undefined, user: undefined }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    { name: 'auth' }
  )
)

export const authSelectors = {
  isAuthenticated: () => Boolean(useAuthStore.getState().token),
  role: () => useAuthStore.getState().user?.role as Role | undefined,
  isFemme: () => useAuthStore.getState().user?.role === ROLES.FEMME,
}
*/


/*
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role =  'ALUMNO' | 'FEMME' | 'PROFESOR' | 'DIRECTOR'

export type User = {
  id: string
  name: string
  role: Role
  email?: string
  avatar?: string
}

type AuthState = {
  user: User | null
  token: string | null
  login: (data: { user: User; token: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth' }
  )
)
*/


import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'DIRECTOR' | 'PROFESOR' | 'ALUMNO' | 'FEMME' | 'VISITANTE'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (data: { user: User; token?: string }) => void
  logout: () => void
  setUser?: (user: User | null) => void
  setToken?: (token?: string | null) => void
}

export const normalizeRole = (r?: string): Role => {
  switch ((r || '').toLowerCase()) {
    case 'director': return 'DIRECTOR'
    case 'profesor': return 'PROFESOR'
    case 'alumno': return 'ALUMNO'
    case 'alumno-femme': return 'FEMME'
    case 'femme': return 'FEMME'
    case 'elenco': return 'FEMME'
    default: return 'VISITANTE'
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: ({ user, token }) =>
        set({
          user: { ...user, role: normalizeRole(user.role) },
          token: token ?? 'demo-token',
          isAuthenticated: true,
        }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
    }),
    { name: 'auth' }
  )
)
