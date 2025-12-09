import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listScheduleByDate, listActiveBranches, listScheduleByCiclo } from '../api/courses'
import type { Session, CourseType, Paquete } from '../types'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, User, Check, X, CalendarDays, FileText } from 'lucide-react'
import { Spinner } from '@components/ui/Spinner'
import { useAuth } from '@app/hooks/useAuth'
import { useCart } from '@app/store/useCart'
import { verificarInscripcion } from '@features/cuenta/api/inscripciones'
import Filters from './Filters'
import CourseDetailModal from './CourseDetailModal'
import TeacherDetailModal from './TeacherDetailModal'
import PackagesModal from './PackagesModal'
import DateRangeErrorModal from './DateRangeErrorModal'
import ClassLimitModal from './ClassLimitModal'
import SelectionRequiredModal from './SelectionRequiredModal'
import WeeklySchedule from './WeeklySchedule'

// ---------- helpers de fechas ----------
const fmtDayShortLower = (d: Date) => {
  const dd = new Intl.DateTimeFormat('es-BO', { day: '2-digit' }).format(d)
  let m = new Intl.DateTimeFormat('es-BO', { month: 'short' }).format(d).toLowerCase()
  m = m.replace('.', '')
  return `${dd}-${m}`
}
const fmtHeader = new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

function startOfWeekMonday(d = new Date()) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const day = (copy.getDay() + 6) % 7 // Monday = 0
  copy.setDate(copy.getDate() - day)
  return copy
}
const addDays = (d: Date, n: number) => new Date(new Date(d).setDate(d.getDate() + n))
const toISO = (d: Date) => new Date(d).toISOString()
const sameDay = (a: Date, b: Date) => 
  new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() === 
  new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()

const DAYS_LABEL = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

// ---------- Empty State ----------
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-femme-magenta/10"></div>
      <p className="text-sm text-slate-600">No hay clases para los filtros seleccionados.</p>
    </div>
  )
}

// ---------- fila de clase ----------
interface SessionRowProps {
  s: Session
  selectionMode: boolean
  isSelected: boolean
  onToggleSelection: (sessionId: string) => void
  isDisabled: boolean
  onPackageSelect: (paquete: Paquete, ciclo: string, session: Session) => void
  activePromotion: {
    promocionId: number
    nombre: string
    descuento: number
    paqueteId: number
    ofertaId: number
    paqueteInfo?: {
      id: number
      nombre: string
      precio: number
      cantidad_clases: number
      dias_validez: number
      ilimitado: boolean
    }
    ciclo?: string
  } | null
  isEnrolled: boolean
}

function SessionRow({ s, selectionMode, isSelected, onToggleSelection, isDisabled, onPackageSelect, activePromotion, isEnrolled }: SessionRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const start = new Date(s.start)
  const end = new Date(s.end)
  const now = new Date()
  
  // Debug: Verificar si hay clases canceladas con motivo
  if (s.status === 'CANCELLED') {
    console.log(' Clase cancelada:', {
      courseName: s.courseName,
      status: s.status,
      motivo: s.motivo,
      session: s
    })
  }
  
  // Verificar si la clase ya pasó
  const isClassPast = end < now
  
  // Filtrar paquetes si hay promoción activa
  const availablePackages = activePromotion && s.offerId === activePromotion.ofertaId
    ? s.paquetes.filter(p => p.id === activePromotion.paqueteId)
    : s.paquetes
  
  const timeWithMeridiem = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const ampm = d.getHours() < 12 ? 'a. m.' : 'p. m.'
    return `${h}:${m} ${ampm}`
  }

  const handleInscribirseClick = () => {
    setIsPackagesModalOpen(true)
  }

  const handleSelectPackage = (paquete: Paquete) => {
    if (!user) {
      navigate('/auth/login', { state: { from: '/cursos' } })
      return
    }

    onPackageSelect(paquete, s.ciclo, s)
    setIsPackagesModalOpen(false)
  }

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 shadow-sm transition ${
          selectionMode 
            ? isSelected
              ? 'border-femme-magenta bg-femme-magenta/5'
              : isDisabled || isClassPast
              ? 'border-slate-200 bg-slate-50 opacity-50'
              : 'border-slate-200 bg-white hover:border-femme-magenta/50 hover:shadow-md cursor-pointer'
            : isClassPast
            ? 'border-slate-200 bg-slate-50 opacity-60'
            : 'border-slate-200 bg-white hover:shadow-md'
        }`}
        onClick={selectionMode && !isDisabled && !isClassPast ? () => onToggleSelection(s.id) : undefined}
      >
        {/* acento lateral */}
        {!selectionMode && (
          <>
            <div className="absolute left-2 sm:left-3 top-2 sm:top-3 bottom-2 sm:bottom-3 w-px bg-femme-magenta/20"></div>
            <div className="absolute left-[7px] sm:left-[9px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-femme-magenta"></div>
          </>
        )}

        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          {/* Checkbox en modo selección */}
          {selectionMode && (
            <div className="flex items-center">
              <div
                className={`h-6 w-6 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                  isClassPast || isDisabled
                    ? 'border-slate-200 bg-slate-100'
                    : isSelected
                    ? 'border-femme-magenta bg-femme-magenta'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && !isClassPast && !isDisabled && <Check className="h-4 w-4 text-white" />}
                {(isClassPast || isDisabled) && <X className="h-4 w-4 text-slate-400" />}
              </div>
            </div>
          )}

          {/* hora y sede */}
          <div className={selectionMode ? '' : 'pl-5 sm:pl-6'}>
            <div className="text-xs sm:text-sm font-semibold text-slate-900">
              {timeWithMeridiem(start)} — {timeWithMeridiem(end)}
            </div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500">
              LP {s.branch}
              {/* Mostrar cupos disponibles o estado de clase finalizada */}
              {selectionMode && (
                <span className={`ml-2 font-semibold ${
                  isClassPast 
                    ? 'text-slate-400'
                    : s.cupos_disponibles > 5 
                    ? 'text-femme-magenta' 
                    : s.cupos_disponibles > 0 
                      ? 'text-femme-rose'
                      : 'text-red-600'
                }`}>
                  • {isClassPast 
                      ? 'Clase finalizada'
                      : s.cupos_disponibles > 0 
                      ? `${s.cupos_disponibles} cupos`
                      : 'Sin cupos'
                    }
                </span>
              )}
            </div>
          </div>

          {/* título y subtítulo */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm sm:text-base font-semibold text-femme-magenta">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsModalOpen(true)
                  }}
                  className="hover:underline text-left"
                >
                  {s.courseName} — {s.level?.toUpperCase?.() ?? s.level}
                  {s.offerName && ` — ${s.offerName.toUpperCase()}`}
                </button>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 truncate">
                {s.type === 'TALLER' ? 'Taller' : 'Curso regular'} •{' '}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsTeacherModalOpen(true)
                  }}
                  className="hover:underline text-slate-500"
                >
                  {s.instructor.name}
                </button>
              </div>
            </div>
          </div>

          {/* CTA - Solo mostrar si NO está en modo selección */}
          {!selectionMode && (
            <div className="w-full md:w-auto">
              {s.status === 'CANCELLED' ? (
                <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                    Cancelada
                  </span>
                  {s.motivo && (
                    <span className="text-[10px] text-femme-magenta max-w-[150px] text-right">
                      {s.motivo}
                    </span>
                  )}
                </div>
              ) : isClassPast ? (
                <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                    Clase finalizada
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {s.cupos_ocupados}/{s.capacidad_maxima}
                  </span>
                </div>
              ) : s.cupos_disponibles === 0 ? (
                <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    Sin cupos
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {s.cupos_ocupados}/{s.capacidad_maxima}
                  </span>
                </div>
              ) : isEnrolled ? (
                <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="inline-flex items-center rounded-lg border border-femme-magenta bg-femme-magenta/10 px-3 py-2 text-xs font-medium text-femme-magenta">
                    ✓ Clase inscrita
                  </span>
                  <span className="text-[10px] text-femme-magenta">
                    Ya estás inscrito
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center md:items-end gap-1">
                  <button
                    onClick={handleInscribirseClick}
                    className="group w-full rounded-lg sm:rounded-xl bg-femme-magenta px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-femme-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-magenta inline-flex items-center justify-center gap-1"
                  >
                    Inscríbete <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition group-hover:translate-x-0.5" />
                  </button>
                  <span className={`text-[10px] font-medium ${
                    s.cupos_disponibles > 5 
                      ? 'text-femme-magenta' 
                      : s.cupos_disponibles > 0 
                        ? 'text-femme-rose'
                        : 'text-red-600'
                  }`}>
                    {s.cupos_disponibles} cupos
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal del curso */}
      <CourseDetailModal session={s} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Modal del profesor */}
      <TeacherDetailModal instructor={s.instructor} isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} />
      
      {/* Modal de paquetes */}
      <PackagesModal 
        courseName={s.courseName}
        paquetes={availablePackages}
        isOpen={isPackagesModalOpen}
        onClose={() => setIsPackagesModalOpen(false)}
        onSelectPackage={handleSelectPackage}
        isAuthenticated={!!user}
      />
    </>
  )
}


// ---------- Componente principal ----------
export default function Schedule() {
  const today = new Date()
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(today))
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const defaultIndex = days.findIndex((d) => sameDay(d, today))
  const [activeIndex, setActiveIndex] = useState(defaultIndex === -1 ? 0 : defaultIndex)
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()
  
  // Estado para toggle de vista: 'day' o 'week'
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  // Estado de promoción activa
  const [activePromotion, setActivePromotion] = useState<{
    promocionId: number
    nombre: string
    descuento: number
    paqueteId: number
    ofertaId: number
    paqueteInfo?: {
      id: number
      nombre: string
      precio: number
      cantidad_clases: number
      dias_validez: number
      ilimitado: boolean
    }
    ciclo?: string
  } | null>(null)

  // Verificar si hay una promoción activa al montar el componente
  useEffect(() => {
    const promotionData = sessionStorage.getItem('activePromotion')
    if (promotionData) {
      try {
        const promotion = JSON.parse(promotionData)
        setActivePromotion(promotion)
        console.log('🎉 Promoción activa:', promotion)
        
        // Si tiene info del paquete, activar modo selección automáticamente
        if (promotion.paqueteInfo && promotion.ciclo) {
          console.log('✨ Activando modo selección automático...')
          setSelectedPaquete({
            id: promotion.paqueteInfo.id,
            nombre: promotion.paqueteInfo.nombre,
            precio: promotion.paqueteInfo.precio,
            cantidad_clases: promotion.paqueteInfo.cantidad_clases,
            dias_validez: promotion.paqueteInfo.dias_validez,
            ilimitado: promotion.paqueteInfo.ilimitado
          })
          setSelectedCiclo(promotion.ciclo)
          setSelectedOfferId(promotion.ofertaId)
          setSelectionMode(true)
        }
      } catch (error) {
        console.error('Error parsing promotion data:', error)
        sessionStorage.removeItem('activePromotion')
      }
    }
  }, [])

  // Función para cancelar la promoción
  const cancelPromotion = () => {
    sessionStorage.removeItem('activePromotion')
    setActivePromotion(null)
    // Si estamos en modo selección, cancelarlo también
    if (selectionMode) {
      cancelSelection()
    }
  }

  // Filtros
  const [branch, setBranch] = useState<string>('Todas')
  const [type, setType] = useState<'Todos' | 'REGULAR' | 'TALLER'>('Todos')
  const [teachers, setTeachers] = useState<string[]>(['Todos'])

  // Estado de selección de clases
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPaquete, setSelectedPaquete] = useState<Paquete | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedCiclo, setSelectedCiclo] = useState<string | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  // Guardar las sesiones completas seleccionadas para validar fechas
  const [selectedSessionsCache, setSelectedSessionsCache] = useState<Session[]>([])
  const [automaticClassIds, setAutomaticClassIds] = useState<Set<string>>(new Set())  // IDs de clases automáticas  // Estado para modales de error
  const [dateRangeError, setDateRangeError] = useState<{
    minDate: string
    maxDate: string
    attemptedDate: string
    totalDays: number
  } | null>(null)
  const [classLimitError, setClassLimitError] = useState<number | null>(null)
  // Estado para el modal que reemplaza los `alert()` cuando la selección está incompleta
  const [selectionRequiredOpen, setSelectionRequiredOpen] = useState(false)
  const [selectionRequiredNumber, setSelectionRequiredNumber] = useState<number | null>(null)

  // Obtener sucursales activas
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: listActiveBranches,
  })

  // Opciones de sucursales para el filtro
  const branchOptions = useMemo(() => {
    if (!branchesData) return ['Todas']
    return ['Todas', ...branchesData.map((b) => b.label)]
  }, [branchesData])

  // Fecha seleccionada en formato YYYY-MM-DD
  const selectedDate = (days[activeIndex] || weekStart).toISOString().split('T')[0]

  // useEffect para navegar a la primera fecha AL MONTAR el componente
  useEffect(() => {
    const weeklySelectionData = sessionStorage.getItem('weeklyScheduleSelection')
    if (weeklySelectionData) {
      try {
        const selection = JSON.parse(weeklySelectionData)
        console.log('📥 Leyendo selección inicial:', selection)
        
        // Si hay una primera fecha, navegar a esa semana INMEDIATAMENTE
        if (selection.primeraFecha) {
          const primeraFecha = new Date(selection.primeraFecha)
          const weekStartForDate = startOfWeekMonday(primeraFecha)
          
          console.log('📅 🚀 NAVEGANDO a la semana de:', primeraFecha)
          console.log('📅 Inicio de semana calculado:', weekStartForDate)
          
          setWeekStart(weekStartForDate)
          
          // Calcular qué día de la semana es la primera fecha
          const newDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartForDate, i))
          const dayIndex = newDays.findIndex((d) => sameDay(d, primeraFecha))
          
          console.log('📅 Días de la semana:', newDays.map(d => d.toISOString().split('T')[0]))
          console.log('📅 Índice del día encontrado:', dayIndex)
          
          if (dayIndex !== -1) {
            setActiveIndex(dayIndex)
          }
        }
      } catch (error) {
        console.error('Error parsing weekly schedule selection:', error)
      }
    }
  }, []) // Solo al montar

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', selectedDate],
    queryFn: () => {
      console.log(' Obteniendo horarios para fecha:', selectedDate)
      return listScheduleByDate(selectedDate)
    },
  })

  // useEffect para cargar las sesiones seleccionadas DESPUÉS de navegar
  useEffect(() => {
    const weeklySelectionData = sessionStorage.getItem('weeklyScheduleSelection')
    if (weeklySelectionData && data) {
      try {
        const selection = JSON.parse(weeklySelectionData)
        console.log('📥 Procesando selección con data disponible:', selection)
        
        // Activar modo selección con el paquete y las sesiones
        setSelectedPaquete(selection.paquete || null) // Ahora es el objeto completo
        setSelectedCiclo(selection.ciclo)
        setSelectedOfferId(selection.offerId)
        
        // Convertir los IDs de sesiones a strings y crear el Set
        const sessionIds = new Set<string>(selection.sesionesIds.map((id: number) => String(id)))
        
        // Buscar las sesiones en los datos actuales para llenar el cache
        const sessionsToCache: Session[] = []
        data.forEach((session: Session) => {
          if (sessionIds.has(session.id)) {
            sessionsToCache.push(session)
          }
        })
        
        console.log('🔍 Sesiones encontradas en datos actuales:', sessionsToCache.length, 'de', sessionIds.size)
        console.log('📋 IDs buscados:', Array.from(sessionIds))
        console.log('✅ IDs encontrados:', sessionsToCache.map(s => s.id))
        
        setSelectedClasses(sessionIds)
        setSelectedSessionsCache(sessionsToCache)
        setSelectionMode(true)
        setAutomaticClassIds(new Set(sessionIds))  // Guardar IDs automáticos
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('weeklyScheduleSelection')
        
        console.log('✅ Modo selección activado con', sessionIds.size, 'clases pre-seleccionadas')
        console.log('📦 Paquete seleccionado:', selection.paquete)
      } catch (error) {
        console.error('Error parsing weekly schedule selection:', error)
        sessionStorage.removeItem('weeklyScheduleSelection')
      }
    }
  }, [data])

  // useEffect adicional para actualizar el cache cuando cambia el día y hay sesiones seleccionadas
  useEffect(() => {
    if (!data || !selectionMode || selectedClasses.size === 0) return
    
    // Buscar en los datos actuales si hay sesiones seleccionadas que no están en el cache
    data.forEach((session: Session) => {
      if (selectedClasses.has(session.id)) {
        // Verificar si esta sesión ya está en el cache
        const existsInCache = selectedSessionsCache.some(s => s.id === session.id)
        if (!existsInCache) {
          console.log('➕ Agregando sesión al cache:', session.id, session.courseName)
          setSelectedSessionsCache(cache => [...cache, session])
        }
      }
    })
  }, [data, selectionMode, selectedClasses]) // Se ejecuta cada vez que cambia el día (data cambia)

  // Verificar inscripciones del usuario
  const { data: inscripcionesData } = useQuery({
    queryKey: ['verificar-inscripcion', user?.id],
    queryFn: () => {
      const userId = parseInt(user!.id)
      console.log('🔍 Consultando inscripciones para usuario ID:', userId)
      console.log('📍 Endpoint:', `/asistencias/verificar-inscripcion/${userId}`)
      return verificarInscripcion(userId)
    },
    enabled: !!user?.id,
  })

  const sesionesInscritas = useMemo(() => {
    const sesiones = inscripcionesData?.sesiones_inscritas || []
    console.log(' Sesiones inscritas del usuario:', sesiones)
    console.log(' Total de sesiones inscritas:', sesiones.length)
    console.log(' Datos completos de inscripciones:', inscripcionesData)
    console.log(' IDs EXACTOS recibidos del backend:', JSON.stringify(sesiones))
    return new Set(sesiones)
  }, [inscripcionesData])

  // Obtener lista de profesores únicos desde los datos
  const teacherOptions: string[] = useMemo(() => {
    if (!data) return ['Todos']
    const uniqueTeachers = new Set(data.map((s: Session) => s.instructor.name))
    return ['Todos', ...Array.from(uniqueTeachers)]
  }, [data])

  // Filtrar por sede, tipo y profesores
  const filteredSessions: Session[] = useMemo(() => {
    if (!data) return []
    
    console.log('Total de sesiones del día:', data.length)
    console.log(' IDs de sesiones del día:', data.map((s: Session) => parseInt(s.id)))
    
    return data.filter((s: Session) => {
      // Para sucursales, necesitamos comparar con el formato "departamento-zona"
      let matchesBranch = branch === 'Todas'
      if (!matchesBranch && branchesData && s.sala) {
        // Buscar la sucursal que coincide con la zona de la sesión
        const selectedBranch = branchesData.find((b) => b.label === branch)
        if (selectedBranch) {
          matchesBranch = s.sala.zona === selectedBranch.zona
        }
      }
      
      const matchesType = type === 'Todos' || s.type === type
      const matchesTeacher = teachers.includes('Todos') || teachers.includes(s.instructor.name)
      
      return matchesBranch && matchesType && matchesTeacher
    })
  }, [data, branch, type, teachers, branchesData])

  // Log de coincidencias entre sesiones del día y sesiones inscritas
  useEffect(() => {
    if (filteredSessions.length > 0 && sesionesInscritas.size > 0) {
      const idsDelDia = filteredSessions.map(s => parseInt(s.id))
      const idsInscritos = Array.from(sesionesInscritas)
      const coincidencias = idsDelDia.filter(id => sesionesInscritas.has(id))
      
      console.log(' Análisis de coincidencias:')
      console.log('   - Sesiones inscritas del usuario:', idsInscritos)
      console.log('   - IDs de sesiones en este día:', idsDelDia)
      console.log('   - Coincidencias encontradas:', coincidencias)
      console.log('   - Total coincidencias:', coincidencias.length)
    }
  }, [filteredSessions, sesionesInscritas])

  const count = filteredSessions.length

  // Funciones para el modo de selección
  const handlePackageSelect = (paquete: Paquete, ciclo: string, session: Session) => {
    // Activar modo de selección
    setSelectedPaquete(paquete)
    setSelectedCiclo(ciclo)
    setSelectedOfferId(session.offerId)
    setSelectionMode(true)
    
    // Seleccionar automáticamente la clase donde se hizo clic
    setSelectedClasses(new Set([session.id]))
    setSelectedSessionsCache([session])
  }

  // Calcular si una clase está dentro del rango de 30 días
  const isWithin30Days = (sessionDate: string, selectedDates: string[]): boolean => {
    if (selectedDates.length === 0) return true
    
    // Crear un array con todas las fechas incluyendo la nueva
    const allDates = [...selectedDates, sessionDate].map(d => new Date(d).getTime())
    
    // Obtener la fecha más antigua y la más reciente
    const minDate = Math.min(...allDates)
    const maxDate = Math.max(...allDates)
    
    // Calcular diferencia en días entre la más antigua y la más reciente
    // Usamos Math.floor para contar días completos (23 sept → 23 oct = 30 días)
    const diffInDays = Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24))
    
    // El rango completo debe ser menor o igual a 30 días
    return diffInDays <= 30
  }

  const handleToggleSelection = (sessionId: string) => {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev)
      
      // Si ya está seleccionada, permitir deseleccionar
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
        // También remover del cache
        setSelectedSessionsCache(cache => cache.filter(s => s.id !== sessionId))
        return newSet
      }
      
      if (!selectedPaquete) return prev

      // Buscar la sesión en los datos actuales
      const currentSession = data?.find((s: Session) => s.id === sessionId)
      if (!currentSession) {
        console.error('No se encontró la sesión:', sessionId)
        return prev
      }

      // Usar el cache de sesiones seleccionadas para validar fechas
      const selectedDates = selectedSessionsCache.map((s: Session) => s.start)

      console.log('Validando rango de 30 días:')
      console.log('- Clase actual:', currentSession.courseName, new Date(currentSession.start).toLocaleDateString('es-BO'))
      console.log('- Clases ya seleccionadas:', selectedSessionsCache.length)
      console.log('- Fechas seleccionadas:', selectedDates.map((d: string) => new Date(d).toLocaleDateString('es-BO')))

      // Validar rango de 30 días
      if (!isWithin30Days(currentSession.start, selectedDates)) {
        const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-BO', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
        
        // Calcular el rango si se agregara esta clase
        const allDates = [...selectedDates, currentSession.start].map(d => new Date(d).getTime())
        const minDate = new Date(Math.min(...allDates))
        const maxDate = new Date(Math.max(...allDates))
        const diffInDays = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
        
        console.log(' BLOQUEADO - Rango excede 30 días:', diffInDays)
        
        // Mostrar modal de error en lugar de alert
        setDateRangeError({
          minDate: formatDate(minDate.toISOString()),
          maxDate: formatDate(maxDate.toISOString()),
          attemptedDate: formatDate(currentSession.start),
          totalDays: diffInDays
        })
        
        return prev
      }

      console.log('PERMITIDO - Dentro del rango de 30 días')

      // Si el paquete es ilimitado (cantidad_clases === 0 o null), permitir agregar
      const isUnlimited = !selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0
      
      if (isUnlimited) {
        newSet.add(sessionId)
        // Agregar al cache solo si no existe ya
        setSelectedSessionsCache(cache => {
          if (cache.find(s => s.id === sessionId)) {
            return cache // Ya existe, no agregar duplicado
          }
          return [...cache, currentSession]
        })
        return newSet
      }

      // Si tiene límite de clases, validar que no se exceda
      if (selectedPaquete.cantidad_clases && newSet.size < selectedPaquete.cantidad_clases) {
        newSet.add(sessionId)
        // Agregar al cache solo si no existe ya
        setSelectedSessionsCache(cache => {
          if (cache.find(s => s.id === sessionId)) {
            return cache // Ya existe, no agregar duplicado
          }
          return [...cache, currentSession]
        })
      } else {
        // Mostrar modal de error en lugar de alert
        setClassLimitError(selectedPaquete.cantidad_clases || 0)
      }
      
      return newSet
    })
  }

  const cancelSelection = () => {
    setSelectionMode(false)
    setSelectedPaquete(null)
    setSelectedClasses(new Set())
    setSelectedCiclo(null)
    setSelectedOfferId(null)
    setSelectedSessionsCache([])
  }

  const confirmSelection = async () => {
    if (!selectedPaquete) return
    
    console.log('🛒 CONFIRMANDO SELECCIÓN:')
    console.log('  - IDs seleccionados:', Array.from(selectedClasses))
    console.log('  - Total IDs:', selectedClasses.size)
    console.log('  - Cache de sesiones INICIAL:', selectedSessionsCache.length)
    
    // Crear una copia local del cache para trabajar
    let allSessions = [...selectedSessionsCache]
    
    // Verificar si faltan sesiones en el cache
    const missingIds = Array.from(selectedClasses).filter(id => 
      !allSessions.some(s => s.id === id)
    )
    
    console.log('  - IDs faltantes en cache:', missingIds.length)
    
    // Si faltan sesiones, cargarlas día por día
    if (missingIds.length > 0) {
      console.log('⚠️ Faltan', missingIds.length, 'sesiones. Cargando días adicionales...')
      
      const startDate = new Date(weekStart)
      const endDate = new Date(weekStart)
      endDate.setDate(endDate.getDate() + 30)
      
      const remainingIds = [...missingIds]
      
      for (let d = new Date(startDate); d <= endDate && remainingIds.length > 0; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        try {
          const dayData = await listScheduleByDate(dateStr)
          console.log(`📅 Cargando día ${dateStr}:`, dayData.length, 'sesiones')
          
          dayData.forEach((session: Session) => {
            // Asegurar que ambos IDs sean strings para la comparación
            const sessionIdStr = String(session.id)
            const idIndex = remainingIds.findIndex(id => String(id) === sessionIdStr)
            
            if (idIndex !== -1) {
              console.log('✅ Encontrada sesión:', sessionIdStr, session.courseName, 'el', dateStr)
              allSessions.push(session)
              remainingIds.splice(idIndex, 1)
              console.log('  ✓ Quedan', remainingIds.length, 'sesiones por encontrar')
            }
          })
        } catch (error) {
          console.error('Error cargando día', dateStr, error)
        }
        
        if (remainingIds.length === 0) break
      }
      
      console.log('✅ Total sesiones después de cargar:', allSessions.length)
    }
    
    const isUnlimited = !selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0
    
    // Formatear las fechas de las clases seleccionadas
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-BO', { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Eliminar duplicados usando un Map por ID
    const uniqueSessions = Array.from(
      new Map(allSessions.map(s => [s.id, s])).values()
    )
    
    console.log('  - Sesiones únicas después de eliminar duplicados:', uniqueSessions.length)
    console.log('  - IDs únicos:', uniqueSessions.map(s => s.id))
    
    const sortedSessions = uniqueSessions.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    
    console.log('  - Sesiones ordenadas por fecha:')
    sortedSessions.forEach(s => console.log(`    ${s.id}: ${formatDate(s.start)} - ${s.courseName}`))
    
    // Separar sesiones automáticas y manuales
    const automaticSessions = sortedSessions.filter(s => automaticClassIds.has(s.id))
    const manualSessions = sortedSessions.filter(s => !automaticClassIds.has(s.id))
    
    const automaticDetails = automaticSessions
      .map(session => `${formatDate(session.start)} - ${session.courseName} - ${session.instructor?.name || ''}`)
      .join('\n')
    
    const manualDetails = manualSessions
      .map(session => `${formatDate(session.start)} - ${session.courseName} - ${session.instructor?.name || ''}`)
      .join('\n')
    
    console.log('  - Clases automáticas:', automaticSessions.length)
    console.log('  - Clases manuales:', manualSessions.length)
    console.log('  - Detalles automáticos:')
    console.log(automaticDetails)
    console.log('  - Detalles manuales:')
    console.log(manualDetails)
    
    // Para paquetes ilimitados (cantidad_clases === 0 o null), permitir confirmar si hay al menos 1 clase
    if (isUnlimited) {
      if (selectedClasses.size === 0) {
        // Mostrar modal de selección requerida
        setSelectionRequiredNumber(null)
        setSelectionRequiredOpen(true)
        return
      }
      console.log('Paquete ilimitado:', selectedPaquete)
      console.log('Clases seleccionadas:', Array.from(selectedClasses))
      
      // Calcular fecha de primera clase desde uniqueSessions
      const fechasPrimerClase = uniqueSessions
        .map(session => session.start)
        .sort()
      
      // Calcular precio (aplicar descuento si hay promoción activa)
      let finalPrice = selectedPaquete.precio
      let discountApplied = 0
      if (activePromotion && activePromotion.paqueteId === selectedPaquete.id) {
        const discount = activePromotion.descuento
        discountApplied = finalPrice * (discount / 100)
        finalPrice = finalPrice - discountApplied
      }
      
      // Agregar al carrito
      addItem({
        id: `paquete-${selectedPaquete.id}-${Date.now()}`,
        title: `${selectedPaquete.nombre} - ${selectedClasses.size} ${selectedClasses.size === 1 ? 'clase' : 'clases'}${activePromotion ? ` (${activePromotion.descuento}% OFF)` : ''}`,
        price: finalPrice,
        qty: 1,
        detailsAutomaticas: automaticDetails,
        detailsManuales: manualDetails,
        paqueteId: selectedPaquete.id,
        clasesSeleccionadas: Array.from(selectedClasses).map(id => parseInt(id)),
        fechaPrimeraClase: fechasPrimerClase[0] || '',
        promocionId: activePromotion?.promocionId,
        descuentoAplicado: discountApplied,
      })
      
      console.log('🎯 Item agregado al carrito (paquetes ilimitados):', {
        paqueteId: selectedPaquete.id,
        clasesSeleccionadas: Array.from(selectedClasses).map(id => parseInt(id)),
        promocion: activePromotion,
        precioOriginal: selectedPaquete.precio,
        precioFinal: finalPrice,
        descuento: discountApplied
      })
      
      // Limpiar promoción después de agregar al carrito
      if (activePromotion) {
        cancelPromotion()
      }
      
      cancelSelection()
      navigate('/carrito')
      return
    }

    // Para paquetes con límite, validar que se hayan seleccionado todas las clases
    if (selectedPaquete.cantidad_clases && selectedClasses.size === selectedPaquete.cantidad_clases) {
      console.log('Paquete:', selectedPaquete)
      console.log('Clases seleccionadas:', Array.from(selectedClasses))
      
      // Obtener información de sesiones únicas para evitar duplicados
      const uniqueSessions = Array.from(
        new Map(selectedSessionsCache.map(s => [s.id, s])).values()
      )
      
      const classDetails = uniqueSessions
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .map(session => `${formatDate(session.start)} - ${session.courseName} - ${session.instructor?.name || ''}`)
        .join('\n')
      
      // Calcular fecha de primera clase desde uniqueSessions
      const fechasPrimerClase = uniqueSessions
        .map(session => session.start)
        .sort()
      
      // Calcular precio (aplicar descuento si hay promoción activa)
      let finalPrice = selectedPaquete.precio
      let discountApplied = 0
      if (activePromotion && activePromotion.paqueteId === selectedPaquete.id) {
        const discount = activePromotion.descuento
        discountApplied = finalPrice * (discount / 100)
        finalPrice = finalPrice - discountApplied
      }
      
      // Agregar al carrito
      addItem({
        id: `paquete-${selectedPaquete.id}-${Date.now()}`,
        title: `${selectedPaquete.nombre} - ${selectedClasses.size} ${selectedClasses.size === 1 ? 'clase' : 'clases'}${activePromotion ? ` (${activePromotion.descuento}% OFF)` : ''}`,
        price: finalPrice,
        qty: 1,
        detailsAutomaticas: automaticDetails,
        detailsManuales: manualDetails,
        paqueteId: selectedPaquete.id,
        clasesSeleccionadas: Array.from(selectedClasses).map(id => parseInt(id)),
        fechaPrimeraClase: fechasPrimerClase[0] || '',
        promocionId: activePromotion?.promocionId,
        descuentoAplicado: discountApplied,
      })
      
      console.log(' Item agregado al carrito (paquetes con límite):', {
        paqueteId: selectedPaquete.id,
        clasesSeleccionadas: Array.from(selectedClasses).map(id => parseInt(id)),
        promocion: activePromotion,
        precioOriginal: selectedPaquete.precio,
        precioFinal: finalPrice,
        descuento: discountApplied
      })
      
      // Limpiar promoción después de agregar al carrito
      if (activePromotion) {
        cancelPromotion()
      }
      
      cancelSelection()
      navigate('/carrito')
    } else {
      // Mostrar modal indicando el número exacto requerido
      setSelectionRequiredNumber(selectedPaquete.cantidad_clases || 0)
      setSelectionRequiredOpen(true)
    }
  }  // Para paquetes ilimitados, está completo si hay al menos 1 clase
  // Para paquetes con límite, está completo si se alcanzó el número exacto
  const isSelectionComplete = selectedPaquete 
    ? (!selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0)
      ? selectedClasses.size > 0 
      : selectedPaquete.cantidad_clases === selectedClasses.size
    : false

  // Navegación por teclado en tabs
  function onTabsKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      setActiveIndex((i) => Math.min(i + 1, days.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      setActiveIndex((i) => Math.max(i - 1, 0))
      e.preventDefault()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Banner de promoción activa */}
      {activePromotion && !selectionMode && (
        <div className="bg-gradient-to-r from-femme-magenta via-femme-rose to-femme-coral text-white">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-white/20 rounded-lg px-3 py-1.5">
                  <span className="text-2xl font-bold">{activePromotion.descuento}% OFF</span>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{activePromotion.nombre}</h3>
                  <p className="text-xs sm:text-sm text-white/90">Selecciona tus clases y obtén el descuento automáticamente</p>
                </div>
              </div>
              <button
                onClick={cancelPromotion}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
              >
                Cancelar promoción
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle: Agenda diaria / Agenda semanal - ENCIMA de barra de días */}
      {!selectionMode && (
        <div className="bg-white border-b border-slate-200/80">
          <div className="mx-auto max-w-6xl px-2 sm:px-4 py-3 md:px-6">
            <div className="flex justify-center">
              <div 
                className="inline-flex items-center w-full max-w-md p-1 rounded-full bg-white border border-femme-magenta/20 shadow-lg gap-0.5"
                role="group"
                aria-label="Cambiar vista de agenda"
              >
                <button
                  onClick={() => setViewMode('day')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                    viewMode === 'day'
                      ? 'bg-femme-magenta text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-femme-magenta'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <rect x="4" y="5" width="16" height="3" rx="1" />
                    <rect x="4" y="10.5" width="10" height="3" rx="1" />
                    <rect x="4" y="16" width="13" height="3" rx="1" />
                  </svg>
                  Agenda diaria
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                    viewMode === 'week'
                      ? 'bg-femme-magenta text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-femme-magenta'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <rect x="4" y="5" width="5" height="5" rx="1" />
                    <rect x="10" y="5" width="5" height="5" rx="1" />
                    <rect x="16" y="5" width="4" height="5" rx="1" />
                    <rect x="4" y="13" width="5" height="5" rx="1" />
                    <rect x="10" y="13" width="5" height="5" rx="1" />
                    <rect x="16" y="13" width="4" height="5" rx="1" />
                  </svg>
                  Agenda semanal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Barra de días sticky - Solo en vista diaria */}
      {viewMode === 'day' && (
        <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto max-w-6xl px-2 py-2 sm:px-4 sm:py-3 md:px-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setWeekStart(addDays(weekStart, -7))
                  setActiveIndex(0)
                }}
                className="inline-flex h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-magenta"
                aria-label="Semana anterior"
              >
                <ChevronLeft className="h-3 w-3 sm:h-5 sm:w-5" />
              </button>

              <div
                role="tablist"
                aria-label="Seleccionar día de la semana"
                onKeyDown={onTabsKeyDown}
                className="flex flex-1 items-stretch gap-1 sm:gap-2 md:gap-3 overflow-visible pt-3 pb-1 -mb-1"
              >
                {days.map((d, i) => {
                  const isActive = i === activeIndex
                  const isToday = sameDay(d, today)
                  return (
                    <button
                      role="tab"
                      aria-selected={isActive}
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={
                        'relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg sm:rounded-xl border px-1 py-1.5 sm:px-4 sm:py-3 md:px-5 md:py-4 text-slate-800 shadow-sm transition ' +
                        (isActive
                          ? 'border-femme-magenta/30 bg-white ring-1 ring-femme-magenta/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50')
                      }
                    >
                      <span className="text-[8px] sm:text-[10px] md:text-[11px] text-slate-500 truncate">{fmtDayShortLower(d)}</span>
                      <span className="mt-0.5 text-[10px] sm:text-base md:text-lg font-extrabold tracking-wide">{DAYS_LABEL[i]}</span>
                      {/* Indicador inferior */}
                      <span
                        className={
                          'absolute inset-x-1 sm:inset-x-3 md:inset-x-4 bottom-0.5 sm:bottom-1 h-[2px] sm:h-[3px] rounded-full transition-all ' +
                          (isActive ? 'bg-femme-magenta' : 'bg-transparent')
                        }
                      ></span>
                      {isToday && (
                        <span className="absolute -top-2 sm:-top-3 rounded-full bg-femme-magenta px-1 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-semibold text-white shadow whitespace-nowrap">
                          Hoy
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => {
                  setWeekStart(addDays(weekStart, 7))
                  setActiveIndex(0)
                }}
                className="inline-flex h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-magenta"
                aria-label="Próxima semana"
              >
                <ChevronRight className="h-3 w-3 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() => {
                  const newWeekStart = startOfWeekMonday(new Date())
                  const newDays = Array.from({ length: 7 }, (_, i) => addDays(newWeekStart, i))
                  const i = newDays.findIndex((d) => sameDay(d, new Date()))
                  setWeekStart(newWeekStart)
                  setActiveIndex(i === -1 ? 0 : i)
                }}
                className="ml-0.5 sm:ml-2 inline-flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl bg-femme-magenta px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold text-white shadow-sm transition hover:bg-femme-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-magenta flex-shrink-0"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Hoy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-2 sm:px-4 pb-8 pt-4 md:px-6">
        {/* Panel de filtros - Solo mostrar en vista diaria */}
        {!selectionMode && viewMode === 'day' && (
          <div className="mb-4">
            <Filters
              branch={branch}
              type={type}
              teachers={teachers}
              branchOptions={branchOptions}
              teacherOptions={teacherOptions}
              onBranchChange={setBranch}
              onTypeChange={setType}
              onTeachersChange={setTeachers}
            />
          </div>
        )}

        {/* Banner de selección de clases */}
        {selectionMode && selectedPaquete && (
          <div className="mb-4 rounded-xl sm:rounded-2xl border-2 border-femme-magenta bg-gradient-to-r from-femme-magenta/10 to-femme-rose/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Selecciona tus clases
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {(!selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0) ? 'Ilimitado dentro de 30 días de la misma oferta' : `Solo clases de la misma oferta (${selectedCiclo})`}
                </p>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Contador */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-femme-magenta">
                    {selectedClasses.size}
                  </span>
                  {(!selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0) ? (
                    <span className="text-xs sm:text-sm text-slate-500">
                      {selectedClasses.size === 1 ? 'clase elegida' : 'clases elegidas'}
                    </span>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base text-slate-600">
                        / {selectedPaquete.cantidad_clases}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 ml-1">
                        {selectedClasses.size === 1 ? 'clase' : 'clases'}
                      </span>
                    </>
                  )}
                </div>

                {isSelectionComplete && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-femme-magenta">
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">{(!selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0) ? 'Listo' : 'Completo'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4">
              <button
                onClick={cancelSelection}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancelar inscripción
              </button>
              <button
                onClick={confirmSelection}
                disabled={!isSelectionComplete}
                className={`w-full sm:w-auto px-6 py-2 text-sm font-semibold rounded-lg shadow-sm transition ${
                  isSelectionComplete
                    ? 'bg-gradient-to-r from-femme-magenta to-femme-rose text-white hover:shadow-md'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Actualizar carrito
              </button>
            </div>
          </div>
        )}

        {/* Encabezado de lista - Solo mostrar en vista diaria */}
        {viewMode === 'day' && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 capitalize truncate">
              {fmtHeader.format(days[activeIndex] || weekStart)}
            </h2>
            <span
              aria-live="polite"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm whitespace-nowrap"
            >
              {count} {count === 1 ? 'clase' : 'clases'}
            </span>
          </div>
        )}

        {/* Contenido según el modo de vista */}
        {viewMode === 'day' ? (
          /* Vista diaria - contenido original */
          isLoading ? (
            <div className="py-12 grid place-items-center">
              <Spinner label="Cargando horarios..." />
            </div>
          ) : count === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((s: Session) => {
                const isSelected = selectedClasses.has(s.id)
                const isInCorrectCycle = !selectionMode || s.ciclo === selectedCiclo
                const isInCorrectOffer = !selectionMode || s.offerId === selectedOfferId
                
                // Debug log para verificar la validación de ofertas
                if (selectionMode && selectedOfferId) {
                  console.log(`Validando sesión ${s.id} (${s.courseName}):`, {
                    selectedOfferId,
                    sessionOfferId: s.offerId,
                    isInCorrectOffer,
                    selectedCiclo,
                    sessionCiclo: s.ciclo,
                    isInCorrectCycle
                  })
                }
                
                // Para paquetes ilimitados (cantidad_clases === 0), solo validar ciclo, oferta y rango de 30 días
                // Para paquetes con límite, validar también el número máximo de clases
                const sessionIdNum = parseInt(s.id)
                const isEnrolled = sesionesInscritas.has(sessionIdNum)
                
                // Debug: Verificar comparación de IDs para TODAS las sesiones
                console.log(`🔍 Sesión ${s.id} "${s.courseName}":`, {
                  'ID original': s.id,
                  'Tipo original': typeof s.id,
                  'ID convertido': sessionIdNum,
                  'Tipo convertido': typeof sessionIdNum,
                  'Está inscrito?': isEnrolled,
                  'Set contiene': Array.from(sesionesInscritas),
                  'Prueba directa .has()': sesionesInscritas.has(sessionIdNum),
                  'Prueba con string': sesionesInscritas.has(s.id as any)
                })
                
                // Debug: Verificar comparación de IDs
                if (isEnrolled) {
                  console.log(`✅ INSCRITO: ${s.courseName} (ID: ${sessionIdNum})`)
                }
                
                let isDisabled = false
                if (selectionMode) {
                  // Bloquear clases ya inscritas en modo selección
                  if (isEnrolled) {
                    isDisabled = true
                  } else if (!isInCorrectCycle || !isInCorrectOffer) {
                    isDisabled = true
                  } else if (!isSelected && s.cupos_disponibles === 0) {
                    // No se puede seleccionar si no hay cupos disponibles
                    isDisabled = true
                  } else if (!isSelected && selectedPaquete) {
                    // Si el paquete NO es ilimitado (tiene cantidad_clases válida > 0) y ya se alcanzó el límite
                    const isUnlimited = !selectedPaquete.cantidad_clases || selectedPaquete.cantidad_clases === 0
                    if (!isUnlimited && selectedPaquete.cantidad_clases && selectedClasses.size >= selectedPaquete.cantidad_clases) {
                      isDisabled = true
                    }
                  }
                }
                
                return (
                  <SessionRow 
                    key={s.id} 
                    s={s}
                    selectionMode={selectionMode}
                    isSelected={isSelected}
                    onToggleSelection={handleToggleSelection}
                    isDisabled={isDisabled}
                    onPackageSelect={handlePackageSelect}
                    activePromotion={activePromotion}
                    isEnrolled={isEnrolled}
                  />
                )
              })}
            </div>
          )
        ) : (
          /* Vista semanal - WeeklySchedule integrado SIN modal flotante */
          <WeeklySchedule onClose={() => setViewMode('day')} isEmbedded={true} />
        )}
      </div>

      {/* Modales de error */}
      <DateRangeErrorModal
        isOpen={!!dateRangeError}
        onClose={() => setDateRangeError(null)}
        minDate={dateRangeError?.minDate || ''}
        maxDate={dateRangeError?.maxDate || ''}
        attemptedDate={dateRangeError?.attemptedDate || ''}
        totalDays={dateRangeError?.totalDays || 0}
      />

      <SelectionRequiredModal
        isOpen={selectionRequiredOpen}
        onClose={() => setSelectionRequiredOpen(false)}
        required={selectionRequiredNumber}
      />

      <ClassLimitModal
        isOpen={!!classLimitError}
        onClose={() => setClassLimitError(null)}
        maxClasses={classLimitError || 0}
      />
    </div>
  )
}
