import { useState } from 'react'
import { useAuth } from './useAuth'
import AuthRequiredModal from '@components/ui/AuthRequiredModal'

export function useAuthGate() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const requireAuth = (onAuthed: () => void) => {
    if (user) onAuthed()
    else setShowAuthModal(true)
  }

  const modal = (
    <AuthRequiredModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
    />
  )

  return { requireAuth, modal, isAuthed: Boolean(user) }
}

