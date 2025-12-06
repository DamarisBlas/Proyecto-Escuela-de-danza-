import { hasPermission, type Permission } from '@lib/rbac'
import { useAuth } from './useAuth'

export function usePermissions() {
  const { role } = useAuth()
  const can = (perm: Permission) => hasPermission(role, perm)
  return { can }
}
