import { X, Lock } from 'lucide-react'

interface ClassLimitModalProps {
  isOpen: boolean
  onClose: () => void
  maxClasses: number
}

export default function ClassLimitModal({
  isOpen,
  onClose,
  maxClasses
}: ClassLimitModalProps) {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Límite alcanzado
              </h3>
              <p className="text-sm text-slate-500">
                Ya seleccionaste todas las clases del paquete
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
            {/* Info card */}
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-3xl font-bold text-purple-600">{maxClasses}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Clases máximas del paquete
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ya seleccionaste las {maxClasses} {maxClasses === 1 ? 'clase' : 'clases'}
              </p>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
              <p className="text-sm text-purple-900 font-medium text-center">
                Para cambiar una clase, primero deselecciona otra
              </p>
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
