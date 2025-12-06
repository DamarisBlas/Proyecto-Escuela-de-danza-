import React from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Plus, Trash2 } from 'lucide-react'

interface Package {
  nombre: string
  cantidad: number
  precio: number
  ilimitado?: boolean
}

interface PackageBuilderProps {
  value: Package[]
  onChange: (pkgs: Package[]) => void
}

// ================= Builder de paquetes =================
export function PackageBuilder({ value, onChange }: PackageBuilderProps) {
  const addRow = () => onChange([...value, { nombre: '', cantidad: 4, precio: 0, ilimitado: false }])
  const removeRow = (idx: number) => onChange(value.filter((_, i) => i !== idx))
  const edit = (idx: number, field: 'nombre' | 'cantidad' | 'precio', v: string) => {
    const clone = value.map((p, i) => (i === idx ? { ...p, [field]: field === 'nombre' ? v : Number(v) } : p))
    onChange(clone)
  }
  const toggleIlimitado = (idx: number) => {
    const clone = value.map((p, i) => (i === idx ? { ...p, ilimitado: !p.ilimitado } : p))
    onChange(clone)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-muted-foreground">
          <thead className="bg-muted-foreground/10 text-sm text-left">
            <tr>
              <th className="px-3 py-2 w-1/3">Nombre</th>
              <th className="px-3 py-2 w-1/6">Cantidad clases</th>
              <th className="px-3 py-2 w-1/6">Precio (Bs)</th>
              <th className="px-3 py-2 w-1/6">Ilimitado</th>
              <th className="px-3 py-2 w-1/6"></th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y">
            {value.map((row, idx) => (
              <tr key={idx} className="align-top">
                <td className="px-3 py-2">
                  <Input value={row.nombre} placeholder="A" onChange={(e) => edit(idx, 'nombre', e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <Input 
                    type="number" 
                    min={1} 
                    value={row.ilimitado ? '' : row.cantidad} 
                    onChange={(e) => edit(idx, 'cantidad', e.target.value)}
                    disabled={row.ilimitado}
                    placeholder={row.ilimitado ? '∞' : ''}
                    className={row.ilimitado ? 'bg-gray-100 cursor-not-allowed' : ''}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input type="number" min={0} value={row.precio} onChange={(e) => edit(idx, 'precio', e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center h-full">
                    <Checkbox 
                      checked={row.ilimitado || false}
                      onChange={() => toggleIlimitado(idx)}
                      className="size-5 accent-femme-magenta cursor-pointer"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeRow(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" className="gap-2" onClick={addRow}>
        <Plus className="w-4 h-4" /> Agregar paquete
      </Button>
    </div>
  )
}