import Modal from '@components/ui/Modal'
import Button from '@components/ui/Button'
import type { Promotion } from '../../../types'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  promo: Promotion | null
  onEnroll: (p: Promotion) => void
  isFull?: boolean
}

export default function PromotionDetailModal({ isOpen, onClose, promo, onEnroll, isFull = false }: Props) {
  const [imageError, setImageError] = useState(false)
  
  if (!promo) return null
  const isExpired = promo.expiresAt ? (new Date(promo.expiresAt) < new Date()) : false
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle promoción">
      <div className="p-1 sm:p-2">
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-1">{promo.title}</h2>
        <div className="flex items-center justify-between text-sm text-graphite mb-3">
          <span>La Paz</span>
          <span className="font-medium text-femme-magenta">{promo.validUntil}</span>
        </div>

        {promo.image && !imageError ? (
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full aspect-[16/9] object-cover rounded-lg border"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-femme-magenta/10 via-femme-rose/10 to-femme-coral/10 rounded-lg border flex items-center justify-center">
            <div className="text-center text-graphite">
              <svg className="mx-auto h-16 w-16 mb-2 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeWidth="2"/>
                <circle cx="9" cy="9" r="2" strokeWidth="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" strokeWidth="2"/>
              </svg>
              <p className="text-sm">Imagen no disponible</p>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">Descripción</h3>
            <p className="text-graphite leading-relaxed">{promo.description}</p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">Condiciones</h3>
            <p className="text-graphite leading-relaxed">{promo.conditions}</p>
          </div>
        </div>
        {isFull && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-sm">
            ⚠️ La promoción ha alcanzado su cupo de beneficiarios y no acepta más inscripciones.
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" className="flex-1 border-graphite text-ink hover:bg-graphite hover:text-white" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            className={`flex-1 bg-femme-magenta hover:bg-femme-rose text-white ${isExpired || isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isExpired && !isFull && onEnroll(promo)}
            disabled={isExpired || isFull}
            title={isFull ? 'Promoción llena' : (isExpired ? 'Promoción vencida' : 'Inscríbete ahora')}
          >
            {isFull ? 'Lleno' : (isExpired ? 'Promoción vencida' : 'Inscríbete Ahora')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
