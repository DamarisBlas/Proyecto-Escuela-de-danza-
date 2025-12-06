

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPermisosDetallados, aprobarPermiso, rechazarPermiso } from "../api/backend";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/useAuthStore";


type Estado = "Pendiente" | "Aprobado" | "Negado";

type TipoCurso = "Regular" | "Intensivo" | "Taller";

type Permiso = {
  id: string;
  fecha: string; // DD/MM (solicitud)
  ciclo: string; // "Ciclo 3/2025"
  nombre: string;
  tipoAlumno: "Alumno" | "Alumno Femme";
  programa: string; // p.ej. "Camino Femme"
  tipoCurso: TipoCurso; // Regular | Intensivo | Taller
  detallePermiso: string; // motivo
  clase: string; // p.ej. "Salsa"
  claseFecha: string; // "12-09-2025"
  profesor: string; // "Daysi"
  ubicacion: string; // "Sopocachi"
  estado: Estado;
};

// Interface para mapear datos del backend
interface BackendPermiso {
  permiso_id: number;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  motivo: string;
  motivo_rechazo: string | null;
  estado_permiso: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  persona: {
    id_persona: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
  };
  ciclo: {
    nombre: string;
  };
  oferta: {
    nombre_oferta: string;
  };
  paquete: {
    nombre: string;
    cantidad_clases: number;
  };
  clase: {
    nombre_estilo: string;
    nivel: number;
    dias: string;
  };
  horario_sesion: {
    id_horario_sesion: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  };
}

// Función para transformar datos del backend a formato del frontend
function mapBackendToPermiso(backend: BackendPermiso): Permiso {
  // Convertir estado
  let estado: Estado = "Pendiente";
  if (backend.estado_permiso === "APROBADO") estado = "Aprobado";
  else if (backend.estado_permiso === "RECHAZADO") estado = "Negado";

  // Formatear fecha de solicitud
  const fechaSolicitud = new Date(backend.fecha_solicitud);
  const fecha = `${fechaSolicitud.getDate().toString().padStart(2, '0')}/${(fechaSolicitud.getMonth() + 1).toString().padStart(2, '0')}`;

  // Formatear fecha de clase
  const fechaClase = new Date(backend.horario_sesion.fecha);
  const claseFecha = `${fechaClase.getDate().toString().padStart(2, '0')}-${(fechaClase.getMonth() + 1).toString().padStart(2, '0')}-${fechaClase.getFullYear()}`;

  return {
    id: backend.permiso_id.toString(),
    fecha,
    ciclo: backend.ciclo.nombre,
    nombre: `${backend.persona.nombre} ${backend.persona.apellido}`,
    tipoAlumno: "Alumno", // TODO: Determinar si es Alumno Femme desde el backend
    programa: backend.oferta.nombre_oferta,
    tipoCurso: "Regular", // TODO: Determinar tipo de curso desde el backend
    detallePermiso: backend.motivo,
    clase: `${backend.clase.nombre_estilo} - Nivel ${backend.clase.nivel}`,
    claseFecha,
    profesor: "Daysi", // TODO: Obtener profesor desde el backend
    ubicacion: "Sopocachi", // TODO: Obtener ubicación desde el backend
    estado,
  };
}

// Paleta
const colors = {
  femme: {
    magenta: "#C2185B",
    rose: "#EC407A",
    coral: "#F04E45",
    orange: "#FB8C00",
    amber: "#FFB300",
    softyellow: "#FFE082",
  },
  ink: "#121212",
  graphite: "#333333",
  snow: "#FFFFFF",
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Spinner minimal
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="animate-spin"
      aria-label="cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#e5e7eb"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke={colors.femme.magenta}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Toasts ligeros

type Toast = { id: string; message: string; type?: "success" | "error" | "info" };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(message: string, type: Toast["type"] = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((ts) => [...ts, { id, message, type }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2400);
  }
  function remove(id: string) {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }
  return { toasts, push, remove };
}

function ToastViewport({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[90vw] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            "rounded-xl border p-3 shadow-sm text-sm flex items-start gap-2",
            t.type === "success" && "bg-green-50 border-green-200 text-green-900",
            t.type === "error" && "bg-red-50 border-red-200 text-red-900",
            t.type === "info" && "bg-neutral-50 border-neutral-200 text-neutral-900"
          )}
        >
          <span className="mt-0.5">{t.message}</span>
          <button onClick={() => onClose(t.id)} className="ml-auto rounded-md px-2 py-0.5 text-[11px] hover:bg-black/5">
            Cerrar
          </button>
        </div>
      ))}
    </div>
  );
}

// Modal genérico
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {children}
        <button onClick={onClose} className="mt-4 text-sm text-neutral-500 underline underline-offset-2">
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Componente principal
export default function PermissionsAdminPage() {
  const { toasts, push, remove } = useToasts();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Filtros (combobox)
  const [selectedCycle, setSelectedCycle] = useState("1-2024");
  const [estadoFilter, setEstadoFilter] = useState<Estado | "Todos">("Todos");
  const [selectedProgram, setSelectedProgram] = useState<string>("Todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("Todos");
  const [selectedCurso, setSelectedCurso] = useState<string>("Todas");
  const [search, setSearch] = useState("");

  // Query para obtener permisos del backend
  const { data: backendPermisos = [], isLoading } = useQuery({
    queryKey: ['permisos-detallados'],
    queryFn: fetchPermisosDetallados,
  });

  // Transformar datos del backend a formato del frontend
  const data = useMemo(() => {
    return backendPermisos.map(mapBackendToPermiso);
  }, [backendPermisos]);

  // UX: spinner ligero cuando cambian filtros (simulado)
  const [isFiltering, setIsFiltering] = useState(false);
  function pulseFilter() {
    setIsFiltering(true);
    window.clearTimeout((pulseFilter as any)._t);
    (pulseFilter as any)._t = window.setTimeout(() => setIsFiltering(false), 250);
  }

  // Handlers que disparan el spinner
  const onChangeCycle = (v: string) => {
    setSelectedCycle(v);
    pulseFilter();
  };
  const onChangeEstado = (v: Estado | "Todos") => {
    setEstadoFilter(v);
    pulseFilter();
  };
  const onChangeProgram = (v: string) => {
    setSelectedProgram(v);
    pulseFilter();
  };
  const onChangeTipo = (v: string) => {
    setSelectedTipo(v);
    pulseFilter();
  };
  const onChangeCurso = (v: string) => {
    setSelectedCurso(v);
    pulseFilter();
  };

  // Búsqueda con debounce
  const [searchDraft, setSearchDraft] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchDraft);
      if (searchDraft.trim() !== "") pulseFilter();
    }, 180);
    return () => clearTimeout(t);
  }, [searchDraft]);

  // Opciones dinámicas para selects
  const cycleOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((p: Permiso) => set.add(p.ciclo));
    return Array.from(set).sort();
  }, [data]);

  // Actualizar el ciclo seleccionado al primer ciclo disponible si aún no hay datos
  useEffect(() => {
    if (cycleOptions.length > 0 && selectedCycle === "1-2024") {
      setSelectedCycle(cycleOptions[0]);
    }
  }, [cycleOptions]);

  const programOptions = useMemo(() => {
    const set = new Set<string>(["Todos"]);
    data.forEach((p: Permiso) => set.add(p.programa));
    return Array.from(set);
  }, [data]);

  const tipoOptions = useMemo(() => {
    const set = new Set<string>(["Todos"]);
    data.forEach((p: Permiso) => set.add(p.tipoCurso));
    return Array.from(set);
  }, [data]);

  const cursoOptions = useMemo(() => {
    const set = new Set<string>(["Todas"]);
    data.forEach((p: Permiso) => set.add(p.clase));
    return Array.from(set);
  }, [data]);

  const visibles = useMemo(() => {
    let list = [...data];
    // Filtrar por ciclo
    list = list.filter((p) => p.ciclo === selectedCycle);
    // Estado
    if (estadoFilter !== "Todos") list = list.filter((p) => p.estado === estadoFilter);
    // Programa
    if (selectedProgram !== "Todos") list = list.filter((p) => p.programa === selectedProgram);
    // Tipo de curso
    if (selectedTipo !== "Todos") list = list.filter((p) => p.tipoCurso === (selectedTipo as TipoCurso));
    // Curso
    if (selectedCurso !== "Todas") list = list.filter((p) => p.clase === selectedCurso);
    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => `${p.nombre} ${p.clase}`.toLowerCase().includes(q));
    }
    return list;
  }, [data, selectedCycle, estadoFilter, selectedProgram, selectedTipo, selectedCurso, search]);

  // Modal negar con motivo
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyId, setDenyId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [denyTouched, setDenyTouched] = useState(false);

  async function aprobar(id: string) {
    if (!user?.id) {
      toast.error('No se pudo obtener el ID del usuario');
      return;
    }
    try {
      await aprobarPermiso(parseInt(id), parseInt(user.id));
      queryClient.invalidateQueries({ queryKey: ['permisos-detallados'] });
      toast.success('Permiso aprobado exitosamente');
    } catch (error) {
      console.error('Error al aprobar permiso:', error);
      toast.error('Error al aprobar el permiso');
    }
  }

  function openDeny(id: string) {
    setDenyOpen(true);
    setDenyId(id);
    setDenyReason("");
    setDenyTouched(false);
  }

  async function confirmDeny() {
    if (!denyId) return;
    if (denyReason.trim().length < 3) {
      setDenyTouched(true);
      return;
    }
    if (!user?.id) {
      toast.error('No se pudo obtener el ID del usuario');
      return;
    }
    try {
      await rechazarPermiso(parseInt(denyId), parseInt(user.id), denyReason);
      queryClient.invalidateQueries({ queryKey: ['permisos-detallados'] });
      toast.success('Permiso rechazado exitosamente');
      setDenyOpen(false);
    } catch (error) {
      console.error('Error al rechazar permiso:', error);
      toast.error('Error al rechazar el permiso');
    }
  }

  function resetFilters() {
    setSelectedCycle("1-2024");
    setEstadoFilter("Todos");
    setSelectedProgram("Todos");
    setSelectedTipo("Todos");
    setSelectedCurso("Todas");
    setSearchDraft("");
    setSearch("");
    pulseFilter();
  }

  return (
    <div className="min-h-[80vh] bg-neutral-50 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size={48} />
            <p className="mt-4 text-sm text-graphite/80">Cargando permisos...</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl rounded-2xl border bg-white p-0 shadow-sm">
          {/* Barra de filtros sticky */}
          <div
            className="sticky top-0 z-10 rounded-t-2xl border-b bg-white/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/60"
          >
            <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gestión de Permisos</h1>
             
            <p className="text-sm text-neutral-600">
              Administra las solicitudes de permisos de alumnos.
            </p>
            <br />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            
            {/* Fila 1: Ciclo, Estado, Programa */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium">Ciclo:</span>
              <select
                value={selectedCycle}
                onChange={(e) => onChangeCycle(e.target.value)}
                className="w-[7.5rem] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
              >
                {cycleOptions.map((cycle) => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
            </div>

            <select
              value={estadoFilter}
              onChange={(e) => onChangeEstado(e.target.value as any)}
              className="w-[12rem] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
              title="Estado"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Negado">Negado</option>
            </select>

            <select
              value={selectedProgram}
              onChange={(e) => onChangeProgram(e.target.value)}
              className="w-[16rem] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
              title="Programa"
            >
              {programOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "Todos" ? "Programa: Todos" : opt}
                </option>
              ))}
            </select>

            {/* Separador visual en md+ */}
            <div className="hidden h-6 w-px bg-neutral-200 md:block" />

            {/* Fila 2: Tipo, Curso, Buscar + acciones */}
            <select
              value={selectedTipo}
              onChange={(e) => onChangeTipo(e.target.value)}
              className="w-[14rem] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
              title="Tipo de curso"
            >
              {tipoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "Todos" ? "Tipo: Todos" : opt}
                </option>
              ))}
            </select>

            <select
              value={selectedCurso}
              onChange={(e) => onChangeCurso(e.target.value)}
              className="w-[14rem] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
              title="Curso/Clase"
            >
              {cursoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "Todas" ? "Clase: Todas" : opt}
                </option>
              ))}
            </select>

            <div className="min-w-[200px] flex-1">
              <input
                placeholder="Buscar por nombre o clase…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs md:text-sm outline-none focus:ring-4 focus:ring-neutral-200"
                title="Buscar"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isFiltering && <Spinner />}
              <button
                onClick={resetFilters}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs md:text-sm hover:bg-neutral-50"
                title="Limpiar filtros"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-neutral-600">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Ciclo</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Programa</th>
                  <th className="px-3 py-2">Tipo curso</th>
                  <th className="px-3 py-2">Clase</th>
                  <th className="px-3 py-2">Detalle de la clase</th>
                  <th className="px-3 py-2">Detalle permiso</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((permiso) => {
                  const isPending = permiso.estado === "Pendiente";
                  return (
                    <tr key={permiso.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{permiso.fecha}</td>
                      <td className="px-3 py-2">{permiso.ciclo}</td>
                      <td className="px-3 py-2 font-medium">{permiso.nombre}</td>
                      <td className="px-3 py-2">{permiso.tipoAlumno}</td>
                      <td className="px-3 py-2">{permiso.programa}</td>
                      <td className="px-3 py-2">{permiso.tipoCurso}</td>
                      <td className="px-3 py-2">{permiso.clase}</td>
                      <td className="px-3 py-2">{`${permiso.clase} ${permiso.claseFecha} - Profe ${permiso.profesor} - ${permiso.ubicacion}`}</td>
                      <td className="px-3 py-2">{permiso.detallePermiso}</td>
                      <td className="px-3 py-2">
                        <span
                          className={classNames(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            permiso.estado === "Aprobado" && "bg-green-100 text-green-800",
                            permiso.estado === "Negado" && "bg-red-100 text-red-800",
                            permiso.estado === "Pendiente" && "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {permiso.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobar(permiso.id)}
                            disabled={!isPending}
                            className={classNames(
                              "rounded-lg px-2.5 py-1 text-xs font-medium text-white",
                              !isPending && "opacity-50 cursor-not-allowed"
                            )}
                            style={{ backgroundColor: colors.femme.rose }}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => isPending && openDeny(permiso.id)}
                            disabled={!isPending}
                            className={classNames(
                              "rounded-lg border px-2.5 py-1 text-xs font-medium",
                              !isPending && "opacity-50 cursor-not-allowed"
                            )}
                            style={{ borderColor: colors.femme.coral, color: colors.femme.coral }}
                          >
                            Negar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-sm text-neutral-500">
                      Sin resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Modal negar */}
      <Modal open={denyOpen} onClose={() => setDenyOpen(false)}>
        <h2 className="text-lg font-semibold" style={{ color: colors.femme.magenta }}>
          Negar permiso
        </h2>
        <p className="text-sm text-neutral-600">Describe brevemente el motivo del rechazo.</p>
        <textarea
          value={denyReason}
          onChange={(e) => setDenyReason(e.target.value)}
          onBlur={() => setDenyTouched(true)}
          className={classNames(
            "mt-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
            denyTouched && denyReason.trim().length < 3
              ? "border-red-400 focus:ring-red-100"
              : "border-neutral-300 focus:ring-neutral-200"
          )}
          rows={3}
          placeholder="Motivo (mín. 3 caracteres)"
        />
        {denyTouched && denyReason.trim().length < 3 && (
          <p className="mt-1 text-xs text-red-600">Motivo muy corto</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setDenyOpen(false)}
            className="rounded-xl border border-neutral-300 bg-transparent px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDeny}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.femme.coral }}
          >
            Confirmar rechazo
          </button>
        </div>
      </Modal>

      {/* Toasts */}
      <ToastViewport toasts={toasts} onClose={remove} />

      {/**
       * PRUEBAS MANUALES
       * 1) Barra sticky de filtros con dos filas (wrap) y spinner al cambiar filtros.
       * 2) Filtrar con los combobox (Programa/Tipo/Curso) + Ciclo/Estado + búsqueda (debounce).
       * 3) Aceptar (rosa) / Negar (modal coral) se bloquean cuando no es Pendiente.
       * 4) Revertir → vuelve a Pendiente y habilita acciones.
       */}
    </div>
  );
}
