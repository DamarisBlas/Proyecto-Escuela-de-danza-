import Button from '@components/ui/Button'
import { Image as ImageIcon } from 'lucide-react'
import type { Promotion } from '../../types'

type Props = {
  promo: Promotion
  onView: (p: Promotion) => void
  onEnroll: (p: Promotion) => void
  isFull?: boolean
  inscritosCount?: number
}

export default function PromotionCard({ promo, onView, onEnroll, isFull = false, inscritosCount = 0 }: Props) {
  const isExpired = promo.expiresAt ? (new Date(promo.expiresAt) < new Date()) : false
  
  // Calcular cupos disponibles
  const totalCupos = promo.cantidadBeneficiarios || 0
  const cuposDisponibles = totalCupos > 0 ? Math.max(0, totalCupos - inscritosCount) : 0
  const tieneLimiteCupos = totalCupos > 0
  const porcentajeOcupado = totalCupos > 0 ? (inscritosCount / totalCupos) * 100 : 0
  
  // Estados de disponibilidad
  const cuposAgotados = tieneLimiteCupos && cuposDisponibles === 0
  const pocosChips = tieneLimiteCupos && cuposDisponibles > 0 && cuposDisponibles <= 3
  const mediaOcupacion = tieneLimiteCupos && porcentajeOcupado >= 50 && !pocosChips
  return (
    <div className="bg-white border-2 border-graphite rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {promo.image ? (
            <img 
              src={promo.image} 
              alt={promo.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<svg class="text-graphite h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
              }}
            />
          ) : (
            <ImageIcon className="text-graphite h-5 w-5" />
          )}
        </div>
        <div className="truncate">
          <h3 className="font-semibold text-ink text-lg truncate">{promo.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-graphite">{promo.validUntil}</p>
            {isExpired && (
              <span className="text-xs inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">Vencida</span>
            )}
            {/* Badge de cupos */}
            {tieneLimiteCupos && (
              <span className={`text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                cuposAgotados 
                  ? 'bg-femme-coral/10 text-femme-coral border border-femme-coral' 
                  : pocosChips 
                  ? 'bg-femme-amber/10 text-femme-orange border border-femme-orange' 
                  : 'bg-femme-softyellow/30 text-femme-magenta border border-femme-magenta'
              }`}>
                {cuposAgotados ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Cupos agotados
                  </>
                ) : pocosChips ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ¡Solo {cuposDisponibles} cupo{cuposDisponibles !== 1 ? 's' : ''}!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {cuposDisponibles}/{totalCupos} disponibles
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(promo)}
          className="border-femme-magenta text-femme-magenta hover:bg-femme-magenta hover:text-white"
        >
          Ver detalle
        </Button>
        <Button
          size="sm"
          className={`bg-femme-magenta hover:bg-femme-rose text-white ${isExpired || cuposAgotados ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !isExpired && !cuposAgotados && onEnroll(promo)}
          disabled={isExpired || cuposAgotados}
          title={cuposAgotados ? 'Cupos agotados' : (isExpired ? 'Promoción vencida' : 'Inscríbete ahora')}
        >
          {cuposAgotados ? 'Agotado' : (isExpired ? 'Vencida' : 'Inscríbete')}
        </Button>
      </div>
    </div>
  )
}
