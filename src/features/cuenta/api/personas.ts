import { api } from '@lib/api'

export interface PersonaDetalleResponse {
  apellido_paterno: string
  apellido_materno: string
  celular: string | null
  datos_rol?: {
    pais_origen?: string | null
    descripcion?: string | null
    estado_rol?: boolean
    cuando_comenzo_danza?: string | null
    frase?: string | null
    Persona_id_persona?: number | null
    musica?: string | null
    redes_sociales?: string | null
    signo?: string | null
  }
  email: string
  estado: boolean
  fecha_creacion: string
  id_persona: number
  nombre: string
  solicitud_user_especial?: boolean
  temporal?: boolean
  tipo_cuenta?: string
}

export const getPersonaDetalle = async (personaId: number): Promise<PersonaDetalleResponse> => {
  const { data } = await api.get(`/users/personas/${personaId}/detalle`)
  return data
}
