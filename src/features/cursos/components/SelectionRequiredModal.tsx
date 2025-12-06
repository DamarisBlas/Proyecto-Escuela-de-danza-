import Modal from '@components/ui/Modal'
import Button from '@components/ui/Button'
import React from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  required?: number | null
}

export default function SelectionRequiredModal({ isOpen, onClose, required }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selección incompleta">
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          {required ? (
            <>Debes seleccionar exactamente <strong>{required}</strong> clases para este paquete.</>
          ) : (
            <>Debes seleccionar al menos una clase para poder continuar.</>
          )}
        </p>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button onClick={onClose}>Ir a seleccionar</Button>
        </div>
      </div>
    </Modal>
  )
}
