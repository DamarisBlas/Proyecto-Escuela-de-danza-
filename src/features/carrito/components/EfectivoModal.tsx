import { Button } from '@components/ui/Button'
import { Banknote, X } from 'lucide-react'

interface EfectivoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function EfectivoModal({ isOpen, onClose, onConfirm }: EfectivoModalProps) {
  if (!isOpen) return null

  return (
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
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-4 rounded-xl border border-femme-magenta/20 bg-gradient-to-r from-femme-magenta/5 to-femme-rose/5 p-4">
            <h4 className="font-semibold text-femme-magenta mb-2">
              Recordatorio importante
            </h4>
            <p className="text-sm text-slate-700">
              Para confirmar tu inscripción, debes realizar el pago en efectivo en nuestras oficinas.
            </p>
          </div>

          <div className="text-sm text-slate-600 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✅</span>
              <p>Tu inscripción está <strong>confirmada</strong> y las clases están reservadas</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📍</span>
              <p>Dirección de nuestras oficinas: [Agregar dirección]</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">⏰</span>
              <p>Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
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
              const mensaje = encodeURIComponent('Hola, me gustaría confirmar el pago en efectivo de mi inscripción en FEMME DANCE')
              window.open(`https://wa.me/59164048095?text=${mensaje}`, '_blank')
            }}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            📱 Contactar por WhatsApp
          </Button>
          <Button
            onClick={onConfirm}
            variant="outline"
            className="w-full"
          >
            Ir a mis inscripciones
          </Button>
        </div>
      </div>
    </div>
  )
}
