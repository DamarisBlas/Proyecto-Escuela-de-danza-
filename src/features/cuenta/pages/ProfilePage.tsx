import ProfileForm from './ProfileForm'
import { useAuth } from '@app/hooks/useAuth'
import { useRole } from '@app/hooks/useRole'
import { cn } from '@lib/utils'

function roleBadge(role: ReturnType<typeof useRole>) {
  if (role === 'DIRECTOR') return 'DIRECTOR'
  if (role === 'PROFESOR') return 'PROFESOR'
  if (role === 'FEMME') return 'ALUMNA/O FEMME'
  if (role === 'ALUMNO') return 'ALUMNA/O'
  return 'USUARIO'
}

export default function ProfilePage() {
  const { user } = useAuth()
  const role = useRole()

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Mi Cuenta</h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-femme-magenta text-lg">
            Bienvenid{user?.name?.endsWith('a') ? 'a' : 'o'} {user?.name}
          </p>
          <span className={cn('px-3 py-1 rounded-full text-sm bg-femme-magenta/10 text-femme-magenta')}>
            {roleBadge(role)}
          </span>
        </div>
      </div>

      <ProfileForm />
    </>
  )
}
