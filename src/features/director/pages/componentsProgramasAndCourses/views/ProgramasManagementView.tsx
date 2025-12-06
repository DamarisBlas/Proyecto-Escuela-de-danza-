import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Programa, Categoria, Subcategoria, QuickCreateDialog, Ciclo, Sala, Estilo } from '../ui/ManageListDialog'
import { Edit2, Trash2 } from 'lucide-react'

interface ProgramasManagementViewProps {
  ciclos: Ciclo[]
  createCiclo: (ciclo: Omit<Ciclo, 'id'>) => void
  updateCiclo: (id: number, ciclo: Omit<Ciclo, 'id'>) => void
  deleteCiclo: (id: number) => void
  programas: Programa[]
  createPrograma: (programa: Omit<Programa, 'id'>) => void
  updatePrograma: (id: number, programa: Omit<Programa, 'id'>) => void
  deletePrograma: (id: number) => void
  categorias: Categoria[]
  createCategoria: (categoria: Omit<Categoria, 'id'>) => void
  updateCategoria: (id: number, categoria: Omit<Categoria, 'id'>) => void
  deleteCategoria: (id: number) => void
  subcategorias: Subcategoria[]
  createSubcategoria: (subcategoria: Omit<Subcategoria, 'id'>) => void
  updateSubcategoria: (id: number, subcategoria: Omit<Subcategoria, 'id'>) => void
  deleteSubcategoria: (id: number) => void
  salas: Sala[]
  createSala: (sala: Omit<Sala, 'id'>) => void
  updateSala: (id: number, sala: Omit<Sala, 'id'>) => void
  deleteSala: (id: number) => void
  estilos: Estilo[]
  createEstilo: (estilo: Omit<Estilo, 'id'>) => void
  updateEstilo: (id: number, estilo: Omit<Estilo, 'id'>) => void
  deleteEstilo: (id: number) => void
}

// Componente para tabla de Ciclos
function CiclosTable({ ciclos, setCiclos }: { ciclos: Ciclo[], setCiclos: (ciclos: Ciclo[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Ciclo | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (ciclo: Ciclo) => {
    setEditingId(ciclo.id)
    setEditForm({ ...ciclo })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre del ciclo es obligatorio')
        return
      }
      if (!editForm.fechaInicio) {
        setValidationError('La fecha de inicio es obligatoria')
        return
      }
      if (!editForm.fechaFin) {
        setValidationError('La fecha de fin es obligatoria')
        return
      }
      setCiclos(ciclos.map(c => c.id === editForm.id ? editForm : c))
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const deleteCiclo = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ciclo?')) {
      setCiclos(ciclos.filter(c => c.id !== id))
    }
  }

  const updateEditForm = (field: keyof Ciclo, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Ciclos</h3>
        <QuickCreateDialog 
          label="Ciclo" 
          onCreate={(value) => setCiclos([...ciclos, value])}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ciclos.map((ciclo) => (
              <tr key={ciclo.id}>
                <td className="px-4 py-3">
                  {editingId === ciclo.id ? (
                    <Input
                      value={editForm?.nombre || ''}
                      onChange={(e) => updateEditForm('nombre', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span>{ciclo.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ciclo.id ? (
                    <Input
                      type="date"
                      value={editForm?.fechaInicio || ''}
                      onChange={(e) => updateEditForm('fechaInicio', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-sm">{ciclo.fechaInicio}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ciclo.id ? (
                    <Input
                      type="date"
                      value={editForm?.fechaFin || ''}
                      onChange={(e) => updateEditForm('fechaFin', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-sm">{ciclo.fechaFin}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ciclo.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Guardar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                      {validationError && (
                        <p className="text-sm text-red-600">{validationError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(ciclo)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCiclo(ciclo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Programas
function ProgramasTable({ programas, setProgramas }: { programas: Programa[], setProgramas: (programas: Programa[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Programa | null>(null)

  const startEdit = (programa: Programa) => {
    setEditingId(programa.id)
    setEditForm({ ...programa })
  }

  const saveEdit = () => {
    if (editForm && editForm.nombre.trim()) {
      setProgramas(programas.map(p => p.id === editForm.id ? editForm : p))
    }
    setEditingId(null)
    setEditForm(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const deletePrograma = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este programa?')) {
      setProgramas(programas.filter(p => p.id !== id))
    }
  }

  const updateEditForm = (field: keyof Programa, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Programas</h3>
        <QuickCreateDialog 
          label="Programa" 
          onCreate={(value) => setProgramas([...programas, value])}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programas.map((programa) => (
              <tr key={programa.id}>
                <td className="px-4 py-3">
                  {editingId === programa.id ? (
                    <Input
                      value={editForm?.nombre || ''}
                      onChange={(e) => updateEditForm('nombre', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span>{programa.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === programa.id ? (
                    <Textarea
                      value={editForm?.descripcion || ''}
                      onChange={(e) => updateEditForm('descripcion', e.target.value)}
                      className="w-full"
                      rows={2}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{programa.descripcion}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === programa.id ? (
                    <Checkbox
                      checked={editForm?.esActivo || false}
                      onChange={(e) => updateEditForm('esActivo', e.target.checked)}
                    />
                  ) : (
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      programa.esActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {programa.esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === programa.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        Guardar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(programa)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePrograma(programa.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Categorías
function CategoriasTable({ 
  categorias, 
  setCategorias, 
  programas 
}: { 
  categorias: Categoria[], 
  setCategorias: (categorias: Categoria[]) => void,
  programas: Programa[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Categoria | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (categoria: Categoria) => {
    setEditingId(categoria.id)
    setEditForm({ ...categoria })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm && editForm.nombre.trim() && editForm.idPrograma) {
      setCategorias(categorias.map(c => c.id === editForm.id ? editForm : c))
      setEditingId(null)
      setEditForm(null)
    } else {
      if (!editForm?.idPrograma) {
        setValidationError('Debe seleccionar un programa')
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const deleteCategoria = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      setCategorias(categorias.filter(c => c.id !== id))
    }
  }

  const updateEditForm = (field: keyof Categoria, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const getProgramaNombre = (idPrograma: string) => {
    return programas.find(p => p.id === idPrograma)?.nombre || 'Sin programa'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categorías</h3>
        <QuickCreateDialog 
          label="Categoría" 
          onCreate={(value) => setCategorias([...categorias, value])}
          programas={programas}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="px-4 py-3">
                  {editingId === categoria.id ? (
                    <Select
                      value={editForm?.idPrograma || ''}
                      onChange={(e) => updateEditForm('idPrograma', e.target.value)}
                    >
                      <option value="">Seleccionar programa</option>
                      {programas.map(programa => (
                        <option key={programa.id} value={programa.id}>
                          {programa.nombre}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <span className="text-sm">{getProgramaNombre(categoria.idPrograma)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === categoria.id ? (
                    <Input
                      value={editForm?.nombre || ''}
                      onChange={(e) => updateEditForm('nombre', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span>{categoria.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === categoria.id ? (
                    <Textarea
                      value={editForm?.descripcion || ''}
                      onChange={(e) => updateEditForm('descripcion', e.target.value)}
                      className="w-full"
                      rows={2}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{categoria.descripcion}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === categoria.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Guardar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                      {validationError && (
                        <p className="text-sm text-red-600">{validationError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(categoria)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoria(categoria.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Subcategorías
function SubcategoriasTable({ 
  subcategorias, 
  setSubcategorias, 
  categorias,
  programas
}: { 
  subcategorias: Subcategoria[], 
  setSubcategorias: (subcategorias: Subcategoria[]) => void,
  categorias: Categoria[],
  programas: Programa[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Subcategoria | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (subcategoria: Subcategoria) => {
    setEditingId(subcategoria.id)
    setEditForm({ ...subcategoria })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre de la subcategoría es obligatorio')
        return
      }
      if (!editForm.idCategoria) {
        setValidationError('Debe seleccionar una categoría')
        return
      }
      setSubcategorias(subcategorias.map(s => s.id === editForm.id ? editForm : s))
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const deleteSubcategoria = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta subcategoría?')) {
      setSubcategorias(subcategorias.filter(s => s.id !== id))
    }
  }

  const updateEditForm = (field: keyof Subcategoria, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const getCategoriaNombre = (idCategoria: string) => {
    return categorias.find(c => c.id === idCategoria)?.nombre || 'Sin categoría'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Subcategorías</h3>
        <QuickCreateDialog 
          label="Subcategoría" 
          onCreate={(value) => setSubcategorias([...subcategorias, value])}
          categorias={categorias}
          programas={programas}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subcategorias.map((subcategoria) => (
              <tr key={subcategoria.id}>
                <td className="px-4 py-3">
                  {editingId === subcategoria.id ? (
                    <Select
                      value={editForm?.idCategoria || ''}
                      onChange={(e) => updateEditForm('idCategoria', e.target.value)}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(categoria => {
                        const programaNombre = programas.find(p => p.id === categoria.idPrograma)?.nombre || 'Programa desconocido'
                        return (
                          <option key={categoria.id} value={categoria.id}>
                            {programaNombre} - {categoria.nombre}
                          </option>
                        )
                      })}
                    </Select>
                  ) : (
                    <span className="text-sm">{getCategoriaNombre(subcategoria.idCategoria)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === subcategoria.id ? (
                    <Input
                      value={editForm?.nombre || ''}
                      onChange={(e) => updateEditForm('nombre', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span>{subcategoria.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === subcategoria.id ? (
                    <Textarea
                      value={editForm?.descripcion || ''}
                      onChange={(e) => updateEditForm('descripcion', e.target.value)}
                      className="w-full"
                      rows={2}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{subcategoria.descripcion}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === subcategoria.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Guardar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                      {validationError && (
                        <p className="text-sm text-red-600">{validationError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(subcategoria)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubcategoria(subcategoria.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Ciclos con datos de la base de datos
function CiclosTableWithData({ 
  ciclos, 
  createCiclo, 
  updateCiclo, 
  deleteCiclo 
}: { 
  ciclos: Ciclo[], 
  createCiclo: (ciclo: Omit<Ciclo, 'id'>) => void,
  updateCiclo: (id: number, ciclo: Omit<Ciclo, 'id'>) => void,
  deleteCiclo: (id: number) => void
}) {
  console.log('📊 CiclosTableWithData received ciclos:', ciclos)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Ciclo | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (ciclo: Ciclo) => {
    setEditingId(ciclo.id)
    setEditForm({ ...ciclo })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre del ciclo es obligatorio')
        return
      }
      if (!editForm.fechaInicio) {
        setValidationError('La fecha de inicio es obligatoria')
        return
      }
      if (!editForm.fechaFin) {
        setValidationError('La fecha de fin es obligatoria')
        return
      }
      updateCiclo(parseInt(editForm.id), {
        nombre: editForm.nombre,
        fechaInicio: editForm.fechaInicio,
        fechaFin: editForm.fechaFin
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ciclo?')) {
      deleteCiclo(parseInt(id))
    }
  }

  const updateEditForm = (field: keyof Ciclo, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Ciclos</h3>
        <QuickCreateDialog 
          label="Ciclo" 
          onCreate={createCiclo}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {validationError}
          </div>
        )}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fecha Inicio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fecha Fin</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ciclos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay ciclos en la base de datos
                </td>
              </tr>
            ) : (
              ciclos.map((ciclo) => (
                <tr key={ciclo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{ciclo.id}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === ciclo.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{ciclo.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === ciclo.id ? (
                      <Input
                        type="date"
                        value={editForm?.fechaInicio || ''}
                        onChange={(e) => updateEditForm('fechaInicio', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      ciclo.fechaInicio
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === ciclo.id ? (
                      <Input
                        type="date"
                        value={editForm?.fechaFin || ''}
                        onChange={(e) => updateEditForm('fechaFin', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      ciclo.fechaFin
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === ciclo.id ? (
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" variant="primary">
                          Guardar
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(ciclo)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ciclo.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Programas con datos de la base de datos
function ProgramasTableWithData({ 
  programas, 
  createPrograma,
  updatePrograma,
  deletePrograma
}: { 
  programas: Programa[], 
  createPrograma: (programa: Omit<Programa, 'id'>) => void,
  updatePrograma: (id: number, programa: Omit<Programa, 'id'>) => void,
  deletePrograma: (id: number) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Programa | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (programa: Programa) => {
    setEditingId(programa.id)
    setEditForm({ ...programa })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre del programa es obligatorio')
        return
      }
      updatePrograma(parseInt(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        esActivo: editForm.esActivo
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este programa?')) {
      deletePrograma(parseInt(id))
    }
  }

  const updateEditForm = (field: keyof Programa, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Programas</h3>
        <QuickCreateDialog 
          label="Programa" 
          onCreate={createPrograma}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay programas en la base de datos
                </td>
              </tr>
            ) : (
              programas.map((programa) => (
                <tr key={programa.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{programa.id}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === programa.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{programa.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === programa.id ? (
                      <Textarea
                        value={editForm?.descripcion || ''}
                        onChange={(e) => updateEditForm('descripcion', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      programa.descripcion
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === programa.id ? (
                      <Checkbox
                        checked={editForm?.esActivo || false}
                        onChange={(e) => updateEditForm('esActivo', e.target.checked)}
                      />
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        programa.esActivo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {programa.esActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === programa.id ? (
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" variant="primary">
                          Guardar
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(programa)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {validationError && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            {validationError}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para tabla de Categorías con datos de la base de datos
function CategoriasTableWithData({ 
  categorias, 
  createCategoria, 
  updateCategoria,
  programas 
}: { 
  categorias: Categoria[], 
  createCategoria: (categoria: Omit<Categoria, 'id'>) => void,
  updateCategoria: (id: number, categoria: Omit<Categoria, 'id'>) => void,
  programas: Programa[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Categoria | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (categoria: Categoria) => {
    setEditingId(categoria.id)
    setEditForm({ ...categoria })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre de la categoría es obligatorio')
        return
      }
      if (!editForm.idPrograma) {
        setValidationError('Debe seleccionar un programa')
        return
      }
      updateCategoria(parseInt(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        idPrograma: editForm.idPrograma
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const updateEditForm = (field: keyof Categoria, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const getProgramaNombre = (idPrograma: string) => {
    const programa = programas.find(p => p.id === idPrograma)
    return programa ? programa.nombre : `ID: ${idPrograma}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categorías</h3>
        <QuickCreateDialog 
          label="Categoría" 
          onCreate={createCategoria}
          programas={programas}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Programa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay categorías en la base de datos
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{categoria.id}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === categoria.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{categoria.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === categoria.id ? (
                      <Textarea
                        value={editForm?.descripcion || ''}
                        onChange={(e) => updateEditForm('descripcion', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      categoria.descripcion
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === categoria.id ? (
                      <Select
                        value={editForm?.idPrograma || ''}
                        onChange={(e) => updateEditForm('idPrograma', e.target.value)}
                      >
                        <option value="">Seleccionar programa</option>
                        {programas.map(programa => (
                          <option key={programa.id} value={programa.id}>
                            {programa.nombre}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      getProgramaNombre(categoria.idPrograma)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === categoria.id ? (
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" variant="primary">
                          Guardar
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(categoria)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {validationError && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            {validationError}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para tabla de Subcategorías con datos de la base de datos
function SubcategoriasTableWithData({ 
  subcategorias, 
  createSubcategoria, 
  updateSubcategoria,
  categorias, 
  programas 
}: { 
  subcategorias: Subcategoria[], 
  createSubcategoria: (subcategoria: Omit<Subcategoria, 'id'>) => void,
  updateSubcategoria: (id: number, subcategoria: Omit<Subcategoria, 'id'>) => void,
  categorias: Categoria[],
  programas: Programa[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Subcategoria | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (subcategoria: Subcategoria) => {
    setEditingId(subcategoria.id)
    setEditForm({ ...subcategoria })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre de la subcategoría es obligatorio')
        return
      }
      if (!editForm.idCategoria) {
        setValidationError('Debe seleccionar una categoría')
        return
      }
      updateSubcategoria(parseInt(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        idCategoria: editForm.idCategoria
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const updateEditForm = (field: keyof Subcategoria, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const getCategoriaNombre = (idCategoria: string) => {
    const categoria = categorias.find(c => c.id === idCategoria)
    return categoria ? categoria.nombre : `ID: ${idCategoria}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Subcategorías</h3>
        <QuickCreateDialog 
          label="Subcategoría" 
          onCreate={createSubcategoria}
          categorias={categorias}
          programas={programas}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Categoría</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subcategorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay subcategorías en la base de datos
                </td>
              </tr>
            ) : (
              subcategorias.map((subcategoria) => (
                <tr key={subcategoria.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{subcategoria.id}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === subcategoria.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{subcategoria.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === subcategoria.id ? (
                      <Textarea
                        value={editForm?.descripcion || ''}
                        onChange={(e) => updateEditForm('descripcion', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      subcategoria.descripcion
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === subcategoria.id ? (
                      <Select
                        value={editForm?.idCategoria || ''}
                        onChange={(e) => updateEditForm('idCategoria', e.target.value)}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(categoria => {
                          const programaNombre = programas.find(p => p.id === categoria.idPrograma)?.nombre || 'Programa desconocido'
                          return (
                            <option key={categoria.id} value={categoria.id}>
                              {programaNombre} - {categoria.nombre}
                            </option>
                          )
                        })}
                      </Select>
                    ) : (
                      getCategoriaNombre(subcategoria.idCategoria)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === subcategoria.id ? (
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" variant="primary">
                          Guardar
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(subcategoria)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {validationError && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            {validationError}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para tabla de Estilos con datos de la base de datos
function EstilosTableWithData({ 
  estilos, 
  createEstilo,
  updateEstilo,
  deleteEstilo
}: { 
  estilos: Estilo[], 
  createEstilo: (estilo: Omit<Estilo, 'id'>) => void,
  updateEstilo: (id: number, estilo: Omit<Estilo, 'id'>) => void,
  deleteEstilo: (id: number) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Estilo | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (estilo: Estilo) => {
    setEditingId(estilo.id)
    setEditForm({ ...estilo })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre del estilo es obligatorio')
        return
      }
      updateEstilo(parseInt(editForm.id), {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        beneficios: editForm.beneficios
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estilo?')) {
      deleteEstilo(parseInt(id))
    }
  }

  const updateEditForm = (field: keyof Estilo, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Estilos de Baile</h3>
        <QuickCreateDialog 
          label="Estilo" 
          onCreate={(value) => createEstilo(value)}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beneficios
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estilos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No hay estilos registrados
                </td>
              </tr>
            ) : (
              estilos.map((estilo) => (
                <tr key={estilo.id}>
                  <td className="px-4 py-3">
                    {editingId === estilo.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{estilo.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === estilo.id ? (
                      <Textarea
                        value={editForm?.descripcion || ''}
                        onChange={(e) => updateEditForm('descripcion', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{estilo.descripcion}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === estilo.id ? (
                      <Textarea
                        value={editForm?.beneficios || ''}
                        onChange={(e) => updateEditForm('beneficios', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{estilo.beneficios}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === estilo.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            Guardar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            Cancelar
                          </Button>
                        </div>
                        {validationError && (
                          <p className="text-sm text-red-600">{validationError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(estilo)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(estilo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para tabla de Salas con datos de la base de datos
function SalasTableWithData({ 
  salas, 
  createSala,
  updateSala,
  deleteSala
}: { 
  salas: Sala[], 
  createSala: (sala: Omit<Sala, 'id'>) => void,
  updateSala: (id: number, sala: Omit<Sala, 'id'>) => void,
  deleteSala: (id: number) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Sala | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const startEdit = (sala: Sala) => {
    setEditingId(sala.id)
    setEditForm({ ...sala })
    setValidationError('')
  }

  const saveEdit = () => {
    setValidationError('')
    if (editForm) {
      if (!editForm.nombre.trim()) {
        setValidationError('El nombre de la sala es obligatorio')
        return
      }
      if (!editForm.ubicacion.trim()) {
        setValidationError('La ubicación es obligatoria')
        return
      }
      updateSala(parseInt(editForm.id), {
        nombre: editForm.nombre,
        ubicacion: editForm.ubicacion,
        linkUbicacion: editForm.linkUbicacion,
        departamento: editForm.departamento,
        zona: editForm.zona
      })
      setEditingId(null)
      setEditForm(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setValidationError('')
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta sala?')) {
      deleteSala(parseInt(id))
    }
  }

  const updateEditForm = (field: keyof Sala, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Salas</h3>
        <QuickCreateDialog 
          label="Sala" 
          onCreate={(value) => createSala(value)}
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zona
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay salas registradas
                </td>
              </tr>
            ) : (
              salas.map((sala) => (
                <tr key={sala.id}>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <Input
                        value={editForm?.nombre || ''}
                        onChange={(e) => updateEditForm('nombre', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{sala.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <Textarea
                        value={editForm?.ubicacion || ''}
                        onChange={(e) => updateEditForm('ubicacion', e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-600 whitespace-pre-wrap">{sala.ubicacion}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <Input
                        value={editForm?.linkUbicacion || ''}
                        onChange={(e) => updateEditForm('linkUbicacion', e.target.value)}
                        className="w-full"
                        placeholder="URL de Google Maps"
                      />
                    ) : (
                      sala.linkUbicacion ? (
                        <a 
                          href={sala.linkUbicacion} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Ver mapa
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Sin link</span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <Input
                        value={editForm?.zona || ''}
                        onChange={(e) => updateEditForm('zona', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm">{sala.zona}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <Input
                        value={editForm?.departamento || ''}
                        onChange={(e) => updateEditForm('departamento', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm">{sala.departamento}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === sala.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            Guardar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            Cancelar
                          </Button>
                        </div>
                        {validationError && (
                          <p className="text-sm text-red-600">{validationError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(sala)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sala.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente principal
export function ProgramasManagementView({
  ciclos,
  createCiclo,
  updateCiclo,
  deleteCiclo,
  programas,
  createPrograma,
  updatePrograma,
  deletePrograma,
  categorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  subcategorias,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
  salas,
  createSala,
  updateSala,
  deleteSala,
  estilos,
  createEstilo,
  updateEstilo,
  deleteEstilo
}: ProgramasManagementViewProps) {

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Gestión de Programas</h2>
      
      <CiclosTableWithData 
        ciclos={ciclos} 
        createCiclo={createCiclo}
        updateCiclo={updateCiclo}
        deleteCiclo={deleteCiclo}
      />
      <ProgramasTableWithData 
        programas={programas} 
        createPrograma={createPrograma}
        updatePrograma={updatePrograma}
        deletePrograma={deletePrograma}
      />
      <CategoriasTableWithData 
        categorias={categorias} 
        createCategoria={createCategoria}
        updateCategoria={updateCategoria}
        programas={programas} 
      />
      <SubcategoriasTableWithData 
        subcategorias={subcategorias} 
        createSubcategoria={createSubcategoria}
        updateSubcategoria={updateSubcategoria}
        categorias={categorias}
        programas={programas}
      />
      <EstilosTableWithData 
        estilos={estilos} 
        createEstilo={createEstilo}
        updateEstilo={updateEstilo}
        deleteEstilo={deleteEstilo}
      />
      <SalasTableWithData 
        salas={salas} 
        createSala={createSala}
        updateSala={updateSala}
        deleteSala={deleteSala}
      />
    </div>
  )
}