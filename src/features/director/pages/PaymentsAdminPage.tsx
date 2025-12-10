import React, { useState, useEffect } from 'react'
import { api } from '@lib/api'
import { Spinner } from '@components/ui/Spinner'

// Helper function para formatear fechas
const formatDate = (dateString: string | null) => {
  if (!dateString) return '—'
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

type Cuota = {
  id_pago: number
  nro: number
  monto: number
  fecha: string
  estado: string
  metodoPago: number
  observaciones?: string
  editing?: boolean
}

type Plan = {
  id_inscripcion: number
  id_persona: number
  alumno: string
  nombre: string
  formaPago: number
  total: number
  cuotas: number
  montoCuota: number
  estado: string
  proximoPago: string
  ciclo: string
  programa: string
  oferta: string
  subcategoria: string
  paquete: string
  detalle: Cuota[]
}


const ESTADOS_CUOTA = ['PENDIENTE', 'PROCESANDO', 'CONFIRMADO', 'RECHAZADO', 'CANCELADO']

// Función para calcular el estado de la inscripción basado en sus cuotas
function calcularEstadoInscripcion(cuotas: Cuota[]): string {
  if (cuotas.length === 0) return 'PENDIENTE'
  
  const todasConfirmadas = cuotas.every(c => c.estado === 'CONFIRMADO')
  if (todasConfirmadas) return 'COMPLETADO'
  
  return 'PENDIENTE'
}

type MetodoPago = {
  id_metodo_pago: number
  nombre_metodo: string
  descripcion: string
  estado: boolean
}

export default function PaymentsAdminPage(): JSX.Element {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cicloFilter, setCicloFilter] = useState('TODOS')
  const [programaFilter, setProgramaFilter] = useState('TODOS')
  const [ofertaFilter, setOfertaFilter] = useState('TODOS')
  const [estadoFilter, setEstadoFilter] = useState('TODOS')
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [changedPayments, setChangedPayments] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Cargar métodos de pago
        const metodosResponse = await api.get('/metodos-pago')
        setMetodosPago(metodosResponse.data || [])
        
        const response = await api.get('/pagos/inscripciones-activas/detallado')
        const { inscripciones } = response.data

        const plansData: Plan[] = inscripciones.map((insc: any) => {
          const pagos = insc.pagos || []
          const proximoPagoData = pagos.find((p: any) => p.estado === 'PENDIENTE')
          
          const detalleCuotas = pagos.map((pago: any) => ({
            id_pago: pago.id_pago,
            nro: pago.numero_cuota,
            monto: pago.monto,
            fecha: pago.fecha_vencimiento,
            estado: pago.estado,
            metodoPago: pago.Metodo_pago_id_metodo_pago,
            observaciones: pago.observaciones,
            editing: false
          }))
          
          return {
            id_inscripcion: insc.inscripcion.id_inscripcion,
            id_persona: insc.persona.id_persona,
            alumno: `${insc.persona.nombre} ${insc.persona.apellido_paterno} ${insc.persona.apellido_materno}`.trim(),
            nombre: `${insc.paquete.nombre} – ${insc.paquete.cantidad_clases} clases`,
            formaPago: pagos.length > 0 ? pagos[0].Metodo_pago_id_metodo_pago : 1,
            total: insc.inscripcion.precio_final,
            cuotas: pagos.length,
            montoCuota: pagos.length > 0 ? pagos[0].monto : 0,
            estado: calcularEstadoInscripcion(detalleCuotas),
            proximoPago: proximoPagoData ? formatDate(proximoPagoData.fecha_vencimiento) : '—',
            ciclo: insc.ciclo.nombre,
            programa: insc.programa.nombre_programa,
            oferta: insc.oferta.nombre_oferta,
            subcategoria: insc.subcategoria.nombre_subcategoria,
            paquete: insc.paquete.nombre,
            detalle: detalleCuotas
          }
        })

        setPlans(plansData)
      } catch (error) {
        console.error('Error al cargar datos de pagos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEstadoCuotaChange = (planId: number, cuotaNro: number, nuevoEstado: string) => {
    setPlans((prev) => prev.map((plan) => {
      if (plan.id_inscripcion !== planId) return plan
      const cuota = plan.detalle.find(c => c.nro === cuotaNro)
      if (cuota) {
        setChangedPayments(prev => new Set(prev).add(cuota.id_pago))
      }
      const nuevoDetalle = plan.detalle.map(c => c.nro === cuotaNro ? { ...c, estado: nuevoEstado } : c)
      return { 
        ...plan, 
        detalle: nuevoDetalle,
        estado: calcularEstadoInscripcion(nuevoDetalle)
      }
    }))
  }

  const handleMetodoPagoChange = (planId: number, cuotaNro: number, nuevoMetodo: number) => {
    setPlans((prev) => prev.map((plan) => {
      if (plan.id_inscripcion !== planId) return plan
      const cuota = plan.detalle.find(c => c.nro === cuotaNro)
      if (cuota) {
        setChangedPayments(prev => new Set(prev).add(cuota.id_pago))
      }
      return { 
        ...plan, 
        detalle: plan.detalle.map(c => c.nro === cuotaNro ? { ...c, metodoPago: nuevoMetodo } : c) 
      }
    }))
  }

  const handleObservacionesChange = (planId: number, cuotaNro: number, nuevoTexto: string) => {
    setPlans((prev) => prev.map((plan) => {
      if (plan.id_inscripcion !== planId) return plan
      const cuota = plan.detalle.find(c => c.nro === cuotaNro)
      if (cuota) {
        setChangedPayments(prev => new Set(prev).add(cuota.id_pago))
      }
      return { 
        ...plan, 
        detalle: plan.detalle.map(c => c.nro === cuotaNro ? { ...c, observaciones: nuevoTexto } : c) 
      }
    }))
  }

  const handleToggleEditarCuota = (planId: number, cuotaNro: number) => {
    setPlans((prev) => prev.map((plan) => plan.id_inscripcion !== planId ? plan : { 
      ...plan, 
      detalle: plan.detalle.map(c => c.nro === cuotaNro ? { ...c, editing: !c.editing } : c) 
    }))
  }

  const handleMontoCuotaChange = (planId: number, cuotaNro: number, nuevoMontoStr: string) => {
    const nuevoMonto = parseFloat(nuevoMontoStr)
    setPlans((prev) => prev.map((plan) => {
      if (plan.id_inscripcion !== planId) return plan
      const cuota = plan.detalle.find(c => c.nro === cuotaNro)
      if (cuota) {
        setChangedPayments(prev => new Set(prev).add(cuota.id_pago))
      }
      return { 
        ...plan, 
        detalle: plan.detalle.map(c => c.nro === cuotaNro ? { 
          ...c, 
          monto: Number.isNaN(nuevoMonto) ? 0 : nuevoMonto 
        } : c) 
      }
    }))
  }

  const handleEliminarCuota = async (planId: number, cuotaNro: number) => {
    const plan = plans.find(p => p.id_inscripcion === planId)
    if (!plan) return
    
    const cuota = plan.detalle.find(c => c.nro === cuotaNro)
    if (!cuota) return
    
    const confirmado = window.confirm(`¿Estás seguro de cancelar la cuota #${cuotaNro} de Bs. ${cuota.monto.toFixed(2)}?`)
    if (!confirmado) return
    
    try {
      await api.put(`/pagos/${cuota.id_pago}/cancel`)
      
      // Actualizar la interfaz eliminando la cuota
      setPlans((prev) => prev.map((p) => {
        if (p.id_inscripcion !== planId) return p
        const detalleNuevo = p.detalle.filter(c => c.nro !== cuotaNro).map((c, idx) => ({ ...c, nro: idx + 1 }))
        return { ...p, detalle: detalleNuevo }
      }))
      
      alert('Cuota cancelada exitosamente')
    } catch (error) {
      console.error('Error al cancelar cuota:', error)
      alert('Error al cancelar la cuota. Por favor intenta nuevamente.')
    }
  }

  const handleGuardarCambios = async (plan: Plan) => {
    const sumaMontos = plan.detalle.reduce((acc, c) => acc + (c.monto || 0), 0)
    const isRefund = plan.detalle.length === 0
    
    if (!isRefund) {
      const esTotalValido = Math.abs(sumaMontos - plan.total) < 0.001
      if (!esTotalValido) {
        alert(`No puedes guardar este plan. La suma de las cuotas (Bs. ${sumaMontos.toFixed(2)}) debe ser igual al total del plan (Bs. ${plan.total.toFixed(2)}).`)
        return
      }
    }
    
    try {
      // Actualizar solo los pagos que cambiaron
      const pagosParaActualizar = plan.detalle.filter(cuota => changedPayments.has(cuota.id_pago))
      
      if (pagosParaActualizar.length === 0 && !isRefund) {
        alert('No hay cambios para guardar')
        return
      }
      
      const promesas = pagosParaActualizar.map(cuota => 
        api.put(`/pagos/${cuota.id_pago}`, {
          id_persona: plan.id_persona,
          id_inscripcion: plan.id_inscripcion,
          monto: cuota.monto,
          observaciones: cuota.observaciones || '',
          estado: cuota.estado,
          Metodo_pago_id_metodo_pago: cuota.metodoPago
        })
      )
      
      await Promise.all(promesas)
      
      // Limpiar el set de cambios para este plan
      setChangedPayments(prev => {
        const nuevo = new Set(prev)
        pagosParaActualizar.forEach(cuota => nuevo.delete(cuota.id_pago))
        return nuevo
      })
      
      alert(`Cambios guardados exitosamente (${pagosParaActualizar.length} pago${pagosParaActualizar.length !== 1 ? 's' : ''} actualizado${pagosParaActualizar.length !== 1 ? 's' : ''})`)
    } catch (error) {
      console.error('Error al guardar cambios:', error)
      alert('Error al guardar los cambios. Por favor intenta nuevamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const ciclosDisponibles = Array.from(new Set(plans.map(p => p.ciclo))).sort()
  const programasDisponibles = Array.from(new Set(plans.map(p => p.programa))).sort()
  const ofertasDisponibles = Array.from(new Set(plans.map(p => p.oferta))).sort()

  const filteredPlans = plans.filter(plan => {
    const matchSearch = !normalizedSearch || 
      plan.alumno.toLowerCase().includes(normalizedSearch) || 
      plan.nombre.toLowerCase().includes(normalizedSearch) || 
      plan.id_inscripcion.toString().includes(normalizedSearch)
    if (!matchSearch) return false
    
    const matchCiclo = cicloFilter === 'TODOS' || plan.ciclo === cicloFilter
    if (!matchCiclo) return false
    
    const matchPrograma = programaFilter === 'TODOS' || plan.programa === programaFilter
    if (!matchPrograma) return false
    
    const matchOferta = ofertaFilter === 'TODOS' || plan.oferta === ofertaFilter
    if (!matchOferta) return false
    
    let matchEstado = true
    if (estadoFilter === 'PENDIENTE') matchEstado = plan.estado === 'PENDIENTE'
    if (estadoFilter === 'COMPLETADO') matchEstado = plan.estado === 'COMPLETADO'
    if (!matchEstado) return false
    
    return true
  })

  const resumen = filteredPlans.reduce((acc, plan) => {
    acc.totalPlanes += 1
    plan.detalle.forEach(c => {
      acc.totalCuotas += 1
      if (c.estado === 'PENDIENTE') acc.pendientes += 1
      if (c.estado === 'VENCIDA') acc.vencidas += 1
    })
    return acc
  }, { totalPlanes: 0, totalCuotas: 0, pendientes: 0, vencidas: 0 })

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-slate-200 p-4 sm:p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-sm font-semibold text-graphite flex items-center gap-2">
          Pagos y cuotas
        </h1>
        <p className="text-xs text-slate-500">Busca por alumno. Filtra por ciclo, programa, oferta y estado para encontrar pagos a revisar.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex-1 md:max-w-md">
            <label className="text-[11px] font-medium text-graphite">Buscar</label>
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Alumno, nombre de plan o ID..." 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200" 
            />
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <div className="flex flex-col min-w-[120px]">
              <span className="font-medium text-graphite mb-1">Ciclo</span>
              <select 
                value={cicloFilter} 
                onChange={e => setCicloFilter(e.target.value)} 
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value="TODOS">Todos</option>
                {ciclosDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="font-medium text-graphite mb-1">Programa</span>
              <select 
                value={programaFilter} 
                onChange={e => setProgramaFilter(e.target.value)} 
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value="TODOS">Todos</option>
                {programasDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="font-medium text-graphite mb-1">Oferta</span>
              <select 
                value={ofertaFilter} 
                onChange={e => setOfertaFilter(e.target.value)} 
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value="TODOS">Todas</option>
                {ofertasDisponibles.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[150px]">
              <span className="font-medium text-graphite mb-1">Estado</span>
              <select 
                value={estadoFilter} 
                onChange={e => setEstadoFilter(e.target.value)} 
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-graphite pt-1">
          <span>Planes visibles: <strong>{resumen.totalPlanes}</strong></span>
          <span>Cuotas totales: <strong>{resumen.totalCuotas}</strong></span>
          <span className="inline-flex items-center rounded-full bg-femme-amber/20 px-2 py-0.5">
            Pendientes: <strong className="ml-1 text-amber-700">{resumen.pendientes}</strong>
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
            Vencidas: <strong className="ml-1 text-rose-700">{resumen.vencidas}</strong>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No se encontraron planes con los filtros actuales.</p>
        ) : (
          filteredPlans.map(plan => {
            const cuotasPagadas = plan.detalle.filter(c => c.estado === 'PAGADO' || c.estado === 'CONFIRMADO').length
            const sumaMontos = plan.detalle.reduce((acc, c) => acc + (c.monto || 0), 0)
            const isRefund = plan.detalle.length === 0
            const esTotalValido = isRefund ? true : Math.abs(sumaMontos - plan.total) < 0.001

            return (
              <article key={plan.id_inscripcion} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500">
                      ID inscripción: <span className="font-mono bg-graphite text-white rounded-full px-2 py-0.5">{plan.id_inscripcion}</span>
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{plan.alumno}</p>
                    <p className="text-xs text-slate-600">{plan.nombre}</p>
                    <p className="text-[11px] text-slate-500">
                      {plan.ciclo} · {plan.programa} · {plan.subcategoria} · {plan.oferta}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-[11px] text-slate-500">{cuotasPagadas}/{plan.cuotas} cuotas pagadas</p>
                    <p className="text-[11px] text-slate-500">
                      Próximo pago: <strong className="text-graphite">{plan.proximoPago}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-3">
                  <span>Total: <strong>Bs. {plan.total.toFixed(2)}</strong></span>
                  <span>{plan.cuotas} cuota{plan.cuotas > 1 ? 's' : ''}</span>
                  <span>Forma de pago: <strong>{metodosPago.find(m => m.id_metodo_pago === plan.formaPago)?.nombre_metodo || '—'}</strong></span>
                </div>

                <div className="text-[11px] mt-1">
                  {isRefund ? (
                    <>
                      <p className="text-rose-700 font-medium">
                        Este plan no tiene cuotas activas. Se interpretará como cancelación con reembolso completo de Bs. {plan.total.toFixed(2)}.
                      </p>
                      <p className="text-[10px] text-rose-500">
                        Al guardar reembolso se marcará la inscripción como cancelada y se registrará la solicitud de devolución.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={esTotalValido ? 'text-emerald-700' : 'text-rose-700 font-medium'}>
                        Distribución de cuotas: Bs. {sumaMontos.toFixed(2)} / Bs. {plan.total.toFixed(2)}
                      </p>
                      {!esTotalValido && (
                        <p className="text-[10px] text-rose-500">
                          Ajusta los montos o elimina cuotas hasta que la suma coincida con el total del plan para poder guardar.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {!isRefund && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <table className="w-full border-collapse text-[11px]">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Cuota</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Fecha vence</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Monto</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Método</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Estado</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Observaciones</th>
                          <th className="px-2 py-1 text-left font-semibold text-graphite">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.detalle.map(cuota => (
                          <tr key={cuota.id_pago} className="border-t border-slate-100">
                            <td className="px-2 py-1">Cuota {cuota.nro}</td>
                            <td className="px-2 py-1">{formatDate(cuota.fecha)}</td>
                            <td className="px-2 py-1 text-right">
                              {cuota.editing ? (
                                <input 
                                  type="number" 
                                  min={0} 
                                  step={0.01} 
                                  value={cuota.monto} 
                                  onChange={(e) => handleMontoCuotaChange(plan.id_inscripcion, cuota.nro, e.target.value)} 
                                  className="w-20 rounded-full border border-slate-200 px-2 py-0.5 text-[10px]" 
                                />
                              ) : (
                                <>Bs. {(cuota.monto ?? 0).toFixed(2)}</>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {cuota.editing ? (
                                <select 
                                  value={cuota.metodoPago} 
                                  onChange={(e) => handleMetodoPagoChange(plan.id_inscripcion, cuota.nro, parseInt(e.target.value))} 
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px]"
                                >
                                  {metodosPago.map(m => <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>)}
                                </select>
                              ) : (
                                <>{metodosPago.find(m => m.id_metodo_pago === cuota.metodoPago)?.nombre_metodo || '—'}</>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {cuota.editing ? (
                                <select 
                                  value={cuota.estado} 
                                  onChange={(e) => handleEstadoCuotaChange(plan.id_inscripcion, cuota.nro, e.target.value)} 
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px]"
                                >
                                  {ESTADOS_CUOTA.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <>{cuota.estado}</>
                              )}
                            </td>
                            <td className="px-2 py-1 align-top">
                              {cuota.editing ? (
                                <input 
                                  type="text" 
                                  value={cuota.observaciones || ''} 
                                  onChange={(e) => handleObservacionesChange(plan.id_inscripcion, cuota.nro, e.target.value)} 
                                  placeholder="Notas (opcional)" 
                                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px]" 
                                />
                              ) : (
                                <span className="text-[10px] text-slate-600">
                                  {cuota.observaciones && cuota.observaciones.trim() !== '' ? cuota.observaciones : '—'}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              <div className="flex gap-1">
                                <button 
                                  type="button" 
                                  onClick={() => handleToggleEditarCuota(plan.id_inscripcion, cuota.nro)} 
                                  className="inline-flex items-center rounded-full border border-femme-magenta/20 bg-white px-2 py-0.5 text-[10px] font-medium text-femme-magenta hover:bg-femme-magenta/5"
                                >
                                  {cuota.editing ? 'Listo' : 'Editar'}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleEliminarCuota(plan.id_inscripcion, cuota.nro)} 
                                  className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-2 pb-2">
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        Usa el botón <span className="font-semibold">"Editar"</span> en cada fila para habilitar la edición del monto, método y estado. 
                        Si eliminas todas las cuotas, se tomará como un reembolso.
                      </p>
                      <button 
                        disabled={!esTotalValido} 
                        onClick={() => handleGuardarCambios(plan)} 
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold text-white ${
                          esTotalValido ? 'bg-femme-magenta hover:bg-femme-rose' : 'bg-femme-magenta/20 cursor-not-allowed'
                        }`}
                      >
                        {isRefund ? 'Guardar reembolso' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
