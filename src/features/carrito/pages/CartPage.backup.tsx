import { useCart } from '@app/store/useCart'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { ShoppingCart, Trash2, CheckCircle, Banknote, QrCode, CreditCard, X, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@app/hooks/useAuth'
import { api } from '@lib/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { crearNotificacionInscripcion } from '@features/cuenta/api/notificaciones'
import qrImage from '@assets/qr/qr.jpg'

// Tipos para métodos de pago
interface MetodoPago {
  id_metodo_pago: number
  nombre_metodo: string
  descripcion: string
  estado: boolean
}

export default function CartPage() {
  const { items, removeItem, clear, total } = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'qr' | 'tarjeta' | null>(null)
  // Pago por cuotas
  const [paymentMode, setPaymentMode] = useState<'single' | 'installments'>('single')
  const [installments, setInstallments] = useState<number>(2)
  const [installmentsArray, setInstallmentsArray] = useState<Array<{ number: number; amount: string }>>([])
  const [installmentAmount, setInstallmentAmount] = useState<string>('0.00')
  const [isProcessing, setIsProcessing] = useState(false)
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [loadingMetodos, setLoadingMetodos] = useState(true)
  const [showEfectivoModal, setShowEfectivoModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [fechaPrimeraClase, setFechaPrimeraClase] = useState<string>('')
  // Cache local para detalles de sesiones por id (para enriquecer la vista del carrito)
  const [sessionDetailsMap, setSessionDetailsMap] = useState<Record<number, { profesorNombre?: string }>>({})

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const response = await api.get('/metodos-pago')
        setMetodosPago(response.data)
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error)
        toast.error('Error al cargar métodos de pago')
      } finally {
        setLoadingMetodos(false)
      }
    }

    fetchMetodosPago()
  }, [])

  // Cargar detalles de sesiones (profesor) para enriquecer la vista del carrito
  useEffect(() => {
    async function loadSessionDetails() {
      try {
        const allSessionIds = items.flatMap(i => i.clasesSeleccionadas || [])
        const uniqueIds = Array.from(new Set(allSessionIds))

        // Filtrar IDs que ya tenemos en el map
        const idsToFetch = uniqueIds.filter(id => !sessionDetailsMap[id])
        if (idsToFetch.length === 0) return

        const fetched: Record<number, { profesorNombre?: string }> = {}

        await Promise.all(idsToFetch.map(async (id) => {
          try {
            const res = await api.get(`/sesiones/detalle/${id}`)
            // la respuesta contiene .horario y el profesor dentro de horario.profesor.persona
            const profesorPersona = res.data?.horario?.profesor?.persona
            const nombreCompleto = profesorPersona ? `${profesorPersona.nombre} ${profesorPersona.apellido_paterno} ${profesorPersona.apellido_materno}`.trim() : res.data?.horario?.profesor?.nombre
            fetched[id] = { profesorNombre: nombreCompleto }
          } catch (err) {
            console.error('Error al obtener detalle de sesión', id, err)
            // no bloquear todo por un error
          }
        }))

        if (Object.keys(fetched).length > 0) {
          setSessionDetailsMap(prev => ({ ...prev, ...fetched }))
        }
      } catch (err) {
        console.error('Error al cargar detalles de sesiones para carrito:', err)
      }
    }

    loadSessionDetails()
  }, [items])

  // Función para obtener el ID del método de pago seleccionado
  const getMetodoPagoId = (metodoPago: 'efectivo' | 'qr' | 'tarjeta'): number | null => {
    const metodosMap: Record<string, string> = {
      'efectivo': 'Efectivo',
      'qr': 'QR Bancario', 
      'tarjeta': 'Tarjeta'
    }
    
    const nombreMetodo = metodosMap[metodoPago]
    const metodo = metodosPago.find(m => m.nombre_metodo === nombreMetodo)
    return metodo ? metodo.id_metodo_pago : null
  }

  // Permite pagos a cuotas si al menos un item tiene más de 1 clase seleccionada
  const permiteCuotasBase = items.some(item => (item.clasesSeleccionadas?.length || 0) > 1)
  // Solo permitimos cuotas si al menos un item tiene más de 1 clase seleccionada
  const permiteCuotas = permiteCuotasBase

  // Calcular montos por cuota en función del total y el número de cuotas seleccionado
  // Distribuimos el total redondeado en bolivianos enteros entre las cuotas (sin decimales)
  useEffect(() => {
    const totalAmount = Math.round(total()) // redondear al boliviano más cercano
    const base = Math.floor(totalAmount / installments)
    const remainder = totalAmount % installments
    const arr: Array<{ number: number; amount: string }> = []
    for (let i = 0; i < installments; i++) {
      const amount = base + (i < remainder ? 1 : 0)
      arr.push({ number: i + 1, amount: String(amount) })
    }
    setInstallmentsArray(arr)
    setInstallmentAmount(arr[0]?.amount || '0')
  }, [items, installments])

  // Si las cuotas dejan de estar permitidas (p.ej. carrito no tiene paquetes aptos), forzar pago único
  useEffect(() => {
    if (!permiteCuotas && paymentMode === 'installments') {
      setPaymentMode('single')
    }
  }, [permiteCuotas, paymentMode])

  const handleProceedToPayment = async () => {
    if (!paymentMethod) {
      toast.error('Por favor selecciona un método de pago', {
        style: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
      })
      return
    }
    
    if (!user) {
      toast.error('Debes iniciar sesión para proceder con el pago', {
        style: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
      })
      return
    }

    // Obtener el ID del método de pago seleccionado
    const metodoPagoId = getMetodoPagoId(paymentMethod)
    if (!metodoPagoId) {
      toast.error('Error al obtener el método de pago seleccionado', {
        style: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
      })
      return
    }

    // No bloquear cuotas por método (incluyendo QR). La lógica de bloqueos se basa en si los items
    // en el carrito permiten cuotas (paquetes con más de una clase).

    setIsProcessing(true)
    
    try {
      // Crear inscripciones para cada item del carrito
      console.log('🛒 Items en el carrito:', items)
      console.log('💳 Método de pago seleccionado:', paymentMethod, 'ID:', metodoPagoId)
      
      // Obtener la fecha de la primera clase del primer item
      if (items.length > 0 && items[0].fechaPrimeraClase) {
        const fechaPrimera = new Date(items[0].fechaPrimeraClase)
        const fechaPrimeraFormatted = fechaPrimera.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
        setFechaPrimeraClase(fechaPrimeraFormatted)
      }
      
      for (const item of items) {
        console.log('🔍 Procesando item:', item)
        
        if (!item.paqueteId) {
          console.error('❌ Item sin paqueteId:', item)
          continue
        }
        
        if (!item.clasesSeleccionadas || item.clasesSeleccionadas.length === 0) {
          console.error('❌ Item sin clases seleccionadas:', item)
          continue
        }
        
        if (!item.fechaPrimeraClase) {
          console.error('❌ Item sin fecha primera clase:', item)
          continue
        }

        const inscripcionData: any = {
          Persona_id_persona: parseInt(user.id),
          Paquete_id_paquete: item.paqueteId,
          fecha_inscripcion: new Date().toISOString().split('T')[0],
          fecha_inicio: item.fechaPrimeraClase.split('T')[0],
          metodo_pago_id: metodoPagoId,
          clases_seleccionadas: item.clasesSeleccionadas,
          // Solo incluir campos de pago a cuotas cuando paymentMode === 'installments'
          ...(paymentMode === 'installments' ? {
            pago_a_cuotas: true,
            numero_cuotas: installments,
            montos_cuotas: installmentsArray.map(a => parseFloat(a.amount))
          } : {})
        }

        console.log('📡 Enviando inscripción:', inscripcionData)
        console.log('📋 Clases seleccionadas:', item.clasesSeleccionadas, 'Tipo:', typeof item.clasesSeleccionadas[0])
        
        const response = await api.post('/inscripciones', inscripcionData)
        console.log('✅ Inscripción creada:', response.data)
        
        // Crear notificación de inscripción exitosa
        try {
          const personaId = parseInt(user.id)
          const inscripcionId = response.data.id_inscripcion || response.data.inscripcion?.id_inscripcion
          const nombreCurso = item.title
          const cantidadClases = item.clasesSeleccionadas?.length || 0
          
          console.log('🔔 Creando notificación con params:', { personaId, inscripcionId, nombreCurso, cantidadClases })
          console.log('🔍 Response data completa:', response.data)
          
          await crearNotificacionInscripcion(personaId, inscripcionId, nombreCurso, cantidadClases)
        } catch (notifError) {
          console.error('Error creando notificación:', notifError)
          // No interrumpimos el flujo por error en notificación
        }
      }

      // Si llegamos aquí, todas las inscripciones se crearon exitosamente
      
      // Invalidar queries para refrescar los datos
      await queryClient.invalidateQueries({
        queryKey: ['inscripciones', user.id]
      })
      
      // También invalidar notificaciones para que aparezcan inmediatamente
      await queryClient.invalidateQueries({
        queryKey: ['notificaciones', user.id]
      })
      
      // Si el método de pago es efectivo, mostrar modal de recordatorio
      if (paymentMethod === 'efectivo') {
        setShowEfectivoModal(true)
      } else if (paymentMethod === 'qr') {
        setShowQrModal(true)
      } else {
        toast.success(`¡Inscripciones procesadas correctamente con ${paymentMethod}!`, {
          description: 'Tus clases han sido confirmadas. ¡Te esperamos!',
          style: { 
            background: '#F0FDF4', 
            color: '#15803D', 
            border: '1px solid #BBF7D0' 
          },
          duration: 5000
        })
        
        clear() // Limpiar el carrito
        navigate('/cuenta/inscripciones') // Redirigir a la página de inscripciones
      }
      
    } catch (error) {
      console.error('Error al procesar inscripciones:', error)
      toast.error('Hubo un error al procesar tu inscripción. Por favor intenta nuevamente.', {
        description: 'Si el problema persiste, contacta con nosotros.',
        style: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-femme-magenta" />
            Mi Carrito
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {items.length === 0 ? 'Tu carrito está vacío' : `${items.length} ${items.length === 1 ? 'paquete' : 'paquetes'} en tu carrito`}
          </p>
        </div>

        {/* Empty State */}
        {!items.length ? (
          <Card>
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-sm text-slate-600 mb-6">Explora nuestros paquetes y agrega clases a tu carrito</p>
              <Button onClick={() => navigate('/cursos')}>Ver horario de clases</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id}>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                          {item.title}
                        </h3>
                        
                        {/* Detalles de las clases */}
                        {/* Sección de detalles de clases */}
                        {(item.detailsAutomaticas || item.detailsManuales || item.details) && (
                          <div className="mt-3 space-y-3">
                            {/* Clases seleccionadas automáticamente */}
                            {item.detailsAutomaticas && item.detailsAutomaticas.trim() && (
                              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Clases seleccionadas automáticamente
                                </p>
                                <div className="space-y-1.5">
                                  {item.detailsAutomaticas.split('\n').map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                      <CheckCircle className="h-4 w-4 text-femme-magenta flex-shrink-0 mt-0.5" />
                                      <span>{line}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Clases seleccionadas manualmente */}
                            {item.detailsManuales && item.detailsManuales.trim() && (
                              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Clases seleccionadas manualmente
                                </p>
                                <div className="space-y-1.5">
                                  {item.detailsManuales.split('\n').map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                      <CheckCircle className="h-4 w-4 text-femme-magenta flex-shrink-0 mt-0.5" />
                                      <span>{line}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Fallback para items viejos que usan details */}
                            {!item.detailsAutomaticas && !item.detailsManuales && item.details && (
                              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Clases seleccionadas
                                </p>
                                <div className="space-y-1.5">
                                  {item.details.split('\n').map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                      <CheckCircle className="h-4 w-4 text-femme-magenta flex-shrink-0 mt-0.5" />
                                      <span>{line}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Precio y acciones */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                        <div className="text-right">
                          {/* Si hay promoción aplicada, mostrar precio original tachado */}
                          {item.descuentoAplicado && item.descuentoAplicado > 0 ? (
                            <div className="space-y-1">
                              <div className="text-sm text-slate-400 line-through">
                                Bs. {((item.price + item.descuentoAplicado) * item.qty).toFixed(2)}
                              </div>
                              <div className="text-2xl font-bold text-femme-magenta">
                                Bs. {(item.price * item.qty).toFixed(2)}
                              </div>
                              <div className="inline-flex items-center gap-1 text-xs font-semibold text-femme-rose bg-femme-rose/10 px-2 py-0.5 rounded-full">
                                <span>Ahorraste Bs. {(item.descuentoAplicado * item.qty).toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-femme-magenta">
                              Bs. {(item.price * item.qty).toFixed(2)}
                            </div>
                          )}
                          {item.qty > 1 && (
                            <div className="text-xs text-slate-500 mt-1">
                              Bs. {item.price.toFixed(2)} × {item.qty}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resumen */}
            <Card>
              <div className="p-5 sm:p-6">
                {/* Calcular ahorro total */}
                {(() => {
                  const totalDescuentos = items.reduce((sum, item) => {
                    return sum + (item.descuentoAplicado || 0) * item.qty
                  }, 0)
                  
                  return totalDescuentos > 0 ? (
                    <div className="mb-4 rounded-lg bg-gradient-to-r from-femme-magenta/10 to-femme-rose/10 border border-femme-magenta/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700"> ¡Promoción aplicada!</p>
                          <p className="text-xs text-slate-600 mt-0.5">Estás ahorrando en tu compra</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total ahorrado</p>
                          <p className="text-xl font-bold text-femme-magenta">
                            Bs. {totalDescuentos.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Total */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <span className="text-lg font-semibold text-slate-900">Total a pagar</span>
                  <span className="text-3xl font-bold text-femme-magenta">
                    Bs. {total().toFixed(2)}
                  </span>
                </div>

                

                {/* Métodos de pago */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Elige el método de pago
                  </h3>
                  
                  {loadingMetodos ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-femme-magenta"></div>
                      <span className="ml-2 text-sm text-slate-500">Cargando métodos de pago...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Efectivo */}
                      <button
                        onClick={() => setPaymentMethod('efectivo')}
                        className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition ${
                          paymentMethod === 'efectivo'
                            ? 'border-femme-magenta bg-femme-magenta/5 ring-2 ring-femme-magenta/20'
                            : 'border-slate-200 bg-white hover:border-femme-magenta/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                          paymentMethod === 'efectivo' ? 'bg-femme-magenta/10' : 'bg-slate-100'
                        }`}>
                          <Banknote className={`h-6 w-6 ${
                            paymentMethod === 'efectivo' ? 'text-femme-magenta' : 'text-slate-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-semibold ${
                          paymentMethod === 'efectivo' ? 'text-femme-magenta' : 'text-slate-700'
                        }`}>
                          Efectivo
                        </span>
                        <span className="text-xs text-slate-500 text-center mt-1">
                          Pago en sede
                        </span>
                        {paymentMethod === 'efectivo' && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-femme-magenta" />
                          </div>
                        )}
                      </button>

                      {/* QR */}
                      <button
                        onClick={() => setPaymentMethod('qr')}
                        className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition ${
                          paymentMethod === 'qr'
                            ? 'border-femme-magenta bg-femme-magenta/5 ring-2 ring-femme-magenta/20'
                            : 'border-slate-200 bg-white hover:border-femme-magenta/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                          paymentMethod === 'qr' ? 'bg-femme-magenta/10' : 'bg-slate-100'
                        }`}>
                          <QrCode className={`h-6 w-6 ${
                            paymentMethod === 'qr' ? 'text-femme-magenta' : 'text-slate-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-semibold ${
                          paymentMethod === 'qr' ? 'text-femme-magenta' : 'text-slate-700'
                        }`}>
                          QR Bancario
                        </span>
                        <span className="text-xs text-slate-500 text-center mt-1">
                          Cualquier banco
                        </span>
                        {paymentMethod === 'qr' && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-femme-magenta" />
                          </div>
                        )}
                      </button>

                      {/* Tarjeta */}
                      <button
                        onClick={() => setPaymentMethod('tarjeta')}
                        className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition ${
                          paymentMethod === 'tarjeta'
                            ? 'border-femme-magenta bg-femme-magenta/5 ring-2 ring-femme-magenta/20'
                            : 'border-slate-200 bg-white hover:border-femme-magenta/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                          paymentMethod === 'tarjeta' ? 'bg-femme-magenta/10' : 'bg-slate-100'
                        }`}>
                          <CreditCard className={`h-6 w-6 ${
                            paymentMethod === 'tarjeta' ? 'text-femme-magenta' : 'text-slate-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-semibold ${
                          paymentMethod === 'tarjeta' ? 'text-femme-magenta' : 'text-slate-700'
                        }`}>
                          Tarjeta
                        </span>
                        <span className="text-xs text-slate-500 text-center mt-1">
                          Débito o crédito
                        </span>
                        {paymentMethod === 'tarjeta' && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-femme-magenta" />
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Modo de pago */}
                <div className="space-y-3 pt-1 mb-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900">¿Cómo quieres pagar?</h3>
                    <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('single')}
                        className={`px-3 py-1 rounded-full transition ${
                          paymentMode === 'single'
                            ? 'bg-white shadow-sm text-pink-600 font-medium'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pago único
                      </button>
                      <button
                        type="button"
                        disabled={!permiteCuotas}
                        onClick={() => permiteCuotas && setPaymentMode('installments')}
                        className={`px-3 py-1 rounded-full transition ${
                          paymentMode === 'installments'
                            ? 'bg-white shadow-sm text-pink-600 font-medium'
                            : 'text-slate-600 hover:text-slate-900'
                        }
                        ${!permiteCuotas ? ' opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Pagar en cuotas
                      </button>
                    </div>
                  </div>

                  {!permiteCuotas && (
                    <p className="text-[11px] text-slate-500">Este tipo de clase (por ejemplo, clase suelta) solo admite pago único el mismo día.</p>
                  )}

                  {paymentMode === 'installments' && permiteCuotas && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-pink-600">Plan en {installments} cuota{installments > 1 ? 's' : ''} de Bs. {installmentAmount}</p>
                        <div className="text-[11px] text-slate-500">Total redondeado: Bs. {Math.round(total())}</div>
                      </div>

                      {/* QR not allowed: button is disabled if paymentMethod is QR, so not showing this inside installments block */}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label htmlFor="installments-select" className="text-xs font-medium text-slate-700">Número de cuotas</label>
                        <select
                          id="installments-select"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full sm:w-40 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                        >
                          <option value={2}>2 cuotas</option>
                          <option value={3}>3 cuotas</option>
                        </select>
                        <p className="text-xs text-slate-500">Bs. {installmentAmount} por cuota</p>
                      </div>

                      <div className="border-t border-slate-200 pt-3 space-y-1">
                        <p className="text-xs font-semibold text-slate-800">Detalle de pago en cuotas</p>
                        <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                          {installmentsArray.map((cuota) => (
                            <li key={cuota.number}>Cuota {cuota.number}: Bs. {cuota.amount}</li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-slate-500 pt-1">
                          {paymentMethod === 'tarjeta' && (
                            <>Solo se cobrará la primera cuota hoy. Las siguientes se cargarán automáticamente a tu tarjeta en las fechas programadas.</>
                          )}
                          {paymentMethod === 'efectivo' && (
                            <>Pagarás cada cuota en efectivo al iniciar una clase en la escuela.</>
                          )}
                          {paymentMethod === 'qr' && (
                            <>Con QR, podrás pagar la primera cuota al confirmar (se generará un cobro/QR). Las siguientes cuotas quedarán como pendientes y podrás pagarlas por QR o en sede según lo acordado con la escuela.</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => clear()}
                    className="w-full sm:w-auto"
                  >
                    Vaciar carrito
                  </Button>
                  <Button 
                    onClick={handleProceedToPayment}
                    disabled={!paymentMethod || isProcessing || loadingMetodos || (paymentMode === 'installments' && !permiteCuotas)}
                    className="w-full sm:flex-1"
                  >
                    {isProcessing ? 'Procesando...' : loadingMetodos ? 'Cargando...' : 'Proceder al pago'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de recordatorio para pago en efectivo */}
      {showEfectivoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-femme-magenta/10">
                    <Banknote className="h-5 w-5 text-femme-magenta" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      ¡Inscripción exitosa!
                    </h3>
                    <p className="text-sm text-slate-600">
                      Pago en efectivo seleccionado
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEfectivoModal(false)
                    clear()
                    navigate('/cuenta/inscripciones')
                  }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="mb-4 rounded-xl border border-femme-magenta/20 bg-gradient-to-r from-femme-magenta/5 to-femme-rose/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-femme-magenta" />
                  <h4 className="font-semibold text-femme-magenta">
                    Tu primer día comienza
                  </h4>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Recuerda pagar en efectivo en nuestra sede <strong>antes de tu primera clase</strong>.
                </p>
                <div className="rounded-lg bg-white border border-femme-magenta/20 p-3 shadow-sm">
                  <p className="text-xs text-slate-600 mb-1">Fecha de tu primera clase:</p>
                  <p className="text-lg font-bold text-femme-magenta">
                    {fechaPrimeraClase}
                  </p>
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <p>Tu inscripción está <strong>confirmada</strong> y las clases están reservadas</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">📋</span>
                  <p>Puedes ver todos los detalles en la sección "Mis Inscripciones"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500">💬</span>
                  <p>Si necesitas ayuda, contacta con nosotros</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4">
              <Button
                onClick={() => {
                  setShowEfectivoModal(false)
                  clear() // Limpiar el carrito
                  navigate('/cuenta/inscripciones') // Redirigir a inscripciones
                }}
                className="w-full"
              >
                Ir a mis inscripciones
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de QR para pago */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-femme-magenta/10">
                    <QrCode className="h-5 w-5 text-femme-magenta" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      ¡Inscripción exitosa!
                    </h3>
                    <p className="text-sm text-slate-600">
                      Pago por QR seleccionado
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowQrModal(false)
                    clear()
                    navigate('/cuenta/inscripciones')
                  }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* QR Image */}
              <div className="mb-4 flex justify-center">
                <img 
                  src={qrImage} 
                  alt="QR Banco Unión" 
                  className="w-full max-w-sm rounded-lg border-2 border-femme-magenta/20 shadow-md"
                />
              </div>

              <div className="mb-4 rounded-xl border border-femme-magenta/20 bg-gradient-to-r from-femme-magenta/5 to-femme-rose/5 p-4">
                <h4 className="font-semibold text-femme-magenta mb-2">
                  Instrucciones de pago
                </h4>
                <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Escanea el código QR con tu aplicación de banco</li>
                  <li>Realiza el pago por el monto total</li>
                  <li>Envía el comprobante de pago por WhatsApp</li>
                </ol>
              </div>

              <div className="text-sm text-slate-600 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <p>Tu inscripción está <strong>confirmada</strong> y las clases están reservadas</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">📋</span>
                  <p>Puedes ver todos los detalles en la sección "Mis Inscripciones"</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 space-y-3">
              <Button
                onClick={() => {
                  const mensaje = encodeURIComponent('Hola, adjunto comprobante de pago para mi inscripción en FEMME DANCE')
                  window.open(`https://wa.me/59164048095?text=${mensaje}`, '_blank')
                }}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                📱 Enviar comprobante por WhatsApp
              </Button>
              <Button
                onClick={() => {
                  setShowQrModal(false)
                  clear()
                  navigate('/cuenta/inscripciones')
                }}
                variant="outline"
                className="w-full"
              >
                Ir a mis inscripciones
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
