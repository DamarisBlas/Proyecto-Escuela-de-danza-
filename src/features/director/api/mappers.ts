// Mappers para convertir entre la estructura del backend y la del frontend

import { 
  Programa as ProgramaBackend, 
  Categoria as CategoriaBackend, 
  Subcategoria as SubcategoriaBackend,
  Ciclo as CicloBackend,
  Sala as SalaBackend,
  Estilo as EstiloBackend,
  formatDateFromBackend,
  formatDateForBackend
} from './backend'

import { 
  Programa as ProgramaFrontend, 
  Categoria as CategoriaFrontend, 
  Subcategoria as SubcategoriaFrontend,
  Ciclo as CicloFrontend,
  Sala as SalaFrontend,
  Estilo as EstiloFrontend
} from '../pages/componentsProgramasAndCourses/ui/ManageListDialog'

// ================= MAPPERS BACKEND → FRONTEND =================

export const mapProgramaToFrontend = (programa: ProgramaBackend): ProgramaFrontend => ({
  id: programa.id_programa.toString(),
  nombre: programa.nombre_programa,
  descripcion: programa.descricpcion_programa,
  esActivo: programa.estado
})

export const mapCategoriaToFrontend = (categoria: CategoriaBackend): CategoriaFrontend => ({
  id: categoria.id_categoria.toString(),
  idPrograma: categoria.Programa_id_programa.toString(),
  nombre: categoria.nombre_categoria,
  descripcion: categoria.descripcion_categoria
})

export const mapSubcategoriaToFrontend = (subcategoria: SubcategoriaBackend): SubcategoriaFrontend => ({
  id: subcategoria.id_subcategoria.toString(),
  idCategoria: subcategoria.Categoria_id_categoria.toString(),
  nombre: subcategoria.nombre_subcategoria,
  descripcion: subcategoria.descripcion_subcategoria
})

export const mapCicloToFrontend = (ciclo: CicloBackend): CicloFrontend => {
  console.log('🔄 Mapping ciclo from backend:', ciclo)
  const mapped = {
    id: ciclo.id_ciclo.toString(),
    nombre: ciclo.nombre,
    fechaInicio: formatDateFromBackend(ciclo.inicio),
    fechaFin: formatDateFromBackend(ciclo.fin)
  }
  console.log('🔄 Mapped ciclo to frontend:', mapped)
  return mapped
}

export const mapSalaToFrontend = (sala: SalaBackend): SalaFrontend => ({
  id: sala.id_sala.toString(),
  nombre: sala.nombre_sala,
  ubicacion: sala.ubicacion,
  linkUbicacion: sala.link_ubicacion,
  departamento: sala.departamento,
  zona: sala.zona
})

export const mapEstiloToFrontend = (estilo: EstiloBackend): EstiloFrontend => ({
  id: estilo.id_estilo.toString(),
  nombre: estilo.nombre_estilo,
  descripcion: estilo.descripcion_estilo,
  beneficios: estilo.beneficios_estilo
})

// ================= MAPPERS FRONTEND → BACKEND =================

export const mapProgramaToBackend = (programa: Omit<ProgramaFrontend, 'id'>): Omit<ProgramaBackend, 'id_programa'> => ({
  nombre_programa: programa.nombre,
  descricpcion_programa: programa.descripcion,
  estado: programa.esActivo
})

export const mapCategoriaToBackend = (categoria: Omit<CategoriaFrontend, 'id'>): Omit<CategoriaBackend, 'id_categoria'> => ({
  Programa_id_programa: parseInt(categoria.idPrograma),
  nombre_categoria: categoria.nombre,
  descripcion_categoria: categoria.descripcion,
  estado: true
})

export const mapSubcategoriaToBackend = (subcategoria: Omit<SubcategoriaFrontend, 'id'>): Omit<SubcategoriaBackend, 'id_subcategoria'> => ({
  Categoria_id_categoria: parseInt(subcategoria.idCategoria),
  nombre_subcategoria: subcategoria.nombre,
  descripcion_subcategoria: subcategoria.descripcion,
  estado: true
})

export const mapCicloToBackend = (ciclo: Omit<CicloFrontend, 'id'>): { nombre: string, inicio: string, fin: string } => ({
  nombre: ciclo.nombre,
  inicio: formatDateForBackend(ciclo.fechaInicio),
  fin: formatDateForBackend(ciclo.fechaFin)
})

export const mapSalaToBackend = (sala: Omit<SalaFrontend, 'id'>): Omit<SalaBackend, 'id_sala' | 'estado'> => ({
  nombre_sala: sala.nombre,
  ubicacion: sala.ubicacion,
  link_ubicacion: sala.linkUbicacion,
  departamento: sala.departamento,
  zona: sala.zona
})

export const mapEstiloToBackend = (estilo: Omit<EstiloFrontend, 'id'>): Omit<EstiloBackend, 'id_estilo' | 'estado'> => ({
  nombre_estilo: estilo.nombre,
  descripcion_estilo: estilo.descripcion,
  beneficios_estilo: estilo.beneficios
})

// ================= MAPPERS PARA ARRAYS =================

export const mapProgramasToFrontend = (programas: ProgramaBackend[]): ProgramaFrontend[] => 
  programas.map(mapProgramaToFrontend)

export const mapCategoriasToFrontend = (categorias: CategoriaBackend[]): CategoriaFrontend[] => 
  categorias.map(mapCategoriaToFrontend)

export const mapSubcategoriasToFrontend = (subcategorias: SubcategoriaBackend[]): SubcategoriaFrontend[] => 
  subcategorias.map(mapSubcategoriaToFrontend)

export const mapCiclosToFrontend = (ciclos: CicloBackend[]): CicloFrontend[] => {
  console.log('🔄 Mapping ciclos from backend to frontend:', ciclos)
  const mapped = ciclos.map(mapCicloToFrontend)
  console.log('✅ Mapped ciclos:', mapped)
  return mapped
}

export const mapSalasToFrontend = (salas: SalaBackend[]): SalaFrontend[] => 
  salas.map(mapSalaToFrontend)

export const mapEstilosToFrontend = (estilos: EstiloBackend[]): EstiloFrontend[] => 
  estilos.map(mapEstiloToFrontend)