/*import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@app/hooks/useAuth'
import type { Role } from '@lib/constants'
import { ROUTES } from '@lib/constants'

type Props = { allowedRoles?: Role[] }

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
*/



// src/routing/ProtectedRoute.tsx
import { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'

type Props = {
  /** Úsalo como wrapper: <ProtectedRoute>{children}</ProtectedRoute> */
  children?: ReactNode
  /** Ruta a la que redirigir si NO hay sesión (usa cualquiera de los dos nombres) */
  redirectTo?: string
  redirect?: string
}

/**
 * Protege rutas por autenticación.
 * - Si pasas `children`, actúa como wrapper y renderiza esos children.
 * - Si no pasas `children`, devuelve <Outlet/> para usarlo directo en el árbol de rutas.
 */
export default function ProtectedRoute({ children, redirectTo, redirect }: Props) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const fallback = redirectTo ?? redirect ?? '/auth/login'

  if (!token) {
    return <Navigate to={fallback} replace state={{ from: location }} />
  }

  // Modo wrapper
  if (children) return <>{children}</>

  // Modo Outlet
  return <Outlet />
}
