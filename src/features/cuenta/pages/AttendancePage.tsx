import React, { useState, useEffect } from 'react'
import { useAuth } from '@app/hooks/useAuth'
import { api } from '@lib/api'
import { Card } from '@components/ui/Card'
import { Select } from '@components/ui/Select'
import { Spinner } from '@components/ui/Spinner'
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'

// Helper function para formatear fechas sin problemas de zona horaria
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0 a 11
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Tipos para la API de asistencias
interface Asistencia {
  Horario_sesion_id_horario_sesion: number
  Inscripcion_id_inscripcion: number
  asistio: boolean | null
  estado: boolean
  fecha: string | null
  id_asistencia: number
}

interface AsistenciasResponse {
  asistencias: Asistencia[]
  inscripcion_id: number
  total_asistencias: number
}

// Tipos para ciclos activos
interface Ciclo {
  id_ciclo: number
  nombre: string
  inicio: string
  fin: string
  estado: boolean
}

// Tipos para la API de detalle de sesión
interface SesionDetalle {
  id_horario_sesion: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  dia: number
  duracion: number
  cancelado: boolean
  capacidad_maxima: number
  cupos_disponibles: number
  cupos_ocupados: number
  estado: boolean
  motivo: string | null
  horario: {
    id_horario: number
    nivel: number
    capacidad: number
    dias: string
    hora_inicio: string
    hora_fin: string
    estado: boolean
    estilo: {
      id_estilo: number
      nombre_estilo: string
      descripcion_estilo: string
      beneficios_estilo: string
      estado: boolean
    }
    profesor: {
      Persona_id_persona: number
      pais_origen: string
      descripcion: string | null
      estado: boolean
      cuando_comenzo_danza: string | null
      frase: string | null
      musica: any
      redes_sociales: any
      signo: string | null
      persona: {
        nombre: string
        apellido_paterno: string
        apellido_materno: string
        email: string
        celular: string
      }
    }
    sala: {
      id_sala: number
      nombre_sala: string
      ubicacion: string
      link_ubicacion: string
      departamento: string
      zona: string
      estado: boolean
    }
    oferta: {
          id_oferta: number
          nombre_oferta: string
          descripcion: string
          fecha_inicio: string
          fecha_fin: string
          publico_objetivo: string
          repite_semanalmente: boolean
          whatsapplink: string | null
          cantidad_cursos: number
          Subcategoria_id_subcategoria: number
          ciclo_id_ciclo: number
          estado: boolean
          ciclo: {
            id_ciclo: number
            nombre: string
            inicio: string
            fin: string
            estado: boolean
          }
          subcategoria: {
            id_subcategoria: number
            nombre_subcategoria: string
            descripcion_subcategoria: string
            Categoria_id_categoria: number
            estado: boolean
          }
        }
  }
}

// Tipo combinado para mostrar en la tabla
interface ClaseAsistencia {
  id_asistencia: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  estilo: string
  nivel: string
  profesor: string
  profesorNombre: string
  sala: string
  zona: string
  ciclo: string
  subcategoria: string
  inscripcion: string
  asistio: boolean | null
  cancelado: boolean
  id_inscripcion: number
}

// Tipo para agrupar clases por inscripción
interface InscripcionAgrupada {
  id_inscripcion: number
  inscripcion: string
  estilo: string
  ciclo: string
  ciclo_id: number
  subcategoria: string
  clases: ClaseAsistencia[]
  totalClases: number
  asistidas: number
  noAsistidas: number
  pendientes: number
}

export default function AttendancePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inscripciones, setInscripciones] = useState<number[]>([])
  const [selectedCiclo, setSelectedCiclo] = useState<string>('todos')
  const [ciclosDisponibles, setCiclosDisponibles] = useState<Ciclo[]>([])
  const [inscripcionesAgrupadas, setInscripcionesAgrupadas] = useState<InscripcionAgrupada[]>([])
  const [inscripcionesExpandidas, setInscripcionesExpandidas] = useState<Set<number>>(new Set())

  // Cargar ciclos activos
  const loadCiclos = async () => {
    try {
      const response = await api.get<Ciclo[]>('/ciclos/active')
      setCiclosDisponibles(response.data)
    } catch (error) {
      console.error('Error al cargar ciclos:', error)
    }
  }

  // Cargar inscripciones del usuario
  const loadInscripciones = async () => {
    if (!user) return
    
    try {
      const response = await api.get(`/inscripciones/persona/${user.id}`)
      const inscripcionesIds = response.data.map((ins: any) => ins.id_inscripcion)
      setInscripciones(inscripcionesIds)
      
      if (inscripcionesIds.length === 0) {
        setLoading(false)
        return
      }
      
      // Cargar asistencias para todas las inscripciones
      await loadAsistencias(inscripcionesIds)
    } catch (error) {
      console.error('Error al cargar inscripciones:', error)
      setLoading(false)
    }
  }

  // Cargar asistencias para todas las inscripciones y agruparlas
  const loadAsistencias = async (inscripcionesIds: number[]) => {
    try {
      const inscripcionesMap = new Map<number, InscripcionAgrupada>()

      for (const inscripcionId of inscripcionesIds) {
        try {
          // Obtener asistencias de esta inscripción
          const asistenciaResponse = await api.get<AsistenciasResponse>(`/asistencias/inscripcion/${inscripcionId}`)
          
          let inscripcionInfo: InscripcionAgrupada | null = null
          const clases: ClaseAsistencia[] = []
          
          // Para cada asistencia, obtener detalles de la sesión
          for (const asistencia of asistenciaResponse.data.asistencias) {
            try {
              const sesionResponse = await api.get<SesionDetalle>(`/sesiones/detalle/${asistencia.Horario_sesion_id_horario_sesion}`)
              const sesion = sesionResponse.data
              
              // Mapear nivel
              const nivelMap: Record<number, string> = {
                1: 'Básico',
                2: 'Intermedio', 
                3: 'Avanzado'
              }

              // Obtener nombre del profesor directamente desde la persona
              const profesorNombre = sesion.horario.profesor.persona?.nombre || 'Instructor'

              const clase: ClaseAsistencia = {
                id_asistencia: asistencia.id_asistencia,
                fecha: sesion.fecha,
                hora_inicio: sesion.hora_inicio,
                hora_fin: sesion.hora_fin,
                estilo: sesion.horario.estilo.nombre_estilo,
                nivel: nivelMap[sesion.horario.nivel] || 'Básico',
                profesor: profesorNombre,
                profesorNombre: profesorNombre,
                sala: sesion.horario.sala.nombre_sala,
                zona: sesion.horario.sala.zona,
                ciclo: sesion.horario.oferta.ciclo.nombre,
                subcategoria: sesion.horario.oferta.subcategoria.nombre_subcategoria,
                inscripcion: sesion.horario.oferta.nombre_oferta,
                asistio: asistencia.asistio,
                cancelado: sesion.cancelado,
                id_inscripcion: asistencia.Inscripcion_id_inscripcion
              }

              clases.push(clase)

              // Crear info de inscripción si no existe
              if (!inscripcionInfo) {
                inscripcionInfo = {
                  id_inscripcion: inscripcionId,
                  inscripcion: sesion.horario.oferta.nombre_oferta,
                  estilo: sesion.horario.estilo.nombre_estilo,
                  ciclo: sesion.horario.oferta.ciclo.nombre,
                  ciclo_id: sesion.horario.oferta.ciclo.id_ciclo,
                  subcategoria: sesion.horario.oferta.subcategoria.nombre_subcategoria,
                  clases: [],
                  totalClases: 0,
                  asistidas: 0,
                  noAsistidas: 0,
                  pendientes: 0
                }
              }
            } catch (error) {
              console.error(`Error al cargar detalle de sesión ${asistencia.Horario_sesion_id_horario_sesion}:`, error)
            }
          }

          if (inscripcionInfo) {
            // Ordenar clases por fecha (más recientes primero)
            clases.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            
            inscripcionInfo.clases = clases
            inscripcionInfo.totalClases = clases.length
            inscripcionInfo.asistidas = clases.filter(c => c.asistio === true).length
            inscripcionInfo.noAsistidas = clases.filter(c => c.asistio === false).length
            inscripcionInfo.pendientes = clases.filter(c => c.asistio === null && !c.cancelado).length
            
            inscripcionesMap.set(inscripcionId, inscripcionInfo)
          }
        } catch (error) {
          console.error(`Error al cargar asistencias de inscripción ${inscripcionId}:`, error)
        }
      }

      // Convertir a array y ordenar por ciclo/fecha
      const inscripcionesArray = Array.from(inscripcionesMap.values())
      inscripcionesArray.sort((a, b) => b.ciclo.localeCompare(a.ciclo))
      
      setInscripcionesAgrupadas(inscripcionesArray)
    } catch (error) {
      console.error('Error al cargar asistencias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCiclos()
    loadInscripciones()
  }, [user])

  // Resetear inscripciones expandidas cuando cambie el filtro de ciclo
  useEffect(() => {
    setInscripcionesExpandidas(new Set())
  }, [selectedCiclo])

  // Filtrar inscripciones por ciclo seleccionado
  const inscripcionesFiltradas = selectedCiclo === 'todos' 
    ? inscripcionesAgrupadas 
    : inscripcionesAgrupadas.filter(inscripcion => inscripcion.ciclo_id.toString() === selectedCiclo)

  // Debug: mostrar información de filtrado
  console.log('AttendancePage - Filtrado de inscripciones:', {
    selectedCiclo,
    totalInscripciones: inscripcionesAgrupadas.length,
    inscripcionesFiltradas: inscripcionesFiltradas.length,
    ciclosDisponibles: ciclosDisponibles.map(c => ({ id: c.id_ciclo, nombre: c.nombre })),
    inscripcionesConCiclos: inscripcionesAgrupadas.map(i => ({ 
      id: i.id_inscripcion, 
      ciclo: i.ciclo, 
      ciclo_id: i.ciclo_id 
    }))
  })

  // Función para expandir/contraer inscripciones
  const toggleInscripcion = (inscripcionId: number) => {
    const newExpanded = new Set(inscripcionesExpandidas)
    if (newExpanded.has(inscripcionId)) {
      newExpanded.delete(inscripcionId)
    } else {
      newExpanded.add(inscripcionId)
    }
    setInscripcionesExpandidas(newExpanded)
  }

  // Calcular estadísticas totales
  const estadisticasTotales = inscripcionesFiltradas.reduce((acc, inscripcion) => {
    acc.totalClases += inscripcion.totalClases
    acc.asistidas += inscripcion.asistidas
    acc.noAsistidas += inscripcion.noAsistidas
    acc.pendientes += inscripcion.pendientes
    return acc
  }, { totalClases: 0, asistidas: 0, noAsistidas: 0, pendientes: 0 })

  // Función para obtener el ícono de asistencia
  const getAsistenciaIcon = (asistio: boolean | null, cancelado: boolean) => {
    if (cancelado) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (asistio === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (asistio === false) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  // Función para obtener el texto de estado
  const getEstadoTexto = (asistio: boolean | null, cancelado: boolean) => {
    if (cancelado) return 'Cancelada'
    if (asistio === true) return 'Asistió'
    if (asistio === false) return 'No asistió'
    return 'Pendiente'
  }

  // Función para obtener el color del badge
  const getEstadoColor = (asistio: boolean | null, cancelado: boolean) => {
    if (cancelado) return 'bg-red-100 text-red-800 border-red-200'
    if (asistio === true) return 'bg-green-100 text-green-800 border-green-200'
    if (asistio === false) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Cargando asistencias..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Mis Asistencias</h2>
        
        {/* Selector de ciclo */}
        <div className="w-64">
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
            value={selectedCiclo}
            onChange={(e) => setSelectedCiclo(e.target.value)}
          >
            <option value="todos">
              Todos los ciclos ({inscripcionesAgrupadas.length})
            </option>
            {ciclosDisponibles.map((ciclo) => {
              const inscripcionesPorCiclo = inscripcionesAgrupadas.filter(
                i => i.ciclo_id === ciclo.id_ciclo
              ).length
              return (
                <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
                  {ciclo.nombre} ({inscripcionesPorCiclo})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Estadísticas generales */}
      {inscripciones.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{estadisticasTotales.totalClases}</div>
            <div className="text-sm text-slate-600">Total Clases</div>
          </Card>
          
          <Card className="p-4 text-center border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{estadisticasTotales.asistidas}</div>
            <div className="text-sm text-emerald-600">Asistidas</div>
          </Card>
          
          <Card className="p-4 text-center border-red-200">
            <div className="text-2xl font-bold text-red-600">{estadisticasTotales.noAsistidas}</div>
            <div className="text-sm text-red-600">No Asistidas</div>
          </Card>
          
          <Card className="p-4 text-center border-amber-200">
            <div className="text-2xl font-bold text-amber-600">{estadisticasTotales.pendientes}</div>
            <div className="text-sm text-amber-600">Pendientes</div>
          </Card>
        </div>
      )}

      {inscripcionesFiltradas.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No hay inscripciones
          </h3>
          <p className="text-slate-600">
            {selectedCiclo === 'todos' 
              ? 'No se encontraron inscripciones con asistencia registrada.'
              : `No hay inscripciones registradas para el ciclo seleccionado.`
            }
          </p>
        </Card>
      ) : (
        <Card>
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-femme-magenta" />
              Mis Inscripciones y Asistencias
            </h2>
          </div>

          <div className="space-y-4">
            {inscripcionesFiltradas.map((inscripcion) => (
              <div key={inscripcion.id_inscripcion} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Header de la inscripción */}
                <div 
                  className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleInscripcion(inscripcion.id_inscripcion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{inscripcion.inscripcion}</h3>
                          <p className="text-sm text-slate-600">
                            {inscripcion.ciclo} • {inscripcion.subcategoria}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-slate-600">Asistencia</div>
                        <div className="font-semibold text-slate-900">
                          {inscripcion.asistidas}/{inscripcion.totalClases}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-slate-600">Porcentaje</div>
                        <div className="font-semibold text-slate-900">
                          {inscripcion.totalClases > 0 
                            ? Math.round((inscripcion.asistidas / inscripcion.totalClases) * 100)
                            : 0}%
                        </div>
                      </div>
                      
                      <div className="flex items-center text-slate-400">
                        {inscripcionesExpandidas.has(inscripcion.id_inscripcion) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {inscripcionesExpandidas.has(inscripcion.id_inscripcion) && (
                  <div className="p-4 border-t border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-femme-amber/20 text-left text-graphite">
                          <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                            <th className="pb-2">Fecha</th>
                            <th className="pb-2">Hora</th>
                            <th className="pb-2">Estilo</th>
                             <th className="pb-2">Lugar</th>
                            <th className="pb-2">Profesor</th>
                            <th className="pb-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscripcion.clases.map((clase, index) => (
                            <tr key={`${inscripcion.id_inscripcion}-${index}`} className="text-sm">
                              <td className="py-2">
                                {formatDate(clase.fecha)}
                              </td>
                              <td className="py-2">
                                {clase.hora_inicio} - {clase.hora_fin}
                              </td>
                              <td className="py-2">
                                <span className="py-2">{clase.estilo}</span>
                              </td>
                              <td className="py-2">{clase.sala}</td>
                              <td className="py-2">{clase.profesorNombre}</td>
                              <td className="py-2">
                                {clase.cancelado ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                                    <XCircle className="h-3 w-3" />
                                    Cancelada
                                  </span>
                                ) : clase.asistio === true ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                    <CheckCircle className="h-3 w-3" />
                                    Asistí
                                  </span>
                                ) : clase.asistio === false ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                    <XCircle className="h-3 w-3" />
                                    No asistí
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                                    <AlertCircle className="h-3 w-3" />
                                    Pendiente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
