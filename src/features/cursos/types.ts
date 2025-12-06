export type CourseType = 'REGULAR' | 'TALLER'
export type SessionStatus = 'ACTIVE' | 'CANCELLED'

import type { Course } from '../../types'

export type Instructor = {
  id: string
  name: string
  instagram?: string | null
  frase?: string | null
  descripcion?: string | null
  ciudad?: string | null
  signo?: string | null
  musica_favorita?: string | null
  experiencia?: string | null
}

export type Sala = {
  nombre: string
  zona: string
  departamento: string
  direccion: string
  link_ubicacion: string | null
}

export type Paquete = {
  id: number
  nombre: string
  precio: number
  cantidad_clases: number | null
  dias_validez: number
  ilimitado: boolean
}

export type Session = {
  id: string
  courseName: string
  type: CourseType
  level: string
  instructor: Instructor
  start: string           // ISO (ej. '2025-10-27T18:00:00')
  end: string             // ISO
  status: SessionStatus
  motivo?: string | null  // Motivo de cancelación si status === 'CANCELLED'
  branch: string          // zona de la sala
  sala: Sala
  descripcion: string
  beneficios: string
  ciclo: string
  offerId: number         // ID único de la oferta
  capacidad: number
  capacidad_maxima: number
  cupos_disponibles: number
  cupos_ocupados: number
  paquetes: Paquete[]
  offerName?: string      // Nombre de la oferta (ej: "ESPECIAL HALLOWEEN")
}

// Para compatibilidad con lo previo
export type { Course } from '../../types'

