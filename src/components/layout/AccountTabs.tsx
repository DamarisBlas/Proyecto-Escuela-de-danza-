




import { NavLink } from 'react-router-dom'
import { useRole } from '@app/hooks/useRole'
import { cn } from '@lib/utils'

type Tab = { to: string; label: string }

export default function AccountTabs() {
  const role = useRole()

  const alumno: Tab[] = [
    { to: '/cuenta/perfil', label: 'Datos personales' },
    { to: '/cuenta/notificaciones', label: 'Notificaciones' },
    { to: '/cuenta/inscripciones', label: 'Inscripciones' },
    { to: '/cuenta/asistencias', label: 'Asistencia' },
    { to: '/cuenta/permisos', label: 'Permisos' },
    { to: '/cuenta/pagos', label: 'Pagos' },
  ]

  const femme: Tab[] = [
    { to: '/cuenta/perfil', label: 'Datos personales' },
    { to: '/cuenta/notificaciones', label: 'Notificaciones' },
    { to: '/cuenta/inscripciones', label: 'Inscripciones' },
    { to: '/cuenta/pagos', label: 'Pagos' },
    { to: '/cuenta/asistencias', label: 'Asistencia' },
    { to: '/cuenta/permisos', label: 'Permisos Femme' },
  ]

  // CHANGED: Director ahora usa /cuenta/admin/*
  const director: Tab[] = [
    { to: '/cuenta/perfil', label: 'Datos personales' },
    { to: '/cuenta/admin', label: 'Dashboard' },
    { to: '/cuenta/admin/pagos', label: 'Gestión de pagos' },
    { to: '/cuenta/admin/estado-cuentas', label: 'Estado de cuenta' },
    { to: '/cuenta/admin/inscripciones', label: 'Gestión de inscripción' },
    { to: '/cuenta/admin/programas-y-cursos', label: 'Programas y cursos' },
    { to: '/cuenta/admin/cancelaciones', label: 'Cancelaciones' },
    { to: '/cuenta/admin/sorteos', label: 'Sorteos' },
    { to: '/cuenta/admin/promociones', label: 'Promociones' },
    //{ to: '/cuenta/admin/descuentos', label: 'Descuentos' },
    { to: '/cuenta/admin/permisos', label: 'Gestión de permisos' },
    { to: '/cuenta/admin/usuarios', label: 'Gestión de usuarios' },
    { to: '/cuenta/admin/info-escuela', label: 'Inf escuela' }, 
  ]

  // CHANGED: Profesor ahora usa /cuenta/profesor/*
  const profesor: Tab[] = [
    { to: '/cuenta/perfil', label: 'Datos personales' },
    { to: '/cuenta/profesor', label: 'Gestión de cursos' },            // CHANGED
    { to: '/cuenta/profesor/asistencias', label: 'Gestión de asistencia' }, // CHANGED
  ]

  const tabs =
    role === 'FEMME' ? femme :
    role === 'ALUMNO' ? alumno :
    role === 'DIRECTOR' ? director :
    role === 'PROFESOR' ? profesor :
    alumno

  return (
    <div className="container">
      <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-graphite/10">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                'shrink-0 px-3 py-2 text-sm font-medium -mb-px',
                isActive ? 'text-femme-magenta border-b-2 border-femme-magenta' : 'text-graphite hover:text-ink'
              )
            }
            end
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
