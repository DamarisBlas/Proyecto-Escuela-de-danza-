import AccountTabs from '@components/layout/AccountTabs'

import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
import {
  User, Bell, ClipboardList, CalendarCheck, Shield, CreditCard,
  BarChart3, Users, BadgePercent, Gift, Banknote, GraduationCap, Info
} from 'lucide-react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap
   ${isActive ? 'bg-femme-magenta text-white' : 'hover:bg-black/5'}`

export default function AccountLayout() {
  const role = useAuthStore((s) => s.user?.role)
  const isFemme = role === 'FEMME'
  const isAlumno = role === 'ALUMNO'
  const isProfesor = role === 'PROFESOR'
  const isDirector = role === 'DIRECTOR'

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Mi Cuenta</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* NAV */}
        <aside className="col-span-12 md:col-span-3">
          {/* Mobile: use horizontal tabs for all roles so Director can see all options */}
          <div className="md:hidden">
            <AccountTabs />
          </div>

          {/* Desktop: sidebar fijo */}
          <div className="hidden md:block space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-graphite mb-2">General</div>
              <nav className="flex flex-col gap-1">
                <NavLink to="/cuenta/perfil" className={linkClass}><User className="h-4 w-4" /> Perfil</NavLink>
                <NavLink to="/cuenta/notificaciones" className={linkClass}><Bell className="h-4 w-4" /> Notificaciones</NavLink>
                <NavLink to="/cuenta/inscripciones" className={linkClass}><ClipboardList className="h-4 w-4" /> Inscripciones</NavLink>
                <NavLink to="/cuenta/asistencias" className={linkClass}><CalendarCheck className="h-4 w-4" /> Asistencias</NavLink>
                <NavLink to="/cuenta/permisos" className={linkClass}><Shield className="h-4 w-4" /> Permisos</NavLink>
                {(isFemme || isAlumno) && <NavLink to="/cuenta/pagos" className={linkClass}><CreditCard className="h-4 w-4" /> Pagos</NavLink>}
              </nav>
            </div>

            {isProfesor && (
              <div>
                <div className="text-xs uppercase tracking-wide text-graphite mb-2">Profesor</div>
                <nav className="flex flex-col gap-1">
                  <NavLink to="/cuenta/profesor" className={linkClass}>Mis cursos</NavLink>
                  <NavLink to="/cuenta/profesor/asistencias" className={linkClass}>Asistencias</NavLink>
                </nav>
              </div>
            )}

            {isDirector && (
              <div>
                <div className="text-xs uppercase tracking-wide text-graphite mb-2">Director</div>
                <nav className="flex flex-col gap-1">
                  <NavLink to="/cuenta/admin" className={linkClass}><BarChart3 className="h-4 w-4" /> Dashboard</NavLink>
                  <NavLink to="/cuenta/admin/estado-cuentas" className={linkClass}><CreditCard className="h-4 w-4" /> Estado de cuenta</NavLink>
                  <NavLink to="/cuenta/admin/inscripciones" className={linkClass}><ClipboardList className="h-4 w-4" /> Gestión de inscripción</NavLink>
                  <NavLink to="/cuenta/admin/promociones" className={linkClass}><BadgePercent className="h-4 w-4" /> Promociones</NavLink>
                  <NavLink to="/cuenta/admin/sorteos" className={linkClass}><Gift className="h-4 w-4" /> Sorteos</NavLink>
                  <NavLink to="/cuenta/admin/usuarios" className={linkClass}><Users className="h-4 w-4" /> Gestión de usuarios</NavLink>
                  <NavLink to="/cuenta/admin/pagos" className={linkClass}><Banknote className="h-4 w-4" /> Gestión de pagos</NavLink>
                  <NavLink to="/cuenta/admin/programas-y-cursos" className={linkClass}><GraduationCap className="h-4 w-4" /> Programas y cursos</NavLink>
                  <NavLink to="/cuenta/admin/permisos" className={linkClass}><Shield className="h-4 w-4" /> Gestión de permisos</NavLink>
                  <NavLink to="/cuenta/admin/info-escuela" className={linkClass}><Info className="h-4 w-4" /> Inf escuela</NavLink>
                </nav>
              </div>
            )}
          </div>
        </aside>

        {/* CONTENIDO */}
        <section className="col-span-12 md:col-span-9">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
