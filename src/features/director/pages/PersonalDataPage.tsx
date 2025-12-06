import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, updateProfile } from '../api/director'

export default function PersonalDataPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['director','profile'], queryFn: fetchProfile })
  const m = useMutation({ mutationFn: updateProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['director','profile'] }) })

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Datos personales</h1>
      {!data ? null : (
        <form
          onSubmit={(e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget as HTMLFormElement);
            m.mutate({ name: String(fd.get('name')), email: String(fd.get('email')), phone: String(fd.get('phone')) })
          }}
          className="space-y-3 bg-white border rounded-md p-4"
        >
          <div>
            <label className="text-sm">Nombre</label>
            <input name="name" defaultValue={data.name} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input name="email" type="email" defaultValue={data.email} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Teléfono</label>
            <input name="phone" defaultValue={data.phone} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>
          <button className="btn-primary">{m.isPending ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      )}
    </div>
  )
}
