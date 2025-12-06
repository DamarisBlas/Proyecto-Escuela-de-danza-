import { X, Check, Infinity, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Paquete } from '../types'

interface PackagesModalProps {
  courseName: string
  paquetes: Paquete[]
  isOpen: boolean
  onClose: () => void
  onSelectPackage: (paquete: Paquete) => void
  isAuthenticated: boolean
}

export default function PackagesModal({ 
  courseName, 
  paquetes, 
  isOpen, 
  onClose,
  onSelectPackage,
  isAuthenticated 
}: PackagesModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleGoToLogin = () => {
    navigate('/auth/login', { state: { from: '/cursos' } })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="relative my-4 sm:my-8 w-full max-w-3xl rounded-xl sm:rounded-2xl bg-white shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Selecciona tu paquete</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{courseName}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Contenido - Grid de paquetes */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Mensaje de autenticación requerida */}
          {!isAuthenticated && (
            <div className="mb-6 rounded-lg bg-amber-50 border-2 border-amber-200 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">
                    Inicia sesión para inscribirte
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-amber-700">
                    Necesitas estar autenticado para seleccionar un paquete y completar tu inscripción.
                  </p>
                  <button
                    onClick={handleGoToLogin}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 hover:shadow-md"
                  >
                    <Lock className="h-4 w-4" />
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {paquetes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No hay paquetes disponibles para esta clase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paquetes.map((paquete) => (
                <PackageCard 
                  key={paquete.id} 
                  paquete={paquete} 
                  onSelect={() => onSelectPackage(paquete)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}

          {/* Nota informativa */}
          <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-600">
              <span className="font-semibold">Nota:</span> Los paquetes tienen validez de {paquetes[0]?.dias_validez || 30} días 
              desde la fecha de compra. Podrás asistir a cualquier clase disponible en tu nivel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de tarjeta de paquete
function PackageCard({ 
  paquete, 
  onSelect, 
  isAuthenticated 
}: { 
  paquete: Paquete
  onSelect: () => void
  isAuthenticated: boolean
}) {
  const isUnlimited = paquete.ilimitado
  const isPopular = paquete.nombre.toLowerCase().includes('full') || isUnlimited

  return (
    <div 
      className={`relative rounded-xl border-2 p-4 sm:p-5 transition hover:shadow-lg cursor-pointer ${
        isPopular 
          ? 'border-femme-magenta bg-gradient-to-br from-femme-magenta/5 to-femme-rose/5' 
          : 'border-slate-200 bg-white hover:border-femme-magenta/50'
      }`}
      onClick={onSelect}
    >
      {/* Badge popular */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-femme-magenta to-femme-rose px-3 py-1 text-xs font-bold text-white shadow-md">
             Más Popular 
          </span>
        </div>
      )}

      {/* Nombre del paquete */}
      <div className="mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          Paquete {paquete.nombre}
        </h3>
      </div>

      {/* Clases incluidas */}
      <div className="mb-4 flex items-baseline gap-2">
        {isUnlimited ? (
          <div className="flex items-center gap-2">
            <Infinity className="h-6 w-6 sm:h-7 sm:w-7 text-femme-magenta" />
            <span className="text-2xl sm:text-3xl font-bold text-femme-magenta">Ilimitado</span>
          </div>
        ) : (
          <>
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">
              {paquete.cantidad_clases}
            </span>
            <span className="text-sm sm:text-base text-slate-600">
              {paquete.cantidad_clases === 1 ? 'clase' : 'clases'}
            </span>
          </>
        )}
      </div>

      {/* Características */}
      <ul className="mb-4 space-y-2">
        <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
          <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-femme-magenta mt-0.5" />
          <span>Válido por {paquete.dias_validez} días</span>
        </li>
        <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
          <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-femme-magenta mt-0.5" />
          <span>Acceso a todas las sedes</span>
        </li>
        {isUnlimited && (
          <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-femme-magenta mt-0.5" />
            <span>Asiste a todas las clases que quieras</span>
          </li>
        )}
      </ul>

      {/* Precio */}
      <div className="border-t border-slate-200 pt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Precio</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bs {paquete.precio.toFixed(2)}
          </p>
          {!isUnlimited && paquete.cantidad_clases && (
            <p className="text-xs text-slate-500 mt-1">
              Bs {(paquete.precio / paquete.cantidad_clases).toFixed(2)} por clase
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          disabled={!isAuthenticated}
          className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
            !isAuthenticated
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isPopular
              ? 'bg-gradient-to-r from-femme-magenta to-femme-rose text-white hover:shadow-md'
              : 'bg-femme-magenta text-white hover:bg-femme-rose hover:shadow-md'
          }`}
        >
          {!isAuthenticated ? (
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Iniciar sesión
            </span>
          ) : (
            'Seleccionar'
          )}
        </button>
      </div>
    </div>
  )
}
