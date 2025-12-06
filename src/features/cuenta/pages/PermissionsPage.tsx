import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from '@app/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getInscripcionesByPersona, getCiclosActivos, type Inscripcion, type Ciclo } from '../api/inscripciones'
import { api } from '@lib/api'
import { Card } from '@components/ui/Card'
import { Spinner } from '@components/ui/Spinner'
import { EmptyState } from '@components/ui/EmptyState'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight } from 'lucide-react'

// ───────────────────────────── Types
type PermisoEstado = "PENDIENTE" | "APROBADO" | "RECHAZADO";
type AsistenciaEstado = "Asistió" | "No asistió" | "Pendiente";

// Tipo para mostrar permisos en la tabla
type PermisoRow = {
  id: number;
  inscripcionId: number;
  claseOriginal: string;
  claseReemplazo: string;
  motivo: string;
  fecha: string;
  estado: PermisoEstado;
};

// Tipo que viene del backend
type PermisoBackend = {
  permiso_id: number;
  persona_id_persona: number;
  inscripcion_id_inscripcion: number;
  asistencia_original_id: number;
  asistencia_reemplazo_id: number | null;
  horario_sesion_id_horario_sesion: number;
  motivo: string;
  fecha_solicitud: string;
  estado_permiso: PermisoEstado;
  motivo_rechazo: string | null;
  fecha_respuesta: string | null;
  respondida_por: number | null;
  activo: boolean;
};

type ClaseRow = {
  id: string;
  id_asistencia: number;
  fecha: string;
  hora: string;
  estilo: string;
  lugar: string;
  profesor: string;
  asistencia: AsistenciaEstado;
  inscripcion_id: number;
  horario_sesion_id: number;
};

type InscripcionConClases = {
  id: number;
  titulo: string;
  ciclo: string;
  ciclo_id: number;
  tipo: "Regular" | "Taller" | "Intensivo" | "Especial";
  oferta_id: number;
  clases: ClaseRow[];
};

// Tipos para sesiones disponibles por fecha
type SesionDisponible = {
  id_sesion: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estilo: string;
  nivel: number;
  profesor: string;
  sala: string;
  cupos_disponibles: number;
  cupos_ocupados: number;
  capacidad_maxima: number;
  cancelado: boolean;
  oferta: string;
  oferta_id: number;
};

// ───────────────────────────── Helpers
function puedeSolicitarPorAsistencia(a: AsistenciaEstado): boolean {
  return a === "Pendiente" || a === "No asistió";
}

function formatFecha(fecha: string): string {
  // Usar split para evitar problemas de zona horaria
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0 a 11
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ───────────────────────────── Page Component
export default function PermissionsPage() {
  const { user } = useAuth()
  
  // Estado para permisos
  const [permisos, setPermisos] = useState<PermisoRow[]>([]);
  const [loadingPermisos, setLoadingPermisos] = useState(true);

  // UI state
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [expandedInscripcion, setExpandedInscripcion] = useState<number | null>(null);
  const [selectedInscripcionId, setSelectedInscripcionId] = useState<number | null>(null);
  const [selectedClaseId, setSelectedClaseId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [reemplazoId, setReemplazoId] = useState<string>("");
  const [banner, setBanner] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el selector de fecha y sesiones disponibles
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [sesionesDisponibles, setSesionesDisponibles] = useState<SesionDisponible[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);

  // Filtros
  const [filtroCiclo, setFiltroCiclo] = useState<string>("Todos");
  
  // Cargar permisos existentes con detalles de las sesiones
  useEffect(() => {
    const cargarPermisos = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingPermisos(true);
        const response = await api.get<PermisoBackend[]>(`/permisos/persona/${user.id}`);
        
        // Cargar detalles de cada sesión para mostrar información completa
        const permisosConDetalles = await Promise.all(
          response.data.map(async (p: PermisoBackend) => {
            try {
              // Obtener detalles de la asistencia original
              let claseOriginalDetalle = `Asistencia ${p.asistencia_original_id}`;
              try {
                const asistenciaResponse = await api.get(`/asistencias/${p.asistencia_original_id}`);
                const asistencia = asistenciaResponse.data;
                
                // Obtener detalles de la sesión original usando el ID de horario_sesion
                if (asistencia && asistencia.Horario_sesion_id_horario_sesion) {
                  const sesionOriginalResponse = await api.get(`/sesiones/detalle/${asistencia.Horario_sesion_id_horario_sesion}`);
                  const sesionOriginal = sesionOriginalResponse.data;
                  
                  if (sesionOriginal) {
                    const estilo = sesionOriginal.horario?.estilo?.nombre_estilo || sesionOriginal.estilo?.nombre_estilo || "Estilo desconocido";
                    claseOriginalDetalle = `${formatFecha(sesionOriginal.fecha)} · ${sesionOriginal.hora_inicio.substring(0, 5)} · ${estilo}`;
                  }
                }
              } catch (error) {
                console.error('Error obteniendo asistencia original:', error);
              }
              
              // Obtener detalles de la sesión de reemplazo
              let claseReemplazoDetalle = `Sesión ${p.horario_sesion_id_horario_sesion}`;
              try {
                const sesionReemplazoResponse = await api.get(`/sesiones/detalle/${p.horario_sesion_id_horario_sesion}`);
                const sesionReemplazo = sesionReemplazoResponse.data;
                
                if (sesionReemplazo) {
                  const estilo = sesionReemplazo.horario?.estilo?.nombre_estilo || sesionReemplazo.estilo?.nombre_estilo || "Estilo desconocido";
                  claseReemplazoDetalle = `${formatFecha(sesionReemplazo.fecha)} · ${sesionReemplazo.hora_inicio.substring(0, 5)} · ${estilo}`;
                }
              } catch (error) {
                console.error('Error obteniendo sesión de reemplazo:', error);
              }
              
              return {
                id: p.permiso_id,
                inscripcionId: p.inscripcion_id_inscripcion,
                claseOriginal: claseOriginalDetalle,
                claseReemplazo: claseReemplazoDetalle,
                motivo: p.motivo,
                fecha: new Date(p.fecha_solicitud).toLocaleDateString('es-ES'),
                estado: p.estado_permiso
              };
            } catch (error) {
              console.error('Error cargando detalles del permiso:', error);
              // Si falla la carga de detalles, mostrar IDs como fallback
              return {
                id: p.permiso_id,
                inscripcionId: p.inscripcion_id_inscripcion,
                claseOriginal: `Sesión ${p.asistencia_original_id}`,
                claseReemplazo: `Sesión ${p.horario_sesion_id_horario_sesion}`,
                motivo: p.motivo,
                fecha: new Date(p.fecha_solicitud).toLocaleDateString('es-ES'),
                estado: p.estado_permiso
              };
            }
          })
        );
        
        setPermisos(permisosConDetalles);
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      } finally {
        setLoadingPermisos(false);
      }
    };
    
    cargarPermisos();
  }, [user?.id]);

  // Cargar inscripciones del usuario
  const { data: inscripciones = [], isLoading: loadingInscripciones } = useQuery({
    queryKey: ['inscripciones', user?.id],
    queryFn: () => user ? getInscripcionesByPersona(parseInt(user.id)) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Cargar ciclos activos
  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos-activos'],
    queryFn: getCiclosActivos
  });

  // Estado para cargar las clases con asistencias
  const [inscripcionesConClases, setInscripcionesConClases] = useState<InscripcionConClases[]>([]);
  const [loadingClases, setLoadingClases] = useState(false);

  // Cargar clases con asistencias cuando cambien las inscripciones
  React.useEffect(() => {
    const cargarClasesConAsistencias = async () => {
      if (inscripciones.length === 0) return;
      
      setLoadingClases(true);
      const inscripcionesData: InscripcionConClases[] = [];

      for (const inscripcion of inscripciones) {
        try {
          // Obtener asistencias de esta inscripción
          const asistenciaResponse = await api.get(`/asistencias/inscripcion/${inscripcion.id_inscripcion}`);
          const clases: ClaseRow[] = [];
          
          let inscripcionInfo: { titulo: string; ciclo: string; ciclo_id: number; oferta_id: number; tipo: "Regular" | "Taller" | "Intensivo" | "Especial"; subcategoria: string } | null = null;

          // Para cada asistencia, obtener detalles de la sesión
          for (const asistencia of asistenciaResponse.data.asistencias) {
            try {
              const sesionResponse = await api.get(`/sesiones/detalle/${asistencia.Horario_sesion_id_horario_sesion}`);
              const sesion = sesionResponse.data;

              const estadoAsistencia: AsistenciaEstado = 
                asistencia.asistio === true ? "Asistió" :
                asistencia.asistio === false ? "No asistió" : "Pendiente";

              clases.push({
                id: `${asistencia.id_asistencia}-${sesion.id_horario_sesion}`,
                id_asistencia: asistencia.id_asistencia,
                fecha: formatFecha(sesion.fecha),
                hora: `${sesion.hora_inicio} - ${sesion.hora_fin}`,
                estilo: sesion.horario.estilo.nombre_estilo,
                lugar: sesion.horario.sala.nombre_sala,
                profesor: sesion.horario.profesor.persona?.nombre || 'Instructor',
                asistencia: estadoAsistencia,
                inscripcion_id: inscripcion.id_inscripcion,
                horario_sesion_id: asistencia.Horario_sesion_id_horario_sesion
              });
              
              // Guardar información de la inscripción desde la primera sesión
              if (!inscripcionInfo) {
                // Determinar tipo basado en la subcategoría
                const subcategoriaNombre = sesion.horario.oferta.subcategoria.nombre_subcategoria;
                let tipo: "Regular" | "Taller" | "Intensivo" | "Especial" = "Regular";
                if (subcategoriaNombre.toLowerCase().includes('taller')) {
                  tipo = "Taller";
                } else if (subcategoriaNombre.toLowerCase().includes('intensivo')) {
                  tipo = "Intensivo";
                } else if (subcategoriaNombre.toLowerCase().includes('especial')) {
                  tipo = "Especial";
                }
                
                inscripcionInfo = {
                  titulo: sesion.horario.oferta.nombre_oferta,
                  ciclo: sesion.horario.oferta.ciclo.nombre,
                  ciclo_id: sesion.horario.oferta.ciclo.id_ciclo,
                  oferta_id: sesion.horario.oferta.id_oferta,
                  tipo,
                  subcategoria: subcategoriaNombre
                };
              }
            } catch (error) {
              console.error(`Error cargando sesión ${asistencia.Horario_sesion_id_horario_sesion}:`, error);
            }
          }

          if (inscripcionInfo) {
            inscripcionesData.push({
              id: inscripcion.id_inscripcion,
              titulo: inscripcionInfo.titulo,
              ciclo: inscripcionInfo.ciclo,
              ciclo_id: inscripcionInfo.ciclo_id,
              oferta_id: inscripcionInfo.oferta_id,
              tipo: inscripcionInfo.tipo,
              clases: clases.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            });
          }

        } catch (error) {
          console.error(`Error cargando asistencias para inscripción ${inscripcion.id_inscripcion}:`, error);
        }
      }

      setInscripcionesConClases(inscripcionesData);
      setLoadingClases(false);
    };

    cargarClasesConAsistencias();
  }, [inscripciones]);

  // Lista filtrada
  const inscripcionesFiltradas = useMemo(() => {
    return inscripcionesConClases.filter(
      (i) => filtroCiclo === "Todos" || i.ciclo === filtroCiclo
    );
  }, [inscripcionesConClases, filtroCiclo]);

  // Helpers para selección actual
  const inscripcionSel = inscripcionesConClases.find((i) => i.id === selectedInscripcionId) || null;
  const claseSel = inscripcionSel?.clases.find((c) => c.id === selectedClaseId) || null;
  const reemplazoOpts = inscripcionSel?.clases.filter((c) => c.id !== selectedClaseId) ?? [];

  // Ciclos únicos para el filtro
  const ciclosUnicos = useMemo(() => {
    const ciclosSet = new Set(inscripcionesConClases.map(i => i.ciclo));
    return Array.from(ciclosSet);
  }, [inscripcionesConClases]);

  // Cargar sesiones disponibles cuando se selecciona una fecha
  const cargarSesionesPorFecha = async (fecha: string) => {
    if (!fecha || !inscripcionSel) {
      setSesionesDisponibles([]);
      return;
    }

    setLoadingSesiones(true);
    try {
      const response = await api.get(`/sesiones/fecha/${fecha}`);
      const sesiones: SesionDisponible[] = response.data.sesiones.map((sesion: any) => ({
        id_sesion: sesion.id_sesion,
        fecha: sesion.fecha,
        hora_inicio: sesion.hora_inicio,
        hora_fin: sesion.hora_fin,
        estilo: sesion.estilo.nombre_estilo,
        nivel: sesion.nivel,
        profesor: sesion.profesor.nombre,
        sala: sesion.sala.nombre_sala,
        cupos_disponibles: sesion.cupos_disponibles,
        cupos_ocupados: sesion.cupos_ocupados,
        capacidad_maxima: sesion.capacidad_maxima,
        cancelado: sesion.cancelado,
        oferta: sesion.oferta.nombre_oferta,
        oferta_id: sesion.oferta.id_oferta
      }));
      
      // Filtrar sesiones solo de la misma oferta que la inscripción seleccionada
      const sesionesFiltradas = inscripcionSel 
        ? sesiones.filter(s => s.oferta_id === inscripcionSel.oferta_id)
        : sesiones;
      
      setSesionesDisponibles(sesionesFiltradas);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      toast.error('Error al cargar las clases disponibles');
      setSesionesDisponibles([]);
    } finally {
      setLoadingSesiones(false);
    }
  };

  // Manejar cambio de fecha
  const handleFechaChange = (fecha: string) => {
    setFechaSeleccionada(fecha);
    setReemplazoId(""); // Limpiar selección de reemplazo
    cargarSesionesPorFecha(fecha);
  };

  function openNuevoPermiso() {
    setMostrarFormulario(true);
    setTimeout(() => {
      document.getElementById("nuevo-permiso")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function toggleInscripcion(id: number) {
    setExpandedInscripcion((prev) => (prev === id ? null : id));
  }

  function seleccionarClase(inscripcionId: number, claseId: string, asistencia: AsistenciaEstado) {
    if (!puedeSolicitarPorAsistencia(asistencia)) return;
    setSelectedInscripcionId(inscripcionId);
    setSelectedClaseId(claseId);
    setExpandedInscripcion(inscripcionId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inscripcionSel || !claseSel || !motivo.trim() || !reemplazoId || !user?.id) return;

    setIsSubmitting(true);
    
    try {
      // Preparar los datos para el POST
      const permisoData = {
        Persona_id_persona: parseInt(user.id),
        Inscripcion_id_inscripcion: inscripcionSel.id,
        Asistencia_original_id: parseInt(claseSel.id), // Convertir a número
        motivo: motivo.trim(),
        Horario_sesion_id_horario_sesion: parseInt(reemplazoId) // Convertir a número
      };

      // Llamada al API para crear el permiso
      const response = await api.post<PermisoBackend>('/permisos', permisoData);
      
      // Obtener detalles de la clase de reemplazo
      let claseReemplazoDetalle = `Sesión ${response.data.horario_sesion_id_horario_sesion}`;
      try {
        const sesionReemplazoResponse = await api.get(`/sesiones/detalle/${response.data.horario_sesion_id_horario_sesion}`);
        const sesionReemplazo = sesionReemplazoResponse.data;
        if (sesionReemplazo) {
          const estilo = sesionReemplazo.estilo?.nombre_estilo || "Estilo desconocido";
          claseReemplazoDetalle = `${formatFecha(sesionReemplazo.fecha)} · ${sesionReemplazo.hora_inicio.substring(0, 5)} · ${estilo}`;
        }
      } catch (error) {
        console.error('Error obteniendo detalles de sesión de reemplazo:', error);
      }
      
      // Formatear detalles de la clase original
      const claseOriginalDetalle = `${claseSel.fecha} · ${claseSel.hora} · ${claseSel.estilo}`;
      
      // Agregar el nuevo permiso a la lista local
      const nuevoPermiso: PermisoRow = {
        id: response.data.permiso_id,
        inscripcionId: response.data.inscripcion_id_inscripcion,
        claseOriginal: claseOriginalDetalle,
        claseReemplazo: claseReemplazoDetalle,
        motivo: response.data.motivo,
        fecha: new Date(response.data.fecha_solicitud).toLocaleDateString('es-ES'),
        estado: response.data.estado_permiso
      };
      
      setPermisos((prev) => [...prev, nuevoPermiso]);

      // Limpiar formulario
      setMostrarFormulario(false);
      setMotivo("");
      setReemplazoId("");
      setFechaSeleccionada("");
      setSesionesDisponibles([]);
      setSelectedClaseId(null);
      setSelectedInscripcionId(null);
      
      toast.success("Permiso enviado exitosamente", {
        description: "Tu solicitud está en proceso de revisión"
      });
      
      setBanner("Tu permiso fue enviado y está En proceso.");
      setTimeout(() => setBanner(""), 4000);
      window.scrollTo({ top: 0, behavior: "smooth" });
      
    } catch (error) {
      console.error('Error enviando permiso:', error);
      toast.error("Error al enviar el permiso", {
        description: "Por favor intenta nuevamente"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingInscripciones || loadingClases) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Cargando permisos..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Banner */}
      {banner && (
        <div className="rounded-xl border border-femme-amber/50 bg-femme-softyellow/40 px-4 py-2 text-sm text-ink">
          {banner}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Permisos</h1>
          <p className="text-sm text-graphite">Gestiona solicitudes de cambio de clase por inscripción</p>
        </div>
        
      </header>

      {/* Historial */}
      <Card className="rounded-2xl shadow-sm ring-1 ring-femme-magenta/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Permisos registrados</h2>
            <p className="text-xs text-graphite">Resumen de solicitudes enviadas</p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarFormulario((v) => !v)}
            className="rounded-lg border bg-femme-magenta border-femme-magenta/40 px-4 py-2 text-sm font-medium text-white hover:bg-femme-magenta"
          >
            {mostrarFormulario ? "Ocultar formulario" : "+ Nuevo permiso"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-femme-amber/20 text-left text-graphite">
              <tr>
                <Th>Detalle clase</Th>
                <Th>Reemplazado por la clase</Th>
                <Th>Descripción permiso</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {permisos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-graphite">
                    Aún no tienes permisos. Usa <span className="font-medium text-ink">Nuevo permiso</span> para registrar uno.
                  </td>
                </tr>
              ) : (
                permisos.map((p) => (
                  <tr key={p.id}>
                    <Td className="max-w-[200px]">
                      <span className="block truncate" title={p.claseOriginal}>{p.claseOriginal}</span>
                    </Td>
                    <Td className="max-w-[200px]">
                      <span className="block truncate" title={p.claseReemplazo}>{p.claseReemplazo}</span>
                    </Td>
                    <Td className="max-w-[300px]">
                      <div className="max-h-[3.6rem] overflow-hidden">
                        <p className="text-sm leading-relaxed line-clamp-2" title={p.motivo}>
                          {p.motivo}
                        </p>
                      </div>
                    </Td>
                    <Td>{renderEstadoBadge(p.estado)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Nuevo permiso */}
      {mostrarFormulario && (
        <div id="nuevo-permiso">
          <Card className="space-y-4 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Nuevo permiso</h2>
              <p className="text-xs text-graphite">1) Elige la inscripción  2) Selecciona la clase  3) Completa y envía</p>
            </div>
            <button onClick={() => setMostrarFormulario(false)} className="text-xs text-graphite hover:underline">
              Cerrar
            </button>
          </div>

          {/* Filtro de INSCRIPCIONES */}
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-1">
              <Label>Ciclo</Label>
              <select 
                value={filtroCiclo} 
                onChange={(e) => setFiltroCiclo(e.target.value)} 
                className="w-full rounded-lg border border-femme-magenta/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta"
              >
                <option>Todos</option>
                {ciclosUnicos.map((ciclo) => (
                  <option key={ciclo} value={ciclo}>{ciclo}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex items-end">
             
            </div>
          </div>

          {/* Mostrar estado de carga o vacío */}
          {inscripcionesFiltradas.length === 0 ? (
            <EmptyState
              title="No hay inscripciones disponibles"
              subtitle="No se encontraron inscripciones para solicitar permisos."
            />
          ) : (
            <>
              {/* Listado de INSCRIPCIONES */}
              <div className="space-y-4">
                {inscripcionesFiltradas.map((ins) => (
                  <div key={ins.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Header de la inscripción */}
                    <div 
                      className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleInscripcion(ins.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">{ins.titulo}</h3>
                              <p className="text-sm text-slate-600">
                                {ins.ciclo} • {ins.tipo}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-slate-400">
                          {expandedInscripcion === ins.id ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tabla de clases */}
                    {expandedInscripcion === ins.id && (
                      <div className="p-4 border-t border-slate-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                          <thead className="bg-femme-amber/20 text-left text-graphite">
                            <tr>
                              <Th>Fecha</Th>
                              <Th>Hora</Th>
                              <Th>Estilo</Th>
                              <Th>Lugar</Th>
                              <Th>Profesor</Th>
                              <Th>Asistencia</Th>
                              <Th className="text-center">Acción</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {ins.clases.map((c) => {
                              const active = selectedClaseId === c.id && selectedInscripcionId === ins.id;
                              const puedeSolicitar = puedeSolicitarPorAsistencia(c.asistencia);
                              return (
                                <tr key={c.id} className={active ? "bg-femme-rose/5" : ""}>
                                  <Td>{c.fecha}</Td>
                                  <Td>{c.hora}</Td>
                                  <Td className="max-w-[220px] truncate" title={c.estilo}>{c.estilo}</Td>
                                  <Td>{c.lugar}</Td>
                                  <Td>{c.profesor}</Td>
                                  <Td className="text-sm text-ink">{pillAsistencia(c.asistencia)}</Td>
                                  <Td className="text-center">
                                    <button
                                      type="button"
                                      onClick={() => seleccionarClase(ins.id, c.id, c.asistencia)}
                                      disabled={!puedeSolicitar}
                                      className={`rounded-lg px-3 py-1 text-xs ${
                                        active
                                          ? "bg-femme-rose text-white border-femme-rose"
                                          : puedeSolicitar
                                            ? "border border-femme-magenta/40 text-ink hover:bg-femme-rose/10"
                                            : "border border-graphite/20 text-graphite/60 cursor-not-allowed"
                                      }`}
                                    >
                                      {active ? "Seleccionada" : puedeSolicitar ? "Solicitar" : "No disponible"}
                                    </button>
                                  </Td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulario */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-3" />
                <div className="md:col-span-2 space-y-3">
                  <div className="rounded-xl border p-3 bg-femme-rose/20 border-femme-magenta/50">
                    <p className="text-xs font-medium text-ink">Clase seleccionada</p>
                    <p className="text-sm text-ink">
                      {inscripcionSel && claseSel ? (
                        <>
                          <span className="font-semibold">{claseSel.fecha}</span> · {claseSel.hora}
                          <br />{claseSel.estilo}
                          <br />{claseSel.lugar} · {claseSel.profesor}
                          <br /><span className="text-graphite">{inscripcionSel.titulo} • {inscripcionSel.ciclo} • {inscripcionSel.tipo}</span>
                        </>
                      ) : (
                        <span className="text-graphite">Selecciona una clase disponible (Pendiente o No asistió)</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Razón del permiso</Label>
                    <textarea
                      rows={4}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta"
                      placeholder="Ej. Viaje de trabajo, enfermedad, compromiso familiar..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Escoge la fecha</Label>
                    <input
                      type="date"
                      value={fechaSeleccionada}
                      onChange={(e) => handleFechaChange(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta"
                      disabled={!inscripcionSel}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reemplazar por {loadingSesiones && <span className="text-xs text-graphite">(Cargando...)</span>}</Label>
                    <select
                      value={reemplazoId}
                      onChange={(e) => setReemplazoId(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta"
                      disabled={!fechaSeleccionada || loadingSesiones || sesionesDisponibles.length === 0}
                    >
                      <option value="">
                        {!fechaSeleccionada 
                          ? "Primero selecciona una fecha" 
                          : loadingSesiones 
                            ? "Cargando clases..." 
                            : sesionesDisponibles.length === 0 
                              ? "No hay clases disponibles para esta fecha"
                              : "Selecciona clase"}
                      </option>
                      {sesionesDisponibles.map((sesion) => {
                        const esMismaClase = claseSel && sesion.id_sesion === claseSel.horario_sesion_id;
                        
                        // Verificar si la fecha de la sesión es pasada
                        const [year, month, day] = sesion.fecha.split('-').map(Number);
                        const fechaSesion = new Date(year, month - 1, day);
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fecha
                        const esFechaPasada = fechaSesion < hoy;
                        
                        const disabled = sesion.cupos_disponibles === 0 || sesion.cancelado || esMismaClase || esFechaPasada;
                        const nivelMap: Record<number, string> = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
                        return (
                          <option 
                            key={sesion.id_sesion} 
                            value={sesion.id_sesion}
                            disabled={disabled}
                          >
                            {sesion.hora_inicio}-{sesion.hora_fin} · {sesion.estilo} ({nivelMap[sesion.nivel]}) · {sesion.sala}
                            {sesion.cancelado 
                              ? ' - CANCELADA' 
                              : esMismaClase 
                                ? ' - CLASE ACTUAL'
                                : esFechaPasada
                                  ? ' - CLASE CONCLUIDA'
                                  : ` - ${sesion.cupos_disponibles} cupos`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button 
                      type="button" 
                      onClick={() => { 
                        setMotivo(""); 
                        setReemplazoId(""); 
                        setFechaSeleccionada(""); 
                        setSesionesDisponibles([]);
                      }} 
                      className="rounded-lg border px-4 py-2 text-sm text-ink hover:bg-graphite/10"
                    >
                      Limpiar
                    </button>
                    <button
                      disabled={!inscripcionSel || !claseSel || !motivo.trim() || isSubmitting}
                      onClick={handleSubmit}
                      className={`rounded-lg px-6 py-2 text-sm font-semibold text-white flex items-center gap-2 ${
                        !inscripcionSel || !claseSel || !motivo.trim() 
                          ? "bg-graphite/40 cursor-not-allowed" 
                          : "bg-femme-magenta hover:opacity-90"
                      }`}
                    >
                      {isSubmitting && <Spinner />}
                      {isSubmitting ? "Enviando..." : "Enviar permiso"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── UI Components
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 text-xs font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={`px-4 py-2 align-top ${className}`} title={title}>{children}</td>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[11px] font-medium text-graphite">{children}</label>;
}

function renderEstadoBadge(estado: PermisoEstado) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-[11px] border";
  const map: Record<PermisoEstado, string> = {
    PENDIENTE: "border-femme-amber/50 bg-femme-softyellow/40 text-ink",
    APROBADO: "border-emerald-300 bg-emerald-50 text-emerald-700",
    RECHAZADO: "border-red-300 bg-red-50 text-red-700",
  };
  
  // Mapear estados a texto para mostrar
  const textoEstado: Record<PermisoEstado, string> = {
    PENDIENTE: "Pendiente",
    APROBADO: "Aprobado",
    RECHAZADO: "Rechazado"
  };
  
  return <span className={`${base} ${map[estado]}`}>{textoEstado[estado]}</span>;
}

function pillAsistencia(a: AsistenciaEstado) {
  return <span className="text-sm text-ink">{a}</span>;
}
