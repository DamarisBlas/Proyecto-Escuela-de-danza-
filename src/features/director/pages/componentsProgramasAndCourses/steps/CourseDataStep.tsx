import React, { useMemo } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Programa, Categoria, Subcategoria, Ciclo } from '../ui/ManageListDialog'

interface Teacher {
  id: string
  name: string
  nationality: string
  styles: string[]
  instagram: string
}

interface CourseDataStepProps {
  form: any
  setField: (k: string, v: any) => void
  errors: Record<string, string>
  ciclos: Ciclo[]
  createCiclo: (ciclo: Omit<Ciclo, 'id'>) => void
  programas: Programa[]
  createPrograma: (programa: Omit<Programa, 'id'>) => void
  categorias: Categoria[]
  createCategoria: (categoria: Omit<Categoria, 'id'>) => void
  subcategorias: Subcategoria[]
  createSubcategoria: (subcategoria: Omit<Subcategoria, 'id'>) => void
  proyectos: any[]
  niveles: any[]
  teacherQuery: string
  setTeacherQuery: (query: string) => void
  selectedTeacher: any | null
  setSelectedTeacher: (teacher: any | null) => void
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  newTeacher: any
  setNewTeacher: (teacher: any) => void
  goNext: () => void
}

export function CourseDataStep({
  form,
  setField,
  errors,
  ciclos,
  createCiclo,
  programas,
  createPrograma,
  categorias,
  createCategoria,
  subcategorias,
  createSubcategoria,
  proyectos,
  niveles,
  teacherQuery,
  setTeacherQuery,
  selectedTeacher,
  setSelectedTeacher,
  showSuggestions,
  setShowSuggestions,
  newTeacher,
  setNewTeacher,
  goNext
}: CourseDataStepProps) {
  const [cicloError, setCicloError] = React.useState('')
  const [programaError, setProgramaError] = React.useState('')
  const [categoriaError, setCategoriaError] = React.useState('')
  const [subcategoriaError, setSubcategoriaError] = React.useState('')
  const [nombreError, setNombreError] = React.useState('')
  const [fechaInicioError, setFechaInicioError] = React.useState('')
  const [fechaFinError, setFechaFinError] = React.useState('')

  const programasFiltered = useMemo(() => {
    return programas.filter(p => p.esActivo)
  }, [programas])

  const categoriasFiltered = useMemo(() => {
    if (!form.programa) return []
    return categorias.filter(c => c.idPrograma === form.programa)
  }, [categorias, form.programa])

  const subcategoriasFiltered = useMemo(() => {
    if (!form.categoria) return []
    return subcategorias.filter(s => s.idCategoria === form.categoria)
  }, [subcategorias, form.categoria])

  const validate = () => {
    let valid = true
    setCicloError('')
    setProgramaError('')
    setCategoriaError('')
    setSubcategoriaError('')
    setNombreError('')
    setFechaInicioError('')
    setFechaFinError('')

    if (!form.ciclo) {
      setCicloError('El ciclo es obligatorio.')
      valid = false
    }
    if (!form.programa) {
      setProgramaError('El programa es obligatorio.')
      valid = false
    }
    if (!form.categoria) {
      setCategoriaError('La categoría es obligatoria.')
      valid = false
    }
    if (!form.subcategoria) {
      setSubcategoriaError('La subcategoría es obligatoria.')
      valid = false
    }
    if (!form.nombre || form.nombre.trim().length === 0) {
      setNombreError('El nombre del curso es obligatorio.')
      valid = false
    }
    if (!form.fechaInicio) {
      setFechaInicioError('La fecha de inicio es obligatoria.')
      valid = false
    }
    if (!form.fechaFin) {
      setFechaFinError('La fecha de fin es obligatoria.')
      valid = false
    }
    if (form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin) {
      setFechaFinError('La fecha de fin debe ser posterior a la fecha de inicio.')
      valid = false
    }

    return valid
  }

  return (
    <Card>
      <div className="p-3 border-b">
        <h3 className="font-semibold">Datos</h3>
        <p className="text-sm text-muted-foreground">Completa los datos básicos del curso.</p>
      </div>
      <CardContent className="space-y-4 p-4">
        {/* Ciclo */}
        <div className="grid gap-2">
          <Label>Ciclo</Label>
          <Select value={form.ciclo} onChange={(e: any) => setField('ciclo', e.target.value)}>
            <option value="">Seleccionar ciclo</option>
            {ciclos.map((c) => (
              <option key={c.id} value={c.nombre}>{c.nombre}</option>
            ))}
          </Select>
          {cicloError && <p className="text-sm text-destructive">{cicloError}</p>}
        </div>

        {/* Programa */}
        <div className="grid gap-2">
          <Label>Programa</Label>
          <Select value={form.programa} onChange={(e: any) => setField('programa', e.target.value)}>
            <option value="">Seleccionar programa</option>
            {programasFiltered.map((programa) => (
              <option key={programa.id} value={programa.id}>{programa.nombre}</option>
            ))}
          </Select>
          {programaError && <p className="text-sm text-destructive">{programaError}</p>}
        </div>

        {/* Categoría */}
        <div className="grid gap-2">
          <Label>Categoría</Label>
          <Select value={form.categoria} onChange={(e: any) => setField('categoria', e.target.value)}>
            <option value="">Seleccionar categoría</option>
            {categoriasFiltered.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </Select>
          {!form.programa && <p className="text-sm text-muted-foreground">Selecciona un programa primero</p>}
          {categoriaError && <p className="text-sm text-destructive">{categoriaError}</p>}
        </div>

        {/* Subcategoría */}
        <div className="grid gap-2">
          <Label>Subcategoría</Label>
          <Select value={form.subcategoria} onChange={(e: any) => setField('subcategoria', e.target.value)}>
            <option value="">Seleccionar subcategoría</option>
            {subcategoriasFiltered.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>{subcategoria.nombre}</option>
            ))}
          </Select>
          {!form.categoria && <p className="text-sm text-muted-foreground">Selecciona una categoría primero</p>}
          {subcategoriaError && <p className="text-sm text-destructive">{subcategoriaError}</p>}
        </div>

        {/* Nombre del curso */}
        <div className="grid gap-2">
          <Label>Nombre del curso</Label>
          <Input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} placeholder="Curso regular 1 -2025" />
          {nombreError && <p className="text-sm text-destructive">{nombreError}</p>}
        </div>

        {/* Fecha inicio */}
        <div className="grid gap-2">
          <Label>Fecha inicio</Label>
          <Input 
            type="date" 
            value={form.fechaInicio || ''} 
            onChange={(e) => setField('fechaInicio', e.target.value)} 
          />
          {fechaInicioError && <p className="text-sm text-destructive">{fechaInicioError}</p>}
        </div>

        {/* Fecha fin */}
        <div className="grid gap-2">
          <Label>Fecha fin</Label>
          <Input 
            type="date" 
            value={form.fechaFin || ''} 
            onChange={(e) => setField('fechaFin', e.target.value)} 
          />
          {fechaFinError && <p className="text-sm text-destructive">{fechaFinError}</p>}
        </div>

        {/* Público */}
        <div className="grid gap-2">
          <Label>Público</Label>
          <Select value={form.publico || 'todos'} onChange={(e: any) => setField('publico', e.target.value)}>
            <option value="todos">Todos</option>
            <option value="elenco">Elenco</option>
            <option value="alumnos_femme">Alumnos Femme</option>
            <option value="alumnos">Alumnos</option>
          </Select>
        </div>

         {/* Cantidad de cursos */}
        <div className="grid gap-2">
          <Label>Cantidad de cursos</Label>
          <Input 
            type="number" 
            min="1" 
            max="20"
            value={form.cantidadCursos || 1} 
            onChange={(e) => setField('cantidadCursos', parseInt(e.target.value) || 1)} 
            placeholder="Número de cursos"
          />
        </div>

    

        {/* Checkbox: ¿Se repite semanalmente? */}
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={form.seRepiteSemanalmente || false} 
            onChange={(e: any) => setField('seRepiteSemanalmente', e.target.checked)} 
          />
          <Label className="text-sm font-medium">¿El curso se va a repetir semanalmente?</Label>
        </div>

        {/* Descripción */}
        <div className="grid gap-2">
          <Label>Descripción (opcional)</Label>
          <Textarea
            rows={4}
            placeholder="Resumen del curso, requisitos, materiales…"
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
          />
        </div>

       

        {/* Grupo de WhatsApp */}
        <div className="grid gap-2">
          <Label>Tiene un grupo de WhatsApp (Opcional)</Label>
          <Input 
            type="text" 
            value={form.grupoWhatsapp || ''} 
            onChange={(e) => setField('grupoWhatsapp', e.target.value)} 
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>
      </CardContent>
      <div className="p-3 flex justify-between">
        <Button variant="outline" disabled>Anterior</Button>
        <Button onClick={() => { if (validate()) goNext() }} >Continuar</Button>
      </div>
    </Card>
  )
}