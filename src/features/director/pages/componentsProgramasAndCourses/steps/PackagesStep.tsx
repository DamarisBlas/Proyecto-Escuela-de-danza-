import React from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PackageBuilder } from '../ui/PackageBuilder'

interface Package {
  nombre: string
  cantidad: number
  precio: number
}

interface PackagesStepProps {
  form: any
  setField: (k: string, v: any) => void
  goNext: () => void
  goPrev: () => void
  canContinueFrom: (step: number) => boolean
}

export function PackagesStep({
  form,
  setField,
  goNext,
  goPrev,
  canContinueFrom,
}: PackagesStepProps) {
  return (
    <Card>
      <div className="p-3 border-b">
        <h3 className="font-semibold">Paquetes</h3>
        <p className="text-sm text-muted-foreground">Opciones de pago por cantidad de clases.</p>
      </div>
      <CardContent className="space-y-4">
        <PackageBuilder 
          value={form.paquetes} 
          onChange={(pkgs: Package[]) => setField('paquetes', pkgs)} 
        />
        {form.paquetes.length === 0 && (
          <p className="text-sm text-muted-foreground">Agrega al menos un paquete.</p>
        )}
      </CardContent>
      <div className="p-3 flex justify-between">
        <Button variant="outline" onClick={goPrev}>Volver</Button>
        <Button onClick={goNext} disabled={!canContinueFrom(2)}>Continuar</Button>
      </div>
    </Card>
  )
}