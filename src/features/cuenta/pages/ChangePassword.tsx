import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@lib/api'
import { useAuthStore } from '@app/store/useAuthStore'
import { X, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { Spinner } from '@components/ui/Spinner'

interface ChangePasswordProps {
  onClose: () => void
}

interface ChangePasswordData {
  id_persona: number
  old_password: string
  new_password: string
}

interface ChangePasswordResponse {
  message: string
  user: {
    email: string
    id: number
    nombre: string
  }
}

async function changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
  const response = await api.put('/auth/change-password', data)
  return response.data
}

export default function ChangePassword({ onClose }: ChangePasswordProps) {
  const { user } = useAuthStore()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      setSuccessMessage(data.message)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose()
      }, 2000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      return
    }

    // Validaciones
    if (newPassword.length < 6) {
      return
    }

    if (newPassword !== confirmPassword) {
      return
    }

    mutation.mutate({
      id_persona: parseInt(user.id),
      old_password: oldPassword,
      new_password: newPassword,
    })
  }

  const passwordsMatch = newPassword === confirmPassword
  const isFormValid =
    oldPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    newPassword.length >= 6 &&
    passwordsMatch

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative mx-4 w-full max-w-md rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-femme-magenta via-femme-rose to-femme-coral px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

          <div className="relative">
            <button
              onClick={onClose}
              className="absolute -right-2 -top-2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Cambiar Contraseña</h2>
                <p className="text-sm text-white/90">Actualiza tu contraseña de acceso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-green-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {mutation.isError && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error al cambiar la contraseña</p>
                <p className="text-xs text-red-600">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : 'La contraseña actual es incorrecta o hubo un error en el servidor'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4" />
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-12 text-sm transition-all focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                  placeholder="Ingresa tu contraseña actual"
                  required
                  disabled={mutation.isPending || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4" />
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-12 text-sm transition-all focus:border-femme-magenta focus:outline-none focus:ring-2 focus:ring-femme-magenta/20"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={mutation.isPending || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && newPassword.length < 6 && (
                <p className="mt-1 text-xs text-amber-600">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4" />
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 text-sm transition-all focus:outline-none focus:ring-2 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : confirmPassword && passwordsMatch
                      ? 'border-green-300 focus:border-green-400 focus:ring-green-200'
                      : 'border-slate-200 focus:border-femme-magenta focus:ring-femme-magenta/20'
                  }`}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  disabled={mutation.isPending || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} />
                  Las contraseñas no coinciden
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 size={12} />
                  Las contraseñas coinciden
                </p>
              )}
            </div>

          

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                disabled={mutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid || mutation.isPending || !!successMessage}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
                  isFormValid && !mutation.isPending && !successMessage
                    ? 'bg-gradient-to-r from-femme-magenta to-femme-rose hover:shadow-lg'
                    : 'cursor-not-allowed bg-slate-300'
                }`}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Cambiando...
                  </span>
                ) : successMessage ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} />
                    Completado
                  </span>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
