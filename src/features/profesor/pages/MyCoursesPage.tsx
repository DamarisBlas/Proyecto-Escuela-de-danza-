import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, MapPin, Filter, Users, Clock } from "lucide-react";
import { fetchHorariosByProfesor, fetchProfesorByPersonaId, type HorarioProfesor } from '../api/attendance'
import { useAuth } from '@app/hooks/useAuth'
import AttendanceFilters from './AttendanceFilters'

// -----------------------------------------------------------------------------
// Helpers UI mínimos (Card, Input, Select, Badge)
// -----------------------------------------------------------------------------
function cn(...cls: Array<string | false | undefined>) { return cls.filter(Boolean).join(" "); }

const fmtDMY = (iso: string): string => {
  if (!iso) return 'Fecha no disponible'
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props as any;
  return (
    <div {...rest} className={cn("rounded-2xl border border-graphite/10 bg-snow shadow-sm", className)}>
      {children}
    </div>
  );
}
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn("w-full rounded-xl border border-graphite/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-graphite/50 focus:outline-none focus:ring-2 focus:ring-femme-rose", className)} {...props} />
  );
}
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("w-full rounded-xl border border-graphite/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-femme-rose", className)} {...props}>{children}</select>
  );
}
export function Badge({ children, tone = "default", className }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info"; className?: string }) {
  const tones: Record<string, string> = {
    default: "bg-graphite/10 text-ink",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-femme-softyellow text-ink",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------
const fmtHoraRango = (ini: string, fin: string): string => `${ini} - ${fin}`

const diasSemana = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
}

// Helper: acepta `dias` como number o string (p. ej. "1") y devuelve el nombre
function getDiaNombre(dias: string | number | undefined) {
  if (dias === undefined || dias === null) return 'Día desconocido'
  const n = typeof dias === 'string' ? Number(dias) : dias
  // si no es un número válido, devolvemos desconocido
  if (Number.isNaN(n)) return 'Día desconocido'
  return (diasSemana as any)[n] || 'Día desconocido'
}

// -----------------------------------------------------------------------------
// COMPONENTES ESPECÍFICOS
// -----------------------------------------------------------------------------

function OccupBar({ ocup, cupo }: { ocup: number; cupo: number }) {
  const pct = Math.min(100, Math.round((ocup / cupo) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-28 rounded-full bg-graphite/10">
        <div className="h-2 rounded-full bg-femme-orange" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-graphite/70">{ocup}/{cupo} ({pct}%)</span>
    </div>
  );
}

function CourseCard({ horario, onClick }: { horario: HorarioProfesor; onClick: () => void }) {
  const diaNombre = getDiaNombre(horario.dias)

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-graphite/70 flex items-center gap-2">
            <Calendar className="size-4"/> {diaNombre} · {fmtHoraRango(horario.hora_inicio, horario.hora_fin)}
          </p>
          <h3 className="mt-1 font-semibold">{horario.estilo.nombre_estilo} - Nivel {horario.nivel}</h3>
          <p className="text-sm text-graphite/70 flex items-center gap-2 mt-1">
            <MapPin className="size-4"/> {horario.sala.nombre_sala} · {horario.oferta.nombre_oferta}
          </p>
          <p className="text-xs text-graphite/60 mt-1">
            {horario.oferta.programa.nombre_programa} • {horario.oferta.ciclo.nombre_ciclo}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end">
        <div className="flex items-center gap-1 text-xs text-femme-magenta cursor-pointer" onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}>
          <Users className="size-4" />
          Ver inscripciones ({horario.total_inscritos})
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// PÁGINA PRINCIPAL: MyCoursesPage (Profesor)
// -----------------------------------------------------------------------------

export function MyCoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filteredHorarios, setFilteredHorarios] = useState<HorarioProfesor[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Query para obtener información del profesor
  const { data: profesorInfo, isLoading: loadingProfesor } = useQuery({
    queryKey: ['profesor-info', user?.id],
    queryFn: () => {
      return fetchProfesorByPersonaId(parseInt(user!.id))
    },
    enabled: !!user?.id,
  })

  // Query para obtener horarios del profesor
  const { data: horariosData, isLoading: loadingHorarios } = useQuery({
    queryKey: ['horarios-profesor', profesorInfo?.Persona_id_persona],
    queryFn: () => {
      return fetchHorariosByProfesor(profesorInfo!.Persona_id_persona)
    },
    enabled: !!profesorInfo?.Persona_id_persona,
  })

  // Inicializar horarios filtrados cuando se cargan los datos
  useEffect(() => {
    if (horariosData?.horarios && filteredHorarios.length === 0) {
      setFilteredHorarios(horariosData.horarios)
    }
  }, [horariosData?.horarios, filteredHorarios.length])

  // Función para manejar cambios en los filtros
  const handleFiltersChange = (filtered: HorarioProfesor[]) => {
    setFilteredHorarios(filtered)
  }

  // Manejar clic en un horario
  const handleHorarioClick = (horario: HorarioProfesor) => {
    navigate('/cuenta/profesor/asistencias', { state: { horarioId: horario.id_horario } })
  }

  // Filtrar por búsqueda
  const displayedHorarios = useMemo(() => {
    if (!searchQuery.trim()) return filteredHorarios

    return filteredHorarios.filter(horario =>
      horario.estilo.nombre_estilo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      horario.oferta.nombre_oferta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      horario.sala.nombre_sala.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [filteredHorarios, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mis cursos</h1>
          <p className="text-graphite/70">Todas tus clases activas por ciclo y sede</p>
        </div>
        <div />
      </div>

      {/* Toolbar con filtros */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Búsqueda */}
          <div className="flex justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-graphite/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar curso…"
                className="pl-10 w-72"
              />
            </div>
          </div>

          {/* Filtros */}
          {horariosData?.horarios && (
            <AttendanceFilters
              horarios={horariosData.horarios}
              onFiltersChange={handleFiltersChange}
            />
          )}
        </div>
      </Card>

      {/* Grid de cursos */}
      {loadingProfesor || loadingHorarios ? (
        <Card className="p-10 text-center text-graphite/60">
          <div className="mx-auto mb-3 size-10 rounded-full bg-graphite/10 grid place-items-center">
            <Clock className="size-5 animate-spin"/>
          </div>
          Cargando cursos...
        </Card>
      ) : displayedHorarios.length === 0 ? (
        <Card className="p-10 text-center text-graphite/60">
          <div className="mx-auto mb-3 size-10 rounded-full bg-graphite/10 grid place-items-center">
            <Filter className="size-5"/>
          </div>
          No se encontraron cursos con los filtros seleccionados.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayedHorarios.map((horario) => (
            <CourseCard
              key={horario.id_horario}
              horario={horario}
              onClick={() => {
                handleHorarioClick(horario)
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// UI helpers
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 text-xs font-medium ${className}`}>{children}</th>
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 align-top ${className}`}>{children}</td>
}

// -----------------------------------------------------------------------------
// PREVIEW — Solo para visualizar aquí (no copies si no quieres)
// -----------------------------------------------------------------------------
export default function TeacherMyCoursesPreview() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-graphite/10 bg-white/80 backdrop-blur">

      </header>
      <main className="container mx-auto p-4">
        <MyCoursesPage />
      </main>
    </div>
  );
}

