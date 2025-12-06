import { PropsWithChildren } from 'react'
import {Button} from './Button'

type ModalProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  title?: string
}>

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-femme w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
export { Modal }
