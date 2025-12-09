import Input from '@components/ui/Input'
import Label from '@components/ui/Label'
import Button from '@components/ui/Button'
import {Card} from '@components/ui/Card'
import { useAuthStore } from '@app/store/useAuthStore'
import { useRole } from '@app/hooks/useRole'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPersonaDetalle, PersonaDetalleResponse } from '../api/personas'
import ChangePassword from './ChangePassword'

// cspell:ignore apellido
type Common = { nombre: string; apellido_paterno: string; apellido_materno: string; email: string; telefono: string; departamento: string; zona: string; cumpleanos: string }
type ProfExtras = { instagram?: string; facebook?: string; tiktok?: string; zodiacSign?: string; motivationalPhrase?: string; description?: string; preferredStyles?: string; pais_origen?: string; cuando_comenzo_danza?: string }
type State = Common & ProfExtras

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const role = useRole()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const nameParts = user?.name ? user.name.split(' ') : []
  const initialNombre = nameParts.length > 0 ? nameParts[0] : ''
  const restNameParts = nameParts.length > 1 ? nameParts.slice(1) : []
  const initialApellidoPaterno = restNameParts.length > 0 ? restNameParts[0] : ''
  const initialApellidoMaterno = restNameParts.length > 1 ? restNameParts.slice(1).join(' ') : ''

  const [data, setData] = useState<State>({
    nombre: user?.name ?? initialNombre ?? '',
    apellido_paterno: initialApellidoPaterno,
    apellido_materno: initialApellidoMaterno,
    email: user?.email ?? '',
    telefono: '',
    departamento: 'La Paz',
    pais_origen: '',
    cuando_comenzo_danza: '',
    zona: 'Centro',
    cumpleanos: '',
    instagram: role === 'PROFESOR' ? '@' : undefined,
    facebook: role === 'PROFESOR' ? '' : undefined,
    tiktok: role === 'PROFESOR' ? '' : undefined,
    zodiacSign: role === 'PROFESOR' ? '' : undefined,
    motivationalPhrase: role === 'PROFESOR' ? '' : undefined,
    description: role === 'PROFESOR' ? '' : undefined,
    preferredStyles: role === 'PROFESOR' ? '' : undefined,
  })

  const on = (k: keyof State) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(d => ({ ...d, [k]: e.target.value }))

  // Prefill with persona details from backend when available
  const personaId = user ? parseInt(user.id) : null

  const { data: personaDetalle, isLoading: loadingPersona } = useQuery<PersonaDetalleResponse>({
    queryKey: ['personaDetalle', personaId],
    queryFn: () => getPersonaDetalle(personaId!),
    enabled: !!personaId,
  })

  // When personaDetalle arrives, prefill form values
  useEffect(() => {
    if (!personaDetalle) return
    setData((prev) => ({
      ...prev,
      nombre: personaDetalle.nombre ?? prev.nombre,
      apellido_paterno: personaDetalle.apellido_paterno ?? prev.apellido_paterno,
      apellido_materno: personaDetalle.apellido_materno ?? prev.apellido_materno,
      email: personaDetalle.email ?? prev.email,
      telefono: personaDetalle.celular ?? prev.telefono,
      motivationalPhrase: personaDetalle.datos_rol?.frase ?? prev.motivationalPhrase,
      description: personaDetalle.datos_rol?.descripcion ?? prev.description,
      preferredStyles: prev.preferredStyles,
      departamento: personaDetalle.datos_rol?.pais_origen ?? prev.departamento,
      pais_origen: personaDetalle.datos_rol?.pais_origen ?? prev.pais_origen,
      cuando_comenzo_danza: personaDetalle.datos_rol?.cuando_comenzo_danza ?? prev.cuando_comenzo_danza,
      // Parse redes_sociales (supports object or JSON string)
      instagram: (() => {
        const rs: any = personaDetalle.datos_rol?.redes_sociales
        if (!rs) return prev.instagram
        try {
          if (typeof rs === 'string' && rs.trim().startsWith('{')) {
            const obj: any = JSON.parse(rs)
            return obj.instagram || obj.ig || prev.instagram
          }
          if (typeof rs === 'object') {
            const r: any = rs
            return r.instagram || r.ig || prev.instagram
          }
          return String(rs)
        } catch { return prev.instagram }
      })(),
      facebook: (() => {
        const rs: any = personaDetalle.datos_rol?.redes_sociales
        if (!rs) return prev.facebook
        try {
          if (typeof rs === 'string' && rs.trim().startsWith('{')) {
            const obj: any = JSON.parse(rs)
            return obj.facebook || obj.fb || prev.facebook
          }
          if (typeof rs === 'object') {
            const r: any = rs
            return r.facebook || r.fb || prev.facebook
          }
          return prev.facebook
        } catch { return prev.facebook }
      })(),
      tiktok: (() => {
        const rs: any = personaDetalle.datos_rol?.redes_sociales
        if (!rs) return prev.tiktok
        try {
          if (typeof rs === 'string' && rs.trim().startsWith('{')) {
            const obj: any = JSON.parse(rs)
            return obj.tiktok || prev.tiktok
          }
          if (typeof rs === 'object') {
            const r: any = rs
            return r.tiktok || prev.tiktok
          }
          return prev.tiktok
        } catch { return prev.tiktok }
      })(),
    }))
  }, [personaDetalle])

  return (
    <>
      <Card className="p-4 sm:p-6 md:p-8">
        <h2 className="text-xl font-semibold text-ink mb-6">Información Personal</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={data.nombre} onChange={on('nombre')} />
          </div>
          
          <div>
            <Label htmlFor="apellido-paterno">Apellido Paterno</Label>
            <Input id="apellido-paterno" value={data.apellido_paterno} onChange={on('apellido_paterno')} />
          </div>
          <div>
            <Label htmlFor="apellido-materno">Apellido Materno</Label>
            <Input id="apellido-materno" value={data.apellido_materno} onChange={on('apellido_materno')} />
          </div>
          <div>
            <Label htmlFor="telefono">Telefono</Label>
            <Input id="telefono" value={data.telefono} onChange={on('telefono')} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={on('email')} />
          </div>
          <div>
            <Label htmlFor="cumpleanos">Cumpleaños</Label>
            <Input id="cumpleanos" type="date" value={data.cumpleanos} onChange={on('cumpleanos')} />
          </div>
          {/* Departamento - mostrarse por defecto, reemplazado por Pais de origen para profesores */}
          {role === 'PROFESOR' ? (
            <div>
              <Label htmlFor="pais-origen">País de origen</Label>
              <Input id="pais-origen" value={data.pais_origen} onChange={on('pais_origen')} />
            </div>
          ) : (
            <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Input id="departamento" value={data.departamento} onChange={on('departamento')} />
            </div>
          )}
          {/* Zona no se muestra para DIRECTOR */}
          {role !== 'DIRECTOR' && (
            <div>
              <Label htmlFor="zona">Zona</Label>
              <Input id="zona" value={data.zona} onChange={on('zona')} />
            </div>
          )}

          {role === 'PROFESOR' && (
            <>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" placeholder="@usuario" value={data.instagram || ''} onChange={on('instagram')} />
              </div>
              <div>
                <Label htmlFor="zodiac">Signo Zodiacal</Label>
                <Input id="zodiac" placeholder="Escorpio, Leo, etc." value={data.zodiacSign || ''} onChange={on('zodiacSign')} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="frase">Frase motivacional</Label>
                <Input id="frase" value={data.motivationalPhrase || ''} onChange={on('motivationalPhrase')} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="desc">Descripcion</Label>
                <textarea id="desc" className="w-full h-28 rounded-[var(--radius)] border border-graphite/20 px-3 py-2"
                  value={data.description || ''} onChange={on('description')} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="styles">Estilos preferidos (coma separada)</Label>
                <Input id="styles" placeholder="Dancehall, Heels, Hip Hop" value={data.preferredStyles || ''} onChange={on('preferredStyles')} />
              </div>
              {/* Redes sociales adicionales */}
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="Usuario o URL" value={data.facebook || ''} onChange={on('facebook')} />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input id="tiktok" placeholder="Usuario o URL" value={data.tiktok || ''} onChange={on('tiktok')} />
              </div>
              {/* Pais de origen y cuando comenzo (fecha) para profesores */}
              <div>
                <Label htmlFor="cuando">Cuando comenzo en la danza</Label>
                <Input id="cuando" type="date" value={data.cuando_comenzo_danza || ''} onChange={on('cuando_comenzo_danza')} />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button className="bg-femme-magenta hover:bg-femme-rose text-white">Actualizar datos</Button>
          <Button 
            variant="primary" 
            className="border border-femme-magenta text-femme-magenta bg-transparent"
            onClick={() => setShowChangePassword(true)}
          >
            Cambiar contraseña
          </Button>
        </div>
      </Card>

      {/* Modal de cambio de contrase�a */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </>
  )
}
