import React from "react";

interface FiltersProps {
  selectedCycle: string;
  selectedPrograma: string;
  selectedCategoria: string;
  selectedSubcategoria: string;
  selectedOferta: string;
  searchName: string;
  onCycleChange: (cycle: string) => void;
  onProgramaChange: (programa: string) => void;
  onCategoriaChange: (categoria: string) => void;
  onSubcategoriaChange: (subcategoria: string) => void;
  onOfertaChange: (oferta: string) => void;
  onSearchNameChange: (name: string) => void;
  onClearFilters: () => void;
}

export function Filters({
  selectedCycle,
  selectedPrograma,
  selectedCategoria,
  selectedSubcategoria,
  selectedOferta,
  searchName,
  onCycleChange,
  onProgramaChange,
  onCategoriaChange,
  onSubcategoriaChange,
  onOfertaChange,
  onSearchNameChange,
  onClearFilters,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      {/* Primera fila de filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Ciclo</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={selectedCycle}
            onChange={(e) => onCycleChange(e.target.value)}
            aria-label="Seleccionar ciclo"
          >
            <option value="">Todos</option>
            <option value="Ciclo 3/2025">Ciclo 3/2025</option>
            <option value="Ciclo 2/2025">Ciclo 2/2025</option>
            <option value="Ciclo 1/2025">Ciclo 1/2025</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Programa</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={selectedPrograma}
            onChange={(e) => onProgramaChange(e.target.value)}
            aria-label="Seleccionar programa"
          >
            <option value="">Todos</option>
            <option value="Camino Femme">Camino Femme</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Categoría</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={selectedCategoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            aria-label="Seleccionar categoría"
          >
            <option value="">Todos</option>
            <option value="Técnico">Técnico</option>
            <option value="Complementario">Complementario</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Subcategoría</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={selectedSubcategoria}
            onChange={(e) => onSubcategoriaChange(e.target.value)}
            aria-label="Seleccionar subcategoría"
          >
            <option value="">Todos</option>
            <option value="Regular">Regular</option>
            <option value="Especiales">Especiales</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Oferta</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={selectedOferta}
            onChange={(e) => onOfertaChange(e.target.value)}
            aria-label="Seleccionar oferta"
          >
            <option value="">Todos</option>
            <option value="Curso regular 3 -2025">Curso regular 3 -2025</option>
            <option value="Especial 1.">Especial 1.</option>
          </select>
        </div>
      </div>

      {/* Segunda fila: búsqueda y botones */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Buscar por nombre</label>
          <input
            type="text"
            className="border rounded-lg px-3 py-2 text-sm"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            placeholder="Nombre del profesor o estilo..."
            aria-label="Buscar por nombre"
          />
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={onClearFilters}
            aria-label="Limpiar filtros"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}