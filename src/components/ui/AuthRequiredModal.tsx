import Modal from '@components/ui/Modal'
import {Button} from '@components/ui/Button'
import { LogIn } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  ctaLabel?: string
  redirectTo?: string // default: /login
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Autentícate por favor',
  message = 'Para continuar con el proceso ingresa con tu cuenta o regístrate. ¡Es rápido y fácil!',
  ctaLabel = 'Ingresar / Registrarte',
  redirectTo = '/login'
}: Props) {
  const nav = useNavigate()
  const loc = useLocation()

  const goLogin = () => {
    onClose()
    nav(redirectTo, { state: { from: loc } })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-femme-softyellow flex items-center justify-center shrink-0">
          <LogIn className="text-femme-magenta" />
        </div>
        <div className="space-y-3">
          <p className="text-graphite">{message}</p>
          <div className="flex justify-end">
            <Button className="bg-femme-magenta hover:bg-femme-rose text-white" onClick={goLogin}>
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
