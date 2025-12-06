import { useState } from 'react'
import { X, MapPin, Calendar, Clock, User } from 'lucide-react'

interface Course {
  id: string
  name: string
  level: string
  type: string
  ciclo: string
  schedule: string
  date: string
  duration: string
  instructor: {
    id: string
    name: string
    photo?: string
  }
  description: string
  benefits: string[]
  location: {
    city: string
    zone: string
    address: string
    studio: string
    mapUrl: string
  }
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Card del curso - Trigger del modal */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-femme-magenta">{course.name}</h3>
            <p className="text-sm text-slate-600">Nivel {course.level}</p>
          </div>
          <span className="rounded-full bg-femme-magenta/10 px-2 py-1 text-xs font-medium text-femme-magenta">
            {course.type}
          </span>
        </div>
      </div>

      {/* Modal de detalles del curso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* Header del modal */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <h2 className="text-sm text-slate-500">Ver detalle curso</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-6">
              {/* Título y ciclo */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{course.name}</h1>
                  <p className="mt-1 text-base text-slate-600">Nivel {course.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-400">
                    {course.ciclo}
                  </p>
                </div>
              </div>

              {/* Información de horario */}
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-medium text-slate-700">{course.type}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{course.date}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.schedule} - {course.duration}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  {course.instructor.photo ? (
                    <img
                      src={course.instructor.photo}
                      alt={course.instructor.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{course.instructor.name}</p>
                </div>
              </div>

              {/* Descripción de la clase */}
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Descripcion de la clase</h3>
                <p className="text-sm leading-relaxed text-slate-700">{course.description}</p>

                {course.benefits && course.benefits.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Beneficios de este curso</p>
                    <ul className="space-y-1">
                      {course.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400"></span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Detalle de la Sala */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Detalle de la Sala</h3>
                <div className="space-y-1 text-sm text-slate-700">
                  <p>{course.location.city}</p>
                  <p>{course.location.zone}</p>
                  <p>{course.location.address}</p>
                  <p>{course.location.studio}</p>
                  {course.location.mapUrl && (
                    <a
                      href={course.location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-femme-magenta hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver en Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
