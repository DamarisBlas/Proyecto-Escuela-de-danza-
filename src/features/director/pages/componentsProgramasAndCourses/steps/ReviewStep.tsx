import React from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { KeyValue } from '../ui/KeyValue'
import { DAY_OPTS } from '../utils/helpers'
import { Programa, Categoria, Subcategoria, Sala, Estilo } from '../ui/ManageListDialog'

interface Teacher {
  id: string
  name: string
  nationality: string
  styles?: string[]
  instagram: string
}

interface HorarioData {
  id: string
  dias: string[]
  horaInicio: string
  horaFin: string
  flexible: boolean
  overrides: Record<string, { start?: string; end?: string }>
  estilo: string
  nivel: string
  sala: string
  publico: string
  cupos: number
  profesor: Teacher | null
}

interface ReviewStepProps {
  form: any
  errors: Record<string, string>
  sessions: Array<{ day: string; start: string; end: string }>
  selectedTeacher: Teacher | null
  teacherQuery: string
  publicar: () => void
  programas: Programa[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  horarios?: HorarioData[]
  estilos?: Estilo[]
  salas?: Sala[]
}

export function ReviewStep({
  form,
  errors,
  sessions,
  selectedTeacher,
  teacherQuery,
  publicar,
  programas,
  categorias,
  subcategorias,
  horarios,
  estilos = [],
  salas = []
}: ReviewStepProps) {
  // Funciones helper para obtener nombres a partir de IDs
  const getProgramaNombre = (id: string) => programas.find(p => p.id === id)?.nombre || '—'
  const getCategoriaNombre = (id: string) => categorias.find(c => c.id === id)?.nombre || '—'
  const getSubcategoriaNombre = (id: string) => subcategorias.find(s => s.id === id)?.nombre || '—'
  
  const getSesionesForHorario = (horario: HorarioData) => {
    return horario.dias.map((dayKey) => {
      const o = horario.overrides[dayKey] || {}
      return {
        day: dayKey,
        start: o.start || horario.horaInicio,
        end: o.end || horario.horaFin,
      }
    })
  }

  const getPublicoLabel = (publico: string) => {
    const map: Record<string, string> = {
      'todos': 'Todos',
      'elenco': 'Elenco',
      'alumnos_femme': 'Alumnos Femme',
      'alumnos': 'Alumnos',
    }
    return map[publico] || publico
  }
  return (
    <Card>
      <div className="p-3 border-b">
        <h3 className="font-semibold">Revisión</h3>
        <p className="text-sm text-muted-foreground">Verifica la información antes de publicar.</p>
      </div>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <KeyValue k="Programa" v={getProgramaNombre(form.programa)} />
          <KeyValue k="Ciclo" v={form.ciclo} />
          <KeyValue k="Categoría" v={getCategoriaNombre(form.categoria)} />
          <KeyValue k="Subcategoría" v={getSubcategoriaNombre(form.subcategoria)} />
            <KeyValue k="Nombre" v={form.nombre} />
          
          <KeyValue k="Fecha inicio" v={form.fechaInicio || '—'} />
          <KeyValue k="Fecha fin" v={form.fechaFin || '—'} />
            <KeyValue k="Cantidad de cursos" v={String(form.cantidadCursos || 1)} />
          <KeyValue k="Público" v={getPublicoLabel(form.publico || 'todos')} />
          {form.seRepiteSemanalmente && (
            <KeyValue k="Se repite semanalmente" v="Sí" />
          )}
        </div>

        {/* Mostrar horarios múltiples o sistema antiguo */}
        {horarios && horarios.length > 0 ? (
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Horarios del curso</h4>
            {horarios.map((horario, index) => {
              const sesiones = getSesionesForHorario(horario)
              
              // Buscar nombres de estilo y sala por ID
              const estiloNombre = estilos.find(e => String(e.id) === String(horario.estilo))?.nombre || horario.estilo
              const salaNombre = salas.find(s => String(s.id) === String(horario.sala))?.nombre || horario.sala
              
              return (
                <div key={horario.id} className="border rounded-lg p-4 bg-gray-50 space-y-4">
                  <h5 className="font-medium text-md border-b pb-2">
                    {horarios.length > 1 ? `Horario ${index + 1}` : 'Horario del curso'}
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <KeyValue k="Estilo" v={estiloNombre || '—'} />
                    <KeyValue k="Nivel" v={horario.nivel} />
                    <KeyValue k="Sala" v={salaNombre || '—'} />
                    <KeyValue k="Cupos" v={String(horario.cupos)} />
                    <KeyValue k="Profesor" v={horario.profesor?.name || '—'} />
                    {horario.profesor && (
                      <>
                        <KeyValue k="Nacionalidad" v={horario.profesor.nationality} />
                        <KeyValue k="Instagram" v={horario.profesor.instagram || '—'} />
                      </>
                    )}
                  </div>

                  <div>
                    <h6 className="font-medium text-sm mb-2">Sesiones</h6>
                    <div className="overflow-x-auto rounded-md border bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="bg-zinc-50">
                          <tr>
                            <th className="p-3 text-left">Día</th>
                            <th className="p-3 text-left">Inicio</th>
                            <th className="p-3 text-left">Fin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sesiones.map((s, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-3">{DAY_OPTS.find(d => d.key === s.day)?.label}</td>
                              <td className="p-3">{s.start}</td>
                              <td className="p-3">{s.end}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <>
            {/* Sistema antiguo - horario único */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KeyValue k="Nivel" v={form.nivel} />
              <KeyValue k="Cupos" v={String(form.cupos)} />
              <KeyValue k="Profesor" v={selectedTeacher?.name || teacherQuery || '—'} />
              <KeyValue k="Días" v={form.dias.map((d: string) => DAY_OPTS.find(x => x.key === d)?.short).join(' · ') || '—'} />
              <KeyValue k="Horario base" v={`${form.horaInicio} – ${form.horaFin}`} />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Sesiones</h4>
              <div className="overflow-x-auto rounded-md border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-3 text-left">Día</th>
                      <th className="p-3 text-left">Inicio</th>
                      <th className="p-3 text-left">Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{DAY_OPTS.find(d => d.key === s.day)?.label}</td>
                        <td className="p-3">{s.start}</td>
                        <td className="p-3">{s.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div>
          <h4 className="font-semibold mb-2">Paquetes</h4>
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Cantidad</th>
                  <th className="p-3 text-left">Precio (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {form.paquetes.map((p: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{p.nombre}</td>
                    <td className="p-3">
                      {p.ilimitado ? (
                        <span className="font-semibold text-graphite">∞ Ilimitado</span>
                      ) : (
                        p.cantidad
                      )}
                    </td>
                    <td className="p-3">{p.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm space-y-2">
            <div className="font-semibold">Campos pendientes por completar:</div>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <div className="p-3 flex gap-2">
        
        <Button disabled={Object.keys(errors).length > 0} onClick={publicar}>
          Publicar curso
        </Button>
      </div>
    </Card>
  )
}