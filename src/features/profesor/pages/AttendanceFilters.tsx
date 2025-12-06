import { useState, useMemo, useEffect } from 'react'
import { HorarioProfesor } from '../api/attendance'

interface AttendanceFiltersProps {
  horarios: HorarioProfesor[]
  onFiltersChange: (filteredHorarios: HorarioProfesor[]) => void
}

export default function AttendanceFilters({ horarios, onFiltersChange }: AttendanceFiltersProps) {
  const [selectedCiclo, setSelectedCiclo] = useState<string>('todos')
  const [selectedPrograma, setSelectedPrograma] = useState<string>('todos')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos')
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>('todos')
  const [selectedOferta, setSelectedOferta] = useState<string>('todos')

  // Extraer opciones únicas para cada filtro
  const ciclos = useMemo(() => {
    const unique = [...new Set(horarios.map(h => h.oferta.ciclo.nombre_ciclo))]
    return unique.sort()
  }, [horarios])

  const programas = useMemo(() => {
    const unique = [...new Set(horarios.map(h => h.oferta.programa.nombre_programa))]
    return unique.sort()
  }, [horarios])

  const categorias = useMemo(() => {
    const unique = [...new Set(horarios.map(h => h.oferta.categoria.nombre_categoria))]
    return unique.sort()
  }, [horarios])

  const subcategorias = useMemo(() => {
    const unique = [...new Set(horarios.map(h => h.oferta.subcategoria.nombre_subcategoria))]
    return unique.sort()
  }, [horarios])

  const ofertas = useMemo(() => {
    const unique = [...new Set(horarios.map(h => h.oferta.nombre_oferta))]
    return unique.sort()
  }, [horarios])

  // Filtrar horarios basado en los filtros seleccionados
  const filteredHorarios = useMemo(() => {
    return horarios.filter(horario => {
      const matchesCiclo = selectedCiclo === 'todos' || horario.oferta.ciclo.nombre_ciclo === selectedCiclo
      const matchesPrograma = selectedPrograma === 'todos' || horario.oferta.programa.nombre_programa === selectedPrograma
      const matchesCategoria = selectedCategoria === 'todos' || horario.oferta.categoria.nombre_categoria === selectedCategoria
      const matchesSubcategoria = selectedSubcategoria === 'todos' || horario.oferta.subcategoria.nombre_subcategoria === selectedSubcategoria
      const matchesOferta = selectedOferta === 'todos' || horario.oferta.nombre_oferta === selectedOferta

      return matchesCiclo && matchesPrograma && matchesCategoria && matchesSubcategoria && matchesOferta
    })
  }, [horarios, selectedCiclo, selectedPrograma, selectedCategoria, selectedSubcategoria, selectedOferta])

  // Notificar cambios al componente padre
  useEffect(() => {
    onFiltersChange(filteredHorarios)
  }, [filteredHorarios, onFiltersChange])

  const handleReset = () => {
    setSelectedCiclo('todos')
    setSelectedPrograma('todos')
    setSelectedCategoria('todos')
    setSelectedSubcategoria('todos')
    setSelectedOferta('todos')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Filtros de Cursos</h3>
        <button
          onClick={handleReset}
          className="text-xs text-femme-magenta hover:text-femme-magenta/80 underline"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Ciclo */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Ciclo</label>
          <select
            value={selectedCiclo}
            onChange={(e) => setSelectedCiclo(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
          >
            <option value="todos">Todos los ciclos</option>
            {ciclos.map(ciclo => (
              <option key={ciclo} value={ciclo}>{ciclo}</option>
            ))}
          </select>
        </div>

        {/* Programa */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Programa</label>
          <select
            value={selectedPrograma}
            onChange={(e) => setSelectedPrograma(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
          >
            <option value="todos">Todos los programas</option>
            {programas.map(programa => (
              <option key={programa} value={programa}>{programa}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Categoría</label>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
          >
            <option value="todos">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        {/* Subcategoría */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Subcategoría</label>
          <select
            value={selectedSubcategoria}
            onChange={(e) => setSelectedSubcategoria(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
          >
            <option value="todos">Todas las subcategorías</option>
            {subcategorias.map(subcategoria => (
              <option key={subcategoria} value={subcategoria}>{subcategoria}</option>
            ))}
          </select>
        </div>

        {/* Oferta */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Oferta</label>
          <select
            value={selectedOferta}
            onChange={(e) => setSelectedOferta(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-femme-magenta focus:border-transparent"
          >
            <option value="todos">Todas las ofertas</option>
            {ofertas.map(oferta => (
              <option key={oferta} value={oferta}>{oferta}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar resultados */}
      <div className="text-xs text-slate-600">
        Mostrando {filteredHorarios.length} de {horarios.length} cursos
      </div>
    </div>
  )
}