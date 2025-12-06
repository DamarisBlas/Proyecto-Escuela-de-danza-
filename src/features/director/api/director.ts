import { api } from '@/lib/api'

// Utilidad: intenta a backend y si falla entrega mock
async function tryOrMock<T>(call: () => Promise<T>, mock: T): Promise<T> {
  try { return await call() } catch { return new Promise(res => setTimeout(()=>res(mock), 300)) }
}

/** PROFESORES */
export type ProfesorBackend = {
  id_profesor: number
  nombre: string
  apellido: string
  email: string
  celular: string
  cuidad: string
  descripcion: string | null
  estado: boolean
  estilos: any | null
  experiencia: string | null
  frase: string | null
  musica: any | null
  redes_sociales: any | null
  signo: string | null
  temporal: any | null
}

export type Profesor = {
  id: string
  name: string
  nationality: string
  instagram: string
  temporal?: boolean  // Indica si es profesor temporal
}

export async function fetchProfesores(): Promise<Profesor[]> {
  try {
    const response = await api.get('/profesores/active')
    const profesores = response.data.profesores || []
    
    // Transformar la respuesta del backend al formato que usa el frontend
    return profesores.map((p: ProfesorBackend) => ({
      id: p.id_profesor.toString(),
      name: `${p.nombre} ${p.apellido || ''}`.trim(),
      nationality: p.cuidad || 'No especificado',
      instagram: p.redes_sociales?.instagram || p.redes_sociales || '',
      temporal: p.temporal || false
    }))
  } catch (error) {
    console.error('Error fetching profesores:', error)
    return []
  }
}

export async function createProfesorTemporal(data: {
  nombre: string
  cuidad: string
  redes_sociales: string
}): Promise<Profesor> {
  const response = await api.post('/profesores/temporal', data)
  const p = response.data.profesor
  
  return {
    id: p.id_profesor.toString(),
    name: p.nombre,
    nationality: p.cuidad || 'No especificado',
    instagram: p.redes_sociales || '',
    temporal: true
  }
}

export async function deleteProfesor(id: string): Promise<void> {
  await api.delete(`/profesores/${id}`)
}

/** OFERTAS */
export type CreateOfertaPayload = {
  ciclo_id_ciclo: number
  Subcategoria_id_subcategoria: number
  nombre_oferta: string
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
  cantidad_cursos: number
  publico_objetivo: string
  whatsapplink: string | null
  repite_semanalmente: boolean
}

export type CreateHorarioPayload = {
  oferta_id: number
  estilo_id: number
  nivel: number
  profesor_id: number
  sala_id: number
  capacidad: number
  dias: number[]
  hora_inicio: string
  hora_fin: string
}

export type CreatePaquetePayload = {
  nombre: string
  dias_validez: number
  ilimitado: boolean
  oferta_id: number
  precio: number
  cantidad_clases?: number
}

export async function createOferta(data: CreateOfertaPayload) {
  const response = await api.post('/ofertas', data)
  return response.data
}

export async function createHorario(data: CreateHorarioPayload) {
  const response = await api.post('/horarios', data)
  return response.data
}

export async function createPaquete(data: CreatePaquetePayload) {
  const response = await api.post('/paquetes', data)
  return response.data
}

/** DASHBOARD */
export type Metric = { label: string; value: number; delta?: number }
export async function fetchDashboard() {
  return tryOrMock(
    async () => (await api.get('/director/dashboard')).data,
    {
      metrics: [
        { label: 'Alumnas activas', value: 128, delta: +6 },
        { label: 'Ingresos (Bs)', value: 7420, delta: +12 },
        { label: 'Asistencia hoy', value: 64, delta: -3 },
        { label: 'Inscripciones nuevas', value: 15, delta: +2 },
      ],
      recent: [
        { id: 'r1', text: 'Pago confirmado — Paquete B • Ana C.' },
        { id: 'r2', text: 'Inscripción aprobada — HEELS BASIC • Luisa S.' },
      ]
    }
  )
}

/** CUENTA / ESTADO */
export async function fetchAccountStatus() {
  return tryOrMock(
    async () => (await api.get('/director/account-status')).data,
    {
      balance: 12450,
      due: 860,
      items: [
        { id: 't1', type: 'Ingreso', detail: 'Paquete A (4 clases)', amount: 125, date: '2025-04-06' },
        { id: 't2', type: 'Ingreso', detail: 'Clase suelta', amount: 40, date: '2025-04-06' },
        { id: 't3', type: 'Reembolso', detail: 'Taller cancelado', amount: -40, date: '2025-04-05' },
      ],
    }
  )
}

/** USERS */
export type UserRow = { id: string; name: string; email: string; role: 'ALUMNO'|'FEMME'|'PROFESOR'|'DIRECTOR'; active: boolean }
export async function fetchUsers(): Promise<UserRow[]> {
  return tryOrMock(
    async () => (await api.get('/director/users')).data,
    [
      { id: 'u1', name: 'Patricia Charcas', email: 'patty@femme.bo', role: 'PROFESOR', active: true },
      { id: 'u2', name: 'Ana C.', email: 'ana@femme.bo', role: 'FEMME', active: true },
      { id: 'u3', name: 'Leo', email: 'leo@femme.bo', role: 'PROFESOR', active: false },
    ]
  )
}
export async function updateUserRole(userId: string, role: UserRow['role']) {
  return tryOrMock(async () => (await api.patch(`/director/users/${userId}`, { role })).data, { ok: true })
}

/** ENROLLMENTS */
export type EnrollmentRow = { id: string; student: string; course: string; status: 'pendiente'|'aprobada'|'cancelada' }
export async function fetchEnrollments(): Promise<EnrollmentRow[]> {
  return tryOrMock(async () => (await api.get('/director/enrollments')).data, [
    { id: 'e1', student: 'Ana C.', course: 'HEELS BASIC', status: 'pendiente' },
    { id: 'e2', student: 'Laura M.', course: 'DANCEHALL', status: 'aprobada' },
  ])
}
export async function updateEnrollment(id: string, status: EnrollmentRow['status']) {
  return tryOrMock(async () => (await api.patch(`/director/enrollments/${id}`, { status })).data, { ok: true })
}

/** PROMOS */
export type PromoRow = { id: string; title: string; active: boolean }
export async function fetchPromotions(): Promise<PromoRow[]> {
  return tryOrMock(async () => (await api.get('/director/promotions')).data, [
    { id: 'p1', title: 'Paquete A 10% OFF', active: true },
    { id: 'p2', title: 'Clase suelta 2x1 Domingos', active: false },
  ])
}
export async function togglePromotion(id: string, active: boolean) {
  return tryOrMock(async () => (await api.patch(`/director/promotions/${id}`, { active })).data, { ok: true })
}

/** PAGOS */
export type PaymentRow = { id: string; student: string; concept: string; amount: number; status: 'pendiente'|'confirmado' }
export async function fetchPayments(): Promise<PaymentRow[]> {
  return tryOrMock(async () => (await api.get('/director/payments')).data, [
    { id: 'pg1', student: 'Ana C.', concept: 'Paquete B', amount: 200, status: 'pendiente' },
    { id: 'pg2', student: 'Laura M.', concept: 'Clase suelta', amount: 40, status: 'confirmado' },
  ])
}
export async function setPaymentStatus(id: string, status: PaymentRow['status']) {
  return tryOrMock(async () => (await api.patch(`/director/payments/${id}`, { status })).data, { ok: true })
}

/** PROGRAMAS & CURSOS */
export type ProgramRow = { id: string; name: string }
export type CourseRow = { id: string; programId: string; name: string; level: string }
export async function fetchPrograms(): Promise<{ programs: ProgramRow[]; courses: CourseRow[] }> {
  return tryOrMock(async () => (await api.get('/director/programs')).data, {
    programs: [{ id: 'pr1', name: 'Camino Femme' }],
    courses: [
      { id: 'c1', programId: 'pr1', name: 'HEELS BASIC', level: 'Básico' },
      { id: 'c2', programId: 'pr1', name: 'DANCEHALL', level: 'Intermedio' },
    ]
  })
}
export async function createProgram(name: string) {
  return tryOrMock(async () => (await api.post('/director/programs', { name })).data, { id: crypto.randomUUID(), name })
}
export async function createCourse(payload: { programId: string; name: string; level: string }) {
  return tryOrMock(async () => (await api.post('/director/courses', payload)).data, { id: crypto.randomUUID(), ...payload })
}

/** SORTEOS */
export type RaffleRow = { id: string; title: string; active: boolean; winners?: string[] }
export async function fetchRaffles(): Promise<RaffleRow[]> {
  return tryOrMock(async () => (await api.get('/director/raffles')).data, [
    { id: 'rf1', title: 'Sorteo mensual', active: true },
  ])
}
export async function drawRaffle(id: string) {
  return tryOrMock(async () => (await api.post(`/director/raffles/${id}/draw`)).data, { winners: ['Ana C.', 'Laura M.'] })
}

/** PERFIL DIRECTOR (Datos personales) */
export async function fetchProfile() {
  return tryOrMock(async () => (await api.get('/director/profile')).data, {
    name: 'Directora Femme', email: 'director@femme.bo', phone: '+591 70000000'
  })
}
export async function updateProfile(payload: { name: string; email: string; phone: string }) {
  return tryOrMock(async () => (await api.put('/director/profile', payload)).data, { ok: true })
}

/** INFO ESCUELA */
export async function fetchSchoolInfo() {
  return tryOrMock(async () => (await api.get('/director/school')).data, {
    name: 'Femme Dance',
    branches: ['Miraflores', 'Centro', 'Calacoto'],
    address: 'La Paz — Zona Sopocachi',
    about: 'Escuela de baile para mujeres. Clases de heels, dancehall, twerk, pole dance y más.',
    mission : 'Empoderar a las mujeres a través del baile y la expresión corporal.',
    vision : 'Ser la escuela de baile líder en Latinoamérica, reconocida por nuestra calidad y ambiente inclusivo.',
    values : 'Respeto, Inclusión, Pasión, Profesionalismo, Comunidad',
    social: { instagram: 'https://instagram.com/femme', facebook: 'https://facebook.com/femme', whatsapp: '+591 765165' },
    faq : [
      { id:1, question: '¿Cuál es la política de reembolsos?', answer: 'Los reembolsos se pueden solicitar hasta 24 horas antes de la clase.' },
      { id:2, question: '¿Puedo cambiar de curso después de inscribirme?', answer: 'Sí, puedes cambiar de curso una vez por ciclo.' },
    ]
  })
}
export async function updateSchoolInfo(payload: any) {
  return tryOrMock(async () => (await api.put('/director/school', payload)).data, { ok: true })
}


/** PERMISOS */
export type PermissionRow = { role: 'ALUMNO'|'FEMME'|'PROFESOR'|'DIRECTOR'; permissions: string[] }
export async function fetchPermissions(): Promise<PermissionRow[]> {
  return tryOrMock(async () => (await api.get('/director/permissions')).data, [
    { role: 'ALUMNO', permissions: ['view:account'] },
    { role: 'FEMME', permissions: ['view:account'] },
    { role: 'PROFESOR', permissions: ['take:attendance'] },
    { role: 'DIRECTOR', permissions: ['view:dashboard','manage:users','manage:courses','manage:payments','manage:enrollments','manage:promotions','manage:raffles','manage:permissions','manage:school'] },
  ])
}
export async function updateRolePermissions(role: PermissionRow['role'], permissions: string[]) {
  return tryOrMock(async () => (await api.put(`/director/permissions/${role}`, { permissions })).data, { ok: true })
}

