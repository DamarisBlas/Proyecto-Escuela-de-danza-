import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@components/ui/Button'
import { CreditCard } from 'lucide-react'
import { api } from '@lib/api'

interface StripeCheckoutFormProps {
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
  clientSecret: string
}

export function StripeCheckoutForm({ onSuccess, onError, clientSecret }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Extraer payment_intent_id del clientSecret
  const paymentIntentId = clientSecret.split('_secret_')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    // Llamar onSuccess con el payment_intent_id ANTES de confirmar el pago
    // Esto permite crear la inscripción antes de la redirección
    try {
      await onSuccess?.(paymentIntentId)
    } catch (err) {
      console.error('Error en onSuccess:', err)
      setMessage('Error al procesar la inscripción')
      setIsLoading(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pago-exitoso`,
      },
    })

    if (error) {
      const errorMessage = error.type === 'card_error' || error.type === 'validation_error'
        ? error.message || 'Error de validación'
        : 'Ocurrió un error inesperado.'
      
      setMessage(errorMessage)
      onError?.(errorMessage)
    } else {
      // Pago confirmado exitosamente por Stripe
      // Llamar al endpoint para confirmar el pago manualmente (desarrollo local y backup en producción)
      try {
        await api.post(`/stripe/confirm-payment/${paymentIntentId}`, {})
        console.log('✅ Pago confirmado manualmente en el backend')
      } catch (confirmError) {
        console.error('Error al confirmar pago manualmente:', confirmError)
        // No bloqueamos el flujo si falla, el webhook lo confirmará en producción
      }
    }
    // Si no hay error, Stripe redirigirá automáticamente

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <PaymentElement 
          id="payment-element"
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-femme-magenta hover:bg-femme-rose"
        size="lg"
      >
        <CreditCard className="mr-2 h-5 w-5" />
        {isLoading ? 'Procesando...' : 'Pagar ahora'}
      </Button>

      {message && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}
    </form>
  )
}
