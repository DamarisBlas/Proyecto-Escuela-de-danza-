import { api } from '@lib/api'
import type { Course } from '../../../types'
import type { Session } from '../types'

export async function listCourses(): Promise<Course[]> {
  const { data } = await api.get('/courses')
  return data
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await api.get('/courses/' + id)
  return data
}

interface BackendSala {
  id_sala: number
  nombre_sala: string
  zona: string
  departamento: string
  ubicacion: string
  link_ubicacion: string
  estado: boolean
}

export interface BranchOption {
  id: number
  label: string
  zona: string
  departamento: string
}

export async function listActiveBranches(): Promise<BranchOption[]> {
  const { data } = await api.get<BackendSala[]>('/salas/active')
  
  return data.map((sala) => ({
    id: sala.id_sala,
    label: sala.departamento + '-' + sala.zona,
    zona: sala.zona,
    departamento: sala.departamento
  }))
}

const NIVEL_MAP: Record<number, string> = {
  1: 'Básico',
  2: 'Intermedio',
  3: 'Avanzado'
}

interface BackendSesion {
  id_sesion: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  cancelado: boolean
  estado: string
  nivel: number
  capacidad: number
  capacidad_maxima: number
  cupos_disponibles: number
  cupos_ocupados: number
  duracion: number
  horario_id: number
  motivo: string | null
  estilo: {
    id_estilo: number
    nombre_estilo: string
    descripcion_estilo: string
    beneficios_estilo: string
  }
  oferta: {
    id_oferta: number
    nombre_oferta: string
    tipo: 'REGULAR' | 'TALLER'
    ciclo: string
    descripcion: string
    publico_objetivo: string
    whatsapplink: string | null
  }
  paquetes: Array<{
    id_paquete: number
    nombre: string
    precio: number
    cantidad_clases: number | null
    dias_validez: number
    ilimitado: boolean
  }>
  profesor: {
    Persona_id_persona: number
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    frase: string | null
    descripcion: string | null
    pais_origen: string | null
    signo: string | null
    musica: string | null
    cuando_comenzo_danza: string | null
    instagram: string | null
  }
  sala: {
    id_sala: number
    nombre: string
    zona: string
    departamento: string
    direccion: string
    link_ubicacion: string
  }
}

interface BackendResponse {
  sesiones: BackendSesion[]
  total: number
}

export async function listScheduleByDate(fecha: string): Promise<Session[]> {
  const url = '/sesiones/fecha/' + fecha
  const { data } = await api.get<BackendResponse>(url)
  
  return data.sesiones.map((s) => {
    const instructor = {
      id: String(s.profesor.Persona_id_persona),
      name: `${s.profesor.nombre} ${s.profesor.apellido_paterno} ${s.profesor.apellido_materno}`.trim(),
      instagram: s.profesor.instagram,
      frase: s.profesor.frase,
      descripcion: s.profesor.descripcion,
      pais_origen: s.profesor.pais_origen,
      signo: s.profesor.signo,
      musica: s.profesor.musica,
      cuando_comenzo_danza: s.profesor.cuando_comenzo_danza
    }
    
    const sala = {
      nombre: s.sala.nombre,
      zona: s.sala.zona,
      departamento: s.sala.departamento,
      direccion: s.sala.direccion,
      link_ubicacion: s.sala.link_ubicacion
    }
    
    const start = s.fecha + 'T' + s.hora_inicio
    const end = s.fecha + 'T' + s.hora_fin
    
    const paquetes = s.paquetes.map((p) => ({
      id: p.id_paquete,
      nombre: p.nombre,
      precio: p.precio,
      cantidad_clases: p.cantidad_clases,
      dias_validez: p.dias_validez,
      ilimitado: p.ilimitado
    }))
    
    return {
      id: String(s.id_sesion),
      courseName: s.estilo.nombre_estilo,
      level: NIVEL_MAP[s.nivel] || 'Básico',
      type: s.oferta.tipo,
      start: start,
      end: end,
      branch: s.sala.zona,
      status: s.cancelado ? ('CANCELLED' as const) : ('ACTIVE' as const),
      motivo: s.motivo,
      instructor: instructor,
      sala: sala,
      descripcion: s.estilo.descripcion_estilo,
      beneficios: s.estilo.beneficios_estilo,
      ciclo: s.oferta.ciclo,
      offerId: s.oferta.id_oferta,
      capacidad: s.capacidad,
      capacidad_maxima: s.capacidad_maxima,
      cupos_disponibles: s.cupos_disponibles,
      cupos_ocupados: s.cupos_ocupados,
      paquetes: paquetes,
      offerName: s.oferta.tipo !== 'REGULAR' ? s.oferta.nombre_oferta : undefined
    }
  })
}

export async function listScheduleByCiclo(ciclo: string): Promise<Session[]> {
  try {
    // Obtener todas las sesiones del ciclo
    const { data } = await api.get<BackendResponse>('/sesiones/ciclo/' + encodeURIComponent(ciclo))
    
    return data.sesiones.map((s) => {
      const instructor = {
        id: String(s.profesor.Persona_id_persona),
        name: `${s.profesor.nombre} ${s.profesor.apellido_paterno} ${s.profesor.apellido_materno}`.trim(),
        instagram: s.profesor.instagram,
        frase: s.profesor.frase,
        descripcion: s.profesor.descripcion,
        pais_origen: s.profesor.pais_origen,
        signo: s.profesor.signo,
        musica: s.profesor.musica,
        cuando_comenzo_danza: s.profesor.cuando_comenzo_danza
      }
      
      const sala = {
        nombre: s.sala.nombre,
        zona: s.sala.zona,
        departamento: s.sala.departamento,
        direccion: s.sala.direccion,
        link_ubicacion: s.sala.link_ubicacion
      }
      
      const start = s.fecha + 'T' + s.hora_inicio
      const end = s.fecha + 'T' + s.hora_fin
      
      const paquetes = s.paquetes.map((p) => ({
        id: p.id_paquete,
        nombre: p.nombre,
        precio: p.precio,
        cantidad_clases: p.cantidad_clases,
        dias_validez: p.dias_validez,
        ilimitado: p.ilimitado
      }))
      
      return {
        id: String(s.id_sesion),
        courseName: s.estilo.nombre_estilo,
        level: NIVEL_MAP[s.nivel] || 'Básico',
        type: s.oferta.tipo,
        start: start,
        end: end,
        branch: s.sala.zona,
        status: s.cancelado ? ('CANCELLED' as const) : ('ACTIVE' as const),
        motivo: s.motivo,
        instructor: instructor,
        sala: sala,
        descripcion: s.estilo.descripcion_estilo,
        beneficios: s.estilo.beneficios_estilo,
        ciclo: s.oferta.ciclo,
        offerId: s.oferta.id_oferta,
        capacidad: s.capacidad,
        capacidad_maxima: s.capacidad_maxima,
        cupos_disponibles: s.cupos_disponibles,
        cupos_ocupados: s.cupos_ocupados,
        paquetes: paquetes,
        offerName: s.oferta.tipo !== 'REGULAR' ? s.oferta.nombre_oferta : undefined
      }
    })
  } catch (error) {
    console.error('Error al obtener sesiones por ciclo:', error)
    return []
  }
}

// ========== Tipos para el endpoint de horarios con profesores ==========

interface BackendPersona {
  id_persona: number
  nombre: string
  apellido: string
  celular: string | null
  email: string | null
  estado: boolean
}

interface BackendProfesor {
  id_profesor: number
  estado?: boolean
  // Estructura antigua (con persona anidada)
  persona?: BackendPersona
  // Estructura nueva (directa)
  nombre?: string
  apellido?: string
}

interface BackendEstilo {
  id_estilo: number
  nombre_estilo: string
  descripcion_estilo: string
  beneficios_estilo: string
  estado: boolean
}

interface BackendCategoria {
  id_categoria: number
  nombre_categoria: string
}

interface BackendSubcategoria {
  id_subcategoria: number
  nombre_subcategoria: string
}

interface BackendPrograma {
  id_programa: number
  nombre_programa: string
}

interface BackendCiclo {
  id_ciclo: number
  nombre_ciclo: string
}

interface BackendOferta {
  id_oferta: number
  nombre_oferta: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  cantidad_cursos: number
  publico_objetivo: string
  estado: boolean
  repite_semanalmente: boolean
  categoria: BackendCategoria
  subcategoria: BackendSubcategoria
  programa: BackendPrograma
  ciclo: BackendCiclo
}

interface BackendHorario {
  id_horario: number
  dias: string
  hora_inicio: string
  hora_fin: string
  nivel: number
  capacidad: number
  estado: boolean
  total_inscritos: number
  estilo: BackendEstilo
  profesor: BackendProfesor
  sala: BackendSala
  oferta: BackendOferta
}

export interface WeeklyScheduleResponse {
  horarios: BackendHorario[]
  total_horarios: number
  oferta?: {
    id_oferta: number
    nombre_oferta: string
    descripcion: string
    fecha_inicio: string
    fecha_fin: string
    cantidad_cursos: number
    publico_objetivo: string
  }
  ciclo?: {
    id_ciclo: number
    nombre: string
    inicio: string
    fin: string
  }
  programa?: {
    id_programa: number
    nombre_programa: string
  }
  categoria?: {
    id_categoria: number
    nombre_categoria: string
  }
  subcategoria?: {
    id_subcategoria: number
    nombre_subcategoria: string
  }
  fecha_consulta?: string
}

// ========== Fetch horarios semanales ==========

export async function fetchWeeklySchedule(): Promise<WeeklyScheduleResponse> {
  const { data } = await api.get<any>('/horarios/cursos-regulares/vigente')
  return {
    horarios: data.horarios || [],
    total_horarios: data.total_horarios || 0,
    oferta: data.oferta,
    ciclo: data.ciclo,
    programa: data.programa,
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    fecha_consulta: data.fecha_consulta
  }
}

// ========== Tipos para cronograma por ciclo ==========

interface BackendCategoriaOferta {
  id_categoria: number
  nombre_categoria: string
}

interface BackendSubcategoriaOferta {
  id_subcategoria: number
  nombre_subcategoria: string
}

interface BackendOfertaCiclo {
  id_oferta: number
  nombre_oferta: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  cantidad_cursos: number
  publico_objetivo: string
  estado: boolean
  repite_semanalmente: boolean
  categoria: BackendCategoriaOferta
  subcategoria: BackendSubcategoriaOferta
}

interface BackendCiclo {
  id_ciclo: number
  nombre_ciclo: string
  fecha_inicio: string
  fecha_fin: string
  estado: boolean
  ofertas?: BackendOfertaCiclo[]
}

export interface CycleScheduleResponse {
  ciclos: BackendCiclo[]
  total_ciclos: number
}

// ========== Fetch cronograma por ciclo ==========

export async function fetchCycleSchedule(): Promise<CycleScheduleResponse> {
  const { data } = await api.get<CycleScheduleResponse>('/ciclos/cronograma')
  return data
}

// ========== Fetch paquetes por oferta ==========

interface BackendPaquete {
  id_paquete: number
  nombre: string
  precio: number
  cantidad_clases: number
  dias_validez: number
  ilimitado: boolean
  estado: boolean
  oferta_id: number
}

export async function fetchPaquetesByOferta(ofertaId: number): Promise<BackendPaquete[]> {
  const { data } = await api.get<BackendPaquete[]>(`/paquetes?oferta_id=${ofertaId}`)
  return data
}

export async function fetchAllPaquetes(): Promise<BackendPaquete[]> {
  const { data } = await api.get<BackendPaquete[]>('/paquetes')
  return data
}

// ========== Marcado automático ==========

interface SesionDetalle {
  id_horario_sesion: number
  horario_id: number
  fecha: string
  dia: number
  hora_inicio: string
  hora_fin: string
  capacidad_maxima: number
  cupos_disponibles: number
}

interface MarcadoAutomaticoResponse {
  fecha_inicio: string
  fecha_fin: string
  cantidad_clases_paquete: number
  horarios_consultados: number[]
  ids_horario_sesion: number[]
  sesiones_disponibles_totales: number
  total_sesiones_seleccionadas: number
  sesiones_detalle: SesionDetalle[]
}

export async function fetchMarcadoAutomatico(
  fechaInicio: string,
  fechaFin: string,
  horariosIds: number[],
  cantidadClases: number
): Promise<MarcadoAutomaticoResponse> {
  const params = new URLSearchParams({
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    horarios_ids: horariosIds.join(','),
    cantidad_clases: cantidadClases.toString()
  })
  
  const { data } = await api.get<MarcadoAutomaticoResponse>(
    `/horarios/marcado-automatico?${params.toString()}`
  )
  return data
}
