
/*
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import logoUrl from '@/assets/logo.png'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useCart } from '@/app/store/useCart'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const count = useCart((s) => s.count())

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-femme-magenta' : 'text-ink'}`
      }
      onClick={() => setOpen(false)}
    >
      {label}
    </NavLink>
  )

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Femme Dance" className="h-8 w-auto" />
          <span className="sr-only">Femme Dance</span>
        </Link>
*/

        {/* Desktop */}

/*
<nav className="hidden md:flex items-center gap-1">
          {navItem('/', 'Inicio')}
          {navItem('/cursos', 'Cursos')}
          {navItem('/promociones', 'Promociones')}
          {navItem('/sobre-nosotros', 'Nosotros')}
          <NavLink to="/carrito" className="relative px-3 py-2 rounded-md text-sm font-medium text-ink">
            Carrito
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-femme-magenta text-white rounded-full px-1.5">
                {count}
              </span>
            )}
          </NavLink>

          {!user ? (
            <NavLink
              to="/auth/login"
              className="ml-2 btn-primary text-sm !py-1.5"
            >
              Iniciar sesión
            </NavLink>
          ) : (
            <>
              {navItem('/cuenta', 'Mi cuenta')}
              <button className="ml-2 text-ink text-sm" onClick={logout}>Cerrar sesión</button>
            </>
          )}
        </nav>
*/
        {/* Mobile button */}
/*
<button className="md:hidden text-ink" onClick={() => setOpen((o) => !o)} aria-label="Abrir menú">
          ☰
        </button>
      </div>
/*
      {/* Mobile menu */
   /*   {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container py-2 flex flex-col gap-1">
            {navItem('/', 'Inicio')}
            {navItem('/cursos', 'Cursos')}
            {navItem('/promociones', 'Promociones')}
            {navItem('/sobre-nosotros', 'Nosotros')}
            <NavLink to="/carrito" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Carrito {count > 0 && <span className="ml-1 text-femme-magenta">({count})</span>}
            </NavLink>
            {!user ? (
              <NavLink to="/auth/login" className="btn-primary text-sm !py-2" onClick={() => setOpen(false)}>
                Iniciar sesión
              </NavLink>
            ) : (
              <>
                {navItem('/cuenta', 'Mi cuenta')}
                <button className="px-3 py-2 text-sm text-ink text-left" onClick={() => { logout(); setOpen(false) }}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

*/
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@app/hooks/useAuth'
import { useCart } from '@app/store/useCart'
import logoUrl from '@/assets/logo.png'
import { cn } from '@lib/utils'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuth()
  const itemsCount = useCart((s) => s.count())
  const nav = useNavigate()

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario'
  const saludo = `Bienvenid${firstName.endsWith('a') ? 'a' : 'o'}`

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive ? 'text-femme-magenta' : 'text-ink hover:text-femme-magenta'
        )
      }
      onClick={() => setOpen(false)}
    >
      {label}
    </NavLink>
  )

  return (
    <header className="border-b border-graphite/10 bg-white">
      <div className="container flex items-center justify-between h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Femme Dance" className="h-8 w-auto" />
          <span className="sr-only">Femme Dance</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItem('/', 'Inicio')}
          {navItem('/cursos', 'Cursos')}
          {navItem('/promociones', 'Promociones')}
          {navItem('/sobre-nosotros', 'Sobre nosotros')}

          

          {/* Carrito con badge */}
          <NavLink
            to="/carrito"
            className={({ isActive }) =>
              cn(
                'relative px-3 py-2 rounded-md text-sm font-medium',
                isActive ? 'text-femme-magenta' : 'text-ink hover:text-femme-magenta'
              )
            }
          >
            Carrito
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-femme-magenta text-white rounded-full px-1.5 py-0.5">
                {itemsCount}
              </span>
            )}
          </NavLink>

          {!isAuthenticated ? (
            <NavLink
              to="/auth/login"
              className="ml-2 px-3 py-2 rounded-[12px] bg-femme-magenta text-white text-sm hover:bg-femme-rose"
            >
              Iniciar sesión
            </NavLink>
          ) : (
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="px-3 py-2 rounded-[12px] text-sm text-ink hover:bg-graphite/5"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                {saludo} {firstName} ▾
              </button>

              {userMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-52 rounded-[12px] border border-graphite/10 bg-white shadow-lg py-2">
                  <button
                    role="menuitem"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-graphite/5"
                    onClick={() => { setUserMenuOpen(false); nav('/cuenta') }}
                  >
                    Mi cuenta
                  </button>
                  <button
                    role="menuitem"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-graphite/5"
                    onClick={() => { setUserMenuOpen(false); logout() }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile button */}
        <button className="md:hidden text-ink text-xl leading-none" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-graphite/10 bg-white">
          <div className="container py-2 flex flex-col gap-1">
            {navItem('/', 'Inicio')}
            {navItem('/cursos', 'Cursos')}
            {navItem('/promociones', 'Promociones')}
            {navItem('/sobre-nosotros', 'Sobre nosotros')}
            <NavLink to="/carrito" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Carrito {itemsCount > 0 && <span className="ml-1 text-femme-magenta">({itemsCount})</span>}
            </NavLink>

            {!isAuthenticated ? (
              <NavLink to="/auth/login" className="mt-1 px-3 py-2 rounded-[12px] bg-femme-magenta text-white text-sm text-center hover:bg-femme-rose" onClick={() => setOpen(false)}>
                Iniciar sesión
              </NavLink>
            ) : (
              <>
                <button className="px-3 py-2 text-sm text-left text-ink" onClick={() => { setOpen(false); nav('/cuenta') }}>
                  Mi cuenta
                </button>
                <button className="px-3 py-2 text-sm text-left text-ink" onClick={() => { logout(); setOpen(false) }}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
