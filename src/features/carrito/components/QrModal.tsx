import { Button } from '@components/ui/Button'
import { QrCode, X } from 'lucide-react'
import qrImage from '@assets/qr/qr.jpg'

interface QrModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function QrModal({ isOpen, onClose, onConfirm }: QrModalProps) {
  if (!isOpen) return null

  return (
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
              onClick={onClose}
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
