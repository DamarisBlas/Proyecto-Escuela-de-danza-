import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { ShoppingCart, Trash2 } from 'lucide-react'
import type { CartItem } from '@app/store/useCart'

interface EnrollmentSummaryProps {
  items: CartItem[]
  total: number
  sessionDetailsMap: Record<number, { profesorNombre?: string }>
  onRemoveItem: (paqueteId: number) => void
  onClear: () => void
}

export function EnrollmentSummary({
  items,
  total,
  sessionDetailsMap,
  onRemoveItem,
  onClear,
}: EnrollmentSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-white p-12 text-center shadow-lg">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-femme-magenta/10">
          <ShoppingCart className="h-12 w-12 text-femme-magenta" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="mb-8 max-w-md text-slate-600">
          Explora nuestros cursos y paquetes de clases para comenzar tu camino en la danza
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del carrito */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-femme-magenta/10">
            <ShoppingCart className="h-6 w-6 text-femme-magenta" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Carrito</h1>
            <p className="text-sm text-slate-600">{items.length} paquete(s) en tu carrito</p>
          </div>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={onClear} className="text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Vaciar carrito
          </Button>
        )}
      </div>

      {/* Items del carrito */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.paqueteId} className="overflow-hidden">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    {item.detailsAutomaticas && (
                      <p className="text-sm text-slate-600">Automático</p>
                    )}
                    {item.detailsManuales && (
                      <p className="text-sm text-slate-600">Manual</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => item.paqueteId && onRemoveItem(item.paqueteId)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mostrar clases seleccionadas */}
                {item.clasesSeleccionadas && item.clasesSeleccionadas.length > 0 && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Clases seleccionadas ({item.clasesSeleccionadas.length})
                    </p>
                    <div className="space-y-1">
                      {item.clasesSeleccionadas.map((sessionId) => {
                        const details = sessionDetailsMap[sessionId]
                        return (
                          <div key={sessionId} className="text-xs text-slate-700">
                            • Sesión #{sessionId}
                            {details?.profesorNombre && ` - Prof. ${details.profesorNombre}`}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                <div className="text-right">
                  <p className="text-2xl font-bold text-femme-magenta">Bs. {item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Total */}
      <Card className="bg-gradient-to-r from-femme-magenta to-femme-rose">
        <div className="flex items-center justify-between p-6">
          <div className="text-white">
            <p className="text-sm font-medium opacity-90">Total a pagar</p>
            <p className="text-3xl font-bold">Bs. {total.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
