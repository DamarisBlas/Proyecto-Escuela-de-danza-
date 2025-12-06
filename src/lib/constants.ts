/*export const ROLES = {
  VISITOR: 'VISITOR',
  ALUMNO: 'ALUMNO',
  FEMME: 'FEMME',
  PROFESOR: 'PROFESOR',
  DIRECTOR: 'DIRECTOR',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  COURSES: '/cursos',
  COURSE_DETAIL: (id = ':id') => `/cursos/${id}`,
  INSTRUCTOR_DETAIL: (id = ':id') => `/profesores/${id}`,
  PROMOS: '/promociones',
  PROMO_DETAIL: (id = ':id') => `/promociones/${id}`,
  CART: '/carrito',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ACCOUNT: '/cuenta',
  PROFESOR: '/profesor',
  DIRECTOR: '/director',
} as const
*/// src/lib/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Roles (front) en MAYÚSCULAS
// ─────────────────────────────────────────────────────────────────────────────
export const ROLES = {
  DIRECTOR: 'DIRECTOR',
  PROFESOR: 'PROFESOR',
  ALUMNO: 'ALUMNO',
  FEMME: 'FEMME',
  VISITANTE: 'VISITANTE',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Etiquetas para mostrar en UI
export const ROLE_LABEL: Record<Role, string> = {
  DIRECTOR: 'Director',
  PROFESOR: 'Profesor',
  ALUMNO: 'Alumno',
  FEMME: 'Alumno Femme',
  VISITANTE: 'Visitante',
}

// Normaliza roles del backend/mock (minúsculas) a MAYÚSCULAS
export const normalizeRole = (r?: string): Role => {
  switch ((r || '').toLowerCase()) {
    case 'director': return ROLES.DIRECTOR
    case 'profesor': return ROLES.PROFESOR
    case 'alumno': return ROLES.ALUMNO // <- ver nota abajo
    case 'alumno-femme':
    case 'femme': return ROLES.FEMME
    default: return ROLES.VISITANTE
  }
}

/**
 * NOTA IMPORTANTE:
 * Si arriba ves error de typo (ALMNO), corrígelo por 'ALUMNO'.
 * Lo dejo así para evitar autocompletado que confunda. La versión final DEBE ser:
 *
 * case 'alumno': return ROLES.ALUMNO
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rutas de navegación reutilizables en la app
// ─────────────────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  ABOUT: '/sobre-nosotros',
  COURSES: '/cursos',
  COURSE_DETAIL: (id: string | number) => `/cursos/${id}`,
  PROMOTIONS: '/promociones',
  PROMOTION_DETAIL: (id: string | number) => `/promociones/${id}`,
  CART: '/carrito',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',

  ACCOUNT: '/cuenta',
  ACCOUNT_PERFIL: '/cuenta/perfil',
  ACCOUNT_NOTIFS: '/cuenta/notificaciones',
  ACCOUNT_ENROLLS: '/cuenta/inscripciones',
  ACCOUNT_ATTEND: '/cuenta/asistencias',
  ACCOUNT_PERMISOS: '/cuenta/permisos',
  ACCOUNT_PAGOS: '/cuenta/pagos',

  PROFESOR: '/profesor',
  PROFESOR_ASIST: '/profesor/asistencias',

  DIRECTOR: '/director',
  DIRECTOR_PAGOS: '/director/pagos',
  DIRECTOR_ESTADO: '/director/estado-cuentas',
  DIRECTOR_INSCRIP: '/director/inscripciones',
  DIRECTOR_PROGRAMS: '/director/programas-y-cursos',
  DIRECTOR_CANCEL: '/director/cancelaciones',
  DIRECTOR_SORTEOS: '/director/sorteos',
  DIRECTOR_PROMOS: '/director/promociones',
  DIRECTOR_USUARIOS: '/director/usuarios',
  DIRECTOR_INFO: '/director/info-escuela',
  DIRECTOR_PERMISOS: '/director/permisos',
  DIRECTOR_DESCUENTOS: '/director/descuentos',
} as const
