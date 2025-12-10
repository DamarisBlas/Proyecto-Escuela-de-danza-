import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Calendar } from 'lucide-react'

interface InstallmentOptionsProps {
  total: number
  paymentMode: 'single' | 'installments'
  installments: number
  installmentsArray: Array<{ number: number; amount: string }>
  onPaymentModeChange: (mode: 'single' | 'installments') => void
  onInstallmentsChange: (count: number) => void
  onInstallmentAmountChange: (index: number, amount: string) => void
}

export function InstallmentOptions({
  total,
  paymentMode,
  installments,
  installmentsArray,
  onPaymentModeChange,
  onInstallmentsChange,
  onInstallmentAmountChange,
}: InstallmentOptionsProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Opciones de pago</h2>

        {/* Selector de modo de pago */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => onPaymentModeChange('single')}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              paymentMode === 'single'
                ? 'border-femme-magenta bg-femme-magenta/5'
                : 'border-slate-200 hover:border-femme-magenta/50 hover:bg-slate-50'
            }`}
          >
            <div className="text-sm font-semibold text-slate-900">Pago único</div>
            <div className="mt-1 text-xs text-slate-600">Paga todo ahora</div>
          </button>

          <button
            onClick={() => onPaymentModeChange('installments')}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              paymentMode === 'installments'
                ? 'border-femme-magenta bg-femme-magenta/5'
                : 'border-slate-200 hover:border-femme-magenta/50 hover:bg-slate-50'
            }`}
          >
            <div className="text-sm font-semibold text-slate-900">A cuotas</div>
            <div className="mt-1 text-xs text-slate-600">Divide el pago</div>
          </button>
        </div>

        {/* Configuración de cuotas */}
        {paymentMode === 'installments' && (
          <div className="space-y-4">
            {/* Selector de número de cuotas */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Número de cuotas
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => onInstallmentsChange(num)}
                    className={`rounded-lg border-2 py-3 text-center font-semibold transition-all ${
                      installments === num
                        ? 'border-femme-magenta bg-femme-magenta text-white'
                        : 'border-slate-200 text-slate-700 hover:border-femme-magenta/50 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Montos de cada cuota */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900">
                Distribución de cuotas
              </label>
              <div className="space-y-3">
                {installmentsArray.map((installment, index) => (
                  <div
                    key={installment.number}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-femme-magenta/10">
                      <Calendar className="h-5 w-5 text-femme-magenta" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-900">
                        Cuota {installment.number}
                      </label>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={total}
                        value={installment.amount}
                        onChange={(e) => onInstallmentAmountChange(index, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de cuotas */}
              <div className="mt-4 rounded-lg border-2 border-femme-magenta/20 bg-femme-magenta/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Total distribuido:</span>
                  <span className="font-bold text-femme-magenta">
                    Bs.{' '}
                    {installmentsArray
                      .reduce((sum, inst) => sum + parseFloat(inst.amount || '0'), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Total a pagar:</span>
                  <span className="font-bold text-slate-900">Bs. {total.toFixed(2)}</span>
                </div>
                {Math.abs(
                  installmentsArray.reduce((sum, inst) => sum + parseFloat(inst.amount || '0'), 0) -
                    total
                ) > 0.01 && (
                  <div className="mt-2 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800">
                    ⚠️ La suma de las cuotas debe ser igual al total
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen del pago único */}
        {paymentMode === 'single' && (
          <div className="rounded-lg border-2 border-femme-magenta/20 bg-femme-magenta/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">Pagarás ahora:</span>
              <span className="text-2xl font-bold text-femme-magenta">Bs. {total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
