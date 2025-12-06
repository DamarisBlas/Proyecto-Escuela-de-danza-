import { api } from '@lib/api'

export interface PersonaDetalleResponse {
  apellido: string
  celular: string | null
  datos_rol?: {
    cuidad?: string | null // backend typo: 'cuidad'
    descripcion?: string | null
    estado_rol?: boolean
    estilos?: string | null
    experiencia?: number | null
    frase?: string | null
    id_profesor?: number | null
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
