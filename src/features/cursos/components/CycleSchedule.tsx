import React, { useState } from 'react'
import { Spinner } from '@components/ui/Spinner'
import { X, Calendar, Clock, MapPin, Tag, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

// Datos mock para demostración
const MOCK_DATA = {
  ciclos: [
    {
      id_ciclo: 10,
      nombre_ciclo: 'Ciclo 3/2025',
      fecha_inicio: '2025-10-20',
      fecha_fin: '2025-12-13',
      estado: true,
      ofertas: [
        {
          id_oferta: 19,
          nombre_oferta: 'Curso regular 3 -2025',
          tipo: 'REGULAR',
          fecha_inicio: '2025-10-20',
          fecha_fin: '2025-12-13',
          estado: 'EN CURSO',
          cantidad_cursos: 7,
          categoria: 'Técnico',
          subcategoria: 'Regular',
          actividades: [
            {
              fecha: '2025-10-20',
              descripcion: 'INICIO DE CURSOS FEMME',
              tipo: 'inicio',
            },
            {
              fecha: '2025-12-13',
              descripcion: 'FIN DE CURSOS FEMME',
              tipo: 'fin',
            },
          ],
        },
        {
          id_oferta: 20,
          nombre_oferta: 'Especial Halloween',
          tipo: 'TALLER',
          fecha_inicio: '2025-10-31',
          fecha_fin: '2025-10-31',
          estado: 'REALIZADO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Especiales',
          actividades: [
            {
              fecha: '2025-10-31',
              descripcion: 'ESPECIAL "HALLOWEEN"',
              tipo: 'especial',
            },
          ],
        },
        {
          id_oferta: 21,
          nombre_oferta: 'Talleres Femme I',
          tipo: 'TALLER',
          fecha_inicio: '2025-11-01',
          fecha_fin: '2025-11-08',
          estado: 'REALIZADO',
          cantidad_cursos: 2,
          categoria: 'Técnico',
          subcategoria: 'Talleres',
          actividades: [
            {
              fecha: '2025-11-01',
              descripcion: 'TALLERES FEMME I',
              tipo: 'taller',
            },
          ],
        },
        {
          id_oferta: 22,
          nombre_oferta: 'Intensivo Kinesiología I',
          tipo: 'TALLER',
          fecha_inicio: '2025-11-02',
          fecha_fin: '2025-11-02',
          estado: 'REALIZADO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Intensivos',
          actividades: [
            {
              fecha: '2025-11-02',
              descripcion: 'INTENSIVO "KINESIOLOGIA I"',
              tipo: 'intensivo',
            },
          ],
        },
        {
          id_oferta: 23,
          nombre_oferta: 'Producción Heels',
          tipo: 'TALLER',
          fecha_inicio: '2025-10-25',
          fecha_fin: '2025-10-25',
          estado: 'CANCELADO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Producción',
          actividades: [
            {
              fecha: '2025-10-25',
              descripcion: 'PRODUCCIÓN "HEELS"',
              tipo: 'produccion',
            },
          ],
        },
        {
          id_oferta: 24,
          nombre_oferta: 'Talleres Femme II',
          tipo: 'TALLER',
          fecha_inicio: '2025-11-08',
          fecha_fin: '2025-11-08',
          estado: 'REALIZADO',
          cantidad_cursos: 1,
          categoria: 'Técnico',
          subcategoria: 'Talleres',
          actividades: [
            {
              fecha: '2025-11-08',
              descripcion: 'TALLERES FEMME II',
              tipo: 'taller',
            },
          ],
        },
        {
          id_oferta: 25,
          nombre_oferta: 'Evaluación Nivel Elemental',
          tipo: 'TALLER',
          fecha_inicio: '2025-11-15',
          fecha_fin: '2025-11-15',
          estado: 'REALIZADO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Evaluaciones',
          actividades: [
            {
              fecha: '2025-11-15',
              descripcion: 'EVALUACION "NIVEL ELEMENTAL"',
              tipo: 'evaluacion',
            },
          ],
        },
        {
          id_oferta: 26,
          nombre_oferta: 'Producción Heels Modificado',
          tipo: 'TALLER',
          fecha_inicio: '2025-11-22',
          fecha_fin: '2025-11-22',
          estado: 'MODIFICADO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Producción',
          actividades: [
            {
              fecha: '2025-11-22',
              descripcion: 'PRODUCCION "HEELS"',
              tipo: 'produccion',
            },
          ],
        },
        {
          id_oferta: 27,
          nombre_oferta: 'Intensivo Origami Femme',
          tipo: 'TALLER',
          fecha_inicio: '2025-12-13',
          fecha_fin: '2025-12-13',
          estado: 'EN CURSO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Intensivos',
          actividades: [
            {
              fecha: '2025-12-13',
              descripcion: 'INTENSIVO "ORIGAMI FEMME"',
              tipo: 'intensivo',
            },
          ],
        },
        {
          id_oferta: 28,
          nombre_oferta: 'Especial Navidad',
          tipo: 'TALLER',
          fecha_inicio: '2025-12-20',
          fecha_fin: '2025-12-20',
          estado: 'EN CURSO',
          cantidad_cursos: 1,
          categoria: 'Complementario',
          subcategoria: 'Especiales',
          actividades: [
            {
              fecha: '2025-12-20',
              descripcion: 'ESPECIAL "NAVIDAD"',
              tipo: 'especial',
            },
          ],
        },
      ],
    },
  ],
}

interface CycleScheduleProps {
  onClose: () => void
}

export default function CycleSchedule({ onClose }: CycleScheduleProps) {
  const [selectedCiclo, setSelectedCiclo] = useState<string | null>(null)

  // Usar datos mock en lugar de query
  const data = MOCK_DATA
  const isLoading = false
  const error = null

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative mx-4 w-full max-w-6xl rounded-3xl bg-white p-8 shadow-2xl">
          <Spinner />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative mx-4 w-full max-w-6xl rounded-3xl bg-white p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-red-50 p-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-center text-lg font-semibold text-red-600">
              Error al cargar el cronograma
            </p>
            <p className="text-center text-sm text-slate-600">
              Por favor, intenta nuevamente más tarde
            </p>
          </div>
        </div>
      </div>
    )
  }

  const ciclos = data.ciclos || []
  const activeCiclo = selectedCiclo || (ciclos.length > 0 ? ciclos[0].nombre_ciclo : null)
  const currentCiclo = ciclos.find((c) => c.nombre_ciclo === activeCiclo)

  // Función para formatear fechas
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  // Función para obtener el estado de una actividad
  const getActivityStatus = (fechaInicio: string, fechaFin: string) => {
    const now = new Date()
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (now < inicio) {
      return { label: 'PRÓXIMO', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock }
    } else if (now > fin) {
      return { label: 'REALIZADO', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle2 }
    } else {
      return { label: 'EN CURSO', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 }
    }
  }

  // Función para obtener color de categoría
  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Técnico': 'from-femme-magenta to-femme-rose',
      'Complementario': 'from-femme-orange to-femme-coral',
      'Especial': 'from-purple-500 to-pink-500',
      'Intensivo': 'from-blue-500 to-cyan-500',
    }
    return colors[categoria] || 'from-slate-500 to-slate-600'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full p-4 md:p-6 lg:p-8">
          <div className="relative mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-white via-orange-50/30 to-white shadow-2xl">
            {/* Header con gradiente naranja tipo cronograma */}
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 px-6 py-8 md:px-8 md:py-10">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,.1) 10px,
                  rgba(255,255,255,.1) 20px
                )`
              }}></div>
              
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute -right-2 -top-2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95 md:right-0 md:top-0"
                  aria-label="Cerrar"
                >
                  <X size={24} />
                </button>

                <div className="pr-12">
                  <div className="mb-2 inline-block rounded-lg bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Camino Femme
                    </span>
                  </div>
                  <h2 className="mb-2 text-2xl font-black uppercase text-white md:text-3xl lg:text-4xl">
                    📅 Cronograma
                  </h2>
                  <p className="max-w-2xl text-sm text-white/95 md:text-base">
                    Fechas importantes, actividades y ofertas del ciclo
                  </p>
                </div>

                {/* Selector de ciclo */}
                {ciclos.length > 1 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {ciclos.map((ciclo) => (
                        <button
                          key={ciclo.id_ciclo}
                          onClick={() => setSelectedCiclo(ciclo.nombre_ciclo)}
                          className={`rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
                            activeCiclo === ciclo.nombre_ciclo
                              ? 'bg-white text-orange-600 shadow-lg scale-105'
                              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                          }`}
                        >
                          {ciclo.nombre_ciclo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 md:p-6 lg:p-8">
              {currentCiclo ? (
                <>
                  {/* Info del ciclo */}
                  <div className="mb-6 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-500 p-3">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase text-slate-800">
                            {currentCiclo.nombre_ciclo}
                          </h3>
                          <p className="text-sm font-semibold text-orange-600">
                            {formatDate(currentCiclo.fecha_inicio)} — {formatDate(currentCiclo.fecha_fin)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notas importantes */}
                    <div className="space-y-2 border-t border-orange-200 pt-4">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-lg">*</span>
                        <p className="text-orange-700">
                          Son indispensables superar para el programa CF
                        </p>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-lg text-green-600">**</span>
                        <p className="text-green-700">
                          Es para quienes superen el nivel elemental
                        </p>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-lg text-blue-600">*</span>
                        <p className="text-blue-700">
                          Indica solo el 1er día se debe revisar el horario vigente
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ofertas del ciclo */}
                  {currentCiclo.ofertas && currentCiclo.ofertas.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-slate-700">
                        <Tag className="h-5 w-5 text-orange-500" />
                        Actividades y Ofertas
                      </h3>

                      {/* Vista Desktop - Tabla */}
                      <div className="hidden md:block">
                        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                                  Mes
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                                  Fechas
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                                  Actividad
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentCiclo.ofertas
                                .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
                                .map((oferta) => {
                                  const status = getActivityStatus(oferta.fecha_inicio, oferta.fecha_fin)
                                  const StatusIcon = status.icon
                                  const mes = new Intl.DateTimeFormat('es-BO', { month: 'long' }).format(new Date(oferta.fecha_inicio))

                                  return (
                                    <tr key={oferta.id_oferta} className="transition-colors hover:bg-slate-50">
                                      <td className="px-6 py-4">
                                        <span className="text-sm font-bold uppercase text-slate-600">
                                          {mes}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                          <Clock className="h-4 w-4 text-slate-400" />
                                          {formatDate(oferta.fecha_inicio)} — {formatDate(oferta.fecha_fin)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`h-3 w-3 rounded-full bg-gradient-to-r ${getCategoryColor(oferta.categoria.nombre_categoria)}`}
                                          />
                                          <div>
                                            <p className="font-bold uppercase text-slate-800">
                                              {oferta.nombre_oferta}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              {oferta.categoria.nombre_categoria} • {oferta.subcategoria.nombre_subcategoria}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${status.color}`}>
                                          <StatusIcon className="h-3.5 w-3.5" />
                                          <span className="text-xs font-bold uppercase tracking-wide">
                                            {status.label}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Vista Mobile - Cards */}
                      <div className="space-y-4 md:hidden">
                        {currentCiclo.ofertas
                          .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
                          .map((oferta) => {
                            const status = getActivityStatus(oferta.fecha_inicio, oferta.fecha_fin)
                            const StatusIcon = status.icon
                            const mes = new Intl.DateTimeFormat('es-BO', { month: 'long' }).format(new Date(oferta.fecha_inicio))

                            return (
                              <div
                                key={oferta.id_oferta}
                                className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg"
                              >
                                {/* Header con mes y estado */}
                                <div className={`bg-gradient-to-r ${getCategoryColor(oferta.categoria.nombre_categoria)} px-4 py-3`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                      {mes}
                                    </span>
                                    <div className={`rounded-lg border bg-white/95 px-2 py-1 ${status.color.replace('bg-', 'border-')}`}>
                                      <div className="flex items-center gap-1">
                                        <StatusIcon className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">
                                          {status.label}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4 space-y-3">
                                  {/* Título */}
                                  <h4 className="text-lg font-black uppercase text-slate-800">
                                    {oferta.nombre_oferta}
                                  </h4>

                                  {/* Categoría */}
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">
                                      {oferta.categoria.nombre_categoria} • {oferta.subcategoria.nombre_subcategoria}
                                    </span>
                                  </div>

                                  {/* Fechas */}
                                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-semibold text-slate-700">
                                      {formatDate(oferta.fecha_inicio)} — {formatDate(oferta.fecha_fin)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <AlertCircle className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-slate-700">
                        No hay actividades programadas
                      </h3>
                      <p className="text-sm text-slate-500">
                        Aún no se han agregado ofertas para este ciclo
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-slate-700">
                    No hay ciclos disponibles
                  </h3>
                  <p className="text-sm text-slate-500">
                    No se encontraron ciclos activos en el sistema
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
