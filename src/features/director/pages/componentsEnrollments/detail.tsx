import React, { useState, forwardRef } from "react";
import type { HorarioItem, Student } from "./types";

interface DetailProps {
  selectedHorario: HorarioItem | null;
  students: Student[];
  onDeleteStudent: (index: number) => void;
  onOpenNotification: () => void;
}

export const Detail = forwardRef<HTMLDivElement, DetailProps>(({
  selectedHorario,
  students,
  onDeleteStudent,
  onOpenNotification
}, ref) => {
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  if (!selectedHorario) return null;

  const computeOcupacion = (capacidad: number, inscritas: number) => {
    return capacidad ? Math.round((inscritas / capacidad) * 100) : 0;
  };

  const toggleExpandedStudent = (studentId: number) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <div ref={ref} className="card mt-6">
      <div className="card-header">
        <h3 className="text-lg md:text-xl font-semibold text-femme-magenta">Detalle de horario</h3>
        <p className="text-sm text-gray-500 mt-1">
          {selectedHorario.dias} • {selectedHorario.hora_inicio} - {selectedHorario.hora_fin} • {selectedHorario.estilo.nombre_estilo}
        </p>
      </div>
      <div className="card-content">
        {/* Información del horario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Profesor</div>
            <div className="font-medium">{selectedHorario.profesor.persona.nombre} {selectedHorario.profesor.persona.apellido_paterno} {selectedHorario.profesor.persona.apellido_materno}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Sala</div>
            <div className="font-medium">{selectedHorario.sala.nombre_sala}</div>
            <div className="text-xs text-gray-500">{selectedHorario.sala.zona}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Capacidad</div>
            <div className="font-medium">{selectedHorario.capacidad} personas</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Oferta</div>
            <div className="font-medium">{selectedHorario.oferta.nombre_oferta}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Ciclo</div>
            <div className="font-medium">{selectedHorario.oferta.ciclo.nombre_ciclo}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Nivel</div>
            <div className="font-medium">Nivel {selectedHorario.nivel}</div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">Inscritas:</span>
          <strong>{students.length}</strong>
          <span className="text-gray-500">| Ocupación:</span>
          <strong>{computeOcupacion(selectedHorario.capacidad, students.length)}%</strong>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="thead">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Estado</th>
                <th>Clases restantes</th>
                <th>Fecha fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="tbody">
              {students.map((s, i) => {
                return (
                  <React.Fragment key={s.id}>
                    <tr>
                      <td className="font-medium">{s.nombre} {s.apellido_paterno} {s.apellido_materno}</td>
                      <td className="text-sm">{s.email}</td>
                      <td className="text-sm">{s.celular}</td>
                      <td>
                        <span className={`badge ${s.inscripcion.estado === 'ACTIVO' ? 'badge-emerald' : 'badge-orange'}`}>
                          {s.inscripcion.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`font-medium ${s.inscripcion.clases_restantes > 0 ? 'text-emerald-600' : 'text-femme-coral'}`}>
                          {s.inscripcion.clases_restantes}
                        </span>
                      </td>
                      <td className="text-sm">
                        {new Date(s.inscripcion.fecha_fin).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn text-xs"
                            style={{ color: "var(--femme-amber)", borderColor: "var(--femme-amber)" }}
                            onClick={() => toggleExpandedStudent(s.id)}
                          >
                            {expandedStudent === s.id ? 'Ocultar' : 'Ver'} sesiones
                          </button>
                          {/* <button
                            className="btn"
                            style={{ color: "var(--femme-coral)", borderColor: "var(--femme-coral)" }}
                            onClick={() => onDeleteStudent(i)}
                          >
                            Eliminar
                          </button>
                          <button className="btn" style={{ color: "var(--femme-magenta)", borderColor: "var(--femme-magenta)" }} onClick={onOpenNotification}>
                            Notificación
                          </button> */}
                        </div>
                      </td>
                    </tr>
                    {expandedStudent === s.id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Todas las sesiones de {s.nombre} {s.apellido_paterno} {s.apellido_materno}:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {s.sesiones
                              .sort((a, b) => new Date(a.fecha + 'T12:00:00').getTime() - new Date(b.fecha + 'T12:00:00').getTime())
                              .map((sesion, index) => (
                                <div key={sesion.id_asistencia} className="bg-white p-3 rounded-lg border">
                                  <div className="font-medium text-sm">
                                    {new Date(sesion.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {sesion.asistio === true ? '✅ Asistió' :
                                     sesion.asistio === false ? '❌ Falta' : '⏳ Pendiente'}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {s.sesiones.length === 0 && (
                            <div className="text-sm text-gray-500 italic">No hay sesiones programadas</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">No hay inscritas en este horario.</div>
          )}
        </div>
      </div>
    </div>
  );
});

Detail.displayName = 'Detail';