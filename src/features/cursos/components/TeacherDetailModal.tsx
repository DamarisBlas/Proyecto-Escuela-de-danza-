import { X } from 'lucide-react'

interface Instructor {
  id: string
  name: string
  instagram?: string | null
  frase?: string | null
  descripcion?: string | null
  ciudad?: string | null
  signo?: string | null
  musica_favorita?: string | null
  experiencia?: string | null
}

interface TeacherDetailModalProps {
  instructor: Instructor
  isOpen: boolean
  onClose: () => void
}

export default function TeacherDetailModal({ instructor, isOpen, onClose }: TeacherDetailModalProps) {
  if (!isOpen) return null

  // Extraer primera letra del nombre para el avatar
  const firstLetter = instructor.name.charAt(0).toUpperCase()
  const instagramUsername = instructor.instagram || 'No disponible'
  const instagramUrl = instructor.instagram ? `https://instagram.com/${instructor.instagram}` : '#'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="relative my-4 sm:my-8 w-full max-w-2xl rounded-xl sm:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xs sm:text-sm text-slate-500">Ver detalle profesor</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Nombre y foto */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start gap-4 sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{instructor.name}</h1>
              {instructor.instagram && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-femme-magenta hover:underline text-sm sm:text-base"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
            {/* Avatar con inicial o foto */}
            <div className="flex h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 items-center justify-center rounded-full border-4 border-femme-magenta/20 bg-gradient-to-br from-femme-magenta to-femme-rose shadow-lg">
              <span className="text-4xl sm:text-5xl font-bold text-white">{firstLetter}</span>
            </div>
          </div>

          {/* Sobre el profesor */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-slate-900">Sobre {instructor.name.split(' ')[0]}</h3>
            {instructor.frase && (
              <p className="mb-3 sm:mb-4 italic text-sm sm:text-base text-slate-600">"{instructor.frase}"</p>
            )}
            {instructor.descripcion && (
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-700">{instructor.descripcion}</p>
            )}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-700">
              {instructor.ciudad && (
                <p><span className="font-medium">Ciudad de origen:</span> {instructor.ciudad}</p>
              )}
              {instructor.signo && (
                <p><span className="font-medium">Signo zodiacal:</span> {instructor.signo}</p>
              )}
              {instructor.musica_favorita && (
                <p><span className="font-medium">Estilo de musica favorito:</span> {instructor.musica_favorita}</p>
              )}
              {instructor.experiencia && (
                <p><span className="font-medium">Experiencia en la danza:</span> {instructor.experiencia}</p>
              )}
            </div>
          </div>

          {/* Instagram */}
          {instructor.instagram && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs sm:text-sm text-femme-magenta hover:underline"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-medium">{instagramUsername}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
