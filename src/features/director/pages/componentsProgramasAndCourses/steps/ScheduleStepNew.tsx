import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { DaysCheckboxes } from '../ui/DaysCheckboxes'
import { DAY_OPTS } from '../utils/helpers'
import { Plus, Trash2, X } from 'lucide-react'
import { Sala, Estilo } from '../ui/ManageListDialog'
import { fetchProfesores, Profesor, createProfesorTemporal, deleteProfesor } from '@/features/director/api/director'
import { useToast } from '@/components/ui/Toast'

interface Teacher {
  id: string
  name: string
  nationality: string
  instagram: string
  temporal?: boolean
}

interface NewTeacherData {
  nombre?: string
  nationality?: string
  instagram?: string
}

interface HorarioData {
  id: string
  // Campos básicos de horario
  dias: string[]
  horaInicio: string
  horaFin: string
  flexible: boolean
  overrides: Record<string, { start?: string; end?: string }>
  
  // Nuevos campos
  estilo: string
  nivel: string  // Básico, Intermedio, Avanzado
  sala: string
  cupos: number
  profesor: Teacher | null
}

interface ScheduleStepProps {
  form: any
  setField: (k: string, v: any) => void
  errors: Record<string, string>
  sessions: Array<{ day: string; start: string; end: string }>
  goNext: () => void
  goPrev: () => void
  canContinueFrom: (step: number) => boolean
  horarios: HorarioData[]
  setHorarios: (horarios: HorarioData[]) => void
  salas: Sala[]
  estilos: Estilo[]
}

export function ScheduleStepNew({
  form,
  setField,
  errors,
  sessions,
  goNext,
  goPrev,
  canContinueFrom,
  horarios,
  setHorarios,
  salas,
  estilos,
}: ScheduleStepProps) {
  console.log('🎯 ScheduleStepNew received salas:', salas)
  console.log('🎯 ScheduleStepNew received estilos:', estilos)
  const cantidadHorarios = form.cantidadCursos || 1

  const { showToast } = useToast()

  // Estado para profesores desde backend
  const [TEACHERS, setTEACHERS] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  // Cargar profesores desde backend al montar el componente
  const loadProfesores = async () => {
    try {
      setLoadingTeachers(true)
      const profesores = await fetchProfesores()
      setTEACHERS(profesores)
    } catch (error) {
      console.error('Error loading profesores:', error)
      showToast('error', 'Error', 'No se pudieron cargar los profesores')
    } finally {
      setLoadingTeachers(false)
    }
  }

  useEffect(() => {
    loadProfesores()
  }, [])
  
  // Estado para autocompletado de profesores
  const [profesorQueries, setProfessorQueries] = useState<Record<string, string>>({})
  const [showingSuggestions, setShowingSuggestions] = useState<Record<string, boolean>>({})
  const [creatingNewProfesor, setCreatingNewProfesor] = useState<Record<string, boolean>>({})
  const [newProfesorData, setNewProfesorData] = useState<Record<string, NewTeacherData>>({})

  // Sincronizar queries con profesores ya seleccionados
  React.useEffect(() => {
    const newQueries: Record<string, string> = {}
    horarios.forEach((horario) => {
      if (horario.profesor && !profesorQueries[horario.id]) {
        newQueries[horario.id] = horario.profesor.name
      }
    })
    if (Object.keys(newQueries).length > 0) {
      setProfessorQueries(prev => ({ ...prev, ...newQueries }))
    }
  }, [horarios])

  const updateHorario = (index: number, field: keyof HorarioData, value: any) => {
    const nuevosHorarios = [...horarios]
    nuevosHorarios[index] = { ...nuevosHorarios[index], [field]: value }
    setHorarios(nuevosHorarios)
  }

  const handleProfesorQueryChange = (horarioId: string, query: string) => {
    setProfessorQueries({ ...profesorQueries, [horarioId]: query })
    setShowingSuggestions({ ...showingSuggestions, [horarioId]: true })
  }

  const selectProfesor = (horarioIndex: number, profesor: Teacher) => {
    updateHorario(horarioIndex, 'profesor', profesor)
    const horarioId = horarios[horarioIndex].id
    setShowingSuggestions({ ...showingSuggestions, [horarioId]: false })
    setProfessorQueries({ ...profesorQueries, [horarioId]: profesor.name })
  }

  const startCreatingNewProfesor = (horarioId: string) => {
    setCreatingNewProfesor({ ...creatingNewProfesor, [horarioId]: true })
    // Pre-llenar el nombre con lo que escribió el usuario
    const currentQuery = profesorQueries[horarioId] || ''
    setNewProfesorData({
      ...newProfesorData,
      [horarioId]: { ...newProfesorData[horarioId], nombre: currentQuery }
    })
    setShowingSuggestions({ ...showingSuggestions, [horarioId]: false })
  }

  const cancelNewProfesor = (horarioId: string) => {
    setCreatingNewProfesor({ ...creatingNewProfesor, [horarioId]: false })
    setNewProfesorData({ ...newProfesorData, [horarioId]: {} })
  }

  const saveNewProfesor = async (horarioIndex: number) => {
    const horarioId = horarios[horarioIndex].id
    const data = newProfesorData[horarioId]
    
    if (data?.nombre && data?.nationality) {
      try {
        // Crear profesor temporal en el backend
        const newProfesor = await createProfesorTemporal({
          nombre: data.nombre,
          cuidad: data.nationality,
          redes_sociales: data.instagram || ''
        })
        
        // Actualizar horario con el nuevo profesor
        updateHorario(horarioIndex, 'profesor', newProfesor)
        setProfessorQueries({ ...profesorQueries, [horarioId]: newProfesor.name })
        setCreatingNewProfesor({ ...creatingNewProfesor, [horarioId]: false })
        setNewProfesorData({ ...newProfesorData, [horarioId]: {} })
        
        // Recargar lista de profesores
        await loadProfesores()
        
        showToast('success', '✅ Profesor creado', 'El profesor temporal se creó exitosamente')
      } catch (error) {
        console.error('Error creating profesor:', error)
        showToast('error', '❌ Error', 'No se pudo crear el profesor. Intenta nuevamente.')
      }
    }
  }

  const handleDeleteProfesor = async (horarioIndex: number, profesor: Teacher) => {
    if (!profesor.temporal) {
      showToast('error', '❌ No permitido', 'Solo se pueden eliminar profesores temporales')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar al profesor "${profesor.name}"?`)) {
      return
    }

    try {
      await deleteProfesor(profesor.id)
      
      // Limpiar el profesor del horario
      updateHorario(horarioIndex, 'profesor', null)
      const horarioId = horarios[horarioIndex].id
      setProfessorQueries({ ...profesorQueries, [horarioId]: '' })
      
      // Recargar lista de profesores
      await loadProfesores()
      
      showToast('success', '✅ Eliminado', 'El profesor temporal se eliminó correctamente')
    } catch (error) {
      console.error('Error deleting profesor:', error)
      showToast('error', '❌ Error', 'No se pudo eliminar el profesor')
    }
  }

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

  return (
    <Card>
      <div className="p-3 border-b">
        <h3 className="font-semibold">Horarios del Curso</h3>
        <p className="text-sm text-muted-foreground">
          {cantidadHorarios > 1 
            ? `Configura los ${cantidadHorarios} horarios del curso` 
            : 'Define el horario del curso'}
        </p>
      </div>
      <CardContent className="space-y-6 p-4">
        {horarios.map((horario, index) => {
          const horarioId = horario.id
          const profesorQuery = profesorQueries[horarioId] || ''
          const isShowingSuggestions = showingSuggestions[horarioId]
          const isCreatingNew = creatingNewProfesor[horarioId]
          const filteredTeachers = TEACHERS.filter((t: Teacher) => 
            t.name.toLowerCase().includes(profesorQuery.toLowerCase())
          )
          const sesiones = getSesionesForHorario(horario)

          return (
            <div key={horario.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h4 className="font-medium text-lg">
                  {cantidadHorarios > 1 ? `Horario ${index + 1}` : 'Horario del Curso'}
                </h4>
              </div>

              {/* Estilo */}
              <div className="grid gap-2">
                <Label>Estilo *</Label>
                <Select 
                  value={horario.estilo} 
                  onChange={(e: any) => updateHorario(index, 'estilo', e.target.value)}
                  className={errors[`horario_${index}_estilo`] ? 'border-red-500' : ''}
                >
                  <option value="">Seleccionar estilo</option>
                  {estilos.map((estilo) => (
                    <option key={estilo.id} value={estilo.id}>
                      {estilo.nombre}
                    </option>
                  ))}
                </Select>
                {errors[`horario_${index}_estilo`] && (
                  <p className="text-sm text-red-600">{errors[`horario_${index}_estilo`]}</p>
                )}
              </div>

              {/* Nivel */}
              <div className="grid gap-2">
                <Label>Nivel *</Label>
                <Select 
                  value={horario.nivel} 
                  onChange={(e: any) => updateHorario(index, 'nivel', e.target.value)}
                  className={errors[`horario_${index}_nivel`] ? 'border-red-500' : ''}
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Multinvel">Multinivel</option>
                </Select>
                {errors[`horario_${index}_nivel`] && (
                  <p className="text-sm text-red-600">{errors[`horario_${index}_nivel`]}</p>
                )}
              </div>

              {/* Sala */}
              <div className="grid gap-2">
                <Label>Sala *</Label>
                <Select 
                  value={horario.sala} 
                  onChange={(e: any) => updateHorario(index, 'sala', e.target.value)}
                  className={errors[`horario_${index}_sala`] ? 'border-red-500' : ''}
                >
                  <option value="">Seleccionar sala</option>
                  {salas.map((sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nombre}
                    </option>
                  ))}
                </Select>
                {errors[`horario_${index}_sala`] && (
                  <p className="text-sm text-red-600">{errors[`horario_${index}_sala`]}</p>
                )}
              </div>

              {/* Cupos */}
              <div className="grid gap-2">
                <Label>Cupos *</Label>
                <Input 
                  type="number"
                  min="1"
                  value={horario.cupos} 
                  onChange={(e) => updateHorario(index, 'cupos', parseInt(e.target.value) || 0)}
                  placeholder="Número de cupos disponibles"
                  className={errors[`horario_${index}_cupos`] ? 'border-red-500' : ''}
                />
                {errors[`horario_${index}_cupos`] && (
                  <p className="text-sm text-red-600">{errors[`horario_${index}_cupos`]}</p>
                )}
              </div>

              {/* Profesor - Autocompletado */}
              <div className="grid gap-2">
                <Label>Profesor *</Label>
                <div className="relative">
                  <Input 
                    value={profesorQuery}
                    onChange={(e) => handleProfesorQueryChange(horarioId, e.target.value)}
                    onFocus={() => setShowingSuggestions({ ...showingSuggestions, [horarioId]: true })}
                    placeholder={loadingTeachers ? "Cargando profesores..." : "Buscar o crear profesor..."}
                    className={errors[`horario_${index}_profesor`] ? 'border-red-500' : ''}
                    disabled={isCreatingNew || loadingTeachers}
                  />
                  {errors[`horario_${index}_profesor`] && (
                    <p className="text-sm text-red-600">{errors[`horario_${index}_profesor`]}</p>
                  )}
                  
                  {isShowingSuggestions && profesorQuery && !loadingTeachers && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTeachers.length > 0 && (
                        <div>
                          {filteredTeachers.map((teacher) => (
                            <button
                              key={teacher.id}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                              onClick={() => selectProfesor(index, teacher)}
                            >
                              <span className="font-medium">{teacher.name}</span>
                              <span className="text-xs text-gray-500">{teacher.nationality} • {teacher.instagram}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {filteredTeachers.length === 0 && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-2">No se encontró el profesor</p>
                          <Button 
                            size="sm" 
                            onClick={() => startCreatingNewProfesor(horarioId)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear nuevo profesor
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Formulario para crear nuevo profesor - Movido más abajo con margen superior */}
                {isCreatingNew && (
                  <div className="border rounded-md p-4 space-y-3 bg-pink-50 border-pink-200 mt-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-sm text-femme-magenta">Crear nuevo profesor</h5>
                      <button 
                        type="button"
                        onClick={() => cancelNewProfesor(horarioId)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-sm">Nombre *</Label>
                      <Input 
                        value={newProfesorData[horarioId]?.nombre || ''}
                        onChange={(e) => setNewProfesorData({
                          ...newProfesorData,
                          [horarioId]: { ...newProfesorData[horarioId], nombre: e.target.value }
                        })}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-sm">Ciudad/Nacionalidad *</Label>
                      <Input 
                        value={newProfesorData[horarioId]?.nationality || ''}
                        onChange={(e) => setNewProfesorData({
                          ...newProfesorData,
                          [horarioId]: { ...newProfesorData[horarioId], nationality: e.target.value }
                        })}
                        placeholder="Ej: La Paz, Bolivia"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-sm">Instagram (opcional)</Label>
                      <Input 
                        value={newProfesorData[horarioId]?.instagram || ''}
                        onChange={(e) => setNewProfesorData({
                          ...newProfesorData,
                          [horarioId]: { ...newProfesorData[horarioId], instagram: e.target.value }
                        })}
                        placeholder="@usuario"
                      />
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => saveNewProfesor(index)}
                      disabled={!newProfesorData[horarioId]?.nombre || !newProfesorData[horarioId]?.nationality}
                      className="w-full"
                    >
                      Guardar profesor
                    </Button>
                  </div>
                )}

                {horario.profesor && (
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{horario.profesor.name}</span>
                      <span className="text-gray-500">({horario.profesor.nationality})</span>
                      {horario.profesor.instagram && (
                        <span className="text-gray-500">{horario.profesor.instagram}</span>
                      )}
                      {horario.profesor.temporal && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Temporal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {horario.profesor.temporal && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProfesor(index, horario.profesor!)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar profesor temporal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          updateHorario(index, 'profesor', null)
                          setProfessorQueries({ ...profesorQueries, [horarioId]: '' })
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Cambiar profesor"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Días de la semana */}
              <div>
                <Label className="mb-2 block">Días *</Label>
                <DaysCheckboxes 
                  value={horario.dias} 
                  onChange={(dias) => updateHorario(index, 'dias', dias)} 
                />
                {errors[`horario_${index}_dias`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`horario_${index}_dias`]}</p>
                )}
              </div>

              {/* Horario base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Hora inicio (base) *</Label>
                  <Input 
                    type="time" 
                    value={horario.horaInicio} 
                    onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)}
                    className={errors[`horario_${index}_horas`] ? 'border-red-500' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Hora fin (base) *</Label>
                  <Input 
                    type="time" 
                    value={horario.horaFin} 
                    onChange={(e) => updateHorario(index, 'horaFin', e.target.value)}
                    className={errors[`horario_${index}_horas`] ? 'border-red-500' : ''}
                  />
                </div>
                {errors[`horario_${index}_horas`] && (
                  <div className="col-span-full">
                    <p className="text-sm text-red-600">{errors[`horario_${index}_horas`]}</p>
                  </div>
                )}
              </div>

              {/* Horario flexible */}
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={horario.flexible} 
                  onChange={(e: any) => updateHorario(index, 'flexible', e.target.checked)} 
                />
                <span className="text-sm">Horario flexible (permitir definir horarios específicos por día)</span>
              </div>

              {horario.flexible && horario.dias.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Horarios por día (opcional)</p>
                  <div className="space-y-3">
                    {horario.dias.map((dayKey: string) => {
                      const day = DAY_OPTS.find((d) => d.key === dayKey)!
                      const o = horario.overrides[dayKey] || {}
                      return (
                        <div key={dayKey} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                          <span className="font-medium">{day.label}</span>
                          <label className="flex items-center gap-2">
                            <span className="w-16 text-sm text-muted-foreground">Inicio</span>
                            <Input 
                              type="time" 
                              value={o.start || ''} 
                              onChange={(e) => updateHorario(index, 'overrides', { 
                                ...horario.overrides, 
                                [dayKey]: { 
                                  ...(horario.overrides[dayKey] || {}), 
                                  start: e.target.value 
                                } 
                              })} 
                              placeholder={horario.horaInicio} 
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            <span className="w-16 text-sm text-muted-foreground">Fin</span>
                            <Input 
                              type="time" 
                              value={o.end || ''} 
                              onChange={(e) => updateHorario(index, 'overrides', { 
                                ...horario.overrides, 
                                [dayKey]: { 
                                  ...(horario.overrides[dayKey] || {}), 
                                  end: e.target.value 
                                } 
                              })} 
                              placeholder={horario.horaFin} 
                            />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Vista rápida de sesiones */}
              <div className="bg-white rounded-lg p-3 text-xs border">
                <div className="font-semibold mb-2">Vista rápida de sesiones</div>
                {sesiones.length === 0 ? (
                  <p className="text-muted-foreground">Sin días seleccionados.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sesiones.map((s, i) => (
                      <li key={i} className="flex justify-between bg-gray-50 rounded px-3 py-2">
                        <span className="capitalize">{DAY_OPTS.find(d => d.key === s.day)?.label}</span>
                        <span>{s.start} – {s.end}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
      <div className="p-3 flex justify-between">
        <Button variant="outline" onClick={goPrev}>Volver</Button>
        <Button onClick={goNext} disabled={!canContinueFrom(1)}>Continuar</Button>
      </div>
    </Card>
  )
}
