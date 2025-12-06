import {Modal} from '@components/ui/Modal'
import {Button} from '@components/ui/Button'
import type { Promotion } from '../../../types'

type Props = {
  open: boolean
  onClose: () => void
  promo: Promotion | null
  onEnroll: (p: Promotion) => void
}

export default function PromotionDetailModal({ open, onClose, promo, onEnroll }: Props) {
  if (!promo) return null
  const isExpired = (promo as any).expiresAt ? (new Date((promo as any).expiresAt) < new Date()) : false
  return (
    <Modal isOpen={open} onClose={onClose} title="Detalle promoción">
      <div className="p-1 sm:p-2">
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-1">{promo.title}</h2>
        <div className="flex items-center justify-between text-sm text-graphite mb-3">
          <span>La Paz</span>
          <span className="font-medium text-femme-magenta">{promo.validUntil}</span>
        </div>

        <img
          src={promo.image || '/placeholder.svg'}
          alt={promo.title}
          className="w-full aspect-[16/9] object-cover rounded-lg border"
        />

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

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" className="flex-1 border-graphite text-ink hover:bg-graphite hover:text-white" onClick={onClose}>
            Cerrar
          </Button>
          <Button className={`flex-1 bg-femme-magenta hover:bg-femme-rose text-white ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !isExpired && onEnroll(promo)} disabled={isExpired} title={isExpired ? 'Promoción vencida' : 'Inscríbete ahora'}>
            {isExpired ? 'Promoción vencida' : 'Inscríbete Ahora'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
