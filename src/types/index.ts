import type { Role } from '@lib/constants'

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

// Tipo para la respuesta de la API
export type ApiUser = {
  id: string
  name: string
  email: string
  role: RoleApi
}

export type RoleApi = 'director' | 'profesor' | 'alumno' | 'alumno-femme' | 'visitante'

export type Course = {
  id: string
  title: string
  style: string
  level: string
  schedule: string
  price: number
  instructorId: string
}


export type Promotion = {
  id: string
  title: string
  validUntil: string   // ej: "Válida hasta el 25 de abril"
  // Fecha de expiración en formato ISO (ej: 2025-12-31). Útil para validaciones programáticas.
  expiresAt?: string
  cycle: string        // ej: "Ciclo 1-2024 · Junio–Julio"
  description: string
  conditions: string
  image: string
  cantidadBeneficiarios?: number
  inscritosCount?: number
}


export type CartItem = {
  id: string
  title: string
  price: number
  qty: number
  details?: string
  paqueteId?: number
  clasesSeleccionadas?: number[]
  fechaPrimeraClase?: string
  promocionId?: number
  descuentoAplicado?: number
}
