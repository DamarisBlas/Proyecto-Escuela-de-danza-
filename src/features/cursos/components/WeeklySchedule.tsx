import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWeeklySchedule, fetchPaquetesByOferta, fetchMarcadoAutomatico } from '../api/courses'
import { api } from '@lib/api'
import { Spinner } from '@components/ui/Spinner'
import { X, Filter, MapPin, Users, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@app/store/useAuthStore'
import ConfirmAutoMarkingModal from './ConfirmAutoMarkingModal'

// Paleta femme
const PALETTE = {
  femme: {
    magenta: '#C2185B',
    rose: '#EC407A',
    coral: '#F04E45',
    orange: '#FB8C00',
    amber: '#FFB300',
    softyellow: '#FFE082',
  },
  ink: '#121212',
  graphite: '#333333',
  snow: '#FFFFFF',
}

// Colores por sala - más vibrantes y modernos
const ROOM_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'Studio Dance': {
    bg: 'linear-gradient(135deg, #EC407A 0%, #C2185B 100%)',
    border: '#C2185B',
    text: PALETTE.snow,
    accent: '#FCE4EC',
  },
  'Universe Dance': {
    bg: 'linear-gradient(135deg, #FB8C00 0%, #F04E45 100%)',
    border: '#F04E45',
    text: PALETTE.snow,
    accent: '#FFF3E0',
  },
 
  default: {
    bg: 'linear-gradient(135deg, #78909C 0%, #546E7A 100%)',
    border: '#546E7A',
    text: PALETTE.snow,
    accent: '#ECEFF1',
  },
}

// Paleta de colores para profesores (más variedad)
const TEACHER_COLOR_PALETTE = [
  '#C2185B', // Magenta
  '#EC407A', // Rosa
  '#F06292', // Rosa claro
  '#FB8C00', // Naranja
  '#FF7043', // Coral
  '#FFA726', // Naranja claro
  '#FFB300', // Ámbar
  '#7E57C2', // Púrpura
  '#5C6BC0', // Índigo
  '#42A5F5', // Azul
  '#26C6DA', // Cian
  '#26A69A', // Verde azulado
  '#66BB6A', // Verde
  '#9CCC65', // Verde lima
  '#D4E157', // Lima
  '#FFCA28', // Amarillo
]

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

function getRoomColors(salaNombre: string) {
  return ROOM_COLORS[salaNombre] || ROOM_COLORS.default
}

// Generar color único por profesor basado en su ID
function getTeacherColor(idProfesor: number) {
  const index = idProfesor % TEACHER_COLOR_PALETTE.length
  return TEACHER_COLOR_PALETTE[index]
}

// Obtener nombre completo del profesor
function getTeacherFullName(profesor: any) {
  // Soportar ambas estructuras: profesor.persona.nombre o profesor.nombre directamente
  if (profesor.persona) {
    const nombre = (profesor.persona.nombre || '').trim()
    const apPat = (profesor.persona.apellido_paterno || '').trim()
    const apMat = (profesor.persona.apellido_materno || '').trim()
    return `${nombre} ${apPat} ${apMat}`.trim()
  }
  const nombre = (profesor.nombre || '').trim()
  const apPat = (profesor.apellido_paterno || '').trim()
  const apMat = (profesor.apellido_materno || '').trim()
  return `${nombre} ${apPat} ${apMat}`.trim()
}

// Extrae un id estable del profesor (persona_id, Persona_id_persona, id_profesor o persona.id_persona)
function getProfessorId(profesor: any) {
  return profesor.persona_id ?? profesor.Persona_id_persona ?? profesor.id_profesor ?? profesor.persona?.id_persona ?? 0
}

function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

interface WeeklyScheduleProps {
  onClose: () => void
  isEmbedded?: boolean // Nueva prop para modo integrado (sin modal flotante)
}

export default function WeeklySchedule({ onClose, isEmbedded = false }: WeeklyScheduleProps) {
  const { user } = useAuthStore()
  const [salaFilter, setSalaFilter] = useState('all')
  const [profesorFilter, setProfesorFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Date range for fetching sessions
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  
  // Selected schedules tracking
  const [selectedHorarios, setSelectedHorarios] = useState<number[]>([])
  const [sesionesData, setSesionesData] = useState<Record<number, any[]>>({})
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  
  // Paquetes de la oferta
  const [paquetes, setPaquetes] = useState<any[]>([])
  const [selectedPaquete, setSelectedPaquete] = useState<number | null>(null)
  const [loadingPaquetes, setLoadingPaquetes] = useState(false)
  
  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalData, setConfirmModalData] = useState<{
    primeraFecha: string
    totalSesiones: number
    paquete: any
  } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['weeklySchedule'],
    queryFn: fetchWeeklySchedule,
  })

  // Fetch paquetes cuando se carga la oferta
  useEffect(() => {
    const fetchPaquetes = async () => {
      if (data?.oferta?.id_oferta) {
        setLoadingPaquetes(true)
        try {
          const response = await api.get(`/paquetes/oferta/${data.oferta.id_oferta}`)
          setPaquetes(response.data || [])
        } catch (error) {
          console.error('Error al cargar paquetes:', error)
        } finally {
          setLoadingPaquetes(false)
        }
      }
    }
    fetchPaquetes()
  }, [data?.oferta?.id_oferta])

  // Handle horario selection and fetch sessions
  const handleToggleHorario = async (idHorario: number) => {
    if (!fechaInicio || !fechaFin) {
      alert('⚠️ Por favor selecciona las fechas de inicio y fin primero')
      return
    }

    const isSelected = selectedHorarios.includes(idHorario)
    
    if (isSelected) {
      // Deselect
      setSelectedHorarios(prev => prev.filter(id => id !== idHorario))
      setSesionesData(prev => {
        const newData = { ...prev }
        delete newData[idHorario]
        return newData
      })
    } else {
      // Select and fetch sessions
      setLoadingSesiones(true)
      try {
        const response = await api.get(`/horarios/sesiones/${idHorario}`, {
          params: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            persona_id: user?.id
          }
        })
        
        console.log('📅 Respuesta de sesiones para horario', idHorario, ':', response.data)
        console.log('📊 Tipo de response.data:', typeof response.data)
        console.log('📊 Es array?:', Array.isArray(response.data))
        console.log('📊 Keys del objeto:', Object.keys(response.data))
        
        // Extraer el array de sesiones del objeto respuesta
        const sesionesArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data.sesiones || response.data.data || [])
        
        console.log('✅ Array de sesiones extraído:', sesionesArray)
        
        setSelectedHorarios(prev => [...prev, idHorario])
        setSesionesData(prev => ({
          ...prev,
          [idHorario]: sesionesArray
        }))
      } catch (error) {
        console.error('Error al cargar sesiones:', error)
        alert('❌ Error al cargar las sesiones de este horario')
      } finally {
        setLoadingSesiones(false)
      }
    }
  }
  
  // Función para confirmar y navegar a Schedule
  const handleConfirmAutoMarking = () => {
    if (!confirmModalData) return
    
    const paqueteCompleto = paquetes.find(p => p.id_paquete === selectedPaquete)
    
    if (!paqueteCompleto) {
      alert('Error: No se encontró el paquete seleccionado')
      return
    }
    
    // Normalizar el paquete para que use la estructura esperada por Schedule
    const paqueteNormalizado = {
      id: paqueteCompleto.id_paquete,
      nombre: paqueteCompleto.nombre,
      precio: paqueteCompleto.precio,
      cantidad_clases: paqueteCompleto.cantidad_clases,
      dias_validez: paqueteCompleto.dias_validez,
      ilimitado: paqueteCompleto.ilimitado
    }
    
    // Recolectar todas las sesiones con sus fechas
    const todasLasSesiones = Object.entries(sesionesData)
      .flatMap(([idHorario, sesiones]) => 
        sesiones.map((item: any) => {
          const sesion = item.sesion || item
          return {
            id: sesion.id_horario_sesion,
            fecha: sesion.fecha
          }
        })
      )
    
    // Ordenar por fecha
    const sesionesOrdenadas = todasLasSesiones.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )
    
    // Preparar datos para pasar a Schedule
    const selectionData = {
      paquete: paqueteNormalizado, // Usar paquete normalizado
      sesionesIds: todasLasSesiones.map(s => s.id),
      ciclo: data?.ciclo?.nombre || '',
      offerId: data?.oferta?.id_oferta || null,
      primeraFecha: confirmModalData.primeraFecha
    }
    
    console.log('📋 Datos para marcar en agenda:', selectionData)
    console.log('📦 Paquete normalizado:', paqueteNormalizado)
    console.log('📅 Primera fecha de sesión:', confirmModalData.primeraFecha)
    
    // Guardar en sessionStorage
    sessionStorage.setItem('weeklyScheduleSelection', JSON.stringify(selectionData))
    
    // Cerrar modal de confirmación y WeeklySchedule
    setShowConfirmModal(false)
    onClose()
  }

  if (isLoading) {
    if (isEmbedded) {
      return (
        <div className="py-12 flex items-center justify-center">
          <Spinner />
        </div>
      )
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative mx-4 w-full max-w-7xl rounded-3xl bg-white p-8 shadow-2xl">
          <Spinner />
        </div>
      </div>
    )
  }

  if (error || !data) {
    if (isEmbedded) {
      return (
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-red-50 p-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-center text-lg font-semibold text-red-600">
              Error al cargar los horarios
            </p>
            <p className="text-center text-sm text-slate-600">
              Por favor, intenta nuevamente más tarde
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative mx-4 w-full max-w-7xl rounded-3xl bg-white p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-red-50 p-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-center text-lg font-semibold text-red-600">
              Error al cargar los horarios
            </p>
            <p className="text-center text-sm text-slate-600">
              Por favor, intenta nuevamente más tarde
            </p>
          </div>
        </div>
      </div>
    )
  }

  const horarios = data.horarios || []

  // Debug: Ver estructura de datos
  console.log('📊 Total horarios recibidos:', horarios.length)
  if (horarios.length > 0) {
    console.log(' Estructura del primer horario:', horarios[0])
    console.log(' Oferta del primer horario:', horarios[0].oferta)
    console.log(' subcategoria del primer horario:', horarios[0].oferta?.subcategoria)
  }

  // Obtener listas únicas de salas y profesores
  const salas = Array.from(new Set(horarios.map((h) => h.sala.nombre_sala)))
  
  // Crear un mapa de profesores únicos con sus IDs para mantener colores consistentes
  const profesoresMap = new Map<string, { id: number; nombre: string }>()
  horarios.forEach((h) => {
    const fullName = getTeacherFullName(h.profesor)
    if (!profesoresMap.has(fullName)) {
      profesoresMap.set(fullName, {
        id: getProfessorId(h.profesor),
        nombre: fullName,
      })
    }
  })
  
  const profesoresUnicos = Array.from(profesoresMap.values()).sort((a, b) => 
    a.nombre.localeCompare(b.nombre)
  )
  
  const profesores = Array.from(profesoresMap.keys())

  // Filtrar horarios
  const filteredHorarios = horarios.filter(
    (h) => {
      const fullName = getTeacherFullName(h.profesor)
      // El nuevo endpoint ya filtra por cursos regulares vigentes, no necesitamos filtrar por subcategoría
      return (
        (salaFilter === 'all' || h.sala.nombre_sala === salaFilter) &&
        (profesorFilter === 'all' || fullName === profesorFilter)
      )
    }
  )

  // Crear slots de tiempo únicos
  const slotsSet = new Set<string>()
  filteredHorarios.forEach((h) => {
    slotsSet.add(`${h.hora_inicio}-${h.hora_fin}`)
  })

  const timeSlots = Array.from(slotsSet).sort((a, b) => {
    const [aStart] = a.split('-')
    const [bStart] = b.split('-')
    return parseTimeToMinutes(aStart) - parseTimeToMinutes(bStart)
  })

  // Obtener niveles legibles
  const getNivelLabel = (nivel: number) => {
    switch (nivel) {
      case 1:
        return 'Básico'
      case 2:
        return 'Intermedio'
      case 3:
        return 'Avanzado'
      default:
        return `Nivel ${nivel}`
    }
  }

  // Obtener badge de nivel
  const getNivelBadge = (nivel: number) => {
    const badges = {
      1: { label: 'BASIC', color: 'bg-femme-softyellow text-ink border-femme-amber' },
      2: { label: 'INTER', color: 'bg-femme-softpink text-femme-magenta border-femme-magenta/30' },
      3: { label: 'PRO', color: 'bg-femme-coral/20 text-femme-coral border-femme-coral/40' },
    }
    return badges[nivel as keyof typeof badges] || { label: `N${nivel}`, color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  return (
    <div className={isEmbedded ? '' : 'fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'}>
      <div className={isEmbedded ? '' : 'h-full overflow-y-auto'}>
        <div className={isEmbedded ? '' : 'min-h-full p-4 md:p-6 lg:p-8'}>
          <div className={`relative ${isEmbedded ? '' : 'mx-auto max-w-7xl'} rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white shadow-2xl`}>
            {/* Header con gradiente */}
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-femme-magenta via-femme-rose to-femme-coral px-6 py-8 md:px-8 md:py-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              
              <div className="relative">
                {!isEmbedded && (
                  <button
                    onClick={onClose}
                    className="absolute -right-2 -top-2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95 md:right-0 md:top-0"
                    aria-label="Cerrar"
                  >
                    <X size={24} />
                  </button>
                )}

                <div className={isEmbedded ? '' : 'pr-12'}>
                  <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                     Horario Semanal
                  </h2>
                  <p className="max-w-2xl text-sm text-white/90 md:text-base">
                    Vista completa de todas las clases de la semana. Filtra por sala o profesor para encontrar lo que buscas.
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-6 flex flex-wrap gap-3">
                 
                  <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {salas.length} {salas.length === 1 ? 'sala' : 'salas'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Users className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {profesores.length} {profesores.length === 1 ? 'profesor' : 'profesores'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Date Range Section */}
              <div className="mb-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-800"> Rango de Fechas para Sesiones</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm text-slate-700 transition-all focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-sm text-slate-700 transition-all focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros mejorados */}
              <div className="mb-6">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="mb-3 flex w-full items-center justify-between rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg md:hidden"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-femme-magenta" />
                        <span className="font-semibold text-slate-700">Filtros</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {showFilters ? 'Ocultar' : 'Mostrar'}
                      </span>
                    </button>

                    <div className={`grid gap-4 md:grid-cols-2 ${showFilters ? 'block' : 'hidden md:grid'}`}>
                      <div className="group">
                        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          Sala
                        </label>
                        <select
                          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-femme-magenta focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                          value={salaFilter}
                          onChange={(e) => setSalaFilter(e.target.value)}
                        >
                          <option value="all">Todas las salas</option>
                          {salas.map((sala) => (
                            <option key={sala} value={sala}>
                              {sala}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="group">
                        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                          <Users className="h-3.5 w-3.5" />
                          Profesor/a
                        </label>
                        <select
                          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-femme-magenta focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                          value={profesorFilter}
                          onChange={(e) => setProfesorFilter(e.target.value)}
                        >
                          <option value="all">Todos los profesores</option>
                          {profesores.map((profesor) => (
                            <option key={profesor} value={profesor}>
                              {profesor}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Reset filters */}
                    {(salaFilter !== 'all' || profesorFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSalaFilter('all')
                          setProfesorFilter('all')
                        }}
                        className="mt-3 text-sm font-semibold text-femme-magenta transition-colors hover:text-femme-rose"
                      >
                        ✕ Limpiar filtros
                      </button>
                    )}
                  </div>

                  {/* Código de colores - Leyenda compacta en una fila */}
                  <div className="mb-6 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      {/* Salas */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Salas:</span>
                        <div className="flex flex-wrap gap-2">
                          {salas.map((sala) => {
                            const colors = getRoomColors(sala)
                            return (
                              <div key={sala} className="flex items-center gap-1.5">
                                <div
                                  className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
                                  style={{ background: colors.bg }}
                                />
                                <span className="text-xs font-medium text-slate-700">{sala}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Profesores */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Profesores ({profesores.length}):</span>
                        <div className="flex flex-wrap gap-2">
                          {profesores.map((profesor) => {
                            const teacherAccent = TEACHER_COLOR_PALETTE[profesores.indexOf(profesor) % TEACHER_COLOR_PALETTE.length]
                            return (
                              <div key={profesor} className="flex items-center gap-1.5">
                                <div
                                  className="h-2.5 w-2.5 rounded-full border border-slate-300"
                                  style={{ background: teacherAccent }}
                                />
                                <span className="text-xs font-medium text-slate-700">{profesor}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hint de scroll */}
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 md:hidden">
                    <span className="text-2xl">👉</span>
                    <p className="text-xs font-medium text-slate-600">
                      Desliza horizontalmente para ver todos los días
                    </p>
                  </div>

                  {/* Grid de horarios - Mismo diseño para móvil y desktop (solo cambia el tamaño) */}
                  <div className="overflow-x-auto rounded-2xl border-2 border-slate-200/80 bg-white shadow-xl">
                    <div className="min-w-[750px] md:min-w-[900px]">
                      <div
                        className="grid gap-0.5 bg-slate-100 p-0.5"
                        style={{
                          gridTemplateColumns: `minmax(70px, 80px) repeat(7, minmax(90px, 1fr))`,
                        }}
                      >
                        {/* Cabecera vacía para la columna de horas */}
                        <div className="bg-gradient-to-br from-slate-50 to-white" />

                        {/* Cabecera de días */}
                        {DAYS.map((day, idx) => (
                          <div
                            key={day}
                            className="bg-gradient-to-br from-femme-magenta/5 to-femme-rose/5 py-2 md:py-4 text-center"
                          >
                            <div className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              {DAYS_SHORT[idx]}
                            </div>
                            <div className="mt-0.5 text-xs md:text-sm font-bold text-slate-700">{day}</div>
                          </div>
                        ))}

                        {/* Filas por horario */}
                        {timeSlots.map((slot, slotIdx) => {
                          const [start, end] = slot.split('-')

                          return (
                            <React.Fragment key={slot}>
                              <div className="bg-gradient-to-r from-slate-50 to-white flex items-center justify-center px-2 md:px-3 py-3 md:py-4">
                                <div className="text-center">
                                  <div className="text-[10px] md:text-xs font-bold text-slate-700">{start}</div>
                                  <div className="text-[8px] md:text-[10px] text-slate-400">a</div>
                                  <div className="text-[10px] md:text-xs font-bold text-slate-700">{end}</div>
                                </div>
                              </div>
                              {DAYS.map((day) => {
                                const slotClasses = filteredHorarios.filter(
                                  (h) => h.dias === day && `${h.hora_inicio}-${h.hora_fin}` === slot
                                )

                                return (
                                  <div
                                    key={day}
                                    className="bg-white flex min-h-[80px] md:min-h-[100px] items-center justify-center p-1.5 md:p-2"
                                  >
                                    {slotClasses.length > 0 ? (
                                      <div className="flex w-full flex-col gap-1.5 md:gap-2">
                                        {slotClasses.map((h) => {
                                          const roomColors = getRoomColors(h.sala.nombre_sala)
                                          const teacherAccent = getTeacherColor(getProfessorId(h.profesor))
                                          const fullName = getTeacherFullName(h.profesor)
                                          const profesorNombre = fullName.split(' ')[0]
                                          const nivelBadge = getNivelBadge(h.nivel)
                                          const cuposDisponibles = h.capacidad - (h.total_inscritos || 0)
                                          const isSelected = selectedHorarios.includes(h.id_horario)

                                          return (
                                            <div
                                              key={h.id_horario}
                                              onClick={() => handleToggleHorario(h.id_horario)}
                                              className={`group relative w-full cursor-pointer overflow-hidden rounded-lg md:rounded-xl border-2 shadow-md transition-all hover:scale-105 hover:shadow-xl ${
                                                isSelected ? 'ring-2 md:ring-4 ring-green-400 ring-offset-1 md:ring-offset-2' : ''
                                              }`}
                                              style={{
                                                background: roomColors.bg,
                                                borderColor: isSelected ? '#10b981' : roomColors.border,
                                              }}
                                            >
                                              <div className="relative p-2 md:p-3">
                                                {/* Selection indicator */}
                                                {isSelected && (
                                                  <div className="absolute left-1.5 md:left-2 top-1.5 md:top-2 rounded-full bg-femme-magenta p-0.5 md:p-1">
                                                    <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                                                  </div>
                                                )}
                                                
                                                {/* Nivel badge - esquina superior */}
                                                <div className="absolute right-1.5 md:right-2 top-1.5 md:top-2">
                                                  <span className={`rounded-md border px-1 md:px-1.5 py-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wider ${nivelBadge.color}`}>
                                                    {nivelBadge.label}
                                                  </span>
                                                </div>

                                                {/* Nombre del estilo */}
                                                <h4 className="mb-1.5 md:mb-2 pr-10 md:pr-12 text-[10px] md:text-sm font-black uppercase leading-tight tracking-wide text-white">
                                                  {h.estilo.nombre_estilo}
                                                </h4>

                                                {/* Info del profesor */}
                                                <div className="mb-1 md:mb-1.5 flex items-center gap-1 md:gap-1.5">
                                                  <span
                                                    className="h-1.5 w-1.5 md:h-2 md:w-2 flex-shrink-0 rounded-full border border-white/50"
                                                    style={{ background: teacherAccent }}
                                                  />
                                                  <span className="text-[9px] md:text-xs font-semibold text-white/95 truncate">
                                                    {profesorNombre}
                                                  </span>
                                                </div>

                                                {/* Sala y cupos */}
                                                <div className="flex items-center justify-between text-[8px] md:text-[10px] text-white/80">
                                                  <span className="flex items-center gap-0.5 md:gap-1 truncate">
                                                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                                                    <span className="truncate">{h.sala.zona}</span>
                                                  </span>
                                                  <span className="flex items-center gap-0.5 md:gap-1 font-semibold flex-shrink-0">
                                                    <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                    {cuposDisponibles}/{h.capacidad}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-slate-300">—</div>
                                    )}
                                  </div>
                                )
                              })}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Schedules Section */}
                  {selectedHorarios.length > 0 && (
                    <div className="mt-8 rounded-xl border-2 border-femme-magenta/30 bg-gradient-to-br from-femme-softpink to-femme-softpink/50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                          <CheckCircle2 className="h-5 w-5 text-femme-magenta" />
                          Horarios Seleccionados ({selectedHorarios.length})
                        </h3>
                        <div className="rounded-lg bg-femme-magenta px-4 py-2 text-sm font-bold text-white shadow-md">
                          📅 Total: {Object.values(sesionesData).reduce((total, sesiones) => total + (sesiones?.length || 0), 0)} sesiones
                        </div>
                      </div>
                      
                      {loadingSesiones && (
                        <div className="flex items-center justify-center py-4">
                          <Spinner />
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {selectedHorarios.map(idHorario => {
                          const horario = filteredHorarios.find(h => h.id_horario === idHorario)
                          if (!horario) return null
                          
                          const sesiones = sesionesData[idHorario] || []
                          const roomColors = getRoomColors(horario.sala.nombre_sala)
                          
                          console.log('🔍 Renderizando horario', idHorario, 'con sesiones:', sesiones)
                          
                          return (
                            <div key={idHorario} className="rounded-xl bg-white p-4 shadow-md border-2 border-femme-magenta/20">
                              <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-slate-800">{horario.estilo.nombre_estilo}</h4>
                                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {horario.dias}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {horario.hora_inicio} - {horario.hora_fin}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {horario.sala.nombre_sala}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3.5 w-3.5" />
                                      {getTeacherFullName(horario.profesor)}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleToggleHorario(idHorario)}
                                  className="rounded-lg bg-red-100 p-2 text-red-600 transition-all hover:bg-red-200"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="mt-3 border-t border-slate-200 pt-3">
                                <div className="mb-2 text-xs font-semibold uppercase text-slate-600">
                                  📅 Sesiones Disponibles: {Array.isArray(sesiones) ? sesiones.length : 0}
                                </div>
                                
                                {!Array.isArray(sesiones) && (
                                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                    ⚠️ Datos de sesiones inválidos. Tipo recibido: {typeof sesiones}
                                  </div>
                                )}
                                
                                {Array.isArray(sesiones) && sesiones.length === 0 && (
                                  <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg text-center">
                                    No hay sesiones disponibles en este rango de fechas
                                  </div>
                                )}
                                
                                {Array.isArray(sesiones) && sesiones.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {sesiones.slice(0, 10).map((item: any, idx: number) => {
                                      const sesion = item.sesion || item
                                      return (
                                        <div
                                          key={sesion.id_horario_sesion || idx}
                                          className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-xs"
                                        >
                                          <div className="font-bold text-slate-800">{sesion.fecha}</div>
                                          <div className="text-slate-600">
                                            {sesion.cupos_disponibles}/{sesion.capacidad_maxima} cupos
                                          </div>
                                        </div>
                                      )
                                    })}
                                    {sesiones.length > 10 && (
                                      <div className="flex items-center px-3 py-2 text-xs text-slate-500">
                                        +{sesiones.length - 10} más
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Sección de Paquetes */}
                      {paquetes.length > 0 && (
                        <div className="mt-6 rounded-xl border-2 border-femme-magenta/30 bg-gradient-to-br from-femme-softpink to-femme-softpink/50 p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                               Selecciona un Paquete
                            </h3>
                            <div className="text-sm text-slate-600">
                              Clases seleccionadas automaticamente: <span className="font-bold text-femme-magenta">{Object.values(sesionesData).reduce((total, sesiones) => total + (sesiones?.length || 0), 0)} clases</span>
                            </div>
                          </div>
                          
                          {loadingPaquetes ? (
                            <div className="flex justify-center py-4">
                              <Spinner />
                            </div>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {paquetes.map((paquete) => {
                                const totalSesiones = Object.values(sesionesData).reduce((total, sesiones) => total + (sesiones?.length || 0), 0)
                                const isInsufficient = !paquete.ilimitado && paquete.cantidad_clases < totalSesiones
                                const isDisabled = isInsufficient
                                
                                return (
                                  <label
                                    key={paquete.id_paquete}
                                    className={`rounded-lg border-2 p-4 transition-all ${
                                      isDisabled
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
                                        : selectedPaquete === paquete.id_paquete
                                        ? 'cursor-pointer border-femme-magenta bg-femme-softpink ring-2 ring-femme-magenta/30'
                                        : 'cursor-pointer border-slate-200 bg-white hover:border-femme-magenta/50 hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        disabled={isDisabled}
                                        checked={selectedPaquete === paquete.id_paquete}
                                        onChange={(e) => {
                                          setSelectedPaquete(e.target.checked ? paquete.id_paquete : null)
                                        }}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-femme-magenta focus:ring-2 focus:ring-femme-magenta disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                      <div className="flex-1">
                                        <div className="font-bold text-slate-800">{paquete.nombre}</div>
                                        <div className="mt-1 text-sm text-slate-600">
                                          {paquete.ilimitado ? (
                                            <span className="font-semibold text-femme-magenta">✨ Clases ilimitadas</span>
                                          ) : (
                                            <span>{paquete.cantidad_clases} {paquete.cantidad_clases === 1 ? 'clase' : 'clases'}</span>
                                          )}
                                        </div>
                                        {isInsufficient && (
                                          <div className="mt-1 text-xs font-semibold text-red-600">
                                            ⚠️ Insuficiente (necesitas {totalSesiones})
                                          </div>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                          <span className="text-xs text-slate-500">
                                            Válido {paquete.dias_validez} días
                                          </span>
                                          <span className="text-lg font-bold text-femme-magenta">
                                            Bs. {paquete.precio.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Botón para marcar clases seleccionadas */}
                      {selectedHorarios.length > 0 && selectedPaquete && (
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={() => {
                              // Buscar el paquete completo
                              const paqueteCompleto = paquetes.find(p => p.id_paquete === selectedPaquete)
                              
                              // Recolectar todas las sesiones con sus fechas
                              const todasLasSesiones = Object.entries(sesionesData)
                                .flatMap(([idHorario, sesiones]) => 
                                  sesiones.map((item: any) => {
                                    const sesion = item.sesion || item
                                    return {
                                      id: sesion.id_horario_sesion,
                                      fecha: sesion.fecha
                                    }
                                  })
                                )
                              
                              // Ordenar por fecha y obtener la primera
                              const sesionesOrdenadas = todasLasSesiones.sort((a, b) => 
                                new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                              )
                              const primeraFecha = sesionesOrdenadas.length > 0 ? sesionesOrdenadas[0].fecha : null
                              
                              if (!primeraFecha || !paqueteCompleto) {
                                alert('Error: No se pudo obtener la información necesaria')
                                return
                              }
                              
                              // Mostrar modal de confirmación
                              setConfirmModalData({
                                primeraFecha,
                                totalSesiones: todasLasSesiones.length,
                                paquete: paqueteCompleto
                              })
                              setShowConfirmModal(true)
                            }}
                            className="rounded-xl bg-gradient-to-r from-femme-magenta to-femme-rose px-8 py-3 text-base font-bold text-white shadow-lg transition hover:shadow-xl hover:from-green-700 hover:to-emerald-700"
                          >
                            ✓ Marcar clases seleccionadas en agenda
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado vacío */}
                  {timeSlots.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-slate-700">
                        No hay clases disponibles
                      </h3>
                      <p className="text-sm text-slate-500">
                        Intenta cambiar los filtros para ver más opciones
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación */}
      {confirmModalData && (
        <ConfirmAutoMarkingModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmAutoMarking}
          primeraFecha={confirmModalData.primeraFecha}
          totalSesiones={confirmModalData.totalSesiones}
          paquete={confirmModalData.paquete}
        />
      )}
    </div>
  )
}
