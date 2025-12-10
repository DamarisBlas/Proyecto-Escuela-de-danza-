import { Card } from '@components/ui/Card'
import { Banknote, QrCode, CreditCard } from 'lucide-react'
import { StripePaymentWrapper } from './StripePaymentWrapper'

interface MetodoPago {
  id_metodo_pago: number
  nombre_metodo: string
  descripcion: string
  estado: boolean
}

interface PaymentMethodSelectorProps {
  metodosPago: MetodoPago[]
  loadingMetodos: boolean
  selectedMethod: 'efectivo' | 'qr' | 'tarjeta' | null
  onSelectMethod: (method: 'efectivo' | 'qr' | 'tarjeta') => void
  // Props para Stripe
  showStripeForm?: boolean
  totalAmount?: number
  inscripcionId?: number
  metodoPagoId?: number
  numeroCuota?: number
  onStripeSuccess?: () => void
  onStripeError?: (error: string) => void
}

export function PaymentMethodSelector({
  metodosPago,
  loadingMetodos,
  selectedMethod,
  onSelectMethod,
  showStripeForm = false,
  totalAmount = 0,
  inscripcionId,
  metodoPagoId,
  numeroCuota = 1,
  onStripeSuccess,
  onStripeError,
}: PaymentMethodSelectorProps) {
  const metodosDisponibles = metodosPago.filter(m => m.estado)

  const getIcon = (nombreMetodo: string) => {
    if (nombreMetodo.toLowerCase().includes('efectivo')) {
      return <Banknote className="h-6 w-6" />
    }
    if (nombreMetodo.toLowerCase().includes('qr')) {
      return <QrCode className="h-6 w-6" />
    }
    if (nombreMetodo.toLowerCase().includes('tarjeta')) {
      return <CreditCard className="h-6 w-6" />
    }
    return <Banknote className="h-6 w-6" />
  }

  const getMethodKey = (nombreMetodo: string): 'efectivo' | 'qr' | 'tarjeta' => {
    if (nombreMetodo.toLowerCase().includes('efectivo')) return 'efectivo'
    if (nombreMetodo.toLowerCase().includes('qr')) return 'qr'
    return 'tarjeta'
  }

  if (loadingMetodos) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Método de pago</h2>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-femme-magenta border-t-transparent" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Método de pago</h2>
          <div className="space-y-3">
            {metodosDisponibles.map((metodo) => {
              const methodKey = getMethodKey(metodo.nombre_metodo)
              const isSelected = selectedMethod === methodKey

              return (
                <button
                  key={metodo.id_metodo_pago}
                  onClick={() => onSelectMethod(methodKey)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-femme-magenta bg-femme-magenta/5'
                      : 'border-slate-200 hover:border-femme-magenta/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-femme-magenta text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getIcon(metodo.nombre_metodo)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{metodo.nombre_metodo}</h3>
                      <p className="text-sm text-slate-600">{metodo.descripcion}</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        isSelected
                          ? 'border-femme-magenta bg-femme-magenta'
                          : 'border-slate-300'
                      } flex items-center justify-center`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Mostrar formulario de Stripe si se seleccionó tarjeta o QR */}
      {showStripeForm && (selectedMethod === 'tarjeta' || selectedMethod === 'qr') && totalAmount > 0 && metodoPagoId && (
        <div className="mt-6">
          <StripePaymentWrapper
            amount={totalAmount}
            paymentMethodType={selectedMethod === 'tarjeta' ? 'card' : 'cashapp'}
            inscripcionId={inscripcionId}
            metodoPagoId={metodoPagoId}
            numeroCuota={numeroCuota}
            onSuccess={onStripeSuccess}
            onError={onStripeError}
          />
        </div>
      )}
    </>
  )
}
