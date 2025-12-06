import { Outlet, NavLink } from 'react-router-dom'
import { ROUTES } from '@lib/constants'

export default function ProfesorLayout() {
  const links = [
    ['Toma de asistencia', ROUTES.PROFESOR + '/asistencia'],
    ['Mis cursos', ROUTES.PROFESOR + '/mis-cursos'],
  ] as const

  return (
    <div className="min-h-screen grid grid-cols-12">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r">
        <div className="p-4 font-semibold">Panel Profesor</div>
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
