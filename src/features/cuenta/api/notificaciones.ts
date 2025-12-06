import { api } from '@lib/api'

// Tipos para las notificaciones
export interface Notificacion {
  id_notificacion: number
  titulo: string
  mensaje: string
  tipo: 'INFORMACION' | 'AVISO' | 'PELIGRO' | 'EXITO'
  categoria: 'INSCRIPCION' | 'PAGO' | 'ASISTENCIA' | 'GENERAL' | 'PROMOCION' | 'SORTEO' | 'CLASE_CANCELADA' | 'RECORDATORIO'
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA'
  fecha_creacion: string
  creado_por: number | null
  estado: boolean
}

export interface NotificacionPersona {
  id_notificacion_persona: number
  Notificacion_id_notificacion: number
  Persona_id_persona: number
  Inscricpcion_id_inscricpcion: number | null
  leida: boolean
  fecha_leida: string | null
  enviada_sistema: boolean
  enviada_push: boolean
  enviada_whatsapp: boolean
  fecha_envio_push: string | null
  fecha_envio_whatsapp: string | null
  estado: boolean
}

export interface NotificacionCompleta extends NotificacionPersona {
  notificacion: Notificacion
}

// Crear una notificación
export interface CrearNotificacionData {
  titulo: string
  mensaje: string // Límite: 600 caracteres
  tipo: Notificacion['tipo']
  categoria: Notificacion['categoria']
  prioridad: Notificacion['prioridad']
  fecha_creacion: string
}

export const crearNotificacion = async (data: CrearNotificacionData): Promise<{ message: string; notificacion: Notificacion }> => {
  console.log('🚀 Llamando API /notificaciones con:', data)
  const response = await api.post('/notificaciones', data)
  console.log('📥 Respuesta de /notificaciones:', response.data)
  return response.data
}

// Asignar notificación a una persona
export interface AsignarNotificacionData {
  Notificacion_id_notificacion: number
  Persona_id_persona: number
  Inscricpcion_id_inscricpcion?: number
  enviada_sistema: boolean
}

export const asignarNotificacionPersona = async (data: AsignarNotificacionData): Promise<{ message: string; notificacion_persona: NotificacionPersona }> => {
  const response = await api.post('/notificaciones-personas', data)
  return response.data
}

// Obtener una notificación específica
export const getNotificacion = async (notificacionId: number): Promise<Notificacion> => {
  const response = await api.get(`/notificaciones/${notificacionId}`)
  return response.data
}

// Obtener notificaciones de una persona
export const getNotificacionesPersona = async (personaId: number): Promise<NotificacionCompleta[]> => {
  const response = await api.get(`/notificaciones-personas/persona/${personaId}`)
  
  // El backend retorna solo los datos de notificacion_persona, necesitamos obtener los detalles de la notificación
  const notificacionesPersona: NotificacionPersona[] = response.data
  
  // Obtener detalles de cada notificación
  const notificacionesCompletas: NotificacionCompleta[] = []
  
  for (const notifPersona of notificacionesPersona) {
    try {
      const notificacion = await getNotificacion(notifPersona.Notificacion_id_notificacion)
      notificacionesCompletas.push({
        ...notifPersona,
        notificacion
      })
    } catch (error) {
      console.error(`Error obteniendo notificación ${notifPersona.Notificacion_id_notificacion}:`, error)
      // Continuar con las demás notificaciones aunque una falle
    }
  }
  
  return notificacionesCompletas
}

// Marcar notificación como leída
export const marcarNotificacionLeida = async (idNotificacionPersona: number): Promise<{ message: string; notificacion_persona: NotificacionPersona }> => {
  const response = await api.put(`/notificaciones-personas/${idNotificacionPersona}/marcar-leida`)
  return response.data
}

// Función helper para crear notificación de inscripción
export const crearNotificacionInscripcion = async (
  personaId: number, 
  inscripcionId: number, 
  nombreCurso: string,
  cantidadClases?: number
) => {
  try {
    // Paso 1: Crear la notificación
    let mensajeCompleto = '';
    
    if (cantidadClases === 1) {
      // Para una sola clase
      mensajeCompleto = `¡Felicitaciones! Tu inscripción a "${nombreCurso}" ha sido confirmada exitosamente. Puedes ver más detalles de tu clase en la sección "Asistencia" y consultar información de tu inscripción en "Inscripciones". ¡Te esperamos en el estudio!`
    } else {
      // Para paquetes con múltiples clases
      const clasesTexto = cantidadClases ? `${cantidadClases} clases` : 'las clases incluidas'
      mensajeCompleto = `¡Felicitaciones! Tu inscripción a "${nombreCurso}" ha sido confirmada exitosamente. Ahora puedes acceder a ${clasesTexto} en este paquete. Consulta tu horario en "Asistencia" y más información en "Inscripciones". ¡Te esperamos!`
    }
    
    // Asegurar que el mensaje no exceda 600 caracteres
    const mensajeFinal = mensajeCompleto.length > 600 
      ? mensajeCompleto.substring(0, 597) + '...' 
      : mensajeCompleto
    
    // Título simple sin símbolos especiales
    const tituloFinal = 'Inscripción Exitosa'
    
    const notificacionData: CrearNotificacionData = {
      titulo: tituloFinal,
      mensaje: mensajeFinal,
      tipo: 'EXITO' as const,
      categoria: 'INSCRIPCION' as const,
      prioridad: 'MEDIA' as const,
      fecha_creacion: new Date().toISOString().split('T')[0] // Solo la fecha en formato YYYY-MM-DD
    }
    
    console.log('📤 Enviando datos de notificación:', notificacionData)
    console.log('📏 Longitud del título:', tituloFinal.length, 'caracteres (límite: 100)')
    console.log('📏 Longitud del mensaje:', mensajeFinal.length, 'caracteres (límite: 600)')
    const notificacionResponse = await crearNotificacion(notificacionData)
    console.log('✅ Notificación creada:', notificacionResponse)
    
    // Paso 2: Asignar a la persona
    const asignacionData: AsignarNotificacionData = {
      Notificacion_id_notificacion: notificacionResponse.notificacion.id_notificacion,
      Persona_id_persona: personaId,
      Inscricpcion_id_inscricpcion: inscripcionId,
      enviada_sistema: true
    }
    
    await asignarNotificacionPersona(asignacionData)
    
    console.log('✅ Notificación de inscripción creada exitosamente')
    
  } catch (error: any) {
    console.error('❌ Error creando notificación de inscripción:', error)
    if (error.response) {
      console.error('❌ Error response data:', error.response.data)
      console.error('❌ Error response status:', error.response.status)
    }
  }
}