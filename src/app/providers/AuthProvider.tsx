import { PropsWithChildren, useEffect, useState } from 'react'
import { api } from '@lib/api'
import { useAuthStore } from '@app/store/useAuthStore'
import { Spinner } from '@components/ui/Spinner'

export function AuthProvider({ children }: PropsWithChildren) {
  const token = useAuthStore(s => s.token)
  const setUser = useAuthStore(s => s.setUser)
  const [hydrated, setHydrated] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // wait for zustand rehydration
    setHydrated(true)
  }, [])

  useEffect(() => {
    const check = async () => {
      if (!token) return
      try {
        setChecking(true)
  const { data } = await api.get('/auth/me')
  setUser?.(data)
      } catch {
        // handled by interceptor
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [token, setUser])

  if (!hydrated || checking) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <Spinner label="Cargando sesión..." />
      </div>
    )
  }

  return <>{children}</>
}
