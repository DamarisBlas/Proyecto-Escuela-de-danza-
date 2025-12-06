import type { Role } from '@app/store/useAuthStore'

export const DEMO_USERS: Array<{
  label: string
  role: Extract<Role, 'ALUMNO' | 'FEMME' | 'PROFESOR' | 'DIRECTOR'>
  email: string
  name: string
  password?: string
}> = [
  { label: 'Director', role: 'DIRECTOR', email: 'director@femmedance.com', name: 'Carmen Directora', password: 'director123' },
  { label: 'Profesor', role: 'PROFESOR', email: 'profesor@femmedance.com', name: 'Patty Charcas', password: 'profesor123' },
  { label: 'Alumno', role: 'ALUMNO', email: 'alumno@femmedance.com', name: 'Ana Pérez', password: 'alumno123' },
  { label: 'Alumno Femme', role: 'FEMME', email: 'alumnofemme@femmedance.com', name: 'María González', password: 'femme123' },
]
