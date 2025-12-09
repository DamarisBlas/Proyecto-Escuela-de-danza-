//export default function CancellationsPage(){ return <div>Cancelaciones</div> }


import React, { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'

// Utility to get today's date in local ISO format (YYYY-MM-DD)
function getTodayLocalISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

// Función para obtener sesiones por fecha
async function fetchClassesForDate(date: string) {
  try {
    const response = await api.get(`/sesiones/fecha/${date}`)
    return response.data.sesiones || []
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

// Función para cancelar una sesión
async function cancelSession(sessionId: number, motivo: string) {
  try {
    const response = await api.put(`/sesiones/${sessionId}`, {
      cancelado: true,
      motivo: motivo
    })
    return response.data
  } catch (error) {
    console.error('Error canceling session:', error)
    throw error
  }
}

const STORAGE_KEY = 'cancelacionFormV1'

type FormState = { date: string; classId: string; reason: string }

const initialState: FormState = { date: '', classId: '', reason: '' }

export default function CancellationsPage() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as FormState
    } catch {}
    return initialState
  })
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [sending, setSending] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    if (!form.date) return setClasses([])
    let mounted = true
    setLoadingClasses(true)
    fetchClassesForDate(form.date).then((sesiones) => {
      if (!mounted) return
      setClasses(sesiones)
      // Si la clase seleccionada actual no está en la lista, resetea
      if (!sesiones.find((x: any) => x.id_sesion.toString() === form.classId)) {
        setForm((s) => ({ ...s, classId: sesiones[0]?.id_sesion?.toString() ?? '' }))
      }
      setLoadingClasses(false)
    })
    return () => { mounted = false }
  }, [form.date])

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.date) e.date = 'Requerida'
    if (!form.classId) e.classId = 'Seleccione una clase'
    if (!form.reason || form.reason.trim().length < 5) e.reason = 'Explique brevemente (≥ 5 caracteres)'
    return e
  }, [form])

  const isValid = Object.keys(errors).length === 0

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setToday() {
    update('date', getTodayLocalISO())
  }

  function resetForm() {
    setForm(initialState)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      showToast('error', '❌ Error', 'Revise los campos')
      return
    }

    setSending(true)
    try {
      await cancelSession(Number(form.classId), form.reason.trim())
      showToast('success', '✅ Clase cancelada', 'La notificación se envió exitosamente')
      resetForm()
      // Recargar clases para reflejar el cambio
      if (form.date) {
        const sesiones = await fetchClassesForDate(form.date)
        setClasses(sesiones)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'No se pudo cancelar la clase'
      showToast('error', '❌ Error', errorMessage)
    } finally {
      setSending(false)
    }
  }

  const selected = classes.find((c: any) => c.id_sesion.toString() === form.classId)
  const selectedLabel = selected 
    ? `${selected.estilo.nombre_estilo} ${selected.hora_inicio}–${selected.hora_fin} ${selected.profesor.nombre} ${selected.profesor.apellido_paterno || ''} ${selected.profesor.apellido_materno || ''} (${selected.cancelado ? 'CANCELADA' : 'ACTIVA'})`.trim()
    : ''

  return (
    <div className="min-h-[60vh] w-full py-10">
      <form onSubmit={onSubmit} className="w-full max-w-3xl mx-auto bg-white rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold text-ink">Cancelación de clases</h1>
        <p className="text-sm text-graphite mt-1">Notifica la cancelación para que el alumnado reciba aviso.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-graphite">Fecha solicitud</label>
            <div className="mt-2 flex gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 transition-shadow ${errors.date ? 'border-red-400 focus:ring-red-100' : 'border-neutral-300 focus:ring-neutral-200'}`}
              />
              <button type="button" onClick={setToday} className="shrink-0 rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">Hoy</button>
            </div>
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite">Seleccione la clase</label>
            <div className="mt-2">
              {loadingClasses ? (
                <div className="rounded-xl border px-3 py-2 bg-neutral-50 text-sm">Cargando clases…</div>
              ) : classes.length === 0 ? (
                <div className="rounded-xl border px-3 py-2 bg-neutral-50 text-sm">No hay clases para esta fecha</div>
              ) : (
                <select value={form.classId} onChange={(e) => update('classId', e.target.value)} className={`w-full rounded-xl border px-3 py-2 bg-white outline-none focus:ring-4 ${errors.classId ? 'border-red-400 focus:ring-red-100' : 'border-neutral-300 focus:ring-neutral-200'}`}>
                  <option value="">Seleccione una clase</option>
                  {classes.map((sesion: any) => {
                    const label = `${sesion.estilo.nombre_estilo} ${sesion.hora_inicio}–${sesion.hora_fin} ${sesion.profesor.nombre} ${sesion.profesor.apellido_paterno || ''} ${sesion.profesor.apellido_materno || ''}${sesion.cancelado ? ' (CANCELADA)' : ''}`.trim()
                    return (
                      <option key={sesion.id_sesion} value={sesion.id_sesion.toString()}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>
            {errors.classId && <p className="mt-1 text-xs text-red-600">{errors.classId}</p>}
          </div>

          <div className="md:col-span-1 md:col-start-3 md:row-span-2">
            <label className="block text-sm font-medium text-graphite">Motivo</label>
            <textarea value={form.reason} onChange={(e) => update('reason', e.target.value)} placeholder="Motivo de cancelación" className={`mt-2 h-[120px] w-full rounded-xl border px-3 py-2 outline-none resize-y focus:ring-4 ${errors.reason ? 'border-red-400 focus:ring-red-100' : 'border-neutral-300 focus:ring-neutral-200'}`} />
            <div className="mt-1 flex items-center justify-between text-[11px] text-graphite">
              <span>{form.reason.trim().length}/500</span>
              {errors.reason && <span className="text-red-600">{errors.reason}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 items-center">
          <button type="submit" disabled={sending || !isValid} className={`rounded-2xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all active:scale-[0.99] ${sending || !isValid ? 'bg-pink-300 cursor-not-allowed' : 'bg-femme-magenta hover:bg-femme-rose'}`}>
            {sending ? 'Enviando…' : 'Cancelar clase'}
          </button>

          <button type="button" onClick={resetForm} className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50">Limpiar</button>

          {selected && <div className="ml-auto text-sm text-graphite">Clase: <strong className={`text-ink ${selected.cancelado ? 'text-red-600' : ''}`}>{selectedLabel}</strong></div>}
        </div>

         
      </form>
    </div>
  )
}
