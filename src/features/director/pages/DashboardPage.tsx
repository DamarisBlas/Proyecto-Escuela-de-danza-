

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { env } from '@/config/env';
import MachineLearning from '../components/MachineLearning';

// ────────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────────

interface Ciclo {
  id_ciclo: number;
  nombre: string;
  inicio: string;
  fin: string;
  estado: boolean;
}

interface KPIs {
  total_alumnas: number;
  ocupacion_promedio: number;
  ingresos_mes_actual: number;
  asistencia_promedio: number;
}

interface EstadisticasGenerales {
  ciclo: {
    id_ciclo: number;
    nombre_ciclo: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  kpis: KPIs;
}

interface EstiloDatos {
  id_estilo: number;
  nombre_estilo: string;
  total_alumnas: number;
}

interface OcupacionEstilo {
  nombre_estilo: string;
  capacidad_total: number;
  cupos_ocupados: number;
  porcentaje_ocupacion: number;
}

interface IngresoMensual {
  mes: string;
  mes_numero: number;
  total_ingresos: number;
}

const palette = {
  magenta: "#C2185B",
  rose: "#EC407A",
  coral: "#F04E45",
  amber: "#FFB300",
  softyellow: "#FFE082",
};
const COLORS = [palette.magenta, palette.rose, palette.coral, palette.amber, palette.softyellow];

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [selectedCicloId, setSelectedCicloId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los datos del dashboard
  const [kpis, setKpis] = useState<KPIs>({
    total_alumnas: 0,
    ocupacion_promedio: 0,
    ingresos_mes_actual: 0,
    asistencia_promedio: 0,
  });
  const [alumnasPorEstilo, setAlumnasPorEstilo] = useState<EstiloDatos[]>([]);
  const [ocupacionPorEstilo, setOcupacionPorEstilo] = useState<OcupacionEstilo[]>([]);
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresoMensual[]>([]);

  // Fetch de ciclos activos
  useEffect(() => {
    const fetchCiclos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${env.API_URL}/ciclos/active`);
        if (!response.ok) throw new Error('Error al cargar ciclos');
        
        const data: Ciclo[] = await response.json();
        setCiclos(data);
        
        // Seleccionar el primer ciclo por defecto
        if (data.length > 0 && !selectedCicloId) {
          setSelectedCicloId(data[0].id_ciclo);
        }
      } catch (err) {
        console.error('Error al cargar ciclos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCiclos();
  }, []);

  // Fetch de datos del dashboard cuando cambia el ciclo seleccionado
  useEffect(() => {
    if (!selectedCicloId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch paralelo de todos los datos
        const [estadisticasRes, alumnasPorEstiloRes, ocupacionRes, ingresosRes] = await Promise.all([
          fetch(`${env.API_URL}/dashboard/estadisticas/${selectedCicloId}`),
          fetch(`${env.API_URL}/dashboard/alumnas-por-estilo/${selectedCicloId}`),
          fetch(`${env.API_URL}/dashboard/ocupacion-por-estilo/${selectedCicloId}`),
          fetch(`${env.API_URL}/dashboard/ingresos-mensuales?anio=${new Date().getFullYear()}&meses=6`),
        ]);

        if (!estadisticasRes.ok || !alumnasPorEstiloRes.ok || !ocupacionRes.ok || !ingresosRes.ok) {
          throw new Error('Error al cargar datos del dashboard');
        }

        const estadisticas: EstadisticasGenerales = await estadisticasRes.json();
        const alumnasPorEstiloData = await alumnasPorEstiloRes.json();
        const ocupacionData = await ocupacionRes.json();
        const ingresosData = await ingresosRes.json();

        // Actualizar estados
        setKpis(estadisticas.kpis);
        setAlumnasPorEstilo(alumnasPorEstiloData.estilos || []);
        setOcupacionPorEstilo(ocupacionData.ocupacion || []);
        setIngresosMensuales(ingresosData.ingresos || []);

        console.log('Dashboard data loaded:', {
          ciclo: selectedCicloId,
          kpis: estadisticas.kpis,
          estilos: alumnasPorEstiloData.estilos?.length,
          ocupacion: ocupacionData.ocupacion?.length,
          ingresos: ingresosData.ingresos?.length,
        });
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCicloId]);

  // Estados de carga y error
  if (loading && ciclos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-femme-magenta"></div>
            Cargando dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-sm text-red-600">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-femme-magenta hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const cicloActual = ciclos.find(c => c.id_ciclo === selectedCicloId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-graphite">
            Resumen del ciclo {cicloActual ? `- ${cicloActual.nombre}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-graphite">Ciclo</label>
          <select
            className="rounded-lg border border-femme-magenta/40 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-femme-magenta"
            value={selectedCicloId || ''}
            onChange={(e) => setSelectedCicloId(Number(e.target.value))}
          >
            {ciclos.map((c) => (
              <option key={c.id_ciclo} value={c.id_ciclo}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiGradient 
          title="Total Alumnas" 
          value={kpis.total_alumnas.toLocaleString("es-BO")} 
          gradient="from-femme-magenta to-femme-rose" 
          text="text-white" 
        />
        <KpiGradient 
          title="Ocupación Promedio" 
          value={`${kpis.ocupacion_promedio}%`} 
          gradient="from-femme-coral to-femme-amber" 
          text="text-white" 
        />
        <KpiGradient 
          title="Ingresos del Mes" 
          value={`Bs. ${kpis.ingresos_mes_actual.toLocaleString("es-BO")}`} 
          gradient="from-femme-coral to-femme-amber" 
          text="text-white" 
        />
        <KpiGradient 
          title="Asistencia Promedio" 
          value={`${kpis.asistencia_promedio}%`} 
          gradient="from-femme-amber to-femme-softyellow" 
          text="text-ink" 
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alumnas por estilo */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-ink">Alumnas por estilo</h3>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-femme-magenta"></div>
            </div>
          ) : alumnasPorEstilo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alumnasPorEstilo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre_estilo" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="total_alumnas" radius={[6, 6, 0, 0]} fill={palette.magenta} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Ocupación por estilo */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-ink">Porcentaje de ocupación</h3>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-femme-magenta"></div>
            </div>
          ) : ocupacionPorEstilo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={ocupacionPorEstilo as any} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={90} 
                  dataKey="porcentaje_ocupacion" 
                  label={({ nombre_estilo, porcentaje_ocupacion }: any) => `${nombre_estilo}: ${porcentaje_ocupacion}%`}
                >
                  {ocupacionPorEstilo.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No hay datos disponibles
            </div>
          )}
        </div>
      </section>

      {/* Ingresos */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-ink">Ingresos (últimos 6 meses)</h3>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-femme-magenta"></div>
          </div>
        ) : ingresosMensuales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ingresosMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_ingresos" 
                stroke={palette.magenta} 
                strokeWidth={3} 
                dot={{ r: 3 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No hay datos disponibles
          </div>
        )}
      </section>

      {/* Machine Learning Dashboard */}
    
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Sub-componentes
function KpiGradient({ title, value, gradient, text }: { title: string; value: string | number; gradient: string; text: string }) {
  return (
    <div className={`rounded-2xl p-4 text-left shadow-sm bg-gradient-to-r ${gradient}`}>
      <p className={`text-sm font-medium ${text}`}>{title}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
    </div>
  );
}

