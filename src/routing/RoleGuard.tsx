/*import { PropsWithChildren } from 'react'
import { usePermissions } from '@app/hooks/usePermissions'

type Props = PropsWithChildren<{ permission: string }>

export default function RoleGuard({ permission, children }: Props) {
  const { can } = usePermissions()
  if (!can(permission as any)) return <div className="p-6 text-sm text-red-600">No tiene permisos para ver esta sección.</div>
  return <>{children}</>
}*/
import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuthStore } from '@app/store/useAuthStore'
import type { Role } from '@lib/constants'

/**
 * CHANGED: agregamos `children` a las props para poder envolver <Outlet/>
 */
type Props = {
  roles: Role[]                      // roles permitidos (en MAYÚSCULAS)
  children: ReactNode                // contenido protegido (p.ej. <Outlet/>)
  fallbackTo?: string                // opcional: a dónde redirigir si no tiene rol permitido
}

export default function RoleGuard({ roles, children, fallbackTo }: Props) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)

  // Si no está autenticado, mandamos a login con "from"
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Si su rol no está permitido, redirigimos a fallback o home
  if (!role || !roles.includes(role)) {
    return <Navigate to={fallbackTo ?? '/'} replace />
  }

  // Tiene permiso, renderizamos hijos
  return <>{children}</>
}
