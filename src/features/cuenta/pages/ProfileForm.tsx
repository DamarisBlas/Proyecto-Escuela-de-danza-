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
type Common = { nombre: string; apellido: string; email: string; telefono: string; departamento: string; zona: string; cumpleanos: string }
type ProfExtras = { instagram?: string; zodiacSign?: string; motivationalPhrase?: string; description?: string; preferredStyles?: string }
type State = Common & ProfExtras

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const role = useRole()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const initialApellido = user?.name ? (user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '') : ''

  const [data, setData] = useState<State>({
    nombre: user?.name ?? '',
    apellido: initialApellido,
    email: user?.email ?? '',
    telefono: '',
    departamento: 'La Paz',
    zona: 'Centro',
    cumpleanos: '',
    instagram: role === 'PROFESOR' ? '@' : undefined,
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
      apellido: personaDetalle.apellido ?? prev.apellido,
      email: personaDetalle.email ?? prev.email,
      telefono: personaDetalle.celular ?? prev.telefono,
      motivationalPhrase: personaDetalle.datos_rol?.frase ?? prev.motivationalPhrase,
      description: personaDetalle.datos_rol?.descripcion ?? prev.description,
      preferredStyles:
        typeof personaDetalle.datos_rol?.estilos === 'string'
          ? personaDetalle.datos_rol!.estilos!
          : prev.preferredStyles,
      departamento: personaDetalle.datos_rol?.cuidad ?? prev.departamento,
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
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" value={data.apellido} onChange={on('apellido')} />
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
          <div>
            <Label htmlFor="departamento">Departamento</Label>
            <Input id="departamento" value={data.departamento} onChange={on('departamento')} />
          </div>
          <div>
            <Label htmlFor="zona">Zona</Label>
            <Input id="zona" value={data.zona} onChange={on('zona')} />
          </div>

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
