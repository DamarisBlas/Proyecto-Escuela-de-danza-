import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchSesionesByFecha, fetchAsistenciasBySesion, marcarAsistencia, fetchProfesorByPersonaId, fetchHorariosByProfesor, fetchInscritosByHorarioFecha, fetchInscritosByHorario, marcarAsistenciaPresente, marcarAsistenciaAusente, type Sesion, type AsistenciaConAlumno, type HorarioProfesor, type ProfesorInfo, type InscritosResponse, type InscritoDetalle, type InscritosHorarioResponse } from '../api/attendance'
import { useAuth } from '@app/hooks/useAuth'
import { toast } from 'sonner'

// ───────────────────────────── Tipos adaptados a la API real
type Modalidad = "presencial" | "virtual" | "mixta"
type TipoHorario = "weekly" | "single"

type Alumna = {
  id_persona: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
}

type Inscripcion = {
  id_inscripcion: number
  clases_usadas: number
  clases_restantes: number
}

type Horario = {
  id_horario: string
  estilo: string
  nivel: string
  modalidad: Modalidad
  sala: string
  capacidad: number
  tipo: TipoHorario
  horarioData: HorarioProfesor // Reference to the original horario data
}

type HorarioSesion = {
  id_sesion: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  duracion: number
  estado: string
  cancelado: boolean
  motivo?: string | null
}

type Asistencia = {
  id_asistencia: number
  asistio: boolean | null
  alumno: Alumna
  inscripcion?: Inscripcion // Made optional since new endpoint doesn't provide this
}

// ───────────────────────────── Utils
const toISO = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

const fmtDMY = (iso: string): string => {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

const fmtHoraRango = (ini: string, fin: string): string => `${ini} - ${fin}`
const cmpISO = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

const diasSemana: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
}

function getDiaNombre(dias: string | number | undefined): string {
  if (dias === undefined || dias === null) return 'Día desconocido'
  const n = typeof dias === 'string' ? Number(dias) : dias
  if (Number.isNaN(n)) return 'Día desconocido'
  return diasSemana[n] || 'Día desconocido'
}

/** Próxima sesión >= hoy (activa y no cancelada); si no hay, devuelve la última pasada válida. */
function nextUpcomingSesion(ses: Sesion[], hoyISO: string): Sesion | null {
  const validas = ses.filter((s) => s.estado === 'ACTIVE' && !s.cancelado).sort((a, b) => cmpISO(a.fecha, b.fecha))
  if (validas.length === 0) return null
  const futura = validas.find((s) => cmpISO(s.fecha, hoyISO) >= 0)
  return futura ?? validas[validas.length - 1]
}

// ───────────────────────────── Página
export default function ProfessorAttendancePage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const HOY = useMemo(() => toISO(new Date()), [])

  // Recibir horarioId desde navegación
  const horarioIdFromNav = location.state?.horarioId

  // Estado UI - convertir el id recibido al formato H-{id}
  const [horarioSelId, setHorarioSelId] = useState<string | null>(
    horarioIdFromNav ? `H-${horarioIdFromNav}` : null
  )
  const [sesionSelId, setSesionSelId] = useState<number | null>(null)
  const [fechaSel, setFechaSel] = useState<string>(HOY)
  const [banner, setBanner] = useState<string>("")
  const [pendingChanges, setPendingChanges] = useState<Map<number, boolean | null>>(new Map())
  const [filteredHorarios, setFilteredHorarios] = useState<HorarioProfesor[]>([])

  // Query para obtener información del profesor
  const { data: profesorInfo, isLoading: loadingProfesor } = useQuery({
    queryKey: ['profesor-info', user?.id],
    queryFn: () => fetchProfesorByPersonaId(parseInt(user!.id)),
    enabled: !!user?.id,
  })

  // Query para obtener horarios del profesor
  const { data: horariosData, isLoading: loadingHorarios } = useQuery({
    queryKey: ['horarios-profesor', profesorInfo?.persona_id],
    queryFn: () => fetchHorariosByProfesor(profesorInfo!.persona_id),
    enabled: !!profesorInfo?.persona_id,
  })

  // Inicializar horarios filtrados cuando se cargan los datos
  useEffect(() => {
    if (horariosData?.horarios && filteredHorarios.length === 0) {
      setFilteredHorarios(horariosData.horarios)
    }
  }, [horariosData?.horarios, filteredHorarios.length])

  // Función para manejar cambios en los filtros
  const handleFiltersChange = (filtered: HorarioProfesor[]) => {
    setFilteredHorarios(filtered)
    // Si el horario seleccionado ya no está en los filtrados, deseleccionarlo
    if (horarioSelId && !filtered.some(h => `H-${h.id_horario}` === horarioSelId)) {
      setHorarioSelId(null)
      setSesionSelId(null)
    }
  }

  // Crear horarios únicos del profesor desde los datos filtrados
  const horariosDelProfe: Horario[] = useMemo(() => {
    if (!filteredHorarios.length) return []

    return filteredHorarios.map((horario) => ({
      id_horario: `H-${horario.id_horario}`,
      estilo: horario.estilo.nombre_estilo,
      nivel: `Nivel ${horario.nivel}`,
      modalidad: 'presencial' as Modalidad,
      sala: horario.sala.nombre_sala,
      capacidad: horario.capacidad,
      tipo: horario.oferta.repite_semanalmente ? 'weekly' : 'single',
      horarioData: horario
    }))
  }, [filteredHorarios])

  const horarioSel = horariosDelProfe.find((h) => h.id_horario === horarioSelId) || null

  // Query para obtener todas las sesiones de la fecha
  const { data: todasSesiones = [], isLoading: loadingSesiones } = useQuery({
    queryKey: ['sesiones-fecha', fechaSel],
    queryFn: () => fetchSesionesByFecha(fechaSel),
  })

  // Filtrar sesiones que corresponden a los horarios del profesor
  const sesionesDelProfesor = useMemo(() => {
    if (!horariosDelProfe.length || !todasSesiones.length) return []

    return todasSesiones.filter((sesion) =>
      horariosDelProfe.some((horario) =>
        sesion.estilo.nombre_estilo === horario.estilo &&
        sesion.nivel === parseInt(horario.nivel.replace('Nivel ', ''))
      )
    )
  }, [todasSesiones, horariosDelProfe])

  // Auto-seleccionar sesión cuando se carga el horario desde navegación
  useEffect(() => {
    if (horarioIdFromNav && horarioSel && !sesionSelId && sesionesDelProfesor.length > 0) {
      const sesionesHorario = sesionesDelProfesor.filter(s =>
        s.estilo.nombre_estilo === horarioSel.estilo && 
        s.nivel === parseInt(horarioSel.nivel.replace('Nivel ', ''))
      )
      const ses = nextUpcomingSesion(sesionesHorario, HOY)
      if (ses) {
        setSesionSelId(ses.id_sesion)
        setFechaSel(ses.fecha)
      }
    }
  }, [horarioIdFromNav, horarioSel, sesionSelId, sesionesDelProfesor, HOY])

  // Query para obtener asistencias de la sesión seleccionada
  const { data: asistenciasRaw = [], isLoading: loadingAsistencias } = useQuery({
    queryKey: ['asistencias-sesion', sesionSelId],
    queryFn: () => fetchAsistenciasBySesion(sesionSelId!),
    enabled: !!sesionSelId,
  })

  // Mutation para marcar asistencia
  const marcarAsistenciaMutation = useMutation({
    mutationFn: ({ asistenciaId, asistio }: { asistenciaId: number; asistio: boolean | null }) => {
      if (asistio === true) {
        return marcarAsistenciaPresente(asistenciaId)
      } else if (asistio === false) {
        return marcarAsistenciaAusente(asistenciaId)
      } else {
        // Para null, podríamos necesitar un endpoint separado o mantener el anterior
        return marcarAsistencia(asistenciaId, asistio)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscritos-horario-fecha', horarioSelId, fechaSel] })
      queryClient.invalidateQueries({ queryKey: ['asistencias-sesion', sesionSelId] })
      toast.success('Asistencia registrada')
    },
    onError: (error) => {
      console.error('Error al marcar asistencia:', error)
      toast.error('Error al registrar asistencia')
    },
  })

  const sesionesDeHorario = sesionesDelProfesor.filter((s) =>
    horarioSel ? s.estilo.nombre_estilo === horarioSel.estilo && s.nivel === parseInt(horarioSel.nivel.replace('Nivel ', '')) : false
  )

  // Query para obtener TODOS los inscritos del horario (sin filtrar por fecha)
  const { data: todosInscritosData, isLoading: loadingTodosInscritos } = useQuery({
    queryKey: ['inscritos-horario', horarioSelId],
    queryFn: () => {
      const horario = horariosDelProfe.find((h) => h.id_horario === horarioSelId)
      return horario ? fetchInscritosByHorario(horario.horarioData.id_horario) : Promise.resolve(null)
    },
    enabled: !!horarioSelId && !!horariosDelProfe.length,
  })

  // Query para obtener inscritos usando el nuevo endpoint (para fecha específica)
  const { data: inscritosData, isLoading: loadingInscritos } = useQuery({
    queryKey: ['inscritos-horario-fecha', horarioSelId, fechaSel],
    queryFn: () => {
      const horario = horariosDelProfe.find((h) => h.id_horario === horarioSelId)
      return horario ? fetchInscritosByHorarioFecha(horario.horarioData.id_horario, fechaSel) : Promise.resolve(null)
    },
    enabled: !!horarioSelId && !!fechaSel && !!horariosDelProfe.length,
  })

  // Convertir asistencias del backend al formato esperado
  const asistencias: Asistencia[] = useMemo(() => {
    if (!Array.isArray(asistenciasRaw)) return []
    return asistenciasRaw.map(asistencia => ({
      id_asistencia: asistencia.id_asistencia,
      asistio: asistencia.asistio,
      alumno: asistencia.alumno,
      inscripcion: asistencia.inscripcion
    }))
  }, [asistenciasRaw])

  // Convertir inscritos del nuevo endpoint al formato esperado
  const asistenciasFromInscritos: Asistencia[] = useMemo(() => {
    if (!inscritosData?.inscritos) return []
    return inscritosData.inscritos.map(inscrito => ({
      id_asistencia: inscrito.asistencia.id_asistencia,
      asistio: inscrito.asistencia.asistio,
      alumno: {
        id_persona: inscrito.persona.id_persona,
        nombre: inscrito.persona.nombre,
        apellido_paterno: inscrito.persona.apellido_paterno,
        apellido_materno: inscrito.persona.apellido_materno,
        email: inscrito.persona.email
      },
      // Ahora incluimos la información de inscripción
      inscripcion: {
        id_inscripcion: inscrito.inscripcion.id_inscripcion,
        clases_usadas: inscrito.inscripcion.clases_usadas,
        clases_restantes: inscrito.inscripcion.clases_restantes
      }
    }))
  }, [inscritosData])

  // Proxima/última sesion al seleccionar horario
  function seleccionarHorario(id: string) {
    setHorarioSelId(id)
    setPendingChanges(new Map()) // Limpiar cambios pendientes al cambiar horario
    const horario = horariosDelProfe.find(h => h.id_horario === id)
    if (horario) {
      const sesionesHorario = sesionesDelProfesor.filter(s =>
        s.estilo.nombre_estilo === horario.estilo && s.nivel === parseInt(horario.nivel.replace('Nivel ', ''))
      )
      const ses = nextUpcomingSesion(sesionesHorario, HOY)
      if (ses) {
        setSesionSelId(ses.id_sesion)
        setFechaSel(ses.fecha)
      } else {
        setSesionSelId(null)
      }
    }
    setTimeout(() => {
      document.getElementById("panel-asistencia")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  }

  // Si cambia la fecha manualmente, buscamos si hay sesion ese día
  function onChangeFecha(nuevaISO: string) {
    setFechaSel(nuevaISO)
    setPendingChanges(new Map()) // Limpiar cambios pendientes al cambiar fecha
    if (horarioSel) {
      const sesionesHorario = sesionesDelProfesor.filter(s =>
        s.estilo.nombre_estilo === horarioSel.estilo && s.nivel === parseInt(horarioSel.nivel.replace('Nivel ', ''))
      )
      const match = sesionesHorario.find((s) => s.fecha === nuevaISO && s.estado === 'ACTIVE' && !s.cancelado)
      setSesionSelId(match ? match.id_sesion : null)
    }
  }

  const sesionSel = sesionesDeHorario.find((s) => s.id_sesion === sesionSelId) || null

  // Asistencias de la sesión actual - usar datos del nuevo endpoint si están disponibles
  const asistenciasVista: Asistencia[] = inscritosData ? asistenciasFromInscritos : asistencias

  // Calcular estado actual considerando cambios pendientes
  const asistenciasConCambios: Asistencia[] = useMemo(() => {
    return asistenciasVista.map(asistencia => ({
      ...asistencia,
      asistio: pendingChanges.get(asistencia.id_asistencia) ?? asistencia.asistio
    }))
  }, [asistenciasVista, pendingChanges])

  // Query para obtener asistencias de la sesión correspondiente cuando usamos inscritos
  const { data: asistenciasSesionParaInscritos = [] } = useQuery({
    queryKey: ['asistencias-sesion-para-inscritos', sesionSelId],
    queryFn: () => fetchAsistenciasBySesion(sesionSelId!),
    enabled: !!inscritosData && !!sesionSelId,
  })

  // Toggle presente/ausente
  function toggleAsistencia(id: number) {
    const asistencia = asistenciasConCambios.find(a => a.id_asistencia === id)
    if (!asistencia) return

    // Get current state (considering pending changes), default to false if null
    const currentAsistio = pendingChanges.get(id) ?? (asistencia.asistio ?? false)

    // Simple toggle: presente ↔ ausente
    const nuevoEstado = !currentAsistio

    // Update pending changes
    setPendingChanges(prev => {
      const newMap = new Map(prev)
      newMap.set(id, nuevoEstado)
      return newMap
    })
  }

  async function guardarAsistencia() {
    if (!horarioSel || pendingChanges.size === 0) return

    try {
      // Crear array de promesas para todas las actualizaciones
      const updatePromises = Array.from(pendingChanges.entries()).map(([asistenciaId, asistio]) => {
        if (asistio === true) {
          return marcarAsistenciaPresente(asistenciaId)
        } else if (asistio === false) {
          return marcarAsistenciaAusente(asistenciaId)
        } else {
          return marcarAsistencia(asistenciaId, asistio)
        }
      })

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updatePromises)

      // Limpiar cambios pendientes
      setPendingChanges(new Map())

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['inscritos-horario-fecha', horarioSelId, fechaSel] })
      queryClient.invalidateQueries({ queryKey: ['asistencias-sesion', sesionSelId] })

      // Mostrar banner de éxito
      const presentes = asistenciasConCambios.filter((a) => a.asistio === true).length
      const total = asistenciasConCambios.length
      const fechaInfo = sesionSel ? `${fmtDMY(sesionSel.fecha)} ${fmtHoraRango(sesionSel.hora_inicio, sesionSel.hora_fin)}` : fmtDMY(fechaSel)
      setBanner(`Asistencia guardada · ${horarioSel.estilo} ${horarioSel.nivel} — ${fechaInfo} · ${presentes}/${total}`)
      setTimeout(() => setBanner(""), 4000)
      window.scrollTo({ top: 0, behavior: "smooth" })

      toast.success('Asistencia guardada correctamente')
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      toast.error('Error al guardar la asistencia')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Banner */}
      {banner && (
        <div className="rounded-xl border border-amber-200 bg-yellow-50 px-4 py-2 text-sm text-slate-900">{banner}</div>
      )}

      {/* Mensaje cuando no hay horario seleccionado */}
      {!horarioSel && (
        <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
         
          <h2 className="text-xl font-bold text-slate-900 mb-2">No hay curso seleccionado</h2>
          <p className="text-slate-600 mb-5">Selecciona un curso desde "Mis cursos" para ver las inscripciones y tomar asistencia</p>
          <button
            onClick={() => navigate('/cuenta/profesor')}
            className="inline-flex items-center gap-2 rounded-lg bg-femme-magenta px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ir a Mis cursos
          </button>
        </div>
      )}

      {/* Header con información del horario */}
      {horarioSel && (
        <header className="rounded-2xl border bg-gradient-to-r from-femme-magenta/5 to-femme-rose/5 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{horarioSel.estilo}</h1>
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{horarioSel.nivel}</span>
                  <span>•</span>
                  <span className="font-medium">{getDiaNombre(horarioSel.horarioData.dias)}</span>
                  <span>•</span>
                  <span>{fmtHoraRango(horarioSel.horarioData.hora_inicio, horarioSel.horarioData.hora_fin)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span>{horarioSel.sala}</span>
                  <span>•</span>
                  <span className="capitalize">{horarioSel.modalidad}</span>
                  <span>•</span>
                  <span>{horarioSel.horarioData.oferta.ciclo.nombre_ciclo}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {horarioSel.horarioData.oferta.nombre_oferta}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-femme-magenta">{todosInscritosData?.total_inscritos || 0}</div>
              <div className="text-sm text-slate-600">inscripciones activas</div>
            </div>
          </div>
        </header>
      )}

      {/* Tabla de todas las inscritas del horario */}
      {horarioSel && (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="bg-amber-50/50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Inscripciones</h2>
            <p className="text-xs text-slate-600 mt-1">Todas las alumnas inscritas en este horario</p>
          </div>

          <div className="p-4">
            {loadingTodosInscritos ? (
              <div className="flex justify-center py-8">
                <div className="text-sm text-slate-600">Cargando inscritas...</div>
              </div>
            ) : !todosInscritosData ? (
              <p className="text-sm text-slate-600 text-center py-8">No se pudieron cargar las inscritas.</p>
            ) : todosInscritosData.inscritos.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-8">No hay alumnas inscritas en este horario.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-amber-50 text-left text-slate-700">
                    <tr>
                      <Th>#</Th>
                      <Th>Nombre</Th>
                      <Th>Email</Th>
                      <Th>Sesión inicial</Th>
                      <Th>Celular</Th>
                      <Th>Estado</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosInscritosData.inscritos.map((inscrito, index) => (
                      <tr key={`${inscrito.persona.id_persona}-${index}`} className="odd:bg-white even:bg-slate-50">
                        <Td className="w-10 text-slate-500">{index + 1}</Td>
                        <Td className="font-medium text-slate-900">{inscrito.persona.nombre} {inscrito.persona.apellido_paterno} {inscrito.persona.apellido_materno}</Td>
                        <Td className="text-slate-700">{inscrito.persona.email}</Td>
                        <Td className="text-slate-600">
                          {fmtDMY(inscrito.horario_sesion.fecha)} 
                        </Td>
                        <Td className="text-slate-600">{inscrito.persona.celular}</Td>
                        <Td>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            inscrito.inscripcion.estado === 'ACTIVO' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inscrito.inscripcion.estado}
                          </span>
                        </Td>
                         </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Panel de asistencia por fecha */}
      {horarioSel && (
        <section id="panel-asistencia" className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="bg-femme-rose/10 px-4 py-3 -m-4 mb-4 rounded-t-2xl border-b">
            <h2 className="text-lg font-semibold text-slate-900">Marcar asistencia</h2>
            <p className="text-xs text-slate-600 mt-1">Selecciona una fecha para registrar la asistencia de la clase</p>
          </div>

          {/* Selector de fecha */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Fecha de clase:</label>
              <input
                type="date"
                value={fechaSel}
                onChange={(e) => onChangeFecha(e.target.value)}
                className="rounded-lg border border-femme-magenta/40 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-femme-magenta"
              />
            </div>
            {/* Chips de sesiones del horario */}
            <div className="hidden gap-2 md:flex">
              {sesionesDeHorario.filter((s) => s.estado === 'ACTIVE' && !s.cancelado).slice(0, 3).map((s) => {
                const active = s.id_sesion === sesionSelId
                return (
                  <button key={s.id_sesion} onClick={() => { setSesionSelId(s.id_sesion); setFechaSel(s.fecha); }} className={`rounded-lg px-3 py-1 text-xs border ${active ? "bg-femme-rose text-white border-femme-rose" : "border-femme-magenta/40 text-slate-700 hover:bg-femme-rose/10"}`}>
                    {fmtDMY(s.fecha)} {fmtHoraRango(s.hora_inicio, s.hora_fin)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Si no hay sesión para esa fecha */}
          {!sesionSel && !inscritosData ? (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-slate-700">
              <p>No hay sesión programada para <b>{fmtDMY(fechaSel)}</b>. Selecciona otra fecha.</p>
            </div>
          ) : loadingInscritos ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-slate-600">Cargando inscritos...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info compacta de la sesión */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                <span className="font-medium text-slate-900">
                  {sesionSel ? `${fmtDMY(sesionSel.fecha)} • ${fmtHoraRango(sesionSel.hora_inicio, sesionSel.hora_fin)}` : fmtDMY(fechaSel)}
                </span>
                <span className="text-slate-600">
                  {inscritosData ? inscritosData.inscritos.length : (sesionSel ? sesionSel.cupos_ocupados : 0)} / {horarioSel.capacidad} inscritas
                </span>
              </div>

              {/* Tabla Desktop */}
              <div className="hidden md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-amber-50 text-left text-slate-700">
                    <tr>
                      <Th>#</Th>
                      <Th>Alumna</Th>
                      <Th className="text-center">Asistencia</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistenciasConCambios.map((a, idx) => (
                      <tr key={a.id_asistencia} className="odd:bg-white even:bg-slate-50">
                        <Td className="w-10 text-slate-500">{idx + 1}</Td>
                        <Td className="font-medium text-slate-900">{a.alumno.nombre} {a.alumno.apellido_paterno} {a.alumno.apellido_materno}</Td>
                        <Td className="text-center">
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={a.asistio === true}
                              onChange={() => toggleAsistencia(a.id_asistencia)}
                              className="h-4 w-4 rounded border-slate-300 text-femme-magenta focus:ring-femme-magenta"
                            />
                            <span className="text-sm text-slate-900">{a.asistio === true ? "Presente" : "Ausente"}</span>
                          </label>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista Móvil */}
              <div className="md:hidden">
                <ul className="divide-y">
                  {asistenciasConCambios.map((a, idx) => (
                    <li key={a.id_asistencia} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-slate-900">{idx + 1}. {a.alumno.nombre} {a.alumno.apellido_paterno} {a.alumno.apellido_materno}</span>
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={a.asistio === true}
                          onChange={() => toggleAsistencia(a.id_asistencia)}
                          className="h-4 w-4 rounded border-slate-300 text-femme-magenta focus:ring-femme-magenta"
                        />
                        <span className="text-sm text-slate-900">{a.asistio === true ? "Presente" : "Ausente"}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-600">
                  Presentes: <b>{asistenciasConCambios.filter((x) => x.asistio === true).length}</b> / {asistenciasConCambios.length}
                </p>
                <button
                  onClick={guardarAsistencia}
                  disabled={pendingChanges.size === 0}
                  className="rounded-lg bg-femme-magenta px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar asistencia
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ───────────────────────────── UI helpers
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 text-xs font-medium ${className}`}>{children}</th>
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 align-top ${className}`}>{children}</td>
}