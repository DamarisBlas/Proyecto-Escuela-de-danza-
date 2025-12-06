import { useAuthStore } from '@app/store/useAuthStore'
import { ROLES, type Role } from '@lib/constants'

export function useAuth() {
  const user = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)
  const login = useAuthStore(s => s.login)
  const logout = useAuthStore(s => s.logout)
  const role: Role | undefined = user?.role
  const isAuthenticated = Boolean(token)
  const isFemme = role === ROLES.FEMME

  return { user, token, role, isAuthenticated, isFemme, login, logout }
}
