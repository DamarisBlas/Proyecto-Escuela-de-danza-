


// src/features/auth/pages/LoginPage.tsx
import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Label from '@components/ui/Label'
import {Card} from '@components/ui/Card'

import { useAuthStore } from '@app/store/useAuthStore'
import { normalizeRole } from '@lib/constants'
import { authenticateUser, login as loginBackend, register as registerBackend } from '@/features/auth/api/auth'
import Modal from '@components/ui/Modal'

export default function LoginPage() {
  // Tab login/registro
  const [isLogin, setIsLogin] = useState(true)

  // Estado login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)

  // Estado registro (demo)
  const [name, setName] = useState('')
  const [apellido, setApellido] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [solicitudUserEspecial, setSolicitudUserEspecial] = useState(false)

  const nav = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/cuenta'

  const login = useAuthStore((s) => s.login)

  // Guarda sesión normalizando el rol y redirige según rol
  const doLogin = (payload: { id?: string | number; name: string; email: string; role: string }) => {
    const role = normalizeRole(payload.role)
    login({
      token: 'demo-token',
      user: {
        id: String(payload.id ?? crypto.randomUUID()),
        name: payload.name,
        email: payload.email,
        role,
      },
    })
    if (role === 'DIRECTOR') nav('/cuenta/admin', { replace: true })
    else if (role === 'PROFESOR') nav('/cuenta/profesor', { replace: true })
    else nav(from, { replace: true })
  }

  // Submit login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    const eSan = email.trim()
    const pSan = password.trim()

    if (!eSan || !pSan) {
      setLoginError('Ingresa email y contraseña.')
      return
    }

    setIsSubmitting(true)
    try {
      // Primero intentamos llamar al backend real
      try {
        const remoteUser = await loginBackend({ email: eSan, password: pSan })
        // El backend puede devolver role_data con estado para profesores
        // Hacemos comprobaciones a nivel runtime ya que la forma exacta viene del backend
        const ru: any = remoteUser
        const roleStr = String(ru.role || '').toLowerCase()
        if (roleStr === 'profesor' && ru?.role_data?.estado === false) {
          // Mostrar modal informativo y resetear formulario
          setShowPendingModal(true)
          return
        }
        // Si está aprobado o no es profesor, continuamos con el login
  const fullName = remoteUser.name || remoteUser.email
  doLogin({ id: (remoteUser as any)?.id, name: fullName, email: remoteUser.email, role: remoteUser.role })
        return
      } catch (err) {
        // Si falla la llamada real, intentamos el mock local para desarrollo offline
        const user = authenticateUser(eSan, pSan) // mock local
        if (!user) {
          setLoginError('Email o contraseña incorrectos.')
          return
        }
        doLogin({ name: user.name, email: user.email, role: user.role })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estado para mensaje de registro exitoso
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Submit registro - redirige a login después de crear cuenta
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !regEmail || !regPassword) return

    const payload = {
      nombre: name.trim(),
      apellido: apellido.trim() || undefined,
      email: regEmail.trim(),
      celular: phone.trim() || undefined,
      password: regPassword,
      solicitud_user_especial: solicitudUserEspecial || undefined,
    }

    setIsSubmitting(true)
    try {
      try {
        const res = await registerBackend(payload as any)
        const rawUser = res?.user ?? res

        // If the user requested a special/profesor account or the backend
        // created a profesor with estado === false, show pending modal
        const isProfesor = String(rawUser?.role || '').toLowerCase() === 'profesor'
        const isPending = isProfesor && rawUser?.role_data?.estado === false

        // Clear registration inputs
        setName('')
        setApellido('')
        setRegEmail('')
        setRegPassword('')
        setPhone('')
        setSolicitudUserEspecial(false)

        if (payload.solicitud_user_especial || isPending) {
          setShowPendingModal(true)
          return
        }

        // Registro exitoso: mostrar mensaje y cambiar al tab de login
        setShowSuccessMessage(true)
        setIsLogin(true)
        return
      } catch (err) {
        // fallback local demo
        setName('')
        setApellido('')
        setRegEmail('')
        setRegPassword('')
        setPhone('')
        setSolicitudUserEspecial(false)
        if (solicitudUserEspecial) {
          setShowPendingModal(true)
          return
        }
        // Registro exitoso (demo): mostrar mensaje y cambiar al tab de login
        setShowSuccessMessage(true)
        setIsLogin(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-graphite mb-2">Ingresar / Regístrate</h1>
          <p className="text-graphite">Autentícate por favor</p>
          <p className="text-sm text-graphite mt-2 leading-relaxed">
            Para continuar con el proceso, ingresa con tu cuenta o regístrate para crear una nueva.
          </p>
          <p className="text-femme-magenta font-medium mt-2">¡Es rápido y fácil!</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 mb-4 border-b border-graphite/10">
          <button
            onClick={() => {
              setIsLogin(true)
              setShowSuccessMessage(false)
            }}
            className={`py-2 text-center font-medium ${
              isLogin ? 'text-femme-magenta border-b-2 border-femme-magenta' : 'text-graphite'
            }`}
          >
            Acceder
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setShowSuccessMessage(false)
            }}
            className={`py-2 text-center font-medium ${
              !isLogin ? 'text-femme-magenta border-b-2 border-femme-magenta' : 'text-graphite'
            }`}
          >
            Registro
          </button>
        </div>

        {/* Card + Forms */}
        <Card className="p-4 sm:p-6 md:p-8">
          {isLogin ? (
            <form className="space-y-5" onSubmit={handleLogin} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Ingresa tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              {showSuccessMessage && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  ✅ ¡Cuenta creada exitosamente! Ahora ingresa con tu email y contraseña.
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ink hover:bg-graphite text-white mt-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Ingresando…' : 'Acceder'}
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Ingresa tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email-reg">Email</Label>
                <Input
                  id="email-reg"
                  type="email"
                  autoComplete="email"
                  placeholder="Ingresa tu email, este sera tu usuario"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password-reg">Contraseña</Label>
                <Input
                  id="password-reg"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Crea una contraseña"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="celular">Celular con WhatsApp</Label>
                <Input
                  id="celular"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Ingresa tu número de WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-graphite">Tu número es muy importante para contactarnos contigo.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="solicitud_user_especial"
                  type="checkbox"
                  checked={solicitudUserEspecial}
                  onChange={(e) => setSolicitudUserEspecial(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="solicitud_user_especial" className="text-sm text-graphite">
                  Quiero solicitar cuenta de profesor (será revisada por director)
                </label>
              </div>

              <Button type="submit" className="w-full bg-femme-magenta hover:bg-femme-rose text-white mt-2">
                Registrarme
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-femme-magenta hover:text-femme-rose text-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
      {showPendingModal && (
        <Modal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} title="Solicitud pendiente">
          <div className="space-y-3">
            <p>Tu solicitud para obtener una cuenta de profesor está pendiente de aprobación por el director. En cuanto sea aprobada recibirás una notificación y podrás iniciar sesión como profesor.</p>
            <div className="flex justify-end">
              <Button onClick={() => {
                setShowPendingModal(false)
                // reset form and stay on login
                setIsLogin(true)
                setEmail('')
                setPassword('')
                setLoginError(null)
              }} className="bg-femme-magenta text-white">OK</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
