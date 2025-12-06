


import React, { useEffect, useState, useMemo, useRef } from "react";
import { Filters, Table, Detail, type HorarioItem, type Student } from "./componentsEnrollments";



const PALETTE = {
  magenta: "#C2185B",
  rose: "#EC407A",
  coral: "#F04E45",
  orange: "#FB8C00",
  amber: "#FFB300",
  softyellow: "#FFE082",
  ink: "#121212",
  graphite: "#333333",
  snow: "#FFFFFF",
};

/* -------------- Subcomponentes -------------- */

// Se mantiene Kpi definido para compatibilidad y tests, aunque la UI ya no lo usa
function Kpi({ label, value, tone = "rose", children }: {
  label: string;
  value: string | number;
  tone?: "rose" | "amber";
  children?: React.ReactNode;
}) {
  const toneClasses = tone === "amber"
    ? "bg-[color:rgba(255,179,0,0.10)] text-[color:#FFB300]"
    : "bg-[color:rgba(236,64,122,0.10)] text-[color:#EC407A]";
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {children ? (
        <div className="mt-2">{children}</div>
      ) : (
        <div className={`mt-3 h-1 w-10 rounded-full ${toneClasses}`} />
      )}
    </div>
  );
}

/* -------------- Helpers -------------- */

function computeOcupacion(cupo: number, count: number) {
  return cupo ? Math.round((count / cupo) * 100) : 0;
}

export default function EnrollmentsAdminPage(){
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedSubcategoria, setSelectedSubcategoria] = useState("");
  const [selectedOferta, setSelectedOferta] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedHorario, setSelectedHorario] = useState<HorarioItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Referencia para hacer scroll automático al detalle
  const detailRef = useRef<HTMLDivElement>(null);

  // Función para seleccionar horario con scroll automático
  const handleSelectHorario = (horario: HorarioItem) => {
    setSelectedHorario(horario);
    // Hacer scroll al detalle después de un pequeño delay para asegurar que se renderice
    setTimeout(() => {
      detailRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Fetch horarios desde la API
  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${env.API_URL}/horarios/profesores`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.horarios)) {
          setHorarios(data.horarios);
          console.log(`Horarios cargados desde API: ${data.horarios.length}`);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error al cargar horarios:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSelectedCycle("");
    setSelectedPrograma("");
    setSelectedCategoria("");
    setSelectedSubcategoria("");
    setSelectedOferta("");
    setSearchName("");
  };

  // Filtrar horarios basado en los filtros seleccionados
  const filteredHorarios = useMemo(() => {
    return horarios.filter((horario) => {
      const matchesCycle = !selectedCycle || horario.oferta.ciclo.nombre_ciclo === selectedCycle;
      const matchesPrograma = !selectedPrograma || horario.oferta.programa.nombre_programa === selectedPrograma;
      const matchesCategoria = !selectedCategoria || horario.oferta.categoria.nombre_categoria === selectedCategoria;
      const matchesSubcategoria = !selectedSubcategoria || horario.oferta.subcategoria.nombre_subcategoria === selectedSubcategoria;
      const matchesOferta = !selectedOferta || horario.oferta.nombre_oferta === selectedOferta;
      const matchesSearch = !searchName ||
        horario.profesor.persona.nombre.toLowerCase().includes(searchName.toLowerCase()) ||
        horario.profesor.persona.apellido.toLowerCase().includes(searchName.toLowerCase()) ||
        horario.estilo.nombre_estilo.toLowerCase().includes(searchName.toLowerCase());

      return matchesCycle && matchesPrograma && matchesCategoria && matchesSubcategoria && matchesOferta && matchesSearch;
    });
  }, [horarios, selectedCycle, selectedPrograma, selectedCategoria, selectedSubcategoria, selectedOferta, searchName]);

  // Fetch estudiantes cuando se selecciona un horario
  useEffect(() => {
    if (selectedHorario) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(`${env.API_URL}/inscripciones/horario/${selectedHorario.id_horario}/inscritos`);

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const data = await response.json();

          if (data && data.inscritos && Array.isArray(data.inscritos)) {
            // Transformar los datos de la API al formato esperado por el componente
            const transformedStudents = data.inscritos.map((inscrito: any) => ({
              id: inscrito.persona.id_persona,
              nombre: inscrito.persona.nombre,
              apellido: inscrito.persona.apellido,
              email: inscrito.persona.email,
              celular: inscrito.persona.celular,
              sesiones: inscrito.sesiones.map((sesion: any) => ({
                fecha: sesion.fecha,
                asistio: sesion.asistencia.asistio,
                id_asistencia: sesion.asistencia.id_asistencia
              })),
              inscripcion: {
                id_inscripcion: inscrito.inscripcion.id_inscripcion,
                estado: inscrito.inscripcion.estado,
                clases_restantes: inscrito.inscripcion.clases_restantes,
                clases_usadas: inscrito.inscripcion.clases_usadas,
                fecha_fin: inscrito.inscripcion.fecha_fin,
                paquete: {
                  nombre: inscrito.inscripcion.paquete.nombre
                }
              }
            }));

            setStudents(transformedStudents);
            console.log(`Estudiantes cargados para horario ${selectedHorario.id_horario}: ${transformedStudents.length}`);
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
        } catch (err) {
          console.error('Error al cargar estudiantes:', err);
          setStudents([]);
        }
      };

      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedHorario]);

  const handleDeleteStudent = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full min-h-screen bg-white text-[15px]">
      <style>{`
        :root {
          --femme-magenta: ${PALETTE.magenta};
          --femme-rose: ${PALETTE.rose};
          --femme-coral: ${PALETTE.coral};
          --femme-orange: ${PALETTE.orange};
          --femme-amber: ${PALETTE.amber};
          --femme-softyellow: ${PALETTE.softyellow};
          --ink: ${PALETTE.ink};
          --graphite: ${PALETTE.graphite};
          --snow: ${PALETTE.snow};
        }
        .text-femme-magenta{color:var(--femme-magenta)}
        .bg-femme-magenta{background-color:var(--femme-magenta)}
        .border-femme-magenta{border-color:var(--femme-magenta)}
        .text-femme-rose{color:var(--femme-rose)}
        .bg-femme-rose{background-color:var(--femme-rose)}
        .text-femme-orange{color:var(--femme-orange)}
        .bg-femme-orange{background-color:var(--femme-orange)}
        .text-femme-amber{color:var(--femme-amber)}
        .bg-femme-amber{background-color:var(--femme-amber)}
        .text-femme-coral{color:var(--femme-coral)}
        .bg-femme-coral{background-color:var(--femme-coral)}
        .card{border:1px solid rgba(0,0,0,.08); border-radius:1rem; background: hsl(var(--card, 0 0% 100%));}
        .card-header{padding:1rem 1rem .25rem 1rem}
        .card-content{padding:1rem}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.5rem .75rem;border-radius:.75rem;border:1px solid rgba(0,0,0,.12);}
        .btn-primary{background:var(--femme-magenta);color:white;border-color:var(--femme-magenta)}
        .btn-outline{background:transparent;color:var(--femme-magenta);border-color:var(--femme-magenta)}
        .btn-outline:hover{background:rgba(194,24,91,.08)}
        .badge{display:inline-flex;align-items:center;gap:.25rem;padding:.125rem .5rem;border-radius:9999px;font-size:.75rem;font-weight:600}
        .badge-rose{background:rgba(236,64,122,.12);color:var(--femme-rose)}
        .badge-orange{background:rgba(251,140,0,.12);color:var(--femme-orange)}
        .badge-emerald{background:rgba(16,185,129,.12);color:rgb(5,150,105)}
        .badge-coral{background:rgba(240,78,69,.12);color:var(--femme-coral)}
        .table{width:100%;border-collapse:separate;border-spacing:0}
        .thead tr th{font-weight:600;color:rgb(107,114,128);text-align:left;font-size:.875rem;padding:.75rem 1rem;border-bottom:1px solid rgba(0,0,0,.06); background: rgba(0,0,0,.02)}
        .tbody tr td{padding:.75rem 1rem;border-bottom:1px solid rgba(0,0,0,.06)}
        .tbody tr:hover{background:rgba(0,0,0,.02)}
        .progress{height:8px;background:rgba(0,0,0,.08);border-radius:9999px;overflow:hidden}
        .progress > span{display:block;height:100%;background:var(--femme-magenta)}
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:1rem}
        .modal{background:white;border-radius:1rem;max-width:560px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,.15)}
      `}</style>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Encabezado */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-femme-magenta">Gestión de Inscripciones</h2>
                <p className="text-sm text-gray-500 mt-1">Listado de clases del periodo y detalle de alumnas inscritas.</p>
              </div>
              {/* Botones de exportar/nueva clase removidos por solicitud */}
            </div>
          </div>
          <div className="card-content">
            <Filters
              selectedCycle={selectedCycle}
              selectedPrograma={selectedPrograma}
              selectedCategoria={selectedCategoria}
              selectedSubcategoria={selectedSubcategoria}
              selectedOferta={selectedOferta}
              searchName={searchName}
              onCycleChange={setSelectedCycle}
              onProgramaChange={setSelectedPrograma}
              onCategoriaChange={setSelectedCategoria}
              onSubcategoriaChange={setSelectedSubcategoria}
              onOfertaChange={setSelectedOferta}
              onSearchNameChange={setSearchName}
              onClearFilters={handleClearFilters}
            />

            <Table
              filteredHorarios={filteredHorarios}
              onSelectHorario={handleSelectHorario}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        <Detail
          ref={detailRef}
          selectedHorario={selectedHorario}
          students={students}
          onDeleteStudent={handleDeleteStudent}
          onOpenNotification={() => setIsNotificationOpen(true)}
        />

        {/* Modal de notificación */}
        {isNotificationOpen && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Enviar notificación">
            <div className="modal p-5">
              <h4 className="text-lg font-semibold mb-4">Enviar notificación</h4>
              <label className="text-sm text-gray-700" htmlFor="msg">Mensaje</label>
              <textarea id="msg" className="mt-2 w-full border rounded-lg p-2" defaultValue="Tu mensualidad vence el 08/04. Por favor regulariza tu pago." />
              <div className="mt-5 flex gap-2 justify-end">
                <button className="btn" onClick={() => setIsNotificationOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => setIsNotificationOpen(false)}>Enviar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


