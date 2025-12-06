import React from 'react'
import { X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

interface ConfirmAutoMarkingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  primeraFecha: string
  totalSesiones: number
  paquete: {
    nombre: string
    cantidad_clases: number
    ilimitado: boolean
  }
}

export default function ConfirmAutoMarkingModal({
  isOpen,
  onClose,
  onConfirm,
  primeraFecha,
  totalSesiones,
  paquete
}: ConfirmAutoMarkingModalProps) {
  if (!isOpen) return null

  // Formatear la fecha de manera legible
  const formatearFecha = (fecha: string) => {
    // Parsear la fecha en formato YYYY-MM-DD sin conversión de timezone
    const [year, month, day] = fecha.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month - 1 porque los meses van de 0-11
    
    const opciones: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('es-ES', opciones)
  }

  // Calcular cuántas clases faltan si el paquete tiene límite
  const clasesRestantes = !paquete.ilimitado && paquete.cantidad_clases > totalSesiones
    ? paquete.cantidad_clases - totalSesiones
    : 0

  const esPaqueteCompleto = paquete.ilimitado || totalSesiones >= paquete.cantidad_clases

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative mx-4 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        {/* Header con gradiente Femme */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-femme-magenta via-femme-rose to-femme-coral px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute -right-2 -top-2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold text-white">
                ✓ Clases Seleccionadas
              </h2>
              <p className="mt-1 text-sm text-white/90">
                Confirma tu selección automática
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información de la primera clase */}
          <div className="rounded-xl border-2 border-femme-magenta/20 bg-gradient-to-br from-femme-magenta/5 to-femme-rose/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-femme-magenta/10 p-2">
                <Calendar className="h-5 w-5 text-femme-magenta" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                  Tu primera clase es el:
                </h3>
                <p className="text-lg font-bold text-femme-magenta">
                  {formatearFecha(primeraFecha)}
                </p>
              </div>
            </div>
          </div>

          {/* Información del paquete */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Resumen de tu selección:
            </h3>
            
            <div className="space-y-3">
              {/* Paquete seleccionado */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Paquete:</span>
                <span className="text-sm font-bold text-slate-800">{paquete.nombre}</span>
              </div>

              {/* Clases del paquete */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Clases del paquete:</span>
                <span className="text-sm font-bold text-slate-800">
                  {paquete.ilimitado ? 'Ilimitadas' : `${paquete.cantidad_clases} clases`}
                </span>
              </div>

              {/* Sesiones seleccionadas automáticamente */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Seleccionadas automáticamente:</span>
                <span className="text-sm font-bold text-femme-magenta">
                  {totalSesiones} {totalSesiones === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              {/* Divisor */}
              {!paquete.ilimitado && (
                <div className="border-t border-slate-300 pt-3">
                  {esPaqueteCompleto ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-semibold">
                        ¡Paquete completo! Todas las clases están cubiertas
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">
                          Debes seleccionar {clasesRestantes} {clasesRestantes === 1 ? 'clase más' : 'clases más'} manualmente
                        </p>
                        <p className="text-xs text-amber-600/80 mt-1">
                          Para completar las {paquete.cantidad_clases} clases de tu paquete
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-femme-magenta to-femme-rose px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-femme-magenta/90 hover:to-femme-rose/90"
            >
              Ir a la agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
