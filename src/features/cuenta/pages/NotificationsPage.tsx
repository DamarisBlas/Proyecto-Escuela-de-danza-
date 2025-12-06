import { useMemo, useState } from 'react'
import {Card} from '@components/ui/Card'
import { cn } from '@lib/utils'
import { useAuth } from '@app/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getNotificacionesPersona, marcarNotificacionLeida, type NotificacionCompleta } from '../api/notificaciones'
import { Spinner } from '@components/ui/Spinner'
import { EmptyState } from '@components/ui/EmptyState'
import { toast } from 'sonner'

// Función helper para truncar mensajes
const truncarMensaje = (mensaje: string, limite: number = 80): { corto: string, esLargo: boolean } => {
  if (mensaje.length <= limite) {
    return { corto: mensaje, esLargo: false }
  }
  return { 
    corto: mensaje.substring(0, limite).trim() + '...', 
    esLargo: true 
  }
}

// Mapeo de tipos del backend a estilos de UI
const TYPE_STYLES: Record<string, string> = {
  'AVISO': 'border-amber-300 bg-femme-softyellow/70',
  'PELIGRO': 'border-femme-rose/50 bg-femme-rose/10',
  'INFORMACION': 'border-graphite/10 bg-graphite/5',
  'EXITO': 'border-emerald-300 bg-emerald-50',
}

const TYPE_BADGE: Record<string, string> = {
  'AVISO': '⚠️  Recordatorio',
  'PELIGRO': '🚨  Importante',
  'INFORMACION': 'ℹ️  Info',
  'EXITO': '✅  Confirmación',
}

// Mapeo de categorías
const CATEGORIA_LABELS: Record<string, string> = {
  'INSCRIPCION': 'Inscripción',
  'PAGO': 'Pago',
  'ASISTENCIA': 'Asistencia',
  'GENERAL': 'General',
  'PROMOCION': 'Promoción', 
  'SORTEO': 'Sorteo',
  'CLASE_CANCELADA': 'Clase Cancelada',
  'RECORDATORIO': 'Recordatorio'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [filterCategory, setFilterCategory] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'leidas' | 'no_leidas'>('todos')
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set())

  // Cargar notificaciones del usuario con auto-refresh
  const { 
    data: notificaciones = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['notificaciones', user?.id],
    queryFn: () => user ? getNotificacionesPersona(parseInt(user.id)) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 30000, // Actualizar cada 30 segundos
    refetchIntervalInBackground: true, // Continuar actualizando en background
    staleTime: 10000, // Los datos se consideran frescos por 10 segundos
  })

  // Filtrar notificaciones
  const notificacionesFiltradas = useMemo(() => {
    let filtered = [...notificaciones]

    // Filtrar por categoría
    if (filterCategory !== 'todos') {
      filtered = filtered.filter(n => n.notificacion.categoria === filterCategory)
    }

    // Filtrar por estado de lectura
    if (filterStatus === 'leidas') {
      filtered = filtered.filter(n => n.leida === true)
    } else if (filterStatus === 'no_leidas') {
      filtered = filtered.filter(n => n.leida === false)
    }

    // Ordenar por fecha de creación (más recientes primero) y luego por prioridad
    return filtered.sort((a, b) => {
      const fechaA = new Date(a.notificacion.fecha_creacion).getTime()
      const fechaB = new Date(b.notificacion.fecha_creacion).getTime()
      
      if (fechaA !== fechaB) {
        return fechaB - fechaA // Más recientes primero
      }
      
      // Si son de la misma fecha, ordenar por prioridad
      const prioridadOrder = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 }
      return (prioridadOrder[b.notificacion.prioridad] || 0) - (prioridadOrder[a.notificacion.prioridad] || 0)
    })
  }, [notificaciones, filterCategory, filterStatus])

  // Categorías únicas para el filtro
  const categoriasDisponibles = useMemo(() => {
    const categorias = new Set(notificaciones.map(n => n.notificacion.categoria))
    return Array.from(categorias)
  }, [notificaciones])

  // Manejar click en notificación: expandir/contraer y marcar como leída
  const handleClickNotificacion = async (notificacionPersona: NotificacionCompleta) => {
    const notifId = notificacionPersona.id_notificacion_persona
    const isExpanded = expandedNotifications.has(notifId)
    
    // Toggle expansión
    const newExpanded = new Set(expandedNotifications)
    if (isExpanded) {
      newExpanded.delete(notifId)
    } else {
      newExpanded.add(notifId)
      
      // Si se expande y no está leída, marcarla como leída
      if (!notificacionPersona.leida) {
        try {
          await marcarNotificacionLeida(notifId)
          refetch() // Recargar notificaciones para actualizar estado
        } catch (error) {
          console.error('Error marcando notificación como leída:', error)
          toast.error('Error al marcar la notificación como leída')
        }
      }
    }
    
    setExpandedNotifications(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Cargando notificaciones..." />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Error al cargar notificaciones"
        subtitle="Hubo un problema al obtener tus notificaciones. Por favor, intenta nuevamente."
      />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">Notificaciones</h2>
       
      </div>

      {/* Filtros */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filtro por categoría */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-graphite/70">Categoría</label>
          <select
            className="rounded-[var(--radius)] border border-graphite/20 px-3 py-2 text-sm bg-white w-full sm:w-48"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="todos">Todas las categorías</option>
            {categoriasDisponibles.map((categoria) => (
              <option key={categoria} value={categoria}>
                {CATEGORIA_LABELS[categoria] || categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-graphite/70">Estado</label>
          <select
            className="rounded-[var(--radius)] border border-graphite/20 px-3 py-2 text-sm bg-white w-full sm:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'leidas' | 'no_leidas')}
          >
            <option value="todos">Todas</option>
            <option value="no_leidas">No leídas</option>
            <option value="leidas">Leídas</option>
          </select>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="mt-6 space-y-4 max-w-4xl">
        {notificacionesFiltradas.map((notifCompleta) => (
          <Card 
            key={notifCompleta.id_notificacion_persona} 
            className={cn(
              "p-0 overflow-hidden cursor-pointer transition-all hover:shadow-md",
              !notifCompleta.leida && "ring-2 ring-femme-magenta/20"
            )}
          >
            <div 
              onClick={() => handleClickNotificacion(notifCompleta)}
              className={cn(
                'flex flex-col sm:flex-row sm:items-start gap-3 p-4 border-l-4 transition-all duration-200',
                TYPE_STYLES[notifCompleta.notificacion.tipo] || 'border-graphite/10 bg-graphite/5',
                expandedNotifications.has(notifCompleta.id_notificacion_persona) && 'bg-opacity-80'
              )}
            >
              {/* Badge del tipo */}
              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-white/70 text-ink w-fit">
                {TYPE_BADGE[notifCompleta.notificacion.tipo] || '📄 Notificación'}
              </span>

              <div className="flex-1">
                {/* Título */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={cn(
                    "text-ink font-medium leading-relaxed",
                    !notifCompleta.leida && "font-semibold"
                  )}>
                    {notifCompleta.notificacion.titulo}
                  </h3>
                  <div className="flex items-center gap-2">
                    {!notifCompleta.leida && (
                      <div className="w-2 h-2 bg-femme-magenta rounded-full flex-shrink-0 mt-2"></div>
                    )}
                    {/* Indicador de expansión */}
                    <div className="text-graphite/50 text-xs mt-1">
                      {expandedNotifications.has(notifCompleta.id_notificacion_persona) ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
                
                {/* Mensaje */}
                <div className="text-slate-700 text-sm mb-2 leading-relaxed">
                  {(() => {
                    const isExpanded = expandedNotifications.has(notifCompleta.id_notificacion_persona)
                    const { corto, esLargo } = truncarMensaje(notifCompleta.notificacion.mensaje)
                    
                    if (isExpanded || !esLargo) {
                      return <p>{notifCompleta.notificacion.mensaje}</p>
                    } else {
                      return (
                        <p>
                          {corto}
                          <span className="text-femme-magenta font-medium ml-1 cursor-pointer">
                            Ver más
                          </span>
                        </p>
                      )
                    }
                  })()}
                </div>
                
                {/* Metadatos */}
                <div className="flex items-center gap-4 text-xs text-graphite/70">
                  <span>{formatDate(notifCompleta.notificacion.fecha_creacion)}</span>
                  <span>•</span>
                  <span className="capitalize">{CATEGORIA_LABELS[notifCompleta.notificacion.categoria] || notifCompleta.notificacion.categoria}</span>
                  {notifCompleta.notificacion.prioridad === 'ALTA' && (
                    <>
                      <span>•</span>
                      <span className="text-red-600 font-medium">Prioridad Alta</span>
                    </>
                  )}
                  {notifCompleta.leida && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600">Leída</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Estado vacío */}
        {notificacionesFiltradas.length === 0 && (
          <div className="rounded-[12px] border border-graphite/10 p-8 text-center text-graphite/60">
            {notificaciones.length === 0 ? (
              <>
                <h3 className="font-medium text-slate-900 mb-2">No tienes notificaciones</h3>
                <p>Cuando tengas nuevas notificaciones, aparecerán aquí.</p>
              </>
            ) : (
              <>
                <h3 className="font-medium text-slate-900 mb-2">No hay notificaciones para estos filtros</h3>
                <p>Prueba ajustando los filtros para ver más notificaciones.</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
