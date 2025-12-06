

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";



// ────────────────────────────────────────────────────────────────────────────────
// Tipos y datos mock
export type Estado = "PENDIENTE" | "PAGO_PARCIAL" | "PAGADO" | "VENCIDO" | "CANCELADO";
export type Row = {
  id_inscripcion: number;
  ciclo: string;
  fecha: string; // dd-mm
  nombre: string;
  programa: string; // Camino Femme / Cursos Libres
  tipoCurso: string; // Taller, Curso regular, Intensivo, etc.
  detalle: string; // "Afrobeats - Salsa" / "A-4 clases" / etc.
  precio: number; // precio original
  tipoPromo: string; // Sin promoción / Sorteo / Descuento 20%
  precioDescuento: number; // precio con promo
  saldo: number; // pendiente
  estado: Estado;
  clasesRestantes: number;
  clasesUsadas: number;
};

const accountData: Row[] = [
  {
    id_inscripcion: 1,
    ciclo: "Ciclo 1-2024",
    fecha: "17-04",
    nombre: "Ana",
    programa: "Cursos Libres",
    tipoCurso: "Taller",
    detalle: "Afrobeats - Salsa",
    precio: 200,
    tipoPromo: "Sin promoción",
    precioDescuento: 200,
    saldo: 0,
    estado: "PAGADO",
    clasesRestantes: 0,
    clasesUsadas: 4,
  },
  {
    id_inscripcion: 2,
    ciclo: "Ciclo 1-2024",
    fecha: "02-04",
    nombre: "Flor",
    programa: "Cursos Libres",
    tipoCurso: "Curso regular",
    detalle: "A-4 clases",
    precio: 200,
    tipoPromo: "Sorteo",
    precioDescuento: 100,
    saldo: 50,
    estado: "PAGO_PARCIAL",
    clasesRestantes: 2,
    clasesUsadas: 2,
  },
  {
    id_inscripcion: 3,
    ciclo: "Ciclo 1-2024",
    fecha: "05-04",
    nombre: "María",
    programa: "Camino Femme",
    tipoCurso: "Camino Femme",
    detalle: "Programa completo",
    precio: 500,
    tipoPromo: "Descuento 20%",
    precioDescuento: 400,
    saldo: 0,
    estado: "PAGADO",
    clasesRestantes: 0,
    clasesUsadas: 12,
  },
  {
    id_inscripcion: 4,
    ciclo: "Ciclo 2-2024",
    fecha: "18-08",
    nombre: "Sofía",
    programa: "Camino Femme",
    tipoCurso: "Intensivo",
    detalle: "Módulo Intermedio",
    precio: 350,
    tipoPromo: "Sin promoción",
    precioDescuento: 350,
    saldo: 200,
    estado: "PENDIENTE",
    clasesRestantes: 6,
    clasesUsadas: 4,
  },
];

// ────────────────────────────────────────────────────────────────────────────────
export default function AccountStatusPage() {
  // Filtros (simples)
  const [selectedCycle, setSelectedCycle] = useState("TODOS");
  const [selectedProgram, setSelectedProgram] = useState("todos");
  const [selectedTipoCurso, setSelectedTipoCurso] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [onlySaldo, setOnlySaldo] = useState(false);
  const [search, setSearch] = useState("");

  // Estados para datos de la API
  const [inscripcionesData, setInscripcionesData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch de inscripciones desde la API
  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${env.API_URL}/inscripciones/completas`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.inscripciones && Array.isArray(data.inscripciones)) {
          // Transformar los datos de la API al formato Row
          const transformedData = data.inscripciones.map((inscripcion: any): Row => {
            // Calcular saldo solo si el estado es PENDIENTE o PAGO_PARCIAL
            let saldoCalculado = 0;
            const estadoPago = inscripcion.estado_pago as Estado;
            
            if (estadoPago === 'PENDIENTE' || estadoPago === 'PAGO_PARCIAL') {
              // Sumar los montos de los pagos confirmados
              const montoPagadoConfirmado = inscripcion.pagos && Array.isArray(inscripcion.pagos)
                ? inscripcion.pagos
                    .filter((pago: any) => pago.estado === 'CONFIRMADO')
                    .reduce((sum: number, pago: any) => sum + (pago.monto || 0), 0)
                : 0;
              
              // Saldo = Precio Final - Monto Confirmado
              saldoCalculado = inscripcion.precio_final - montoPagadoConfirmado;
            }

            return {
              id_inscripcion: inscripcion.id_inscripcion,
              ciclo: inscripcion.oferta.ciclo.nombre_ciclo,
              fecha: new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
              }),
              nombre: `${inscripcion.persona.nombre} ${inscripcion.persona.apellido}`,
              programa: inscripcion.oferta.programa.nombre_programa,
              tipoCurso: inscripcion.oferta.subcategoria.nombre_subcategoria,
              detalle: `${inscripcion.paquete.nombre}-${inscripcion.paquete.cantidad_clases} clases`,
              precio: inscripcion.precio_original,
              tipoPromo: inscripcion.promocion
                ? `Descuento ${inscripcion.promocion.porcentaje_descuento}%`
                : "Sin promoción",
              precioDescuento: inscripcion.precio_final,
              saldo: saldoCalculado,
              estado: estadoPago,
              clasesRestantes: inscripcion.clases_restantes,
              clasesUsadas: inscripcion.clases_usadas,
            };
          });

          setInscripcionesData(transformedData);
          console.log(`Inscripciones cargadas desde API: ${transformedData.length}`);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error al cargar inscripciones:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // Fallback a datos mock si falla la API
        setInscripcionesData(accountData);
      } finally {
        setLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

  // Generar opciones dinámicamente desde los datos
  const dataToUse = inscripcionesData.length > 0 ? inscripcionesData : accountData;
  
  const cycles = ["TODOS", ...Array.from(new Set(dataToUse.map(r => r.ciclo))).sort()];
  const programs = ["todos", ...Array.from(new Set(dataToUse.map(r => r.programa))).sort()];
  const tipos = ["todos", ...Array.from(new Set(dataToUse.map(r => r.tipoCurso))).sort()];
  const estados: ("todos" | Estado)[] = ["todos", ...Array.from(new Set(dataToUse.map(r => r.estado))).sort() as Estado[]];

  // Filtro de filas visibles (usar datos de la API)
  const visible = dataToUse
    .filter(r => selectedCycle === "TODOS" || r.ciclo === selectedCycle)
    .filter(r => selectedProgram === "todos" || r.programa === selectedProgram)
    .filter(r => selectedTipoCurso === "todos" || r.tipoCurso === selectedTipoCurso)
    .filter(r => selectedStatus === "todos" || r.estado === selectedStatus)
    .filter(r => !onlySaldo || r.saldo > 0)
    .filter(r => !search.trim() || r.nombre.toLowerCase().includes(search.trim().toLowerCase()));

  // Totales (solo los 2 solicitados)
  // Ingresado: suma solo las inscripciones con estado PAGADO
  const totalIngresado = visible
    .filter(r => r.estado === 'PAGADO')
    .reduce((s, r) => s + r.precioDescuento, 0);
  const totalSaldo = visible.reduce((s, r) => s + r.saldo, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Estado de Cuentas</h1>
          <p className="text-sm text-graphite">Gestión de inscripciones y pagos</p>
        </div>
      </header>

      {/* KPIs (solo 2) */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Kpi title="Ingresado" value={formatBs(totalIngresado)} tone="emerald" />
        <Kpi title="Saldo pendiente" value={formatBs(totalSaldo)} tone="amber" />
      </section>

      {/* Filtros (incluye CICLO) */}
      <section className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-graphite">Ciclo</label>
            <select value={selectedCycle} onChange={(e)=>setSelectedCycle(e.target.value)} className="w-full rounded-lg border border-femme-magenta/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta">
              {cycles.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-graphite">Programa</label>
            <select value={selectedProgram} onChange={(e)=>setSelectedProgram(e.target.value)} className="w-full rounded-lg border border-femme-magenta/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta">
              {programs.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-graphite">Tipo de curso</label>
            <select value={selectedTipoCurso} onChange={(e)=>setSelectedTipoCurso(e.target.value)} className="w-full rounded-lg border border-femme-magenta/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta">
              {tipos.map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-graphite">Estado de pago</label>
            <select value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)} className="w-full rounded-lg border border-femme-magenta/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta">
              {estados.map(s => <option key={s} value={s}>{capitalize(String(s))}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-graphite">Buscar nombre</label>
            <div className="relative">
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Ej. Ana" className="w-full rounded-lg border px-3 py-2 pe-9 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta" />
              <Search className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-graphite" />
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-graphite">
              <input type="checkbox" checked={onlySaldo} onChange={(e)=>setOnlySaldo(e.target.checked)} className="rounded border-graphite" />
              Mostrar solo con saldo
            </label>
          </div>
        </div>
      </section>

      {/* Tabla */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="font-medium text-ink">Listado</h2>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-femme-magenta"></div>
              Cargando inscripciones...
            </div>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <div className="text-sm text-red-600">
              Error al cargar inscripciones: {error}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Mostrando datos de respaldo
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full text-sm">
              <thead className="sticky top-0 bg-graphite/10 text-left text-graphite">
              <tr>
                <Th>Fecha</Th>
                <Th>Nombre</Th>
                <Th>Programa</Th>
                <Th>Tipo curso</Th>
                <Th>Detalle</Th>
                <Th className="text-right">Precio</Th>
                <Th>Tipo Promo</Th>
                <Th className="text-right">Precio con promo</Th>
                <Th className="text-right">Saldo</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-graphite">No hay registros con los filtros actuales.</td>
                </tr>
              ) : (
                visible.map((item, idx) => (
                  <tr key={idx}>
                    <Td>{item.fecha}</Td>
                    <Td className="font-medium">{item.nombre}</Td>
                    <Td>{item.programa}</Td>
                    <Td>{item.tipoCurso}</Td>
                    <Td className="max-w-[200px] truncate" title={item.detalle}>{item.detalle}</Td>
                    <Td className="text-right">{formatBs(item.precio)}</Td>
                    <Td>{item.tipoPromo}</Td>
                    <Td className="text-right">{formatBs(item.precioDescuento)}</Td>
                    <Td className={`text-right ${item.saldo > 0 ? "text-red-600 font-semibold" : "text-emerald-700"}`}>{formatBs(item.saldo)}</Td>
                    <Td>{statusBadge(item.estado)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Sub-componentes UI
function Kpi({ title, value, tone }: { title: string; value: string; tone?: "ink" | "magenta" | "emerald" | "amber" }) {
  const tones: Record<string, string> = {
    ink: "border-ink/10",
    magenta: "border-femme-magenta/30",
    emerald: "border-emerald-300",
    amber: "border-femme-amber/60",
  };
  return (
    <div className={`rounded-2xl border bg-white p-3 shadow-sm ${tones[tone || "ink"]}`}>
      <p className="text-xs text-graphite">{title}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={`px-3 py-2 ${className}`} title={title}>{children}</td>;
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatBs(n: number) { return `Bs. ${n.toLocaleString("es-BO")}`; }

function statusBadge(estado: Estado) {
  const map: Record<Estado, string> = {
    PAGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDIENTE: "bg-femme-softyellow/50 text-ink border-femme-amber/50",
    PAGO_PARCIAL: "bg-blue-50 text-blue-700 border-blue-200",
    VENCIDO: "bg-orange-50 text-orange-700 border-orange-200",
    CANCELADO: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs ${map[estado]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current/60"></span>
      {estado}
    </span>
  );
}
