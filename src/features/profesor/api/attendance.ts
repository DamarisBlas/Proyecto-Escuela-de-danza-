import { api } from '@/lib/api'

// ================= INTERFACES =================
export interface Asistencia {
  id_asistencia: number
  Inscripcion_id_inscripcion: number
  Horario_sesion_id_horario_sesion: number
  asistio: boolean | null
  fecha: string | null
  estado: boolean
}

export interface AsistenciaConAlumno extends Asistencia {
  alumno: {
    id_persona: number
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    email: string
  }
  inscripcion: {
    id_inscripcion: number
    clases_usadas: number
    clases_restantes: number
  }
}

export interface Sesion {
  id_sesion: number
  horario_id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  capacidad: number
  capacidad_maxima: number
  cupos_disponibles: number
  cupos_ocupados: number
  duracion: number
  estado: string
  cancelado: boolean
  motivo: string | null
  nivel: number
  estilo: {
    id_estilo: number
    nombre_estilo: string
    descripcion_estilo: string
    beneficios_estilo: string
  }
  profesor: {
    persona_id: number
    nombre: string
    apellido_paterno: string | null
    apellido_materno: string | null
    email: string
    celular: string | null
    pais_origen: string | null
    cuando_comenzo_danza: string | null
    frase: string | null
    descripcion: string | null
    musica: string | null
    signo: string | null
    redes_sociales: any
  }
  sala: {
    id_sala: number
    nombre_sala: string
    zona: string
    departamento: string
    direccion: string
    link_ubicacion: string
  }
  oferta: {
    id_oferta: number
    nombre_oferta: string
    ciclo: string
    tipo: string
    publico_objetivo: string
    descripcion: string
    whatsapplink: string
  }
  paquetes: Array<{
    id_paquete: number
    nombre: string
    precio: number
    cantidad_clases: number | null
    dias_validez: number
    ilimitado: boolean
  }>
}

export interface SesionesResponse {
  sesiones: Sesion[]
  total: number
}

// ================= NEW INTERFACES FOR PROFESSOR ENDPOINTS =================

export interface ProfesorInfo {
  persona_id: number
  pais_origen: string | null
  descripcion: string | null
  es_profesor: boolean
  estado: boolean
  cuando_comenzo_danza: string | null
  frase: string | null
  musica: string | null
  redes_sociales: string | null
  signo: string | null
}

export interface HorarioProfesor {
  capacidad: number
  dias: string
  estado: boolean
  estilo: {
    beneficios_estilo: string
    descripcion_estilo: string
    estado: boolean
    id_estilo: number
    nombre_estilo: string
  }
  hora_fin: string
  hora_inicio: string
  id_horario: number
  nivel: number
  oferta: {
    cantidad_cursos: number
    categoria: {
      id_categoria: number
      nombre_categoria: string
    }
    ciclo: {
      id_ciclo: number
      nombre_ciclo: string
    }
    descripcion: string
    estado: boolean
    fecha_fin: string
    fecha_inicio: string
    id_oferta: number
    nombre_oferta: string
    programa: {
      id_programa: number
      nombre_programa: string
    }
    publico_objetivo: string
    repite_semanalmente: boolean
    subcategoria: {
      id_subcategoria: number
      nombre_subcategoria: string
    }
  }
  sala: {
    departamento: string
    estado: boolean
    id_sala: number
    link_ubicacion: string
    nombre_sala: string
    ubicacion: string
    zona: string
  }
  total_inscritos: number
}

export interface HorariosProfesorResponse {
  horarios: HorarioProfesor[]
  persona_id: number
  total_horarios: number
}

// ================= NEW INTERFACES FOR ENROLLED STUDENTS =================

export interface InscritosResponse {
  fecha: string
  horario_id: number
  inscritos: InscritoDetalle[]
}

export interface InscritosHorarioResponse {
  horario_id: number
  inscritos: InscritoDetalle[]
  total_inscritos: number
}

export interface InscritoDetalle {
  asistencia: {
    Horario_sesion_id_horario_sesion: number
    Inscripcion_id_inscripcion: number
    asistio: boolean | null
    estado: boolean
    fecha: string | null
    id_asistencia: number
  }
  horario: {
    capacidad: number
    dias: string
    estado: boolean
    estilo_id: number
    hora_fin: string
    hora_inicio: string
    id_horario: number
    nivel: number
    oferta_id: number
    profesor_id: number
    sala_id: number
  }
  horario_sesion: {
    cancelado: boolean
    capacidad_maxima: number
    cupos_disponibles: number
    cupos_ocupados: number
    dia: number
    duracion: number
    estado: boolean
    fecha: string
    hora_fin: string
    hora_inicio: string
    horario_id: number
    id_horario_sesion: number
    motivo: string | null
  }
  inscripcion: {
    Paquete_id_paquete: number
    Persona_id_persona: number
    Promocion_id_promocion: number | null
    clases_restantes: number
    clases_usadas: number
    descuento_aplicado: number
    estado: string
    estado_pago: string
    fecha_fin: string
    fecha_inicio: string
    fecha_inscripcion: string
    id_inscripcion: number
    pago_a_cuotas: boolean
    precio_final: number
    precio_original: number
  }
  persona: {
    apellido_paterno: string
    apellido_materno: string
    celular: string
    email: string
    estado: boolean
    fecha_creacion: string
    id_persona: number
    nombre: string
    solicitud_user_especial: boolean
    temporal: any
    tipo_cuenta: any
  }
}

// ================= API FUNCTIONS =================

/**
 * Obtener todas las asistencias
 */
export const fetchAsistencias = async (): Promise<Asistencia[]> => {
  try {
    const response = await api.get('/asistencias')
    return response.data
  } catch (error) {
    console.error('Error fetching asistencias:', error)
    throw error
  }
}

/**
 * Obtener asistencias por inscripción
 */
export const fetchAsistenciasByInscripcion = async (inscripcionId: number): Promise<{ asistencias: Asistencia[] }> => {
  try {
    const response = await api.get(`/asistencias/inscripcion/${inscripcionId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching asistencias by inscripcion:', error)
    throw error
  }
}

/**
 * Obtener asistencias de una sesión específica con datos de alumnos
 */
export const fetchAsistenciasBySesion = async (sesionId: number): Promise<AsistenciaConAlumno[]> => {
  try {
    const response = await api.get(`/asistencias/sesion/${sesionId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching asistencias by sesion:', error)
    throw error
  }
}

/**
 * Marcar asistencia de un alumno
 */
export const marcarAsistencia = async (asistenciaId: number, asistio: boolean | null) => {
  try {
    const response = await api.put(`/asistencias/${asistenciaId}`, {
      asistio,
      fecha: new Date().toISOString().split('T')[0]
    })
    return response.data
  } catch (error) {
    console.error('Error marcando asistencia:', error)
    throw error
  }
}

/**
 * Obtener sesiones por fecha
 */
export const fetchSesionesByFecha = async (fecha: string): Promise<Sesion[]> => {
  try {
    const response = await api.get<SesionesResponse>(`/sesiones/fecha/${fecha}`)
    return response.data.sesiones
  } catch (error) {
    console.error('Error fetching sesiones by fecha:', error)
    throw error
  }
}

/**
 * Obtener información del profesor por persona_id
 */
export const fetchProfesorByPersonaId = async (personaId: number): Promise<ProfesorInfo> => {
  try {
    const response = await api.get(`/profesores/persona/${personaId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching profesor by persona id:', error)
    throw error
  }
}

/**
 * Obtener horarios asignados a un profesor
 */
export const fetchHorariosByProfesor = async (profesorId: number): Promise<HorariosProfesorResponse> => {
  try {
    const response = await api.get(`/horarios/profesor/${profesorId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching horarios by profesor:', error)
    throw error
  }
}

/**
 * Obtener personas inscritas en un horario para una fecha específica
 */
export const fetchInscritosByHorarioFecha = async (horarioId: number, fecha: string): Promise<InscritosResponse> => {
  try {
    const response = await api.get(`/asistencias/inscritos?horario_id=${horarioId}&fecha=${fecha}`)
    return response.data
  } catch (error) {
    console.error('Error fetching inscritos by horario and fecha:', error)
    throw error
  }
}

/**
 * Obtener todas las personas inscritas en un horario (sin filtro de fecha)
 */
export const fetchInscritosByHorario = async (horarioId: number): Promise<InscritosHorarioResponse> => {
  try {
    const response = await api.get(`/asistencias/inscritos/horario/${horarioId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching inscritos by horario:', error)
    throw error
  }
}

/**
 * Marcar asistencia como presente
 */
export const marcarAsistenciaPresente = async (asistenciaId: number) => {
  try {
    const response = await api.put(`/asistencias/marcar-presente/${asistenciaId}`)
    return response.data
  } catch (error) {
    console.error('Error marcando asistencia como presente:', error)
    throw error
  }
}

/**
 * Marcar asistencia como ausente
 */
export const marcarAsistenciaAusente = async (asistenciaId: number) => {
  try {
    const response = await api.put(`/asistencias/marcar-ausente/${asistenciaId}`)
    return response.data
  } catch (error) {
    console.error('Error marcando asistencia como ausente:', error)
    throw error
  }
}

