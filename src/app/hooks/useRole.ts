
/*import { useAuth } from './useAuth'
import { ROLES, type Role } from '@lib/constants'

export function useRole() {
  const { role } = useAuth()
  const is = (r: Role) => role === r
  const oneOf = (roles: Role[]) => roles.includes(role as Role)
  return { role, is, oneOf, ROLES }
}*/
import { useAuthStore, type Role } from '@app/store/useAuthStore'

export function useRole(): Role {
  return useAuthStore((s) => s.user?.role ?? 'VISITANTE')
}
