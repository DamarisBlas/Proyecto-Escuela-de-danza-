import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { StripeCheckoutForm } from './StripeCheckoutForm'
import { Card } from '@components/ui/Card'
import { CreditCard, QrCode } from 'lucide-react'
import { env } from '@config/env'
import { api } from '@lib/api'

const stripePromise = loadStripe(env.STRIPE_PUBLIC_KEY)

interface StripePaymentWrapperProps {
  amount: number // en bolivianos
  paymentMethodType: 'card' | 'cashapp'
  inscripcionId?: number
  metodoPagoId: number
  numeroCuota?: number
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export function StripePaymentWrapper({
  amount,
  paymentMethodType,
  inscripcionId,
  metodoPagoId,
  numeroCuota = 1,
  onSuccess,
  onError,
}: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Convertir bolivianos a dólares (aproximadamente 1 USD = 6.96 BOB)
    const amountInUSD = Math.round((amount / 6.96) * 100) // Convertir a centavos

    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/stripe/create-payment-intent', {
          amount: amountInUSD,
          currency: 'usd',
          payment_method_type: paymentMethodType,
          inscripcion_id: inscripcionId,
          metodo_pago_id: metodoPagoId,
          numero_cuota: numeroCuota,
        })

        if (response.data.error) {
          setError(response.data.error)
        } else {
          setClientSecret(response.data.clientSecret)
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Error al conectar con el servidor de pagos'
        setError(errorMsg)
        onError?.(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, paymentMethodType, inscripcionId, metodoPagoId, numeroCuota, onError])

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#C2185B', // femme-magenta
      colorBackground: '#ffffff',
      colorText: '#1e293b',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center p-12">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-femme-magenta border-t-transparent" />
          <p className="text-sm text-slate-600">Preparando formulario de pago...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-900">Error al cargar el pago</h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-femme-magenta/10">
            {paymentMethodType === 'card' ? (
              <CreditCard className="h-6 w-6 text-femme-magenta" />
            ) : (
              <QrCode className="h-6 w-6 text-femme-magenta" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {paymentMethodType === 'card' ? 'Pago con tarjeta' : 'Pago con QR'}
            </h2>
            <p className="text-sm text-slate-600">
              Monto: Bs. {amount.toFixed(2)} (~${(amount / 6.96).toFixed(2)} USD)
            </p>
          </div>
        </div>

        {clientSecret && (
          <Elements stripe={stripePromise} options={options}>
            <StripeCheckoutForm onSuccess={onSuccess} onError={onError} clientSecret={clientSecret} />
          </Elements>
        )}
      </div>
    </Card>
  )
}
