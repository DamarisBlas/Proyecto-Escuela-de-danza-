import Modal from '@components/ui/Modal'
import Button from '@components/ui/Button'
import React from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  maxAllowed?: number | null
}

export default function LimitReachedModal({ isOpen, onClose, maxAllowed }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Límite alcanzado">
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Has alcanzado el número máximo de clases permitidas para este paquete{maxAllowed ? ` (${maxAllowed}).` : '.'}
        </p>
        <p className="text-sm text-slate-600">Para cambiar una selección, deselecciona otra clase primero.</p>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  )
}
