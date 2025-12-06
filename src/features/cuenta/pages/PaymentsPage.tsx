import React, { useState, useEffect } from 'react'
import { useAuth } from '@app/hooks/useAuth'
import { api } from '@lib/api'
import { Card } from '@components/ui/Card'
import { Select } from '@components/ui/Select'
import { Spinner } from '@components/ui/Spinner'
import { getPaqueteCompleto, type PaqueteCompleto } from '../api/inscripciones'
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  Banknote,
  QrCode,
  DollarSign
} from 'lucide-react'

// Helper function para formatear fechas
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Sin fecha'
  
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Tipos para inscripciones
interface Inscripcion {
  id_inscripcion: number
  Persona_id_persona: number
  Paquete_id_paquete: number
  Promocion_id_promocion: number | null
  fecha_inscripcion: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
  estado_pago: string
  precio_original: number
  descuento_aplicado: number
  precio_final: number
  pago_a_cuotas: boolean
  clases_usadas: number
  clases_restantes: number
}

// Tipos para pagos
interface Pago {
  id_pago: number
  Inscripcion_id_inscripcion: number
  Metodo_pago_id_metodo_pago: number
  monto: number
  fecha_pago: string | null
  fecha_vencimiento: string
  estado: string
  numero_cuota: number
  observaciones: string | null
  confirmado_por: number
  fecha_confirmacion_director: string | null
}

// Tipos para métodos de pago
interface MetodoPago {
  id_metodo_pago: number
  nombre_metodo: string
  descripcion: string
  estado: boolean
}

// Tipos para ciclos
interface Ciclo {
  id_ciclo: number
  nombre: string
  inicio: string
  fin: string
  estado: boolean
}

// Tipo para datos enriquecidos de paquete
interface PaqueteInfo {
  nombre: string
  ciclo: string
  oferta: string
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [selectedCiclo, setSelectedCiclo] = useState<string>('')
  const [selectedInscripcion, setSelectedInscripcion] = useState<string>('')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loadingPagos, setLoadingPagos] = useState(false)
  const [expandedPagos, setExpandedPagos] = useState<Set<number>>(new Set())
  const [paquetesCompletos, setPaquetesCompletos] = useState<Record<number, PaqueteCompleto>>({})

  // Cargar ciclos activos al montar
  useEffect(() => {
    const fetchCiclos = async () => {
      try {
        const response = await api.get('/ciclos/active')
        setCiclos(response.data)
        
        // Auto-seleccionar el primer ciclo activo
        if (response.data.length > 0) {
          setSelectedCiclo(response.data[0].id_ciclo.toString())
        }
      } catch (error) {
        console.error('Error al cargar ciclos:', error)
      }
    }

    fetchCiclos()
  }, [])

  // Cargar métodos de pago
  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const response = await api.get('/metodos-pago')
        setMetodosPago(response.data)
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error)
      }
    }

    fetchMetodosPago()
  }, [])

  // Cargar inscripciones cuando se selecciona un ciclo
  useEffect(() => {
    const fetchInscripciones = async () => {
      if (!user || !selectedCiclo) return

      setLoading(true)
      try {
        const response = await api.get(`/inscripciones/persona/${user.id}`)
        const todasInscripciones: Inscripcion[] = response.data
        
        setInscripciones(todasInscripciones)
        
        // Cargar información completa de paquetes
        const paquetesIds = [...new Set(todasInscripciones.map(i => i.Paquete_id_paquete))]
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
        
        // Auto-seleccionar la primera inscripción
        if (todasInscripciones.length > 0) {
          setSelectedInscripcion(todasInscripciones[0].id_inscripcion.toString())
        } else {
          setSelectedInscripcion('')
          setPagos([])
        }
      } catch (error) {
        console.error('Error al cargar inscripciones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInscripciones()
  }, [user, selectedCiclo, ciclos])

  // Cargar pagos cuando se selecciona una inscripción
  useEffect(() => {
    const fetchPagos = async () => {
      if (!selectedInscripcion) {
        setPagos([])
        return
      }

      setLoadingPagos(true)
      try {
        const response = await api.get(`/pagos/inscripcion/${selectedInscripcion}`)
        setPagos(response.data)
      } catch (error) {
        console.error('Error al cargar pagos:', error)
        setPagos([])
      } finally {
        setLoadingPagos(false)
      }
    }

    fetchPagos()
  }, [selectedInscripcion])

  const toggleExpandPago = (pagoId: number) => {
    setExpandedPagos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pagoId)) {
        newSet.delete(pagoId)
      } else {
        newSet.add(pagoId)
      }
      return newSet
    })
  }

  const getMetodoPagoNombre = (id: number) => {
    const metodo = metodosPago.find(m => m.id_metodo_pago === id)
    return metodo?.nombre_metodo || 'Desconocido'
  }

  const getMetodoPagoIcon = (id: number) => {
    const nombre = getMetodoPagoNombre(id)
    
    if (nombre.toLowerCase().includes('efectivo')) {
      return <Banknote className="h-5 w-5" />
    } else if (nombre.toLowerCase().includes('qr')) {
      return <QrCode className="h-5 w-5" />
    } else if (nombre.toLowerCase().includes('tarjeta')) {
      return <CreditCard className="h-5 w-5" />
    }
    
    return <DollarSign className="h-5 w-5" />
  }

  const getEstadoPagoStyle = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'PAGADO':
      case 'CONFIRMADO':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />
        }
      case 'PENDIENTE':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />
        }
      case 'VENCIDO':
      case 'RECHAZADO':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <XCircle className="h-5 w-5 text-red-600" />
        }
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <AlertCircle className="h-5 w-5 text-slate-600" />
        }
    }
  }

  const calcularTotalPagado = () => {
    return pagos
      .filter(p => p.estado.toUpperCase() === 'PAGADO' || p.estado.toUpperCase() === 'CONFIRMADO')
      .reduce((sum, p) => sum + p.monto, 0)
  }

  const calcularTotalPendiente = () => {
    return pagos
      .filter(p => p.estado.toUpperCase() === 'PENDIENTE')
      .reduce((sum, p) => sum + p.monto, 0)
  }

  const inscripcionActual = inscripciones.find(i => i.id_inscripcion.toString() === selectedInscripcion)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-femme-magenta" />
          Mis Pagos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Consulta el estado de tus pagos e inscripciones
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selector de Ciclo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ciclo
              </label>
              <Select
                value={selectedCiclo}
                onChange={(e) => setSelectedCiclo(e.target.value)}
                disabled={ciclos.length === 0}
              >
                <option value="">Selecciona un ciclo</option>
                {ciclos.map((ciclo) => (
                  <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
                    {ciclo.nombre}
                  </option>
                ))}
              </Select>
            </div>

            {/* Selector de Inscripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inscripción
              </label>
              <Select
                value={selectedInscripcion}
                onChange={(e) => setSelectedInscripcion(e.target.value)}
                disabled={inscripciones.length === 0 || loading}
              >
                <option value="">Selecciona una inscripción</option>
                {inscripciones.map((insc) => {
                  const paqueteCompleto = paquetesCompletos[insc.Paquete_id_paquete]
                  const displayText = paqueteCompleto 
                    ? `${paqueteCompleto.oferta.nombre_oferta} - Paquete: ${paqueteCompleto.paquete.nombre}`
                    : `Inscripción #${insc.id_inscripcion}`
                  
                  return (
                    <option key={insc.id_inscripcion} value={insc.id_inscripcion}>
                      {displayText}
                    </option>
                  )
                })}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      )}

      {/* Tabla de Pagos */}
      {!loading && selectedInscripcion && (
        <Card>
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-femme-magenta" />
              Detalle de Pagos
            </h2>
          </div>

          {loadingPagos ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : pagos.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No hay pagos registrados
              </h3>
              <p className="text-sm text-slate-600">
                No hay pagos para esta inscripción
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-femme-amber/20 text-left text-graphite">
                  <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="pb-2 px-2">#</th>
                    <th className="pb-2 px-2">Monto</th>
                    <th className="pb-2 px-2">Método</th>
                    <th className="pb-2 px-2 hidden sm:table-cell">Vencimiento</th>
                    <th className="pb-2 px-2">Estado</th>
                    <th className="pb-2 px-2 hidden lg:table-cell">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => {
                    const estadoStyle = getEstadoPagoStyle(pago.estado)
                    const esPagoVencido = pago.estado === 'PENDIENTE' && 
                      new Date(pago.fecha_vencimiento) < new Date()

                    return (
                      <tr key={pago.id_pago} className="text-sm border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2">
                          <span className="font-medium text-slate-700">
                            {inscripcionActual?.pago_a_cuotas 
                              ? `Cuota ${pago.numero_cuota}` 
                              : 'Pago único'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-bold text-femme-magenta">
                            Bs. {pago.monto.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {getMetodoPagoIcon(pago.Metodo_pago_id_metodo_pago)}
                            <span className="text-slate-700 hidden sm:inline">
                              {getMetodoPagoNombre(pago.Metodo_pago_id_metodo_pago)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className={esPagoVencido ? 'text-red-600 font-medium' : 'text-slate-700'}>
                            {formatDate(pago.fecha_vencimiento)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1">
                            {pago.estado === 'PAGADO' || pago.estado === 'CONFIRMADO' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                <span className="hidden sm:inline">{pago.estado}</span>
                              </span>
                            ) : pago.estado === 'PENDIENTE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                <AlertCircle className="h-3 w-3" />
                                <span className="hidden sm:inline">Pendiente</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3" />
                                <span className="hidden sm:inline">{pago.estado}</span>
                              </span>
                            )}
                            {esPagoVencido && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                <span className="hidden sm:inline">Vencido</span>
                                <XCircle className="h-3 w-3 sm:hidden" />
                              </span>
                            )}
                            {/* Mobile: show dates on separate row */}
                            <div className="sm:hidden text-xs text-slate-600 mt-1">
                              <div>Vence: {formatDate(pago.fecha_vencimiento)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden lg:table-cell">
                          {pago.observaciones ? (
                            <span className="text-slate-600 text-xs">{pago.observaciones}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Empty state cuando no hay inscripción seleccionada */}
      {!loading && !selectedInscripcion && (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Selecciona una inscripción
            </h3>
            <p className="text-sm text-slate-600">
              Elige un ciclo y una inscripción para ver tus pagos
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
