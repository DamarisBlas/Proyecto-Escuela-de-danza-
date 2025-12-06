/*import { PropsWithChildren } from 'react'

export function Sidebar({ children }: PropsWithChildren) {
  return <aside className="w-64 border-r">{children}</aside>
}*/
import { NavLink } from 'react-router-dom'
import { cn } from '@lib/utils'
import { useRole } from '@app/hooks/useRole'

type Props = { variant?: 'cuenta' | 'profesor' | 'director' }
export default function Sidebar({ variant = 'cuenta' }: Props) {
  const role = useRole()

  const accountLinks = [
    { to: '/cuenta', label: 'Resumen' },
    { to: '/cuenta/perfil', label: 'Datos personales' },
    { to: '/cuenta/notificaciones', label: 'Notificaciones' },
    { to: '/cuenta/inscripciones', label: 'Inscripciones' },
    { to: '/cuenta/asistencia', label: 'Asistencia' },
    ...(role === 'FEMME' ? [{ to: '/cuenta/permisos', label: 'Permisos (FEMME)' }, { to: '/cuenta/pagos', label: 'Pagos' }] : []),
  ]

  const links =
    variant === 'director'
      ? [
          { to: '/director', label: 'Dashboard' },
          { to: '/director/usuarios', label: 'Usuarios' },
          // cuando agregues más páginas, añade aquí
        ]
      : variant === 'profesor'
      ? [
          { to: '/profesor', label: 'Mis cursos' },
          { to: '/profesor/asistencias', label: 'Asistencias' },
        ]
      : accountLinks

  return (
    <nav className="p-4">
      <ul className="space-y-1">
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'block rounded-[12px] px-3 py-2 text-sm hover:bg-graphite/5',
                  isActive ? 'bg-femme-softyellow text-ink' : 'text-graphite'
                )
              }
              end
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

