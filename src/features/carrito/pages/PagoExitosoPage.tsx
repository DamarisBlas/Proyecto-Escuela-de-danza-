import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '@lib/api'
import { useCart } from '@app/store/useCart'

export default function PagoExitosoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clear } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading')
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    const clientSecret = searchParams.get('payment_intent_client_secret')

    if (!clientSecret || !paymentIntentId) {
      setStatus('error')
      return
    }

    // Verificar el estado del pago con el backend
    const verifyPayment = async () => {
      try {
        const response = await api.get(`/stripe/payment-status/${paymentIntentId}`)
        setPaymentIntent(response.data)

        if (response.data.status === 'succeeded') {
          setStatus('success')
          // Limpiar el carrito cuando el pago es exitoso
          clear()
        } else if (response.data.status === 'processing') {
          setStatus('processing')
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Error al verificar el pago:', error)
        setStatus('error')
      }
    }

    verifyPayment()
  }, [searchParams, clear])

  if (status === 'loading') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <div className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-femme-magenta border-t-transparent" />
            <h2 className="mb-2 text-xl font-semibold text-slate-900">Verificando pago...</h2>
            <p className="text-sm text-slate-600">Por favor espera un momento</p>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="mb-3 text-3xl font-bold text-slate-900">¡Pago exitoso!</h1>
            <p className="mb-6 text-slate-600">Tu pago ha sido procesado correctamente.</p>

            {paymentIntent && (
              <div className="mb-6 rounded-lg bg-slate-50 p-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Monto pagado:</span>
                    <span className="text-sm font-bold text-slate-900">
                      ${(paymentIntent.amount / 100).toFixed(2)} {paymentIntent.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">ID de transacción:</span>
                    <span className="text-xs font-mono text-slate-900">
                      {searchParams.get('payment_intent')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Fecha:</span>
                    <span className="text-sm text-slate-900">
                      {new Date(paymentIntent.created * 1000).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/cuenta/inscripciones')}
                className="w-full"
                size="lg"
              >
                Ver mis inscripciones
              </Button>
              <Button
                onClick={() => navigate('/cursos')}
                variant="outline"
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-12 w-12 text-yellow-600" />
              </div>
            </div>

            <h1 className="mb-3 text-3xl font-bold text-slate-900">Pago en proceso</h1>
            <p className="mb-6 text-slate-600">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/cuenta/inscripciones')}
                className="w-full"
                size="lg"
              >
                Ver mis inscripciones
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-slate-900">Error en el pago</h1>
          <p className="mb-6 text-slate-600">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/carrito')}
              className="w-full"
              size="lg"
            >
              Reintentar pago
            </Button>
            <Button
              onClick={() => navigate('/cursos')}
              variant="outline"
              className="w-full"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
