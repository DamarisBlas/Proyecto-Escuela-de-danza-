import { api } from '@lib/api'

export interface Inscripcion {
  id_inscripcion: number
  Persona_id_persona: number
  Paquete_id_paquete: number
  Promocion_id_promocion: number | null
  fecha_inscripcion: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
  estado_pago: string
  precio_original: number
  precio_final: number
  descuento_aplicado: number
  pago_a_cuotas: boolean
  clases_usadas: number
  clases_restantes: number
}

export interface Ciclo {
  id_ciclo: number
  nombre: string
  inicio: string
  fin: string
  estado: boolean
}

// Obtener inscripciones de un usuario específico
export const getInscripcionesByPersona = async (personaId: number): Promise<Inscripcion[]> => {
  const response = await api.get(`/inscripciones/persona/${personaId}`)
  return response.data
}

export const getInscripcionesCompletas = async () => {
  const response = await api.get('/inscripciones/completas')
  return response.data
}

// Obtener ciclos activos
export const getCiclosActivos = async (): Promise<Ciclo[]> => {
  const response = await api.get('/ciclos/active')
  return response.data
}

// Verificar inscripciones de un usuario
export interface VerificarInscripcionResponse {
  persona_id: number
  sesiones_inscritas: number[]
  tiene_inscripciones: boolean
  total_inscripciones_activas: number
  total_sesiones_inscritas: number
}

export const verificarInscripcion = async (personaId: number): Promise<VerificarInscripcionResponse> => {
  const response = await api.get(`/asistencias/verificar-inscripcion/${personaId}`)
  return response.data
}

export interface PaqueteCompleto {
  ciclo: {
    fin: string
    id_ciclo: number
    inicio: string
    nombre_ciclo: string
  }
  oferta: {
    cantidad_cursos: number
    descripcion: string
    fecha_fin: string
    fecha_inicio: string
    id_oferta: number
    nombre_oferta: string
    publico_objetivo: string
    repite_semanalmente: boolean
    whatsapplink: string | null
  }
  paquete: {
    cantidad_clases: number
    dias_validez: number
    estado: boolean
    id_paquete: number
    ilimitado: boolean
    nombre: string
    precio: string
  }
  subcategoria: {
    categoria_id: number
    descripcion_subcategoria: string
    id_subcategoria: number
    nombre_subcategoria: string
  }
}

// Obtener información completa del paquete
export const getPaqueteCompleto = async (paqueteId: number): Promise<PaqueteCompleto> => {
  const response = await api.get(`/paquetes/${paqueteId}/info-completa`)
  return response.data
}