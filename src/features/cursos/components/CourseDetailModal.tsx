import { X, Calendar, User, MapPin, Clock } from 'lucide-react'
import type { Session } from '../types'

interface CourseDetailModalProps {
  session: Session
  isOpen: boolean
  onClose: () => void
}

export default function CourseDetailModal({ session, isOpen, onClose }: CourseDetailModalProps) {
  if (!isOpen) return null

  const start = new Date(session.start)
  const end = new Date(session.end)
  
  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }
  
  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="relative my-4 sm:my-8 w-full max-w-2xl rounded-xl sm:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header con gradiente */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-femme-magenta to-femme-rose px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xs sm:text-sm font-medium text-white/90">Ver detalle curso</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Título */}
          <div className="mb-4 flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-femme-magenta to-femme-rose bg-clip-text text-transparent">
                {session.courseName}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">Nivel {session.level}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="rounded-full bg-femme-magenta/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-femme-magenta whitespace-nowrap">
                {session.ciclo || 'CICLO 1 - 2024'}
              </p>
            </div>
          </div>

          {/* Horario con acento magenta */}
          <div className="mb-4 sm:mb-6 rounded-lg border-2 border-femme-magenta/20 bg-gradient-to-br from-femme-magenta/5 to-femme-rose/5 p-3 sm:p-4">
            <p className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-semibold text-femme-magenta">
              <span className="h-2 w-2 rounded-full bg-femme-magenta"></span>
              {session.type === 'TALLER' ? 'Taller' : 'Clases regulares'}
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-femme-magenta flex-shrink-0" />
              <span className="font-medium">{formatDate(start)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-femme-magenta flex-shrink-0" />
              <span className="font-medium">{formatTime(start)} - {formatTime(end)}</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-900">{session.instructor.name}</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 sm:mb-3 flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-900">
              <span className="h-1 w-6 sm:w-8 rounded-full bg-gradient-to-r from-femme-magenta to-femme-rose"></span>
              Descripcion de la clase
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              {session.descripcion || `${session.courseName} se caracteriza por ser un baile con una gran actitud, energía y pasos de baile.`}
            </p>
            {session.beneficios && (
              <div className="mt-3 sm:mt-4">
                <p className="mb-2 text-xs sm:text-sm font-semibold text-femme-magenta">Beneficios de este curso</p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {session.beneficios.split(',').map((beneficio, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-femme-magenta"></span>
                      <span>{beneficio.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detalle de la Sala con acento */}
          <div className="rounded-lg border-2 border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
            <h3 className="mb-2 sm:mb-3 flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-900">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-femme-magenta flex-shrink-0" />
              Detalle de la Sala
            </h3>
            <div className="space-y-1 text-xs sm:text-sm text-slate-700">
              <p className="font-medium">{session.sala?.departamento || 'La Paz Bolivia'}</p>
              <p>Zona {session.sala?.zona || session.branch}</p>
              <p>Direccion {session.sala?.direccion || 'No especificada'}</p>
              <p className="text-slate-600">{session.sala?.nombre || 'Studio Dance with me'}</p>
              {session.sala?.link_ubicacion && (
                <a
                  href={session.sala.link_ubicacion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 sm:mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-femme-magenta to-femme-rose px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Ver en Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
