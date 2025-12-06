// Servicio de integración que maneja la conversión entre frontend y backend
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchProgramasBackend,
  createProgramaBackend,
  updateProgramaBackend,
  deleteProgramaBackend,
  fetchCategoriasBackend,
  fetchCategoriasByProgramaBackend,
  createCategoriaBackend,
  updateCategoriaBackend,
  deleteCategoriaBackend,
  fetchSubcategoriasBackend,
  fetchSubcategoriasByCategoriaBackend,
  createSubcategoriaBackend,
  updateSubcategoriaBackend,
  deleteSubcategoriaBackend,
  fetchSalasBackend,
  createSalaBackend,
  fetchEstilosBackend,
  createEstiloBackend,
  fetchCiclosBackend,
  createCicloBackend,
  updateCicloBackend,
  deleteCicloBackend,
  updateSalaBackend,
  deleteSalaBackend,
  updateEstiloBackend,
  deleteEstiloBackend,
  getOfertasActivas,
} from './backend'
import * as mappers from './mappers'
import { 
  Programa as ProgramaFrontend, 
  Categoria as CategoriaFrontend, 
  Subcategoria as SubcategoriaFrontend,
  Ciclo as CicloFrontend,
  Sala as SalaFrontend,
  Estilo as EstiloFrontend
} from '../pages/componentsProgramasAndCourses/ui/ManageListDialog'

// ================= QUERY KEYS =================
export const queryKeys = {
  programas: ['programas'],
  categorias: (programaId?: string) => ['categorias', programaId],
  subcategorias: (categoriaId?: string) => ['subcategorias', categoriaId],
  ciclos: ['ciclos'],
  salas: ['salas'],
  estilos: ['estilos'],
  ofertas: ['ofertas'],
}

// ================= HOOKS PARA PROGRAMAS =================
export const useProgramas = () => {
  return useQuery({
    queryKey: queryKeys.programas,
    queryFn: async () => {
      console.log('🔄 [useProgramas] Fetching programas desde backend...')
      const programas = await fetchProgramasBackend()
      console.log('📦 [useProgramas] Programas recibidos del backend:', programas)
      const mapped = mappers.mapProgramasToFrontend(programas)
      console.log('✅ [useProgramas] Programas mapeados al frontend:', mapped)
      return mapped
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useCreatePrograma = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (programa: Omit<ProgramaFrontend, 'id'>) => {
      console.log('🔵 [useCreatePrograma] Iniciando creación con:', programa)
      const programaBackend = mappers.mapProgramaToBackend(programa)
      console.log('🔵 [useCreatePrograma] Programa mapeado a backend:', programaBackend)
      const created = await createProgramaBackend(programaBackend)
      console.log('🔵 [useCreatePrograma] Programa creado desde backend:', created)
      const mappedToFrontend = mappers.mapProgramaToFrontend(created)
      console.log('🔵 [useCreatePrograma] Programa final mapeado a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreatePrograma] onSuccess ejecutado con data:', data)
      console.log('🔄 [useCreatePrograma] Invalidando queries...')
      await queryClient.invalidateQueries({ queryKey: queryKeys.programas })
      console.log('🔄 [useCreatePrograma] Refetcheando queries...')
      await queryClient.refetchQueries({ queryKey: queryKeys.programas })
      console.log('✅ [useCreatePrograma] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreatePrograma] Error en mutación:', error)
    }
  })
}

export const useUpdatePrograma = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, programa }: { id: number, programa: Omit<ProgramaFrontend, 'id'> }) => {
      const programaBackend = mappers.mapProgramaToBackend(programa)
      const updated = await updateProgramaBackend(id, programaBackend)
      return mappers.mapProgramaToFrontend(updated)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.programas })
      await queryClient.refetchQueries({ queryKey: queryKeys.programas })
    },
  })
}

export const useDeletePrograma = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteProgramaBackend(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.programas })
      await queryClient.refetchQueries({ queryKey: queryKeys.programas })
    },
  })
}

// ================= HOOKS PARA CATEGORÍAS =================
export const useCategorias = (programaId?: string) => {
  return useQuery({
    queryKey: queryKeys.categorias(programaId),
    queryFn: async () => {
      if (programaId) {
        const categorias = await fetchCategoriasByProgramaBackend(parseInt(programaId))
        return mappers.mapCategoriasToFrontend(categorias)
      } else {
        const categorias = await fetchCategoriasBackend()
        return mappers.mapCategoriasToFrontend(categorias)
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateCategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoria: Omit<CategoriaFrontend, 'id'>) => {
      console.log('🔵 [useCreateCategoria] Iniciando creación con:', categoria)
      const categoriaBackend = mappers.mapCategoriaToBackend(categoria)
      console.log('🔵 [useCreateCategoria] Categoria mapeada a backend:', categoriaBackend)
      const created = await createCategoriaBackend(categoriaBackend)
      console.log('🔵 [useCreateCategoria] Categoria creada desde backend:', created)
      const mappedToFrontend = mappers.mapCategoriaToFrontend(created)
      console.log('🔵 [useCreateCategoria] Categoria final mapeada a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreateCategoria] onSuccess ejecutado con data:', data)
      console.log('🔄 [useCreateCategoria] Invalidando queries...')
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias(data.idPrograma) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias() })
      console.log('🔄 [useCreateCategoria] Refetcheando queries...')
      await queryClient.refetchQueries({ queryKey: queryKeys.categorias() })
      console.log('✅ [useCreateCategoria] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreateCategoria] Error en mutación:', error)
    }
  })
}

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, categoria }: { id: number, categoria: Omit<CategoriaFrontend, 'id'> }) => {
      const categoriaBackend = mappers.mapCategoriaToBackend(categoria)
      const updated = await updateCategoriaBackend(id, categoriaBackend)
      return mappers.mapCategoriaToFrontend(updated)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias(data.idPrograma) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias() })
      await queryClient.refetchQueries({ queryKey: queryKeys.categorias() })
    },
  })
}

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCategoriaBackend(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categorias() })
      await queryClient.refetchQueries({ queryKey: queryKeys.categorias() })
    },
  })
}

// ================= HOOKS PARA SUBCATEGORÍAS =================
export const useSubcategorias = (categoriaId?: string) => {
  return useQuery({
    queryKey: queryKeys.subcategorias(categoriaId),
    queryFn: async () => {
      if (categoriaId) {
        const subcategorias = await fetchSubcategoriasByCategoriaBackend(parseInt(categoriaId))
        return mappers.mapSubcategoriasToFrontend(subcategorias)
      } else {
        const subcategorias = await fetchSubcategoriasBackend()
        return mappers.mapSubcategoriasToFrontend(subcategorias)
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateSubcategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (subcategoria: Omit<SubcategoriaFrontend, 'id'>) => {
      console.log('🔵 [useCreateSubcategoria] Iniciando creación con:', subcategoria)
      const subcategoriaBackend = mappers.mapSubcategoriaToBackend(subcategoria)
      console.log('🔵 [useCreateSubcategoria] Subcategoria mapeada a backend:', subcategoriaBackend)
      const created = await createSubcategoriaBackend(subcategoriaBackend)
      console.log('🔵 [useCreateSubcategoria] Subcategoria creada desde backend:', created)
      const mappedToFrontend = mappers.mapSubcategoriaToFrontend(created)
      console.log('🔵 [useCreateSubcategoria] Subcategoria final mapeada a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreateSubcategoria] onSuccess ejecutado con data:', data)
      console.log('🔄 [useCreateSubcategoria] Invalidando queries...')
      await queryClient.invalidateQueries({ queryKey: queryKeys.subcategorias(data.idCategoria) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subcategorias() })
      console.log('🔄 [useCreateSubcategoria] Refetcheando queries...')
      await queryClient.refetchQueries({ queryKey: queryKeys.subcategorias() })
      console.log('✅ [useCreateSubcategoria] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreateSubcategoria] Error en mutación:', error)
    }
  })
}

export const useUpdateSubcategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, subcategoria }: { id: number, subcategoria: Omit<SubcategoriaFrontend, 'id'> }) => {
      const subcategoriaBackend = mappers.mapSubcategoriaToBackend(subcategoria)
      const updated = await updateSubcategoriaBackend(id, subcategoriaBackend)
      return mappers.mapSubcategoriaToFrontend(updated)
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subcategorias(data.idCategoria) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subcategorias() })
      await queryClient.refetchQueries({ queryKey: queryKeys.subcategorias() })
    },
  })
}

export const useDeleteSubcategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteSubcategoriaBackend(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subcategorias() })
      await queryClient.refetchQueries({ queryKey: queryKeys.subcategorias() })
    },
  })
}

// ================= HOOKS PARA CICLOS =================
export const useCiclos = () => {
  return useQuery({
    queryKey: queryKeys.ciclos,
    queryFn: async () => {
      console.log('🔄 [useCiclos] Fetching ciclos desde backend...')
      const ciclos = await fetchCiclosBackend()
      console.log('📦 [useCiclos] Ciclos recibidos del backend:', ciclos)
      const mapped = mappers.mapCiclosToFrontend(ciclos)
      console.log('✅ [useCiclos] Ciclos mapeados al frontend:', mapped)
      return mapped
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateCiclo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ciclo: Omit<CicloFrontend, 'id'>) => {
      console.log('🔵 [useCreateCiclo] Iniciando creación con:', ciclo)
      const cicloBackend = mappers.mapCicloToBackend(ciclo)
      console.log('🔵 [useCreateCiclo] Ciclo mapeado a backend:', cicloBackend)
      const created = await createCicloBackend(cicloBackend)
      console.log('🔵 [useCreateCiclo] Ciclo creado desde backend:', created)
      const mappedToFrontend = mappers.mapCicloToFrontend(created)
      console.log('🔵 [useCreateCiclo] Ciclo final mapeado a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreateCiclo] onSuccess ejecutado con data:', data)
      // Invalidar y refetch inmediato
      console.log('🔄 [useCreateCiclo] Invalidando queries...')
      await queryClient.invalidateQueries({ queryKey: queryKeys.ciclos })
      console.log('🔄 [useCreateCiclo] Refetcheando queries...')
      await queryClient.refetchQueries({ queryKey: queryKeys.ciclos })
      console.log('✅ [useCreateCiclo] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreateCiclo] Error en mutación:', error)
    }
  })
}

export const useUpdateCiclo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ciclo }: { id: number, ciclo: Omit<CicloFrontend, 'id'> }) => {
      const cicloBackend = mappers.mapCicloToBackend(ciclo)
      const updated = await updateCicloBackend(id, cicloBackend)
      return mappers.mapCicloToFrontend(updated)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ciclos })
    },
  })
}

export const useDeleteCiclo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCicloBackend(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ciclos })
    },
  })
}

// ================= HOOKS PARA SALAS Y ESTILOS =================
export const useSalas = () => {
  return useQuery({
    queryKey: queryKeys.salas,
    queryFn: async () => {
      const salas = await fetchSalasBackend()
      return mappers.mapSalasToFrontend(salas)
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - datos menos cambiantes
  })
}

export const useCreateSala = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sala: Omit<SalaFrontend, 'id'>) => {
      console.log('🔵 [useCreateSala] Iniciando creación con:', sala)
      const salaBackend = mappers.mapSalaToBackend(sala)
      console.log('🔵 [useCreateSala] Sala mapeada a backend:', salaBackend)
      const created = await createSalaBackend(salaBackend)
      console.log('🔵 [useCreateSala] Sala creada desde backend:', created)
      const mappedToFrontend = mappers.mapSalaToFrontend(created)
      console.log('🔵 [useCreateSala] Sala final mapeada a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreateSala] onSuccess ejecutado con data:', data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.salas })
      await queryClient.refetchQueries({ queryKey: queryKeys.salas })
      console.log('✅ [useCreateSala] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreateSala] Error en mutación:', error)
    }
  })
}

export const useUpdateSala = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, sala }: { id: number, sala: Omit<SalaFrontend, 'id'> }) => {
      const salaBackend = mappers.mapSalaToBackend(sala)
      const updated = await updateSalaBackend(id, salaBackend)
      return mappers.mapSalaToFrontend(updated)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.salas })
      await queryClient.refetchQueries({ queryKey: queryKeys.salas })
    },
  })
}

export const useDeleteSala = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteSalaBackend(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.salas })
      await queryClient.refetchQueries({ queryKey: queryKeys.salas })
    },
  })
}

export const useEstilos = () => {
  return useQuery({
    queryKey: queryKeys.estilos,
    queryFn: async () => {
      const estilos = await fetchEstilosBackend()
      return mappers.mapEstilosToFrontend(estilos)
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - datos menos cambiantes
  })
}

export const useCreateEstilo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (estilo: Omit<EstiloFrontend, 'id'>) => {
      console.log('🔵 [useCreateEstilo] Iniciando creación con:', estilo)
      const estiloBackend = mappers.mapEstiloToBackend(estilo)
      console.log('🔵 [useCreateEstilo] Estilo mapeado a backend:', estiloBackend)
      const created = await createEstiloBackend(estiloBackend)
      console.log('🔵 [useCreateEstilo] Estilo creado desde backend:', created)
      const mappedToFrontend = mappers.mapEstiloToFrontend(created)
      console.log('🔵 [useCreateEstilo] Estilo final mapeado a frontend:', mappedToFrontend)
      return mappedToFrontend
    },
    onSuccess: async (data) => {
      console.log('✅ [useCreateEstilo] onSuccess ejecutado con data:', data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.estilos })
      await queryClient.refetchQueries({ queryKey: queryKeys.estilos })
      console.log('✅ [useCreateEstilo] Cache actualizado')
    },
    onError: (error) => {
      console.error('❌ [useCreateEstilo] Error en mutación:', error)
    }
  })
}

export const useUpdateEstilo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, estilo }: { id: number, estilo: Omit<EstiloFrontend, 'id'> }) => {
      const estiloBackend = mappers.mapEstiloToBackend(estilo)
      const updated = await updateEstiloBackend(id, estiloBackend)
      return mappers.mapEstiloToFrontend(updated)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.estilos })
      await queryClient.refetchQueries({ queryKey: queryKeys.estilos })
    },
  })
}

export const useDeleteEstilo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteEstiloBackend(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.estilos })
      await queryClient.refetchQueries({ queryKey: queryKeys.estilos })
    },
  })
}

// ================= OFERTAS =================
export const useOfertas = () => {
  return useQuery({
    queryKey: queryKeys.ofertas,
    queryFn: async () => {
      const ofertas = await getOfertasActivas()
      console.log('📦 Ofertas desde backend:', ofertas)
      return ofertas
    },
  })
}