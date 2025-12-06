import { ROLES, type Role } from './constants'

export type Permission =
  | 'view:dashboard'
  | 'manage:users'
  | 'manage:courses'
  | 'view:payments'
  | 'manage:payments'
  | 'view:enrollments'
  | 'manage:enrollments'
  | 'manage:promotions'
  | 'manage:raffles'
  | 'take:attendance'
  | 'manage:permissions' 
  | 'manage:school'  
  | 'view:account'

export const RBAC: Record<Role, Permission[]> = {
  [ROLES.VISITANTE]: [],
  [ROLES.ALUMNO]: ['view:account'],
  [ROLES.FEMME]: ['view:account'],
  [ROLES.PROFESOR]: ['take:attendance'],
  [ROLES.DIRECTOR]: [
    'view:dashboard','manage:users','manage:courses',
    'view:payments','manage:payments',
    'view:enrollments','manage:enrollments',
    'manage:promotions','manage:raffles',
    'manage:permissions',   // NUEVO
    'manage:school'  
  ],
}

export function hasPermission(role: Role | undefined, perm: Permission) {
  if (!role) return false
  return RBAC[role]?.includes(perm) ?? false
}
