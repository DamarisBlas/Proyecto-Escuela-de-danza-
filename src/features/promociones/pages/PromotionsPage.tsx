import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PromotionCard from '../PromotionCard'
import PromotionDetailModal from '../components/PromotionDetailModal'
import PromotionPackagesModal from '../components/PromotionPackagesModal'
import type { Promotion } from '../../../types'
import { Button } from '@components/ui/Button'
import { toast } from 'sonner'
import { useAuthGate } from '@app/hooks/useAuthGate'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPromociones } from '@/features/director/api/backend'
import { getInscripcionesCompletas } from '@/features/cuenta/api/inscripciones'
import { Spinner } from '@components/ui/Spinner'
import { env } from '@/config/env'


interface BackendPromocion {
  id_promocion: number
  nombre_promocion: string
  descricpcion: string
  fecha_inicio: string
  fecha_fin: string
  porcentaje_descuento: number
  publico_objetivo: string
  img: string
  Oferta_id_oferta: number
  paquetes_especificos: string
  aplica_nuevos_usuarios: boolean
  tiene_sorteo: boolean
  cantidad_premios: number | null
  cantidad_beneficiarios?: number | null
  cantidad_beneficiarios_inscritos?: number
  activo: boolean
  estado: boolean
}

function mapBackendToPromotion(backend: BackendPromocion): Promotion {
  // Formatear fecha de fin
  const fechaFin = new Date(backend.fecha_fin)
  const validUntil = `Válida hasta el ${fechaFin.getDate()} de ${fechaFin.toLocaleString('es', { month: 'long' })}`

  // Formatear ciclo 
  const fechaInicio = new Date(backend.fecha_inicio)
  const year = fechaInicio.getFullYear()
  const cycle = `Promoción ${year}`

  // Manejar imagen: puede ser base64, ruta relativa o URL completa
  let image = backend.img
  if (image.startsWith('data:')) {
    // Es base64, usar directamente
    image = backend.img
  } else if (image.startsWith('http')) {
    // Es URL completa, usar directamente
    image = backend.img
  } else if (image.startsWith('/uploads/')) {
    // Es ruta del servidor, construir URL completa
    image = `${env.API_URL}/promociones${image}`
  } else {
    // Cualquier otra ruta, agregar baseURL
    image = `${env.API_URL}${image.startsWith('/') ? '' : '/'}${image}`
  }

  // Construir condiciones (sin el texto "Solo nuevos usuarios" en el detalle)
  const conditions = [
    `Descuento del ${backend.porcentaje_descuento}%`,
    backend.tiene_sorteo ? `Sorteo de ${backend.cantidad_premios} premios` : null,
    `Público: ${backend.publico_objetivo}`
  ].filter(Boolean).join('. ')

  return {
    id: backend.id_promocion.toString(),
    title: backend.nombre_promocion,
    validUntil,
    // Expose ISO date for programmatic checks (e.g., disable enroll when expired)
    expiresAt: backend.fecha_fin,
    cycle,
    description: backend.descricpcion,
    conditions,
    image,
    cantidadBeneficiarios: backend.cantidad_beneficiarios ?? undefined,
    inscritosCount: backend.cantidad_beneficiarios_inscritos ?? 0,
  }
}

const PromotionsPage = () => {
  const nav = useNavigate()
  const { requireAuth, modal: authModal } = useAuthGate()
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(0)
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false)
  const [selectedPromoForEnroll, setSelectedPromoForEnroll] = useState<BackendPromocion | null>(null)

  // Fetch promociones from backend
  const { data: backendPromociones = [], isLoading } = useQuery<BackendPromocion[]>({
    queryKey: ['promociones-publicas'],
    queryFn: fetchPromociones,
  })

  // Fetch all inscripciones completas to compute usage per promotion
  const { data: inscripcionesCompletasRaw = { inscripciones: [] } } = useQuery({
    queryKey: ['inscripciones-completas'],
    queryFn: getInscripcionesCompletas,
    staleTime: 1000 * 60 * 1, // 1 minute
  })
  const inscripcionesCompletas = inscripcionesCompletasRaw.inscripciones || []

  // Transform backend data to frontend format
  const promos = useMemo(() => {
    return backendPromociones
      .filter((promo) => promo.estado === true && promo.activo === true)
      .map(mapBackendToPromotion)
  }, [backendPromociones])

  // Calcular conteo de inscripciones por promocion
  const promoInscritosCount = useMemo(() => {
    const map = new Map<string, number>()
    inscripcionesCompletas.forEach((i: any) => {
      const pid = i.promocion?.id_promocion
      if (!pid) return
      const key = String(pid)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return map
  }, [inscripcionesCompletas])

  const cycles = useMemo(() => Array.from(new Set(promos.map((p) => p.cycle))), [promos])
  const currentCycle = cycles[selectedCycleIndex] ?? cycles[0]
  const list = promos.filter((p) => p.cycle === currentCycle)

  const prevCycle = () => setSelectedCycleIndex((i) => (i > 0 ? i - 1 : cycles.length - 1))
  const nextCycle = () => setSelectedCycleIndex((i) => (i < cycles.length - 1 ? i + 1 : 0))

  const onViewDetail = (p: Promotion) => { setSelectedPromo(p); setIsDetailOpen(true) }
  
  const onEnroll = (p: Promotion) => {
    requireAuth(() => {
      // Buscar la promoción completa en backendPromociones
      const fullPromo = backendPromociones.find(bp => bp.id_promocion.toString() === p.id)
      if (fullPromo) {
        // Verificar fecha de expiración antes de permitir continuar
        try {
          const now = new Date()
          const expires = new Date(fullPromo.fecha_fin)
          if (expires < now) {
            toast.error('Esta promoción ya venció y no es posible inscribirse')
            return
          }
        } catch (e) {
          // Si la fecha no es válida, permitimos continuar pero lo registramos
          console.warn('No se pudo parsear fecha de expiración de la promoción', e)
        }
        // Check capacity
        const max = fullPromo.cantidad_beneficiarios
        if (max && max > 0) {
          const used = fullPromo.cantidad_beneficiarios_inscritos || 0
          if (used >= max) {
            toast.error('Promoción llena. Lo sentimos, ya se alcanzó el cupo de beneficiarios.')
            return
          }
        }
        setSelectedPromoForEnroll(fullPromo)
        setIsPackagesModalOpen(true)
      }
    })
  }

  const handlePackageSelect = async (paqueteId: number) => {
    if (!selectedPromoForEnroll) return
    
    // Buscar la info del paquete seleccionado en los datos cargados del modal
    // Necesitamos obtener la info completa del paquete
    try {
      const paqueteInfo = await import('@/features/director/api/backend').then(m => m.fetchPaqueteInfo(paqueteId))
      
      // Guardar el contexto de la promoción en sessionStorage para usarlo en Schedule
      sessionStorage.setItem('activePromotion', JSON.stringify({
        promocionId: selectedPromoForEnroll.id_promocion,
        nombre: selectedPromoForEnroll.nombre_promocion,
        descuento: selectedPromoForEnroll.porcentaje_descuento,
        paqueteId,
        ofertaId: selectedPromoForEnroll.Oferta_id_oferta,
        // Guardar info del paquete para activar modo selección automáticamente
        paqueteInfo: {
          id: paqueteInfo.paquete.id_paquete,
          nombre: paqueteInfo.paquete.nombre,
          precio: parseFloat(paqueteInfo.paquete.precio),
          cantidad_clases: paqueteInfo.paquete.cantidad_clases,
          dias_validez: paqueteInfo.paquete.dias_validez,
          ilimitado: paqueteInfo.paquete.ilimitado
        },
        ciclo: paqueteInfo.ciclo.nombre_ciclo
      }))
      
      // Redirigir a la agenda de cursos
      nav('/cursos')
      setIsPackagesModalOpen(false)
    } catch (error) {
      console.error('Error obteniendo info del paquete:', error)
    }
  }

  return (
    <section className="space-y-8">

      <section className="rounded-xl text-white shadow-femme bg-gradient-to-br from-femme-magenta via-femme-rose to-femme-coral">
        <div className="px-6 sm:px-8 md:px-12 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Promociones
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Conoce nuestras promociones exclusivas y aprovecha descuentos especiales en cursos y talleres.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner label="Cargando promociones..." />
          </div>
        </div>
      ) : (
        <>
      <div>
        <h1 className="text-3xl font-bold text-ink mb-6">PROMOCIONES</h1>


        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={prevCycle} className="text-graphite hover:text-femme-magenta">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="text-lg font-semibold text-ink">{currentCycle}</div>
          </div>
          <Button variant="ghost" onClick={nextCycle} className="text-graphite hover:text-femme-magenta">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {list.length > 0 ? (
          list.map((promo) => {
            const maxBeneficiarios = promo.cantidadBeneficiarios
            const inscritosCount = promo.inscritosCount || 0
            const isFull = typeof maxBeneficiarios === 'number' && maxBeneficiarios > 0 && inscritosCount >= maxBeneficiarios
            return (
              <PromotionCard 
                key={promo.id} 
                promo={promo} 
                onView={onViewDetail} 
                onEnroll={onEnroll} 
                isFull={isFull}
                inscritosCount={inscritosCount}
              />
            )
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-graphite text-lg">No hay promociones activas en este momento</p>
          </div>
        )}
      </div>
        </>
      )}

      <PromotionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        promo={selectedPromo}
        onEnroll={onEnroll}
        isFull={selectedPromo ? (typeof selectedPromo.cantidadBeneficiarios === 'number' && (promoInscritosCount.get(String(selectedPromo.id)) || 0) >= selectedPromo.cantidadBeneficiarios) : false}
      />

      <PromotionPackagesModal
        isOpen={isPackagesModalOpen}
        onClose={() => setIsPackagesModalOpen(false)}
        promocion={selectedPromoForEnroll}
        onSelectPackage={handlePackageSelect}
        isFull={selectedPromoForEnroll ? (typeof selectedPromoForEnroll.cantidad_beneficiarios === 'number' && (promoInscritosCount.get(String(selectedPromoForEnroll.id_promocion)) || 0) >= selectedPromoForEnroll.cantidad_beneficiarios) : false}
      />

      {authModal}

      <br />
      <br />
    </section>
  )
}

export default PromotionsPage