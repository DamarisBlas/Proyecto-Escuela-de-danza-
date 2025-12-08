import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'

// Importamos los hooks del servicio de integración
import { 
  useProgramas, 
  useCreatePrograma,
  useUpdatePrograma,
  useDeletePrograma,
  useCategorias, 
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
  useSubcategorias, 
  useCreateSubcategoria,
  useUpdateSubcategoria,
  useDeleteSubcategoria,
  useCiclos, 
  useCreateCiclo,
  useUpdateCiclo,
  useDeleteCiclo,
  useSalas,
  useCreateSala,
  useUpdateSala,
  useDeleteSala,
  useEstilos,
  useCreateEstilo,
  useUpdateEstilo,
  useDeleteEstilo,
  useOfertas
} from '../api/integrationService'

// Funciones del backend para crear y actualizar cursos
import { 
  createCourseBackend, 
  type CreateCourseData, 
  getOfertaCompleta,
  updateOferta,
  updateHorario,
  updatePaquete
} from '../api/backend'
import { createOferta, createHorario, createPaquete } from '../api/director'

import { Spinner } from '@/components/ui/Spinner'
import { Stepper } from './componentsProgramasAndCourses/ui/Stepper'
import { CourseDataStep } from './componentsProgramasAndCourses/steps/CourseDataStep'
import { ScheduleStepNew } from './componentsProgramasAndCourses/steps/ScheduleStepNew'
import { PackagesStep } from './componentsProgramasAndCourses/steps/PackagesStep'
import { ReviewStep } from './componentsProgramasAndCourses/steps/ReviewStep'
import { DAY_OPTS, isAfter } from './componentsProgramasAndCourses/utils/helpers'
import { Programa, Categoria, Subcategoria, Ciclo } from './componentsProgramasAndCourses/ui/ManageListDialog'
import { ProgramasManagementView } from './componentsProgramasAndCourses/views/ProgramasManagementView'
import { OfferingView } from './componentsProgramasAndCourses/views/OfferingView'

// ================= Componente de navegación simple =================
interface SimpleNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function SimpleNav({ activeTab, onTabChange }: SimpleNavProps) {
  const tabs = [
    { id: 'programas', label: 'PROGRAMAS' },
    { id: 'ofertas', label: 'OFERTAS' },
    { id: 'nuevo-curso', label: 'NUEVO CURSO' }
  ]

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-femme-magenta text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ================= Componente para vista de Programas =================
function ProgramasView({ 
  programas, 
  ciclos, 
  createCiclo, 
  updateCiclo,
  deleteCiclo,
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
}: { 
  programas: Programa[]
  ciclos: Ciclo[]
  createCiclo: (ciclo: Omit<Ciclo, 'id'>) => void
  updateCiclo: (id: number, ciclo: Omit<Ciclo, 'id'>) => void
  deleteCiclo: (id: number) => void
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
  salas: any[]
  createSala: (sala: any) => void
  updateSala: (id: number, sala: any) => void
  deleteSala: (id: number) => void
  estilos: any[]
  createEstilo: (estilo: any) => void
  updateEstilo: (id: number, estilo: any) => void
  deleteEstilo: (id: number) => void
}) {
  return (
    <ProgramasManagementView
      ciclos={ciclos}
      createCiclo={createCiclo}
      updateCiclo={updateCiclo}
      deleteCiclo={deleteCiclo}
      programas={programas}
      createPrograma={createPrograma}
      updatePrograma={updatePrograma}
      deletePrograma={deletePrograma}
      categorias={categorias}
      createCategoria={createCategoria}
      updateCategoria={updateCategoria}
      deleteCategoria={deleteCategoria}
      subcategorias={subcategorias}
      createSubcategoria={createSubcategoria}
      updateSubcategoria={updateSubcategoria}
      deleteSubcategoria={deleteSubcategoria}
      salas={salas}
      createSala={createSala}
      updateSala={updateSala}
      deleteSala={deleteSala}
      estilos={estilos}
      createEstilo={createEstilo}
      updateEstilo={updateEstilo}
      deleteEstilo={deleteEstilo}
    />
  )
}

// ================= Wizard =================



export default function CrearCursoWizard() {
  // Datos de ejemplo – reemplaza por fetch/queries reales
  const proyectos = ['Camino Femme', 'Kids', 'Élite', 'Libre']
  const niveles = ['Principiante', 'Intermedio', 'Avanzado']
  
  const modalidades = ['Presencial', 'Virtual', 'Híbrido']
  const estados = ['Borrador', 'Activo', 'Finalizado']

  // Profes: recomendaciones + creación rápida
  const TEACHERS = [
    { id: 't1', name: 'Patty Dancer', nationality: 'Bolivia', styles: ['Salsa', 'Bachata'], instagram: '@patty.dancer' },
    { id: 't2', name: 'Carlos Groove', nationality: 'Perú', styles: ['Salsa'], instagram: '@carlosgroove' },
    { id: 't3', name: 'María Flow', nationality: 'Chile', styles: ['Bachata'], instagram: '@maria.flow' },
  ]

  const qc = useQueryClient()

  // Usamos los hooks del servicio de integración
  const { data: programas = [], isLoading: programasLoading, error: programasError } = useProgramas()
  const { data: categorias = [], isLoading: categoriasLoading, error: categoriasError } = useCategorias()
  const { data: subcategorias = [], isLoading: subcategoriasLoading, error: subcategoriasError } = useSubcategorias()
  const { data: ciclos = [], isLoading: ciclosLoading, error: ciclosError } = useCiclos()
  const { data: salas = [], isLoading: salasLoading, error: salasError } = useSalas()
  const { data: estilos = [], isLoading: estilosLoading, error: estilosError } = useEstilos()

  console.log('🔍 Debug - Data from backend:', {
    ciclos,
    programas,
    categorias,
    subcategorias,
    ciclosLoading,
    ciclosError: ciclosError?.message
  })

  // Mutations para crear datos
  const createProgramaMutation = useCreatePrograma()
  const updateProgramaMutation = useUpdatePrograma()
  const deleteProgramaMutation = useDeletePrograma()
  
  const createCategoriaMutation = useCreateCategoria()
  const updateCategoriaMutation = useUpdateCategoria()
  const deleteCategoriaMutation = useDeleteCategoria()
  
  const createSubcategoriaMutation = useCreateSubcategoria()
  const updateSubcategoriaMutation = useUpdateSubcategoria()
  const deleteSubcategoriaMutation = useDeleteSubcategoria()
  
  const createCicloMutation = useCreateCiclo()
  const updateCicloMutation = useUpdateCiclo()
  const deleteCicloMutation = useDeleteCiclo()

  const createSalaMutation = useCreateSala()
  const updateSalaMutation = useUpdateSala()
  const deleteSalaMutation = useDeleteSala()

  const createEstiloMutation = useCreateEstilo()
  const updateEstiloMutation = useUpdateEstilo()
  const deleteEstiloMutation = useDeleteEstilo()

  const createCourseMutation = useMutation({
    mutationFn: createCourseBackend,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cursos'] })
    }
  })

  const [step, setStep] = useState(0)
  const steps = ['Datos', 'Horario', 'Paquetes', 'Revisión']

  // Estado para navegación por pestañas
  const [activeTab, setActiveTab] = useState('nuevo-curso')

  // Estado para modo edición
  const [editMode, setEditMode] = useState<{ isEditing: boolean; ofertaId: number | null }>({
    isEditing: false,
    ofertaId: null
  })

  // Función para resetear el formulario
  const resetForm = () => {
    setForm({
      proyecto: proyectos[0],
      programa: programas[0]?.id || '',
      ciclo: ciclos[0]?.nombre || '',
      categoria: categorias[0]?.id || '',
      subcategoria: subcategorias[0]?.id || '',
      nombre: 'Curso regular 1 -2025',
      nivel: niveles[0],
      cupos: 12,
      estado: estados[0],
      fechaInicio: '',
      fechaFin: '',
      seRepiteSemanalmente: false,
      cantidadCursos: 1,
      publico: 'todos',
      grupoWhatsapp: '',
      dias: [] as string[],
      horaInicio: '18:00',
      horaFin: '19:30',
      overrides: {} as Record<string, { start?: string; end?: string }>,
      flexible: false,
      modalidad: modalidades[0],
      descripcion: '',
      paquetes: [] as { nombre: string; cantidad: number; precio: number; ilimitado?: boolean }[],
    })
    setHorarios([])
    setHorariosInitialized(false)
    setEditMode({ isEditing: false, ofertaId: null })
  }

  // Estado del formulario
  const [form, setForm] = useState({
    proyecto: proyectos[0],
    programa: programas[0]?.id || '',
    ciclo: ciclos[0]?.nombre || '',
    categoria: categorias[0]?.id || '',
    subcategoria: subcategorias[0]?.id || '',

    nombre: 'Curso regular 1 -2025',
    nivel: niveles[0],
    cupos: 12,
    estado: estados[0],
    fechaInicio: '',
    fechaFin: '',
    
    // Nuevos campos
    seRepiteSemanalmente: false,
    cantidadCursos: 1,
    publico: 'todos',
    grupoWhatsapp: '',
    
    dias: [] as string[],
    horaInicio: '18:00',
    horaFin: '19:30',
    overrides: {} as Record<string, { start?: string; end?: string }>,
    flexible: false,
    modalidad: modalidades[0],
    descripcion: '',
    paquetes: [] as { nombre: string; cantidad: number; precio: number; ilimitado?: boolean }[],
  })

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  // Estados y helpers para profesor/creación rápida
  const [teacherQuery, setTeacherQuery] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [newTeacher, setNewTeacher] = useState({ nationality: '', styles: '', instagram: '' })
  const isNewTeacher = teacherQuery && !selectedTeacher
  const filteredTeachers = TEACHERS.filter((t) => t.name.toLowerCase().includes(teacherQuery.toLowerCase()))
  const teacherPayload = selectedTeacher
    ? { id: selectedTeacher.id }
    : isNewTeacher
    ? {
        name: teacherQuery,
        nationality: newTeacher.nationality || null,
        styles: newTeacher.styles ? newTeacher.styles.split(',').map((s) => s.trim()).filter(Boolean) : [],
        instagram: newTeacher.instagram || null,
      }
    : null

  // Estado para múltiples horarios (cuando cantidadCursos > 1)
  const [horarios, setHorarios] = useState<any[]>([])
  const [horariosInitialized, setHorariosInitialized] = useState(false)

  // Actualizar horarios cuando cambia cantidadCursos
  React.useEffect(() => {
    // NO ejecutar si estamos en modo edición (los horarios ya fueron cargados)
    if (editMode.isEditing && horariosInitialized) {
      return
    }

    // Asegurar que siempre haya al menos 1 horario
    const cantidadHorarios = Math.max(1, form.cantidadCursos || 1)
    
    // Ejecutar si:
    // 1. Los horarios no han sido inicializados aún, O
    // 2. La cantidad de horarios cambió
    if (!horariosInitialized || horarios.length !== cantidadHorarios) {
      const nuevosHorarios: any[] = []
      for (let i = 0; i < cantidadHorarios; i++) {
        // Preservar datos existentes si ya había un horario en esa posición
        if (horarios[i]) {
          nuevosHorarios.push(horarios[i])
        } else {
          // Si es el primer horario (índice 0) y cantidadCursos es 1,
          // copiar datos del formulario principal
          if (i === 0 && cantidadHorarios === 1) {
            nuevosHorarios.push({
              id: `horario_${i}`,
              dias: form.dias || [],
              horaInicio: form.horaInicio || '18:00',
              horaFin: form.horaFin || '19:30',
              flexible: form.flexible || false,
              overrides: form.overrides || {},
              estilo: '',
              nivel: form.nivel || 'Básico',
              sala: '',
              cupos: form.cupos || 12,
              profesor: selectedTeacher || (teacherQuery ? { name: teacherQuery } : null),
            })
          } else {
            // Crear nuevo horario vacío para horarios adicionales
            nuevosHorarios.push({
              id: `horario_${i}`,
              dias: [],
              horaInicio: '18:00',
              horaFin: '19:30',
              flexible: false,
              overrides: {},
              estilo: '',
              nivel: 'Básico',
              sala: '',
              cupos: 12,
              profesor: null,
            })
          }
        }
      }
      setHorarios(nuevosHorarios)
      setHorariosInitialized(true)
    }
  }, [form.cantidadCursos, horariosInitialized, editMode.isEditing, form.dias, form.horaInicio, form.horaFin, form.flexible, form.overrides, form.nivel, form.cupos, selectedTeacher, teacherQuery])

  // ======= Sesiones derivadas (base + overrides opcionales) =======
  const sessions = useMemo(() => {
    return form.dias.map((dayKey) => {
      const o = form.overrides[dayKey] || {}
      return {
        day: dayKey,
        start: o.start || form.horaInicio,
        end: o.end || form.horaFin,
      }
    })
  }, [form.dias, form.overrides, form.horaInicio, form.horaFin])

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!form.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.ciclo) e.ciclo = 'Seleccione un ciclo'
    if (!form.programa) e.programa = 'Seleccione un programa'
    if (!form.categoria) e.categoria = 'Seleccione una categoría'
    if (!form.subcategoria) e.subcategoria = 'Seleccione una subcategoría'
    if (!form.fechaInicio || !form.fechaFin) e.fechas = 'Defina fecha inicio y fin'
    if (form.fechaInicio && form.fechaFin && new Date(form.fechaFin) < new Date(form.fechaInicio)) e.fechas = 'La fecha fin no puede ser anterior a inicio'

    // Validar siempre usando el array de horarios (incluso si cantidadCursos es 1)
    if (horarios.length > 0) {
      horarios.forEach((horario, index) => {
        const horarioNum = index + 1
        const isSingleSchedule = form.cantidadCursos === 1
        
        // Solo validar estilo, nivel y sala para múltiples horarios
        if (!isSingleSchedule) {
          if (!horario.estilo) e[`horario_${index}_estilo`] = `Horario ${horarioNum}: Seleccione un estilo`
          if (!horario.nivel) e[`horario_${index}_nivel`] = `Horario ${horarioNum}: Seleccione un nivel`
          if (!horario.sala) e[`horario_${index}_sala`] = `Horario ${horarioNum}: Seleccione una sala`
        }
        
        // Validar campos comunes (con o sin múltiples horarios)
        if (horario.cupos <= 0) e[`horario_${index}_cupos`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}Cupos debe ser mayor a 0`
        if (!horario.profesor) e[`horario_${index}_profesor`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}Selecciona o crea un profesor`
        if (horario.dias.length === 0) e[`horario_${index}_dias`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}Seleccione al menos un día`
        if (!isAfter(horario.horaFin, horario.horaInicio)) e[`horario_${index}_horas`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}La hora de fin debe ser posterior a la de inicio`

        // Validar overrides
        Object.entries(horario.overrides).forEach(([k, o]: [string, any]) => {
          const label = DAY_OPTS.find((d) => d.key === k)?.label || k
          if ((o.start && !o.end) || (!o.start && o.end)) e[`horario_${index}_horas`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}Completa inicio y fin para ${label}`
          if (o.start && o.end && !isAfter(o.end, o.start)) e[`horario_${index}_horas`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}En ${label}, fin debe ser posterior a inicio`
        })

        // Validar sesiones
        const sesionesHorario = horario.dias.map((dayKey: string) => {
          const o = horario.overrides[dayKey] || {}
          return {
            day: dayKey,
            start: o.start || horario.horaInicio,
            end: o.end || horario.horaFin,
          }
        })
        sesionesHorario.forEach((s: any) => { 
          if (!s.start || !s.end) e[`horario_${index}_horas`] = `${!isSingleSchedule ? `Horario ${horarioNum}: ` : ''}Hay días sin horario completo`
        })
      })
    }

    return e
  }, [form, sessions, horarios])

  const canContinueFrom = (s: number) => {
    if (s === 0) return !errors.nombre && !errors.ciclo && !errors.programa && !errors.categoria && !errors.subcategoria && !errors.fechas
    if (s === 1) {
      // Validar que no haya errores relacionados con horarios (para un horario o múltiples)
      const hasHorarioErrors = Object.keys(errors).some(key => 
        key.startsWith('horario_')
      )
      return !hasHorarioErrors
    }
    if (s === 2) return form.paquetes.length > 0
    return true
  }

  const goNext = () => setStep((i: number) => Math.min(i + 1, steps.length - 1))
  const goPrev = () => setStep((i: number) => Math.max(i - 1, 0))

  const resumen = useMemo(() => ({
    ...form,
    totalClases: form.paquetes.reduce((acc, p) => acc + Number(p.cantidad || 0), 0),
  }), [form])

  // Función para cargar datos de oferta en modo edición
  const cargarOfertaParaEditar = async (ofertaId: number) => {
    try {
      showToast('info', '⏳ Cargando oferta...', 'Por favor espera')
      
      const oferta = await getOfertaCompleta(ofertaId)
      console.log('📦 Oferta cargada:', oferta)

      // Función helper para convertir números de día a claves del frontend
      // Backend: "1,2,3,4,5,6,7" donde 1=Lunes, 2=Martes, etc.
      // Frontend: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
      const convertirDiasBackendAFrontend = (diasString: string): string[] => {
        const diasNumeros = diasString.split(',').map(d => d.trim())
        const mapaDias: Record<string, string> = {
          '1': 'mon',   // Lunes
          '2': 'tue',   // Martes
          '3': 'wed',   // Miércoles
          '4': 'thu',   // Jueves
          '5': 'fri',   // Viernes
          '6': 'sat',   // Sábado
          '7': 'sun'    // Domingo
        }
        const diasConvertidos = diasNumeros.map(num => mapaDias[num]).filter(Boolean)
        console.log(`🗓️ Conversión días: "${diasString}" → ${JSON.stringify(diasConvertidos)}`)
        return diasConvertidos
      }
      
      // Activar modo edición
      setEditMode({ isEditing: true, ofertaId })
      
      // Mapear horarios del backend al formato del frontend
      const horariosFormateados = oferta.horarios.map((h: any, index: number) => {
        const diasArray = convertirDiasBackendAFrontend(h.dias)
        console.log(`🔍 Horario ${index}: dias backend="${h.dias}", diasArray=`, diasArray)
        
        return {
          id: `horario_${index}`,
          id_horario_backend: h.id_horario, // Guardar ID del backend para actualización
          dias: diasArray,
          horaInicio: h.hora_inicio,
          horaFin: h.hora_fin,
          flexible: false,
          overrides: {},
          estilo: h.estilo_id.toString(),
          nivel: h.nivel === 1 ? 'Básico' : h.nivel === 2 ? 'Intermedio' : 'Avanzado',
          sala: h.sala_id.toString(),
          cupos: h.capacidad,
          profesor: {
            id: h.profesor_id.toString(),
            name: `${h.profesor.persona.nombre} ${h.profesor.persona.apellido_paterno} ${h.profesor.persona.apellido_materno}`.trim(),
            nationality: h.profesor.pais_origen || '',
            styles: [h.estilo.nombre_estilo],
            instagram: h.profesor.redes_sociales || ''
          }
        }
      })

      console.log('📋 Horarios formateados:', horariosFormateados)

      // Mapear paquetes del backend al formato del frontend
      const paquetesFormateados = oferta.paquetes.map((p: any) => ({
        id_paquete_backend: p.id_paquete, // Guardar ID del backend para actualización
        nombre: p.nombre,
        cantidad: p.ilimitado ? 0 : p.cantidad_clases,
        precio: p.precio,
        ilimitado: p.ilimitado
      }))

      // Actualizar el formulario con los datos de la oferta
      setForm({
        proyecto: proyectos[0],
        programa: oferta.subcategoria.categoria.Programa_id_programa.toString(),
        ciclo: oferta.ciclo.nombre,
        categoria: oferta.subcategoria.Categoria_id_categoria.toString(),
        subcategoria: oferta.Subcategoria_id_subcategoria.toString(),
        nombre: oferta.nombre_oferta,
        nivel: 'Básico',
        cupos: 12,
        estado: estados[0],
        fechaInicio: oferta.fecha_inicio,
        fechaFin: oferta.fecha_fin,
        seRepiteSemanalmente: oferta.repite_semanalmente,
        cantidadCursos: oferta.cantidad_cursos,
        publico: oferta.publico_objetivo,
        grupoWhatsapp: oferta.whatsapplink || '',
        dias: horariosFormateados[0]?.dias || [],
        horaInicio: horariosFormateados[0]?.horaInicio || '18:00',
        horaFin: horariosFormateados[0]?.horaFin || '19:30',
        overrides: {},
        flexible: false,
        modalidad: modalidades[0],
        descripcion: oferta.descripcion || '',
        paquetes: paquetesFormateados
      })

      // Actualizar horarios
      setHorarios(horariosFormateados)
      setHorariosInitialized(true)

      // Cambiar a pestaña de nuevo curso
      setActiveTab('nuevo-curso')
      setStep(0)
      
      showToast('success', '✅ Oferta cargada', 'Puedes modificar los datos')
    } catch (error) {
      console.error('❌ Error al cargar oferta:', error)
      showToast('error', '❌ Error', 'No se pudo cargar la oferta')
    }
  }

  const publicar = async () => {
    // Validar que todos los campos requeridos estén completos
    const allErrors = Object.keys(errors)
    
    // Agregar validación de paquetes si no hay errores previos
    if (allErrors.length === 0 && (!form.paquetes || form.paquetes.length === 0)) {
      showToast('error', '❌ Error', 'Debe agregar al menos un paquete de clases')
      return
    }

    // Validar que los paquetes tengan nombres únicos y no vacíos
    if (form.paquetes && form.paquetes.length > 0) {
      const nombresVacios = form.paquetes.filter((p: any) => !p.nombre || p.nombre.trim() === '')
      if (nombresVacios.length > 0) {
        showToast('error', '❌ Error en paquetes', 'Todos los paquetes deben tener un nombre')
        return
      }

      const nombres = form.paquetes.map((p: any) => p.nombre.trim().toLowerCase())
      const nombresDuplicados = nombres.filter((n: string, idx: number) => nombres.indexOf(n) !== idx)
      if (nombresDuplicados.length > 0) {
        showToast('error', '❌ Nombres duplicados', `Los paquetes deben tener nombres únicos. Duplicados: ${nombresDuplicados.join(', ')}`)
        return
      }
    }
    
    if (allErrors.length > 0) {
      showToast('error', '❌ Faltan campos', `Completa los siguientes campos:\n${allErrors.map(key => errors[key]).join(', ')}`)
      return
    }

    try {
      // 1. Obtener el ID del ciclo seleccionado
      const cicloSeleccionado = ciclos.find(c => c.nombre === form.ciclo)
      if (!cicloSeleccionado) {
        showToast('error', '❌ Error', 'No se encontró el ciclo seleccionado')
        return
      }

      showToast('info', '⏳ Creando oferta...', 'Por favor espera')

      // 2. Crear la oferta
      const ofertaPayload = {
        ciclo_id_ciclo: Number(cicloSeleccionado.id),
        Subcategoria_id_subcategoria: Number(form.subcategoria),
        nombre_oferta: form.nombre,
        fecha_inicio: form.fechaInicio,
        fecha_fin: form.fechaFin,
        descripcion: form.descripcion || '',
        cantidad_cursos: Number(form.cantidadCursos) || 1,
        publico_objetivo: form.publico || 'todos',
        whatsapplink: form.grupoWhatsapp || null,
        repite_semanalmente: form.seRepiteSemanalmente || false
      }

      console.log('📦 Creando oferta:', ofertaPayload)
      
      let ofertaId: number
      
      // MODO EDICIÓN: Actualizar oferta existente
      if (editMode.isEditing && editMode.ofertaId) {
        showToast('info', '⏳ Actualizando oferta...', 'Por favor espera')
        const ofertaResponse = await updateOferta(editMode.ofertaId, ofertaPayload)
        ofertaId = editMode.ofertaId
        console.log('✅ Oferta actualizada:', ofertaResponse)
        showToast('success', '✅ Oferta actualizada', `ID: ${ofertaId}`)
      } 
      // MODO CREACIÓN: Crear nueva oferta
      else {
        const ofertaResponse = await createOferta(ofertaPayload)
        ofertaId = ofertaResponse.oferta.id_oferta
        console.log('✅ Oferta creada:', ofertaResponse)
        showToast('success', '✅ Oferta creada', `ID: ${ofertaId}`)
      }

      // 3. Crear o actualizar horarios
      showToast('info', editMode.isEditing ? '⏳ Actualizando horarios...' : '⏳ Creando horarios...', 'Por favor espera')
      
      const horariosToProcess = form.cantidadCursos > 1 ? horarios : [horarios[0]]
      
      console.log('🔍 Horarios a procesar:', horariosToProcess)
      console.log('🔍 Estilos disponibles:', estilos)
      console.log('🔍 Salas disponibles:', salas)
      
      for (const horario of horariosToProcess) {
        if (!horario) {
          console.warn('⚠️ Horario vacío, saltando...')
          continue
        }

        // Validar que el profesor exista
        if (!horario.profesor || !horario.profesor.id) {
          showToast('error', '❌ Error', 'Falta seleccionar un profesor en uno de los horarios')
          return
        }

        // Mapear días de string a números (mon=1, tue=2, etc.)
        const diasMapeados = horario.dias.map((dia: string) => {
          const dayMap: Record<string, number> = {
            'mon': 1,      // Lunes
            'tue': 2,      // Martes
            'wed': 3,      // Miércoles
            'thu': 4,      // Jueves
            'fri': 5,      // Viernes
            'sat': 6,      // Sábado
            'sun': 7,      // Domingo
            // También soportar nombres en español por compatibilidad
            'lunes': 1,
            'martes': 2,
            'miércoles': 3,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sábado': 6,
            'sabado': 6,
            'domingo': 7
          }
          return dayMap[dia.toLowerCase()] || 1
        })

        // Convertir días a string separado por comas (formato backend)
        const diasString = diasMapeados.join(',')

        // Mapear nivel de string a número
        const nivelMapeado = horario.nivel === 'Básico' ? 1 : horario.nivel === 'Intermedio' ? 2 : 3

        // Obtener IDs numéricos
        const estiloId = Number(horario.estilo)
        const salaId = Number(horario.sala)
        const profesorId = Number(horario.profesor.id)

        console.log('🔍 Procesando horario:', {
          estilo_original: horario.estilo,
          estilo_id: estiloId,
          sala_original: horario.sala,
          sala_id: salaId,
          profesor_original: horario.profesor,
          profesor_id: profesorId,
          nivel_original: horario.nivel,
          nivel_mapeado: nivelMapeado,
          dias_original: horario.dias,
          dias_mapeados: diasMapeados,
          dias_string: diasString
        })

        const horarioPayload = {
          oferta_id: ofertaId,
          estilo_id: estiloId,
          nivel: nivelMapeado,
          profesor_id: profesorId,
          sala_id: salaId,
          capacidad: horario.cupos || 12,
          dias: diasString,  // Backend espera string "1,3,5"
          hora_inicio: horario.horaInicio,
          hora_fin: horario.horaFin
        }

        // MODO EDICIÓN: Actualizar horario existente
        if (editMode.isEditing && horario.id_horario_backend) {
          console.log('📅 Actualizando horario con payload:', horarioPayload)
          const horarioResponse = await updateHorario(horario.id_horario_backend, horarioPayload)
          console.log('✅ Horario actualizado:', horarioResponse)
        } 
        // MODO CREACIÓN: Crear nuevo horario
        else {
          console.log('📅 Creando horario con payload:', horarioPayload)
          const horarioResponse = await createHorario(horarioPayload)
          console.log('✅ Horario creado:', horarioResponse)
        }
      }

      showToast('success', editMode.isEditing ? '✅ Horarios actualizados' : '✅ Horarios creados', `${horariosToProcess.length} horario(s) procesado(s)`)

      // 4. Crear o actualizar paquetes
      showToast('info', editMode.isEditing ? '⏳ Actualizando paquetes...' : '⏳ Creando paquetes...', 'Por favor espera')

      console.log('📦 Total de paquetes a procesar:', form.paquetes.length)
      
      for (let i = 0; i < form.paquetes.length; i++) {
        const paquete: any = form.paquetes[i]
        const paquetePayload = {
          nombre: paquete.nombre,
          dias_validez: 30,
          ilimitado: paquete.ilimitado || false,
          oferta_id: ofertaId,
          precio: paquete.precio,
          ...(paquete.ilimitado ? {} : { cantidad_clases: paquete.cantidad })
        }

        try {
          // MODO EDICIÓN: Actualizar paquete existente
          if (editMode.isEditing && paquete.id_paquete_backend) {
            console.log(`🎫 Actualizando paquete ${i + 1}/${form.paquetes.length}:`, paquetePayload)
            const paqueteResponse = await updatePaquete(paquete.id_paquete_backend, paquetePayload)
            console.log(`✅ Paquete ${i + 1} actualizado:`, paqueteResponse)
          } 
          // MODO CREACIÓN: Crear nuevo paquete
          else {
            console.log(`🎫 Creando paquete ${i + 1}/${form.paquetes.length}:`, paquetePayload)
            const paqueteResponse = await createPaquete(paquetePayload)
            console.log(`✅ Paquete ${i + 1} creado:`, paqueteResponse)
          }
        } catch (paqueteError: any) {
          console.error(`❌ Error al procesar paquete ${i + 1}:`, {
            nombre: paquete.nombre,
            error: paqueteError.response?.data,
            payload: paquetePayload
          })
          throw paqueteError // Re-lanzar el error para que el catch principal lo maneje
        }
      }

      // Mensaje de éxito final
      const mensajeExito = editMode.isEditing 
        ? '🎉 ¡Oferta actualizada!' 
        : '🎉 ¡Curso publicado!'
      const descripcionExito = editMode.isEditing
        ? 'La oferta, horarios y paquetes se actualizaron exitosamente'
        : 'La oferta, horarios y paquetes se crearon exitosamente'
      
      showToast('success', mensajeExito, descripcionExito)
      
      // Invalidar queries para refrescar datos
      qc.invalidateQueries({ queryKey: ['ofertas'] })
      
      // Limpiar formulario y volver al inicio
      setTimeout(() => {
        resetForm()
        setStep(0)
        setActiveTab('ofertas')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Error al publicar curso:', error)
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = 'Ocurrió un error inesperado'
      
      if (error.response?.status === 409) {
        errorMessage = error.response?.data?.error || error.response?.data?.message || 'Ya existe un registro con estos datos. Por favor verifica la información.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showToast('error', '❌ Error al publicar', errorMessage)
    }
  }

  const suggested = useMemo(() => {
    const q = form.nombre.toLowerCase()
    return TEACHERS.filter((t) => t.styles.some((s) => q.includes(s.toLowerCase())))
  }, [form.nombre])

  // Loading state de cualquiera de las queries principales
  const isLoading = programasLoading || categoriasLoading || subcategoriasLoading || ciclosLoading || salasLoading || estilosLoading

  // Hook para mostrar notificaciones
  const { showToast } = useToast()

  // Funciones para crear nuevos elementos (se pasarán a componentes hijos)
  const handleCreatePrograma = (programa: Omit<Programa, 'id'>) => {
    createProgramaMutation.mutate(programa, {
      onSuccess: () => {
        showToast('success', '✨ Programa creado', 'El programa se ha creado exitosamente')
      },
      onError: () => {
        showToast('error', '❌ Error al crear programa', 'No se pudo crear el programa. Intenta nuevamente.')
      }
    })
  }
  
  const handleCreateCategoria = (categoria: Omit<Categoria, 'id'>) => {
    createCategoriaMutation.mutate(categoria, {
      onSuccess: () => {
        showToast('success', '✨ Categoría creada', 'La categoría se ha creado exitosamente')
      },
      onError: () => {
        showToast('error', '❌ Error al crear categoría', 'No se pudo crear la categoría. Intenta nuevamente.')
      }
    })
  }
  
  const handleCreateSubcategoria = (subcategoria: Omit<Subcategoria, 'id'>) => {
    createSubcategoriaMutation.mutate(subcategoria, {
      onSuccess: () => {
        showToast('success', '✨ Subcategoría creada', 'La subcategoría se ha creado exitosamente')
      },
      onError: () => {
        showToast('error', '❌ Error al crear subcategoría', 'No se pudo crear la subcategoría. Intenta nuevamente.')
      }
    })
  }
  
  const handleCreateCiclo = (ciclo: Omit<Ciclo, 'id'>) => {
    createCicloMutation.mutate(ciclo, {
      onSuccess: () => {
        console.log('✅ Ciclo creado exitosamente')
        showToast('success', '✨ Ciclo creado', 'El ciclo se ha creado exitosamente')
      },
      onError: (error) => {
        console.error('❌ Error al crear ciclo:', error)
        showToast('error', '❌ Error al crear ciclo', 'No se pudo crear el ciclo. Verifica tu conexión.')
      }
    })
  }

  const handleUpdateCiclo = (id: number, ciclo: Omit<Ciclo, 'id'>) => {
    updateCicloMutation.mutate({ id, ciclo }, {
      onSuccess: () => {
        showToast('success', '✅ Ciclo actualizado', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeleteCiclo = (id: number) => {
    deleteCicloMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Ciclo eliminado', 'El ciclo se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar el ciclo.')
      }
    })
  }

  // Handlers para Programas
  const handleUpdatePrograma = (id: number, programa: Omit<Programa, 'id'>) => {
    updateProgramaMutation.mutate({ id, programa }, {
      onSuccess: () => {
        showToast('success', '✅ Programa actualizado', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeletePrograma = (id: number) => {
    deleteProgramaMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Programa eliminado', 'El programa se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar el programa.')
      }
    })
  }

  // Handlers para Categorías
  const handleUpdateCategoria = (id: number, categoria: Omit<Categoria, 'id'>) => {
    updateCategoriaMutation.mutate({ id, categoria }, {
      onSuccess: () => {
        showToast('success', '✅ Categoría actualizada', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeleteCategoria = (id: number) => {
    deleteCategoriaMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Categoría eliminada', 'La categoría se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar la categoría.')
      }
    })
  }

  // Handlers para Subcategorías
  const handleUpdateSubcategoria = (id: number, subcategoria: Omit<Subcategoria, 'id'>) => {
    updateSubcategoriaMutation.mutate({ id, subcategoria }, {
      onSuccess: () => {
        showToast('success', '✅ Subcategoría actualizada', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeleteSubcategoria = (id: number) => {
    deleteSubcategoriaMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Subcategoría eliminada', 'La subcategoría se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar la subcategoría.')
      }
    })
  }

  // Handlers para Salas
  const handleCreateSala = (sala: any) => {
    createSalaMutation.mutate(sala, {
      onSuccess: () => {
        showToast('success', '✨ Sala creada', 'La sala se ha creado exitosamente')
      },
      onError: () => {
        showToast('error', '❌ Error al crear sala', 'No se pudo crear la sala. Intenta nuevamente.')
      }
    })
  }

  const handleUpdateSala = (id: number, sala: any) => {
    updateSalaMutation.mutate({ id, sala }, {
      onSuccess: () => {
        showToast('success', '✅ Sala actualizada', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeleteSala = (id: number) => {
    deleteSalaMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Sala eliminada', 'La sala se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar la sala.')
      }
    })
  }

  // Handlers para Estilos
  const handleCreateEstilo = (estilo: any) => {
    createEstiloMutation.mutate(estilo, {
      onSuccess: () => {
        showToast('success', '✨ Estilo creado', 'El estilo se ha creado exitosamente')
      },
      onError: () => {
        showToast('error', '❌ Error al crear estilo', 'No se pudo crear el estilo. Intenta nuevamente.')
      }
    })
  }

  const handleUpdateEstilo = (id: number, estilo: any) => {
    updateEstiloMutation.mutate({ id, estilo }, {
      onSuccess: () => {
        showToast('success', '✅ Estilo actualizado', 'Los cambios se han guardado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al actualizar', 'No se pudieron guardar los cambios.')
      }
    })
  }

  const handleDeleteEstilo = (id: number) => {
    deleteEstiloMutation.mutate(id, {
      onSuccess: () => {
        showToast('success', '🗑️ Estilo eliminado', 'El estilo se ha eliminado correctamente')
      },
      onError: () => {
        showToast('error', '❌ Error al eliminar', 'No se pudo eliminar el estilo.')
      }
    })
  }

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto p-6">
     
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programas y Cursos</h1>
          <p className="text-muted-foreground">Gestiona programas, ofertas y crea nuevos cursos.</p>
        </div>
      </div>

      {/* Navegación simple */}
      <SimpleNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-3xl mx-auto">
        {/* Contenido según la pestaña activa */}
        {activeTab === 'programas' && (
          <ProgramasView 
            programas={programas}
            ciclos={ciclos}
            createCiclo={handleCreateCiclo}
            updateCiclo={handleUpdateCiclo}
            deleteCiclo={handleDeleteCiclo}
            createPrograma={handleCreatePrograma}
            updatePrograma={handleUpdatePrograma}
            deletePrograma={handleDeletePrograma}
            categorias={categorias}
            createCategoria={handleCreateCategoria}
            updateCategoria={handleUpdateCategoria}
            deleteCategoria={handleDeleteCategoria}
            subcategorias={subcategorias}
            createSubcategoria={handleCreateSubcategoria}
            updateSubcategoria={handleUpdateSubcategoria}
            deleteSubcategoria={handleDeleteSubcategoria}
            salas={salas}
            createSala={handleCreateSala}
            updateSala={handleUpdateSala}
            deleteSala={handleDeleteSala}
            estilos={estilos}
            createEstilo={handleCreateEstilo}
            updateEstilo={handleUpdateEstilo}
            deleteEstilo={handleDeleteEstilo}
          />
        )}

        {activeTab === 'ofertas' && (
          <OfferingView 
            ciclos={ciclos}
            subcategorias={subcategorias}
            onEditOferta={cargarOfertaParaEditar}
          />
        )}

        {activeTab === 'nuevo-curso' && (
          <>
            {editMode.isEditing && editMode.ofertaId && (
              <div className="mb-4 p-4 bg-pink-100 border border-femme-magenta rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-femme-magenta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-femme-magenta">
                        Modo Edición - Oferta #{editMode.ofertaId}
                      </p>
                      <p className="text-xs text-femme-magenta">
                        Los cambios que realices actualizarán esta oferta existente.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      resetForm()
                      setStep(0)
                      setActiveTab('ofertas')
                      showToast('info', 'ℹ️ Edición cancelada', 'Se descartaron los cambios')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar edición
                  </button>
                </div>
              </div>
            )}
            
            <Stepper step={step} setStep={(i) => setStep(i)} steps={steps} />

            {/* Contenido principal centrado */}
            <div className="space-y-6">
          {step === 0 && (
            <CourseDataStep
              form={form}
              setField={setField}
              errors={errors}
              ciclos={ciclos}
              createCiclo={handleCreateCiclo}
              programas={programas}
              createPrograma={handleCreatePrograma}
              categorias={categorias}
              createCategoria={handleCreateCategoria}
              subcategorias={subcategorias}
              createSubcategoria={handleCreateSubcategoria}
              proyectos={proyectos}
              niveles={niveles}
             
              teacherQuery={teacherQuery}
              setTeacherQuery={setTeacherQuery}
              selectedTeacher={selectedTeacher}
              setSelectedTeacher={setSelectedTeacher}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              newTeacher={newTeacher}
              setNewTeacher={setNewTeacher}
              
              goNext={goNext}
            />
          )}

          {step === 1 && (
            <ScheduleStepNew
              form={form}
              setField={setField}
              errors={errors}
              sessions={sessions}
              goNext={goNext}
              goPrev={goPrev}
              canContinueFrom={canContinueFrom}
              horarios={horarios}
              setHorarios={setHorarios}
              salas={salas}
              estilos={estilos}
            />
          )}

          {step === 2 && (
            <PackagesStep
              form={form}
              setField={setField}
              goNext={goNext}
              goPrev={goPrev}
              canContinueFrom={canContinueFrom}
            />
          )}

          {step === 3 && (
            <ReviewStep
              form={form}
              errors={errors}
              sessions={sessions}
              selectedTeacher={selectedTeacher}
              teacherQuery={teacherQuery}
              publicar={publicar}
              programas={programas}
              categorias={categorias}
              subcategorias={subcategorias}
              horarios={horarios.length > 0 ? horarios : undefined}
              estilos={estilos}
              salas={salas}
            />
          )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
