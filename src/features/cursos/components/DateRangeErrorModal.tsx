import { X, AlertTriangle } from 'lucide-react'

interface DateRangeErrorModalProps {
  isOpen: boolean
  onClose: () => void
  minDate: string
  maxDate: string
  attemptedDate: string
  totalDays: number
}

export default function DateRangeErrorModal({
  isOpen,
  onClose,
  minDate,
  maxDate,
  attemptedDate,
  totalDays
}: DateRangeErrorModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Rango de 30 días excedido
              </h3>
              <p className="text-sm text-slate-500">
                Esta clase está fuera del período permitido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-4">
            {/* Info cards */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Si agregas esta clase
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Primera clase:</span>
                  <span className="font-semibold text-slate-900">{minDate}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Última clase:</span>
                  <span className="font-semibold text-slate-900">{maxDate}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm text-slate-600">Rango total:</span>
                  <span className="font-bold text-amber-600 text-lg">{totalDays} días</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-sm font-bold text-amber-700">!</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-amber-900 font-medium">
                    El paquete permite un máximo de <span className="font-bold">30 días</span> entre la primera y última clase.
                  </p>
                  <p className="text-xs text-amber-700 mt-2">
                    Deselecciona alguna clase para ajustar el rango de fechas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gradient-to-r from-femme-magenta to-femme-rose px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
