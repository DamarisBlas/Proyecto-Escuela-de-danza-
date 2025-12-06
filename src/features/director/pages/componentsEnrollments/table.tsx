import React from "react";
import type { HorarioItem } from "./types";

interface TableProps {
  filteredHorarios: HorarioItem[];
  onSelectHorario: (horario: HorarioItem) => void;
  loading?: boolean;
  error?: string | null;
}

export function Table({ filteredHorarios, onSelectHorario, loading = false, error = null }: TableProps) {
  if (loading) {
    return (
      <div className="mt-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-femme-magenta"></div>
          Cargando horarios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 py-10 text-center">
        <div className="text-sm text-red-600">
          Error al cargar horarios: {error}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Mostrando datos de respaldo
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="table">
        <thead className="thead">
          <tr>
            <th>Profesor</th>
            <th>Estilo</th>
            <th>Día</th>
            <th>Horario</th>
            <th>Sala</th>
            <th>Ciclo</th>
            <th>Categoría</th>
            <th>Subcategoría</th>
            <th>Oferta</th>
            <th className="text-right">Capacidad</th>
            <th className="text-right">Inscritos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {filteredHorarios.map((item) => {
            return (
              <tr key={item.id_horario}>
                <td className="font-medium">
                  {item.profesor.persona.nombre} {item.profesor.persona.apellido}
                </td>
                <td>
                  <span className="badge badge-rose">{item.estilo.nombre_estilo}</span>
                </td>
                <td>{item.dias}</td>
                <td>{item.hora_inicio} - {item.hora_fin}</td>
                <td>
                  <div>
                    <div className="font-medium">{item.sala.nombre_sala}</div>
                    <div className="text-xs text-gray-500">{item.sala.zona}</div>
                  </div>
                </td>
                <td>{item.oferta.ciclo.nombre_ciclo}</td>
                <td>{item.oferta.categoria.nombre_categoria}</td>
                <td>{item.oferta.subcategoria.nombre_subcategoria}</td>
                <td>{item.oferta.nombre_oferta}</td>
                <td className="text-right">{item.capacidad}</td>
                <td className="text-right">{item.total_inscritos}</td>
                <td>
                  <button
                    className="btn text-femme-magenta border-femme-magenta"
                    onClick={() => onSelectHorario(item)}
                  >
                    detalle
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredHorarios.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-500">No hay horarios que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}