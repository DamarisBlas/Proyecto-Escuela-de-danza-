import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Modal from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { FilePlus2, Settings2, Trash2 } from 'lucide-react'

// ================= Tipos para la estructura jerárquica =================
export interface Programa {
  id: string
  nombre: string
  descripcion: string
  esActivo: boolean
}

export interface Ciclo {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
}

export interface Categoria {
  id: string
  idPrograma: string
  nombre: string
  descripcion: string
}

export interface Subcategoria {
  id: string
  idCategoria: string
  nombre: string
  descripcion: string
}

export interface Sala {
  id: string
  nombre: string
  ubicacion: string
  linkUbicacion: string
  departamento: string
  zona: string
}

export interface Estilo {
  id: string
  nombre: string
  descripcion: string
  beneficios: string
}

// ================= Diálogos rápidos: crear & gestionar =================

interface QuickCreateDialogProps {
  label: 'Ciclo' | 'Programa' | 'Categoría' | 'Subcategoría' | 'Estilo' | 'Sala'
  onCreate: (value: any) => void
  programas?: Programa[]
  categorias?: Categoria[]
  selectedPrograma?: string
  selectedCategoria?: string
}

export function QuickCreateDialog({ 
  label, 
  onCreate, 
  programas = [], 
  categorias = [], 
  selectedPrograma = '', 
  selectedCategoria = '' 
}: QuickCreateDialogProps) {
  const [name, setName] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [esActivo, setEsActivo] = useState(true)
  const [programaId, setProgramaId] = useState(selectedPrograma)
  const [categoriaId, setCategoriaId] = useState(selectedCategoria)
  const [open, setOpen] = useState(false)

  // Estados adicionales para Estilo
  const [beneficios, setBeneficios] = useState('')

  // Estados adicionales para Sala
  const [ubicacion, setUbicacion] = useState('')
  const [linkUbicacion, setLinkUbicacion] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [zona, setZona] = useState('')

  // Mensajes de error por campo
  const [nameError, setNameError] = useState('')
  const [startError, setStartError] = useState('')
  const [endError, setEndError] = useState('')
  const [programaError, setProgramaError] = useState('')
  const [categoriaError, setCategoriaError] = useState('')

  // Función para limpiar todos los campos y errores
  const clearForm = () => {
    setName('')
    setDescripcion('')
    setStart('')
    setEnd('')
    setEsActivo(true)
    setProgramaId(selectedPrograma)
    setCategoriaId(selectedCategoria)
    setBeneficios('')
    setUbicacion('')
    setLinkUbicacion('')
    setDepartamento('')
    setZona('')
    setNameError('')
    setStartError('')
    setEndError('')
    setProgramaError('')
    setCategoriaError('')
  }

  const handleClose = () => {
    clearForm()
    setOpen(false)
  }

  const canSave = () => {
    let valid = true
    setNameError('')
    setStartError('')
    setEndError('')
    setProgramaError('')
    setCategoriaError('')
    if (!name.trim()) {
      setNameError('El nombre es obligatorio.')
      valid = false
    }
    if (label === 'Ciclo') {
      if (!start) {
        setStartError('La fecha de inicio es obligatoria.')
        valid = false
      }
      if (!end) {
        setEndError('La fecha de fin es obligatoria.')
        valid = false
      }
    }
    if (label === 'Categoría' && !programaId) {
      setProgramaError('Selecciona el programa al que pertenece.')
      valid = false
    }
    if (label === 'Subcategoría' && !categoriaId) {
      setCategoriaError('Selecciona la categoría a la que pertenece.')
      valid = false
    }
    return valid
  }

  const handleCreate = () => {
    if (!canSave()) return
    let payload: any = { nombre: name }
    if (label === 'Ciclo') {
      payload = { 
        id: `CICLO_${Date.now()}`,
        nombre: name, 
        fechaInicio: start, 
        fechaFin: end 
      }
    } else if (label === 'Programa') {
      payload = { 
        id: `PROG_${Date.now()}`,
        nombre: name, 
        descripcion: descripcion, 
        esActivo: esActivo 
      }
    } else if (label === 'Categoría') {
      payload = { 
        id: `CAT_${Date.now()}`,
        idPrograma: programaId,
        nombre: name, 
        descripcion: descripcion 
      }
    } else if (label === 'Subcategoría') {
      payload = { 
        id: `SUBCAT_${Date.now()}`,
        idCategoria: categoriaId,
        nombre: name, 
        descripcion: descripcion 
      }
    } else if (label === 'Estilo') {
      payload = { 
        nombre: name, 
        descripcion: descripcion,
        beneficios: beneficios 
      }
    } else if (label === 'Sala') {
      payload = { 
        nombre: name, 
        ubicacion: ubicacion,
        linkUbicacion: linkUbicacion,
        departamento: departamento,
        zona: zona
      }
    }
    onCreate(payload)
    setOpen(false)
    clearForm()
  }

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <FilePlus2 className="w-4 h-4"/>
        Nuevo {label}
      </Button>
      <Modal isOpen={open} onClose={handleClose} title={`Crear ${label}`}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input 
              value={name} 
              onChange={(e: any) => setName(e.target.value)} 
              placeholder={`Nombre del ${label.toLowerCase()}`} 
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>

          {label === 'Ciclo' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha inicio</Label>
                <Input 
                  type="date" 
                  value={start} 
                  onChange={(e: any) => setStart(e.target.value)} 
                />
                {startError && <p className="text-sm text-destructive">{startError}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Fecha fin</Label>
                <Input 
                  type="date" 
                  value={end} 
                  onChange={(e: any) => setEnd(e.target.value)} 
                />
                {endError && <p className="text-sm text-destructive">{endError}</p>}
              </div>
            </div>
          )}

          {(label === 'Programa' || label === 'Categoría' || label === 'Subcategoría' || label === 'Estilo') && (
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea 
                value={descripcion} 
                onChange={(e: any) => setDescripcion(e.target.value)} 
                placeholder={`Descripción del ${label.toLowerCase()}`}
                rows={3}
              />
            </div>
          )}

          {label === 'Estilo' && (
            <div className="grid gap-2">
              <Label>Beneficios</Label>
              <Textarea 
                value={beneficios} 
                onChange={(e: any) => setBeneficios(e.target.value)} 
                placeholder="Beneficios del estilo (separados por comas)"
                rows={3}
              />
            </div>
          )}

          {label === 'Sala' && (
            <>
              <div className="grid gap-2">
                <Label>Ubicación</Label>
                <Input 
                  value={ubicacion} 
                  onChange={(e: any) => setUbicacion(e.target.value)} 
                  placeholder="Dirección de la sala" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Link de Ubicación</Label>
                <Input 
                  value={linkUbicacion} 
                  onChange={(e: any) => setLinkUbicacion(e.target.value)} 
                  placeholder="URL de Google Maps u otro" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Departamento</Label>
                  <Input 
                    value={departamento} 
                    onChange={(e: any) => setDepartamento(e.target.value)} 
                    placeholder="Ej: La Paz" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Zona</Label>
                  <Input 
                    value={zona} 
                    onChange={(e: any) => setZona(e.target.value)} 
                    placeholder="Ej: Zona Sur" 
                  />
                </div>
              </div>
            </>
          )}

          {label === 'Programa' && (
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={esActivo} 
                onChange={(e: any) => setEsActivo(e.target.checked)} 
              />
              <span className="text-sm">Activo</span>
            </div>
          )}

          {label === 'Categoría' && (
            <div className="grid gap-2">
              <Label>Programa</Label>
              <Select value={programaId} onChange={(e: any) => setProgramaId(e.target.value)}>
                <option value="">Seleccionar programa</option>
                {programas.map((programa) => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </Select>
              {programaError && <p className="text-sm text-destructive">{programaError}</p>}
            </div>
          )}

          {label === 'Subcategoría' && (
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select value={categoriaId} onChange={(e: any) => setCategoriaId(e.target.value)}>
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => {
                  const programaNombre = programas?.find(p => p.id === categoria.idPrograma)?.nombre || 'Programa desconocido'
                  return (
                    <option key={categoria.id} value={categoria.id}>
                      {programaNombre} - {categoria.nombre}
                    </option>
                  )
                })}
              </Select>
              {categoriaError && <p className="text-sm text-destructive">{categoriaError}</p>}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button disabled={!canSave} onClick={handleCreate}>Guardar</Button>
        </div>
      </Modal>
    </>
  )
}

interface ManageListDialogProps {
  label: 'Ciclo' | 'Programa' | 'Categoría' | 'Subcategoría'
  items: any[]
  onChange: (next: any[]) => void
  programas?: Programa[]
  categorias?: Categoria[]
}

export function ManageListDialog({ label, items, onChange, programas = [], categorias = [] }: ManageListDialogProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<any[]>(items)
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})

  const handleOpen = () => {
    setOpen(true)
    setRows(items)
    setValidationErrors({})
  }

  const validateRows = () => {
    const errors: Record<number, string> = {}
    
    rows.forEach((item, index) => {
      if (typeof item === 'string') {
        // Para ciclos (strings)
        if (!item.trim()) {
          errors[index] = 'El nombre del ciclo es obligatorio'
        }
      } else {
        // Para objetos
        if (label === 'Programa') {
          if (!item.nombre || !item.nombre.trim()) {
            errors[index] = 'El nombre del programa es obligatorio'
          }
        } else if (label === 'Categoría') {
          if (!item.nombre || !item.nombre.trim()) {
            errors[index] = 'El nombre de la categoría es obligatorio'
          }
          if (!item.idPrograma) {
            errors[index] = 'Debe seleccionar un programa'
          }
        } else if (label === 'Subcategoría') {
          if (!item.nombre || !item.nombre.trim()) {
            errors[index] = 'El nombre de la subcategoría es obligatorio'
          }
          if (!item.idCategoria) {
            errors[index] = 'Debe seleccionar una categoría'
          }
        } else if (label === 'Ciclo') {
          if (!item.nombre || !item.nombre.trim()) {
            errors[index] = 'El nombre del ciclo es obligatorio'
          }
          if (!item.fechaInicio) {
            errors[index] = 'La fecha de inicio es obligatoria'
          }
          if (!item.fechaFin) {
            errors[index] = 'La fecha de fin es obligatoria'
          }
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateRows()) {
      return // No guardar si hay errores de validación
    }
    
    const filteredRows = rows.filter(item => {
      if (typeof item === 'string') return item.trim().length > 0
      return item.nombre && item.nombre.trim().length > 0
    })
    onChange(filteredRows)
    setOpen(false)
  }

  const clearForm = () => {
    setRows(items)
  }

  const handleClose = () => {
    clearForm()
    setOpen(false)
  }

  const updateRow = (index: number, field: string, value: any) => {
    const copy = [...rows]
    if (typeof copy[index] === 'string' && field === 'nombre') {
      copy[index] = value
    } else {
      copy[index] = { ...copy[index], [field]: value }
    }
    setRows(copy)
    
    // Limpiar error de validación para esta fila cuando se actualiza
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors }
      delete newErrors[index]
      setValidationErrors(newErrors)
    }
  }

  const removeRow = (index: number) => {
    setRows(rows.filter((_, idx) => idx !== index))
  }

  const addRow = () => {
    if (label === 'Ciclo') {
      setRows([...rows, { 
        id: `CICLO_${Date.now()}`, 
        nombre: '', 
        fechaInicio: '', 
        fechaFin: '' 
      }])
    } else if (label === 'Programa') {
      setRows([...rows, { 
        id: `PROG_${Date.now()}`, 
        nombre: '', 
        descripcion: '', 
        esActivo: true 
      }])
    } else if (label === 'Categoría') {
      setRows([...rows, { 
        id: `CAT_${Date.now()}`, 
        idPrograma: '', 
        nombre: '', 
        descripcion: '' 
      }])
    } else if (label === 'Subcategoría') {
      setRows([...rows, { 
        id: `SUBCAT_${Date.now()}`, 
        idCategoria: '', 
        nombre: '', 
        descripcion: '' 
      }])
    }
  }

  const renderTable = () => {
    if (label === 'Ciclo') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((item, index) => (
                <tr key={index} className={validationErrors[index] ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        value={typeof item === 'string' ? item : item.nombre || ''}
                        onChange={(e) => updateRow(index, 'nombre', e.target.value)}
                        placeholder="Nombre del ciclo"
                        className={validationErrors[index] && (!item.nombre || !item.nombre.trim()) ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('nombre') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        type="date"
                        value={typeof item === 'object' ? item.fechaInicio || '' : ''}
                        onChange={(e) => updateRow(index, 'fechaInicio', e.target.value)}
                        className={validationErrors[index] && validationErrors[index].includes('inicio') ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('inicio') && (
                        <p className="text-xs text-red-600">Fecha de inicio obligatoria</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        type="date"
                        value={typeof item === 'object' ? item.fechaFin || '' : ''}
                        onChange={(e) => updateRow(index, 'fechaFin', e.target.value)}
                        className={validationErrors[index] && validationErrors[index].includes('fin') ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('fin') && (
                        <p className="text-xs text-red-600">Fecha de fin obligatoria</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (label === 'Programa') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((item, index) => (
                <tr key={index} className={validationErrors[index] ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        value={typeof item === 'string' ? item : item.nombre || ''}
                        onChange={(e) => updateRow(index, 'nombre', e.target.value)}
                        placeholder="Nombre del programa"
                        className={validationErrors[index] && (!item.nombre || !item.nombre.trim()) ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('nombre') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={typeof item === 'object' ? item.descripcion || '' : ''}
                      onChange={(e) => updateRow(index, 'descripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={typeof item === 'object' ? item.esActivo !== false : true}
                      onChange={(e: any) => updateRow(index, 'esActivo', e.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (label === 'Categoría') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((item, index) => (
                <tr key={index} className={validationErrors[index] ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        value={typeof item === 'string' ? item : item.nombre || ''}
                        onChange={(e) => updateRow(index, 'nombre', e.target.value)}
                        placeholder="Nombre de la categoría"
                        className={validationErrors[index] && (!item.nombre || !item.nombre.trim()) ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('nombre') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Select
                        value={typeof item === 'object' ? item.idPrograma || '' : ''}
                        onChange={(e: any) => updateRow(index, 'idPrograma', e.target.value)}
                        className={validationErrors[index] && !item.idPrograma ? 'border-red-500' : ''}
                      >
                        <option value="">Seleccionar programa</option>
                        {programas.map((programa) => (
                          <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                        ))}
                      </Select>
                      {validationErrors[index] && validationErrors[index].includes('programa') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={typeof item === 'object' ? item.descripcion || '' : ''}
                      onChange={(e) => updateRow(index, 'descripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (label === 'Subcategoría') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((item, index) => (
                <tr key={index} className={validationErrors[index] ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Input
                        value={typeof item === 'string' ? item : item.nombre || ''}
                        onChange={(e) => updateRow(index, 'nombre', e.target.value)}
                        placeholder="Nombre de la subcategoría"
                        className={validationErrors[index] && (!item.nombre || !item.nombre.trim()) ? 'border-red-500' : ''}
                      />
                      {validationErrors[index] && validationErrors[index].includes('nombre') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <Select
                        value={typeof item === 'object' ? item.idCategoria || '' : ''}
                        onChange={(e: any) => updateRow(index, 'idCategoria', e.target.value)}
                        className={validationErrors[index] && !item.idCategoria ? 'border-red-500' : ''}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((categoria) => {
                          const programaNombre = programas?.find(p => p.id === categoria.idPrograma)?.nombre || 'Programa desconocido'
                          return (
                            <option key={categoria.id} value={categoria.id}>
                              {programaNombre} - {categoria.nombre}
                            </option>
                          )
                        })}
                      </Select>
                      {validationErrors[index] && validationErrors[index].includes('categoría') && (
                        <p className="text-xs text-red-600">{validationErrors[index]}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={typeof item === 'object' ? item.descripcion || '' : ''}
                      onChange={(e) => updateRow(index, 'descripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={handleOpen}>
        <Settings2 className="w-4 h-4"/>
        Gestionar {label}s
      </Button>
      <Modal isOpen={open} onClose={handleClose} title={`Gestionar ${label}s`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {label === 'Ciclo' && 'Gestiona los ciclos académicos'}
              {label === 'Programa' && 'Gestiona los programas educativos'}
              {label === 'Categoría' && 'Gestiona las categorías por programa'}
              {label === 'Subcategoría' && 'Gestiona las subcategorías por categoría'}
            </p>
           
          </div>
          
          <div className="max-h-[400px] overflow-auto border rounded-md">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No hay {label.toLowerCase()}s configurados</p>
                <p className="text-xs mt-1">Haz clic en "Agregar {label}" para comenzar</p>
              </div>
            ) : (
              renderTable()
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </Modal>
    </>
  )
}