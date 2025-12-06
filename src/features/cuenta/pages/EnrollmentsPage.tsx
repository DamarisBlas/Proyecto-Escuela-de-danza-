import { useState, useEffect } from 'react'
import { useAuth } from '@app/hooks/useAuth'
import { getInscripcionesByPersona, getCiclosActivos, getPaqueteCompleto, type Inscripcion, type Ciclo, type PaqueteCompleto } from '../api/inscripciones'
import { Card } from '@components/ui/Card'
import { Select } from '@components/ui/Select'
import Table from '@components/ui/Table'
import { Badge } from '@components/ui/Badge'
import { Spinner } from '@components/ui/Spinner'
import { EmptyState } from '@components/ui/EmptyState'
import { Calendar, DollarSign, Users, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'activo':
      return 'success'
    case 'pendiente':
      return 'warning'
    case 'vencido':
    case 'cancelado':
      return 'danger'
    default:
      return 'secondary'
  }
}

const getEstadoPagoBadgeVariant = (estadoPago: string) => {
  switch (estadoPago.toLowerCase()) {
    case 'pagado':
    case 'completado':
      return 'success'
    case 'pendiente':
      return 'warning'
    case 'vencido':
    case 'cancelado':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  // Crear fecha sin problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0 a 11
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount).replace('BOB', 'Bs')
}

export default function EnrollmentsPage() {
  const { user } = useAuth()
  const [selectedCiclo, setSelectedCiclo] = useState<string>('todos')
  const [paquetesCompletos, setPaquetesCompletos] = useState<Record<number, PaqueteCompleto>>({})

  // Query para obtener inscripciones
  const { data: inscripciones = [], isLoading: isLoadingInscripciones, error: inscripcionesError } = useQuery({
    queryKey: ['inscripciones', user?.id],
    queryFn: () => user ? getInscripcionesByPersona(parseInt(user.id)) : Promise.resolve([]),
    enabled: !!user?.id
  })

  // Query para obtener ciclos
  const { data: ciclos = [], isLoading: isLoadingCiclos } = useQuery({
    queryKey: ['ciclos-activos'],
    queryFn: getCiclosActivos
  })

  // Cargar información completa de paquetes cuando cambian las inscripciones
  useEffect(() => {
    const cargarPaquetesCompletos = async () => {
      if (inscripciones.length === 0) return
      
      const paquetesIds = [...new Set(inscripciones.map(i => i.Paquete_id_paquete))]
      const paquetesData: Record<number, PaqueteCompleto> = {}
      
      for (const paqueteId of paquetesIds) {
        if (!paquetesCompletos[paqueteId]) {
          try {
            const paqueteCompleto = await getPaqueteCompleto(paqueteId)
            paquetesData[paqueteId] = paqueteCompleto
          } catch (error) {
            console.error(`Error cargando paquete ${paqueteId}:`, error)
          }
        }
      }
      
      if (Object.keys(paquetesData).length > 0) {
        setPaquetesCompletos(prev => ({ ...prev, ...paquetesData }))
      }
    }
    
    cargarPaquetesCompletos()
  }, [inscripciones])

  // Filtrar inscripciones por ciclo seleccionado
  const inscripcionesFiltradas = selectedCiclo === 'todos' 
    ? inscripciones 
    : inscripciones.filter(inscripcion => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto) return false
        return paqueteCompleto.ciclo.id_ciclo.toString() === selectedCiclo
      })

  const isLoading = isLoadingInscripciones || isLoadingCiclos
  
  // Verificar si están cargando los paquetes completos
  const paquetesIds = [...new Set(inscripciones.map(i => i.Paquete_id_paquete))]
  const paquetesCargados = paquetesIds.every(id => paquetesCompletos[id])
  const isLoadingPaquetes = inscripciones.length > 0 && !paquetesCargados

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Cargando inscripciones..." />
      </div>
    )
  }

  if (inscripcionesError) {
    return (
      <EmptyState
        title="Error al cargar inscripciones"
        subtitle="Hubo un problema al obtener tus inscripciones. Por favor, intenta nuevamente."
      />
    )
  }

  const columns = [
    {
      key: 'contador',
      label: '#',
      render: (inscripcion: Inscripcion, index: number) => (
        <span className="text-sm font-mono text-slate-600">
          {index + 1}
        </span>
      )
    },
    {
      key: 'ciclo',
      label: 'Ciclo',
      render: (inscripcion: Inscripcion) => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto) {
          return <span className="text-slate-400">Cargando...</span>
        }
        
        return (
          <span className="text-sm font-medium text-slate-900">
            {paqueteCompleto.ciclo.nombre_ciclo}
          </span>
        )
      }
    },
    {
      key: 'subcategoria',
      label: 'Subcategoría',
      render: (inscripcion: Inscripcion) => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto) {
          return <span className="text-slate-400">Cargando...</span>
        }
        
        return (
          <span className="text-sm font-medium text-slate-900">
            {paqueteCompleto.subcategoria.nombre_subcategoria}
          </span>
        )
      }
    },
    {
      key: 'inscripcion',
      label: 'Inscripción',
      render: (inscripcion: Inscripcion) => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto) {
          return <span className="text-slate-400">Cargando...</span>
        }
        
        return (
          <span className="text-sm font-medium text-slate-900">
            {paqueteCompleto.oferta.nombre_oferta}
          </span>
        )
      }
    },
    {
      key: 'paquete',
      label: 'Paquete',
      render: (inscripcion: Inscripcion) => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto) {
          return <span className="text-slate-400">Cargando...</span>
        }
        
        const { paquete } = paqueteCompleto
        const cantidadTexto = paquete.cantidad_clases === 0 || paquete.cantidad_clases === null 
          ? 'ilimitado' 
          : `${paquete.cantidad_clases} clases`
        
        return (
          <span className="text-sm font-medium text-slate-900">
            {paquete.nombre} - {cantidadTexto}
          </span>
        )
      }
    },
    {
      key: 'fecha_inscripcion',
      label: 'Fecha Inscripción',
      render: (inscripcion: Inscripcion) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span className="font-medium text-slate-900">
              {formatDate(inscripcion.fecha_inscripcion)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'fecha_limite_pago',
      label: 'Fecha Límite Pago',
      render: (inscripcion: Inscripcion) => {
        // Usar directamente fecha_fin sin problemas de zona horaria
        const [year, month, day] = inscripcion.fecha_fin.split('-').map(Number)
        const fechaLimite = new Date(year, month - 1, day)
        const hoy = new Date()
        
        // Normalizar hoy para comparar solo fechas (sin horas)
        const hoyNormalizada = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
        
        const diferenciaDias = Math.ceil((fechaLimite.getTime() - hoyNormalizada.getTime()) / (1000 * 60 * 60 * 24))
        
        let colorClass = 'text-slate-900'
        let indicador = ''
        
        if (diferenciaDias < 0) {
          colorClass = 'text-red-600'
          indicador = 'Vencido'
        } else if (diferenciaDias <= 3) {
          colorClass = 'text-amber-600'
          indicador = `${diferenciaDias} día${diferenciaDias !== 1 ? 's' : ''} restante${diferenciaDias !== 1 ? 's' : ''}`
        } else if (diferenciaDias <= 7) {
          colorClass = 'text-blue-600'
          indicador = `${diferenciaDias} días`
        }
        
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-slate-400" />
              <span className={`font-medium ${colorClass}`}>
                {formatDate(inscripcion.fecha_fin)}
              </span>
            </div>
            {indicador && (
              <div className={`text-xs mt-1 ${colorClass}`}>
                {indicador}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (inscripcion: Inscripcion) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(inscripcion.precio_final)}</div>
          {inscripcion.descuento_aplicado > 0 && (
            <div className="text-xs text-green-600">
              -{formatCurrency(inscripcion.descuento_aplicado)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'whatsapp',
      label: 'Grupo WhatsApp',
      render: (inscripcion: Inscripcion) => {
        const paqueteCompleto = paquetesCompletos[inscripcion.Paquete_id_paquete]
        if (!paqueteCompleto || !paqueteCompleto.oferta.whatsapplink) {
          return <span className="text-slate-400 text-sm">No disponible</span>
        }
        
        return (
          <a 
            href={paqueteCompleto.oferta.whatsapplink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Unirse
          </a>
        )
      }
    },
    {
      key: 'estado_pago',
      label: 'Pago',
      render: (inscripcion: Inscripcion) => (
        <Badge variant={getEstadoPagoBadgeVariant(inscripcion.estado_pago)}>
          {inscripcion.estado_pago}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Mis Inscripciones</h2>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona y revisa el estado de tus inscripciones
          </p>
        </div>

        {/* Selector de ciclos */}
        <div className="w-full sm:w-auto">
          <Select
            value={selectedCiclo}
            onChange={(e) => setSelectedCiclo(e.target.value)}
          >
            <option value="todos">Todos los ciclos</option>
            {ciclos.map((ciclo) => (
              <option key={ciclo.id_ciclo} value={ciclo.id_ciclo.toString()}>
                {ciclo.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-femme-magenta/10 rounded-lg">
                <Users className="h-5 w-5 text-femme-magenta" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Inscripciones</p>
                <p className="text-2xl font-bold text-slate-900">{inscripcionesFiltradas.length}</p>
              </div>
            </div>
          </div>
        </Card>

       
      </div>

      {/* Tabla de inscripciones */}
      <Card>
        {inscripcionesFiltradas.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tienes inscripciones"
              subtitle="Cuando te inscribas a paquetes de clases, aparecerán aquí."
            />
          </div>
        ) : isLoadingPaquetes ? (
          <div className="flex items-center justify-center py-12">
            <Spinner label="Cargando detalles de los paquetes..." />
          </div>
        ) : (
          <Table
            data={inscripcionesFiltradas}
            columns={columns}
            className="w-full"
          />
        )}
      </Card>
    </div>
  )
}
