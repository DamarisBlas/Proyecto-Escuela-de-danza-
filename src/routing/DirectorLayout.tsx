/*import { Outlet, NavLink } from 'react-router-dom'
import { ROUTES } from '@lib/constants'

export default function DirectorLayout() {
  const links = [
    ['Dashboard', ROUTES.DIRECTOR + '/dashboard'],
    ['Estado de cuentas', ROUTES.DIRECTOR + '/estado-cuentas'],
    ['Pagos', ROUTES.DIRECTOR + '/pagos'],
    ['Inscripciones', ROUTES.DIRECTOR + '/inscripciones'],
    ['Programas & Cursos', ROUTES.DIRECTOR + '/programas-cursos'],
    ['Cancelaciones', ROUTES.DIRECTOR + '/cancelaciones'],
    ['Sorteos', ROUTES.DIRECTOR + '/sorteos'],
    ['Promociones', ROUTES.DIRECTOR + '/promociones'],
    ['Usuarios', ROUTES.DIRECTOR + '/usuarios'],
  ] as const
  return (
    <div className="min-h-screen grid grid-cols-12">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r">
        <div className="p-4 font-semibold">Panel Director</div>
        <nav className="flex flex-col">
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} className={({isActive}) => `px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 ${isActive ? 'font-semibold' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9 lg:col-span-10 p-4">
        <Outlet />
      </section>
    </div>
  )
}
*/
import { Outlet, NavLink } from 'react-router-dom'
import { BarChart3, UserCog, CreditCard, TicketPercent, Users, ClipboardList, Gift, BadgePercent, Banknote, GraduationCap, Shield, Info } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

const links = [
  { to: `${ROUTES.DIRECTOR}/dashboard`, label: 'Dashboard', icon: BarChart3 },
  { to: `${ROUTES.DIRECTOR}/datos-personales`, label: 'Datos personales', icon: UserCog },
  { to: ROUTES.DIRECTOR_ESTADO, label: 'Estado de cuenta', icon: CreditCard },
  { to: `${ROUTES.DIRECTOR}/inscripciones`, label: 'Gestión de inscripción', icon: ClipboardList },
  { to: ROUTES.DIRECTOR_PROMOS, label: 'Promociones', icon: BadgePercent },
  { to: ROUTES.DIRECTOR_SORTEOS, label: 'Sorteos', icon: Gift },
  { to: ROUTES.DIRECTOR_USUARIOS, label: 'Gestión de usuarios', icon: Users },
  { to: ROUTES.DIRECTOR_PAGOS, label: 'Gestión de pagos', icon: Banknote },
  { to: ROUTES.DIRECTOR_PROGRAMS, label: 'Gestión de programas y cursos', icon: GraduationCap },
  { to: `${ROUTES.DIRECTOR}/permisos`, label: 'Gestión de permisos', icon: Shield },
  { to: ROUTES.DIRECTOR_INFO, label: 'Inf escuela', icon: Info },
  { to: ROUTES.DIRECTOR_DESCUENTOS, label: 'Gestión de descuentos', icon: TicketPercent },
] as const

export default function DirectorLayout() {
  return (
    <div className="min-h-screen grid grid-cols-12">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-white">
        <div className="p-4 font-semibold">Panel Director</div>
        <nav className="flex flex-col">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({isActive}) => `flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 ${isActive ? 'font-semibold text-femme-magenta' : ''}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9 lg:col-span-10 p-4">
        <Outlet />
      </section>
    </div>
  )
}
