import Modal from '@components/ui/Modal'
import Button from '@components/ui/Button'
import { X } from 'lucide-react'
import React from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  minDate: string
  maxDate: string
  diffDays: number
}

export default function RangeWarningModal({ isOpen, onClose, minDate, maxDate, diffDays }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rango de fechas excedido">
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Esta selección excede el rango permitido de <strong>30 días</strong> entre la primera y la última clase.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-xs text-slate-500">Primera clase</div>
          <div className="sm:col-span-2 font-medium text-slate-800">{minDate}</div>

          <div className="text-xs text-slate-500">Última clase</div>
          <div className="sm:col-span-2 font-medium text-slate-800">{maxDate}</div>

          <div className="text-xs text-slate-500">Rango total</div>
          <div className="sm:col-span-2 font-medium text-slate-800">{diffDays} días</div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </Modal>
  )
}
