import { api } from '@/lib/api'

// ================= UTILIDADES DE FECHAS =================
/**
 * Convierte fecha del frontend (YYYY-MM-DD) al formato que espera tu backend
 * Si tu backend espera YYYY-MM-DD, esta función no cambia nada
 * Si espera otro formato, modifica esta función
 */
export const formatDateForBackend = (frontendDate: string): string => {
  // Asumiendo que tu backend espera YYYY-MM-DD
  // Si necesitas otro formato, cambia esta función
  return frontendDate
}

/**
 * Convierte fecha del backend al formato del frontend (YYYY-MM-DD)
 */
export const formatDateFromBackend = (backendDate: string): string => {
  // Asumiendo que tu backend devuelve YYYY-MM-DD
  // Si viene en otro formato, convierte aquí
  return backendDate
}

// ================= INTERFACES BASADAS EN TU BACKEND =================
export interface Programa {
  id_programa: number
  nombre_programa: string
  descricpcion_programa: string
  estado: boolean
}

export interface Categoria {
  id_categoria: number
  Programa_id_programa: number
  nombre_categoria: string
  descripcion_categoria: string
  estado: boolean
}

export interface Subcategoria {
  id_subcategoria: number
  Categoria_id_categoria: number
  nombre_subcategoria: string
  descripcion_subcategoria: string
  estado: boolean
}

export interface Sala {
  id_sala: number
  nombre_sala: string
  ubicacion: string
  link_ubicacion: string
  departamento: string
  zona: string
  estado: boolean
}

export interface Estilo {
  id_estilo: number
  nombre_estilo: string
  descripcion_estilo: string
  beneficios_estilo: string
  estado: boolean
}

export interface Ciclo {
  id_ciclo: number
  nombre: string
  inicio: string
  fin: string
  estado: boolean
}

export interface Oferta {
  id_oferta?: number
  ciclo_id_ciclo: number
  Subcategoria_id_subcategoria: number
  nombre_oferta: string
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
  cantidad_cursos: number
  publico_objetivo: string
  whatsapplink: string | null
  repite_semanalmente: boolean
  paquetes?: Paquete[]
  horarios?: any[]
}

export interface Paquete {
  id_paquete?: number
  nombre_paquete: string
  precio: number
  cantidad_clases: number
  descripcion: string
}

// ================= PROGRAMAS =================
export const fetchProgramasBackend = async (): Promise<Programa[]> => {
  try {
    const response = await api.get('/programas')
    return response.data
  } catch (error) {
    console.error('Error fetching programs:', error)
    throw error
  }
}

export const createProgramaBackend = async (programData: {
  nombre_programa: string
  descricpcion_programa: string
  estado?: boolean
}) => {
  try {
    console.log('🚀 Sending programa data to backend:', programData)
    console.log('🌐 URL being called:', `${api.defaults.baseURL}/programas`)
    const response = await api.post('/programas', {
      nombre_programa: programData.nombre_programa,
      descricpcion_programa: programData.descricpcion_programa,
      estado: programData.estado ?? true
    })
    console.log('✅ Backend full response:', response)
    console.log('✅ Backend response.data:', response.data)
    console.log('✅ Backend response.data.programa:', response.data.programa)
    
    // Extraer el programa del objeto de respuesta
    const programa = response.data.programa || response.data
    console.log('✅ Extracted programa:', programa)
    return programa
  } catch (error: any) {
    console.error('❌ Error creating program:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error details:', error.response?.data)
    console.error('❌ Error status:', error.response?.status)
    throw error
  }
}

export const updateProgramaBackend = async (id: number, programData: {
  nombre_programa: string
  descricpcion_programa: string
  estado?: boolean
}) => {
  try {
    console.log('🚀 Updating programa:', id, programData)
    const response = await api.put(`/programas/${id}`, programData)
    console.log('✅ Backend response for update programa:', response.data)
    const programa = response.data.programa || response.data
    return programa
  } catch (error: any) {
    console.error('❌ Error updating programa:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

export const deleteProgramaBackend = async (id: number) => {
  try {
    console.log('🗑️ Deleting programa:', id)
    const response = await api.delete(`/programas/${id}`)
    console.log('✅ Programa deleted:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Error deleting programa:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

// ================= CATEGORÍAS =================
export const fetchCategoriasBackend = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get('/categorias/active')
    return response.data
  } catch (error) {
    console.error('Error fetching categorias:', error)
    throw error
  }
}

export const fetchCategoriasByProgramaBackend = async (programaId: number): Promise<Categoria[]> => {
  try {
    const response = await api.get(`/categorias/programa/${programaId}/active`)
    return response.data
  } catch (error) {
    console.error('Error fetching categorias by programa:', error)
    throw error
  }
}

export const createCategoriaBackend = async (categoriaData: {
  Programa_id_programa: number
  nombre_categoria: string
  descripcion_categoria: string
}) => {
  try {
    console.log('🚀 Sending categoria data to backend:', categoriaData)
    const response = await api.post('/categorias', categoriaData)
    console.log('✅ Backend full response:', response)
    console.log('✅ Backend response.data:', response.data)
    console.log('✅ Backend response.data.categoria:', response.data.categoria)
    
    // Extraer la categoría del objeto de respuesta
    const categoria = response.data.categoria || response.data
    console.log('✅ Extracted categoria:', categoria)
    return categoria
  } catch (error: any) {
    console.error('❌ Error creating categoria:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error details:', error.response?.data)
    throw error
  }
}

export const updateCategoriaBackend = async (id: number, categoriaData: {
  Programa_id_programa: number
  nombre_categoria: string
  descripcion_categoria: string
}) => {
  try {
    console.log('🚀 Updating categoria:', id, categoriaData)
    const response = await api.put(`/categorias/${id}`, categoriaData)
    console.log('✅ Backend response for update categoria:', response.data)
    const categoria = response.data.categoria || response.data
    return categoria
  } catch (error: any) {
    console.error('❌ Error updating categoria:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

export const deleteCategoriaBackend = async (id: number) => {
  try {
    console.log('🗑️ Deleting categoria:', id)
    const response = await api.delete(`/categorias/${id}`)
    console.log('✅ Categoria deleted:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Error deleting categoria:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

// ================= SUBCATEGORÍAS =================
export const fetchSubcategoriasBackend = async (): Promise<Subcategoria[]> => {
  try {
    const response = await api.get('/subcategorias/active')
    return response.data
  } catch (error) {
    console.error('Error fetching subcategorias:', error)
    throw error
  }
}

export const fetchSubcategoriasByCategoriaBackend = async (categoriaId: number): Promise<Subcategoria[]> => {
  try {
    const response = await api.get(`/subcategorias/categoria/${categoriaId}/active`)
    return response.data
  } catch (error) {
    console.error('Error fetching subcategorias by categoria:', error)
    throw error
  }
}

export const createSubcategoriaBackend = async (subcategoriaData: {
  Categoria_id_categoria: number
  nombre_subcategoria: string
  descripcion_subcategoria: string
}) => {
  try {
    console.log('🚀 Sending subcategoria data to backend:', subcategoriaData)
    const response = await api.post('/subcategorias', subcategoriaData)
    console.log('✅ Backend full response:', response)
    console.log('✅ Backend response.data:', response.data)
    console.log('✅ Backend response.data.subcategoria:', response.data.subcategoria)
    
    // Extraer la subcategoría del objeto de respuesta
    const subcategoria = response.data.subcategoria || response.data
    console.log('✅ Extracted subcategoria:', subcategoria)
    return subcategoria
  } catch (error: any) {
    console.error('❌ Error creating subcategoria:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error details:', error.response?.data)
    throw error
  }
}

export const updateSubcategoriaBackend = async (id: number, subcategoriaData: {
  Categoria_id_categoria: number
  nombre_subcategoria: string
  descripcion_subcategoria: string
}) => {
  try {
    console.log('🚀 Updating subcategoria:', id, subcategoriaData)
    const response = await api.put(`/subcategorias/${id}`, subcategoriaData)
    console.log('✅ Backend response for update subcategoria:', response.data)
    const subcategoria = response.data.subcategoria || response.data
    return subcategoria
  } catch (error: any) {
    console.error('❌ Error updating subcategoria:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

export const deleteSubcategoriaBackend = async (id: number) => {
  try {
    console.log('🗑️ Deleting subcategoria:', id)
    const response = await api.delete(`/subcategorias/${id}`)
    console.log('✅ Subcategoria deleted:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Error deleting subcategoria:', error)
    console.error('❌ Error message:', error.message)
    throw error
  }
}

// ================= SALAS =================
export const fetchSalasBackend = async (): Promise<Sala[]> => {
  try {
    const response = await api.get('/salas/active')
    return response.data
  } catch (error) {
    console.error('Error fetching salas:', error)
    throw error
  }
}

export const createSalaBackend = async (salaData: {
  nombre_sala: string
  ubicacion: string
  link_ubicacion: string
  departamento: string
  zona: string
}) => {
  try {
    const response = await api.post('/salas', salaData)
    return response.data.sala
  } catch (error) {
    console.error('Error creating sala:', error)
    throw error
  }
}

export const updateSalaBackend = async (id: number, salaData: Partial<{
  nombre_sala: string
  ubicacion: string
  link_ubicacion: string
  departamento: string
  zona: string
}>): Promise<Sala> => {
  try {
    const response = await api.put(`/salas/${id}`, salaData)
    return response.data.sala
  } catch (error) {
    console.error('Error updating sala:', error)
    throw error
  }
}

export const deleteSalaBackend = async (id: number): Promise<void> => {
  try {
    await api.delete(`/salas/${id}`)
  } catch (error) {
    console.error('Error deleting sala:', error)
    throw error
  }
}

// ================= ESTILOS =================
export const fetchEstilosBackend = async (): Promise<Estilo[]> => {
  try {
    const response = await api.get('/estilos/active')
    return response.data
  } catch (error) {
    console.error('Error fetching estilos:', error)
    throw error
  }
}

export const createEstiloBackend = async (estiloData: {
  nombre_estilo: string
  descripcion_estilo: string
  beneficios_estilo: string
}) => {
  try {
    const response = await api.post('/estilos', estiloData)
    return response.data.estilo
  } catch (error) {
    console.error('Error creating estilo:', error)
    throw error
  }
}

export const updateEstiloBackend = async (id: number, estiloData: Partial<{
  nombre_estilo: string
  descripcion_estilo: string
  beneficios_estilo: string
}>): Promise<Estilo> => {
  try {
    const response = await api.put(`/estilos/${id}`, estiloData)
    return response.data.estilo
  } catch (error) {
    console.error('Error updating estilo:', error)
    throw error
  }
}

export const deleteEstiloBackend = async (id: number): Promise<void> => {
  try {
    await api.delete(`/estilos/${id}`)
  } catch (error) {
    console.error('Error deleting estilo:', error)
    throw error
  }
}

// ================= CICLOS =================
export const fetchCiclosBackend = async (): Promise<Ciclo[]> => {
  try {
    console.log('🔄 Fetching ciclos from backend...')
    const response = await api.get('/ciclos/active')
    console.log('✅ Ciclos response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching ciclos:', error)
    throw error
  }
}

export const createCicloBackend = async (cicloData: {
  nombre: string
  inicio: string
  fin: string
}) => {
  try {
    // Transformar fechas antes de enviar
    const dataWithFormattedDates = {
      nombre: cicloData.nombre,
      inicio: formatDateForBackend(cicloData.inicio),
      fin: formatDateForBackend(cicloData.fin)
    }
    console.log('🚀 Sending ciclo data to backend:', dataWithFormattedDates)
    console.log('🌐 URL being called:', `${api.defaults.baseURL}/ciclos`)
    const response = await api.post('/ciclos', dataWithFormattedDates)
    console.log('✅ Backend full response:', response)
    console.log('✅ Backend response.data:', response.data)
    console.log('✅ Backend response.data.ciclo:', response.data.ciclo)
    
    // Extraer el ciclo del objeto de respuesta
    const ciclo = response.data.ciclo || response.data
    console.log('✅ Extracted ciclo:', ciclo)
    return ciclo
  } catch (error: any) {
    console.error('❌ Error creating ciclo:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error details:', error.response?.data)
    console.error('❌ Error status:', error.response?.status)
    throw error
  }
}

export const updateCicloBackend = async (id: number, cicloData: {
  nombre: string
  inicio: string
  fin: string
}) => {
  try {
    // Transformar fechas antes de enviar
    const dataWithFormattedDates = {
      nombre: cicloData.nombre,
      inicio: formatDateForBackend(cicloData.inicio),
      fin: formatDateForBackend(cicloData.fin)
    }
    console.log(`🚀 Updating ciclo ${id} with data:`, dataWithFormattedDates)
    const response = await api.put(`/ciclos/${id}`, dataWithFormattedDates)
    console.log('✅ Backend response for update ciclo:', response.data)
    // Extraer el ciclo del objeto de respuesta si viene anidado
    return response.data.ciclo || response.data
  } catch (error) {
    console.error(`❌ Error updating ciclo ${id}:`, error)
    throw error
  }
}

export const deleteCicloBackend = async (id: number) => {
  try {
    const response = await api.delete(`/ciclos/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting ciclo:', error)
    throw error
  }
}

// ================= CURSOS =================
export interface CreateCourseData {
  ciclo: string
  programa: number
  categoria: number
  subcategoria: number
  nombre: string
  descripcion?: string
  fechaInicio: string
  fechaFin: string
  cantidadCursos: number
  seRepiteSemanalmente: boolean
  horarios: any[]
  paquetes: any[]
}

export const createCourseBackend = async (courseData: CreateCourseData) => {
  try {
    // Mapea los datos según tu backend
    const payload = {
      nombre_curso: courseData.nombre,
      descripcion_curso: courseData.descripcion,
      fecha_inicio: courseData.fechaInicio,
      fecha_fin: courseData.fechaFin,
      programa_id: courseData.programa,
      categoria_id: courseData.categoria,
      subcategoria_id: courseData.subcategoria,
      cantidad_cursos: courseData.cantidadCursos,
      se_repite_semanalmente: courseData.seRepiteSemanalmente,
      horarios: courseData.horarios,
      paquetes: courseData.paquetes
    }
    
    const response = await api.post('/cursos', payload)
    return response.data
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

// ================= OBTENER OFERTA COMPLETA =================
export const getOfertaCompleta = async (ofertaId: number) => {
  try {
    const response = await api.get(`/ofertas/${ofertaId}/completa`)
    return response.data
  } catch (error) {
    console.error('Error fetching oferta completa:', error)
    throw error
  }
}

// ================= OBTENER OFERTAS ACTIVAS =================
export const getOfertasActivas = async (): Promise<Oferta[]> => {
  try {
    const response = await api.get('/ofertas/active')
    return response.data
  } catch (error) {
    console.error('Error fetching ofertas activas:', error)
    throw error
  }
}

// Alias para compatibilidad con diferentes nombres
export const fetchOfertasActivasBackend = getOfertasActivas

// ================= ACTUALIZAR OFERTA =================
export const updateOferta = async (ofertaId: number, data: any) => {
  try {
    const response = await api.put(`/ofertas/${ofertaId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating oferta:', error)
    throw error
  }
}

// ================= ACTUALIZAR HORARIO =================
export const updateHorario = async (horarioId: number, data: any) => {
  try {
    const response = await api.put(`/horarios/${horarioId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating horario:', error)
    throw error
  }
}

// ================= ACTUALIZAR PAQUETE =================
export const updatePaquete = async (paqueteId: number, data: any) => {
  try {
    const response = await api.put(`/paquetes/${paqueteId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating paquete:', error)
    throw error
  }
}

// ================= PROMOCIONES =================
interface UploadImageResponse {
  success: boolean
  filename: string
  imageUrl: string
}

export const uploadPromocionImagen = async (file: File): Promise<string> => {
  try {
    console.log('📤 Subiendo archivo:', file.name, file.type, file.size);
    const formData = new FormData()
    // El backend espera el campo 'imagen' (sin la 'e')
    formData.append('imagen', file)

    const response = await api.post<UploadImageResponse>(
      '/promociones/upload-imagen',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    console.log('✅ Respuesta de upload completa:', response.data);
    console.log('🖼️ ImageUrl retornada:', response.data.imageUrl);
    console.log('📁 Filename:', response.data.filename);
    
    // Retornar directamente el imageUrl que viene del backend
    return response.data.imageUrl;
  } catch (error: any) {
    console.error('❌ Error uploading promocion image:', error);
    console.error('❌ Error response:', error?.response?.data);
    throw error
  }
}

interface CreatePromocionPayload {
  nombre_promocion: string
  descripcion?: string
  fecha_inicio?: string
  fecha_fin?: string
  Oferta_id_oferta: number
  porcentaje_descuento?: number
  paquetes_especificos?: string // CSV: "17,18,19"
  publico_objetivo?: string
  img?: string
  tiene_sorteo?: boolean
  cantidad_premios?: number
  cantidad_beneficiarios?: number
  premios?: number[] // Array de descuentos para sorteos
  aplica_nuevos_usuarios?: boolean
}

interface CreatePromocionResponse {
  message: string
  promocion: {
    id_promocion: number
    nombre_promocion: string
    descricpcion?: string
    fecha_inicio?: string
    fecha_fin?: string
    Oferta_id_oferta: number
    porcentaje_descuento?: number
    paquetes_especificos?: string
    publico_objetivo?: string
    img?: string
    tiene_sorteo?: boolean
    cantidad_premios?: number
    premios_descuentos?: any
    aplica_nuevos_usuarios?: boolean
    estado: boolean
  }
  premios?: Array<{
    id_premio: number
    descuento: number
    estado: boolean
    Promocion_id_promocion: number
  }>
  informacion_adicional: {
    id_promocion: number
    descuento?: number
    tiene_sorteo?: boolean
    premios_creados?: number
  }
}

export const createPromocion = async (
  data: {
    name: string
    details?: string
    startDate?: string
    deadline?: string
    ofertaId: string
    percent?: number
    paqueteIds?: string[]
    imageUrl?: string
    tieneSorteo?: boolean
    cantidadPremios?: number
    premios?: number[]
    cantidadBeneficiarios?: number
  }
): Promise<CreatePromocionResponse> => {
  try {
    const payload: CreatePromocionPayload = {
      nombre_promocion: data.name,
      descripcion: data.details,
      fecha_inicio: data.startDate,
      fecha_fin: data.deadline,
      Oferta_id_oferta: parseInt(data.ofertaId),
      porcentaje_descuento: data.percent,
      paquetes_especificos: data.paqueteIds?.join(','),
      publico_objetivo: 'General', // Default value
      img: data.imageUrl,
      tiene_sorteo: data.tieneSorteo || false,
      cantidad_premios: data.cantidadPremios || 0,
      premios: data.tieneSorteo && data.premios ? data.premios : undefined,
      cantidad_beneficiarios: data.cantidadBeneficiarios || undefined,
      aplica_nuevos_usuarios: true, // Default value
    }

    console.log('📤 Payload enviado al backend:', JSON.stringify(payload, null, 2));
    const response = await api.post<CreatePromocionResponse>('/promociones', payload)
    console.log('✅ Respuesta completa del backend:', response);
    console.log('✅ Response.data:', response.data);
    return response.data
  } catch (error: any) {
    console.error('❌ Error creating promocion:', error)
    console.error('❌ Error response data:', error?.response?.data)
    console.error('❌ Error message:', error?.message)
    throw error
  }
}

export const fetchPromociones = async () => {
  try {
    const response = await api.get('/promociones/activas')
    return response.data
  } catch (error) {
    console.error('Error fetching promociones:', error)
    throw error
  }
}

export const fetchPaqueteInfo = async (paqueteId: number) => {
  try {
    const response = await api.get(`/paquetes/${paqueteId}/info-completa`)
    return response.data
  } catch (error) {
    console.error('Error fetching paquete info:', error)
    throw error
  }
}

export const togglePromocionActivo = async (id: number, activo: boolean) => {
  try {
    const response = await api.put(`/promociones/${id}`, { activo })
    return response.data
  } catch (error) {
    console.error('Error toggling promocion activo:', error)
    throw error
  }
}

export const deletePromocionLogico = async (id: number) => {
  try {
    const response = await api.delete(`/promociones/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting promocion:', error)
    throw error
  }
}

// ================= PERMISOS =================
export const fetchPermisosDetallados = async () => {
  try {
    const response = await api.get('/permisos/detallados')
    return response.data
  } catch (error) {
    console.error('Error fetching permisos:', error)
    throw error
  }
}

export const aprobarPermiso = async (permisoId: number, respondidaPor: number) => {
  try {
    const response = await api.post(`/permisos/${permisoId}/aprobar`, {
      respondida_por: respondidaPor
    })
    return response.data
  } catch (error) {
    console.error('Error aprobando permiso:', error)
    throw error
  }
}

export const rechazarPermiso = async (permisoId: number, respondidaPor: number, motivoRechazo: string) => {
  try {
    const response = await api.post(`/permisos/${permisoId}/rechazar`, {
      respondida_por: respondidaPor,
      motivo_rechazo: motivoRechazo
    })
    return response.data
  } catch (error) {
    console.error('Error rechazando permiso:', error)
    throw error
  }
}