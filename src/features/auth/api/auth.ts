
import { api } from '@lib/api'
import type { ApiUser } from '@/types'
import { env } from '@/config/env'


// Backend real (cuando lo conectes)
// Nota: tu backend devuelve { message, user } (sin token). Adaptamos la llamada.
export async function login(payload: { email: string; password: string }): Promise<ApiUser> {
  const { data } = await api.post('/auth/login', payload)
  // Soporta dos formatos: { token, user } o { message, user } o directamente user
  const rawUser = data.user ?? data

  // Normalizamos el campo name si viene en español
  const nameNormalized = rawUser.name ?? ((rawUser.nombre || rawUser.apellido) ? [rawUser.nombre, rawUser.apellido].filter(Boolean).join(' ') : undefined) ?? rawUser.email

  // Devolvemos el objeto original con name normalizado para que la UI pueda inspeccionar role_data
  const result: any = { ...rawUser, name: nameNormalized }
  return result as any
}

// Register expects spanish fields from your backend
export type RegisterPayload = {
  nombre: string
  apellido?: string
  email: string
  celular?: string
  password: string
  solicitud_user_especial?: boolean
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post('/users/create', payload)
  return data
}

// ---- MOCK local para pruebas ----
const mockUsers: ApiUser[] = [
  { id: '1', name: 'Luca Alumno',   email: 'alumno@femmedance.com',   role: 'alumno' },
  { id: '2', name: 'Mila Femme',    email: 'alumnofemme@femmedance.com',    role: 'alumno-femme' },
  { id: '3', name: 'Pablo Profe',   email: 'profesor@femmedance.com',    role: 'profesor' },
  { id: '4', name: 'Ana Directora', email: 'director@femmedance.com', role: 'director' },
]

const mockCredentials = [
  { email: 'alumno@femmedance.com',   password: 'alumno123' },
  { email: 'alumnofemme@femmedance.com',    password: 'femme123' },
  { email: 'profesor@femmedance.com',    password: 'profesor123' },
  { email: 'director@femmedance.com', password: 'director123' },
]

export function authenticateUser(email: string, password: string): ApiUser | null {
  const e = email.trim().toLowerCase()
  const p = password.trim()
  const credOk = mockCredentials.some(c => c.email.toLowerCase() === e && c.password === p)
  if (!credOk) return null
  const user = mockUsers.find(u => u.email.toLowerCase() === e)
  return user ?? null
}
