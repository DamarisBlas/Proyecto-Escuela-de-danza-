import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from '@components/ui/Modal'
import Button from '@components/ui/Button'
import { Spinner } from '@components/ui/Spinner'
import { fetchPaqueteInfo } from '@/features/director/api/backend'
import { Check } from 'lucide-react'

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
  activo: boolean
  estado: boolean
}

interface PaqueteInfo {
  ciclo: {
    id_ciclo: number
    nombre_ciclo: string
    inicio: string
    fin: string
  }
  oferta: {
    id_oferta: number
    nombre_oferta: string
    descripcion: string
    fecha_inicio: string
    fecha_fin: string
    cantidad_cursos: number
    publico_objetivo: string
    repite_semanalmente: boolean
    whatsapplink: string | null
  }
  paquete: {
    id_paquete: number
    nombre: string
    precio: string
    cantidad_clases: number
    dias_validez: number
    ilimitado: boolean
    estado: boolean
  }
  subcategoria: {
    id_subcategoria: number
    nombre_subcategoria: string
    descripcion_subcategoria: string
    categoria_id: number
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
  promocion: BackendPromocion | null
  onSelectPackage: (paqueteId: number) => void
  isFull?: boolean
}

export default function PromotionPackagesModal({ isOpen, onClose, promocion, onSelectPackage, isFull = false }: Props) {
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [paquetesInfo, setPaquetesInfo] = useState<PaqueteInfo[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(false)

  // Obtener IDs de paquetes desde paquetes_especificos
  const paqueteIds = promocion?.paquetes_especificos.split(',').map(id => parseInt(id.trim())) || []

  // Cargar información de todos los paquetes cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !promocion || paqueteIds.length === 0) {
      setPaquetesInfo([])
      return
    }

    const loadPackages = async () => {
      setIsLoadingPackages(true)
      try {
        const promises = paqueteIds.map(id => fetchPaqueteInfo(id))
        const results = await Promise.all(promises)
        setPaquetesInfo(results)
      } catch (error) {
        console.error('Error cargando paquetes:', error)
      } finally {
        setIsLoadingPackages(false)
      }
    }

    loadPackages()
  }, [isOpen, promocion])

  if (!promocion) return null

  const handleConfirm = () => {
    if (isFull) return
    if (selectedPackageId) {
      onSelectPackage(selectedPackageId)
    }
  }

  // Calcular precio con descuento
  const calculateDiscountedPrice = (originalPrice: string) => {
    const price = parseFloat(originalPrice)
    const discount = promocion.porcentaje_descuento
    const discountedPrice = price - (price * discount / 100)
    return discountedPrice.toFixed(2)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecciona tu paquete">
      <div className="p-2 sm:p-4">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">{promocion.nombre_promocion}</h2>
          <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-femme-magenta/10 to-femme-rose/10 px-3 py-1.5 border border-femme-magenta/20">
            <span className="text-2xl font-bold text-femme-magenta">
              {promocion.porcentaje_descuento}% OFF
            </span>
          </div>
        </div>
        {isFull && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-sm">
            ⚠️ La promoción ha alcanzado su cupo de beneficiarios y no acepta más inscripciones.
          </div>
        )}

        {isLoadingPackages ? (
          <div className="py-8 flex justify-center">
            <Spinner label="Cargando paquetes..." />
          </div>
        ) : paquetesInfo.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p>No hay paquetes disponibles para esta promoción</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {paquetesInfo.map((info) => {
              const isSelected = selectedPackageId === info.paquete.id_paquete
              const originalPrice = parseFloat(info.paquete.precio)
              const discountedPrice = parseFloat(calculateDiscountedPrice(info.paquete.precio))
              
              return (
                <button
                  key={info.paquete.id_paquete}
                  onClick={() => setSelectedPackageId(info.paquete.id_paquete)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-femme-magenta bg-femme-magenta/5'
                      : 'border-slate-200 hover:border-femme-magenta/50 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Nombre del paquete */}
                      <h3 className="font-bold text-ink text-lg mb-1">
                        {info.paquete.nombre}
                      </h3>
                      
                      {/* Detalles del paquete */}
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Oferta:</span> {info.oferta.nombre_oferta}
                        </p>
                        <p>
                          <span className="font-medium">Ciclo:</span> {info.ciclo.nombre_ciclo}
                        </p>
                        <p>
                          <span className="font-medium">Tipo:</span> {info.subcategoria.nombre_subcategoria}
                        </p>
                        <p>
                          <span className="font-medium">Clases:</span>{' '}
                          {info.paquete.ilimitado || info.paquete.cantidad_clases === 0
                            ? 'Ilimitadas'
                            : `${info.paquete.cantidad_clases} ${info.paquete.cantidad_clases === 1 ? 'clase' : 'clases'}`}
                        </p>
                        <p>
                          <span className="font-medium">Validez:</span> {info.paquete.dias_validez} días
                        </p>
                      </div>

                      {/* Precio */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-slate-400 line-through text-sm">
                          Bs. {originalPrice.toFixed(2)}
                        </span>
                        <span className="text-2xl font-bold text-femme-magenta">
                          Bs. {discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-femme-rose font-medium">
                          Ahorras Bs. {(originalPrice - discountedPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`h-6 w-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'border-femme-magenta bg-femme-magenta'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 border-graphite text-ink hover:bg-graphite hover:text-white"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-femme-magenta to-femme-rose hover:shadow-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={!selectedPackageId || isLoadingPackages || isFull}
          >
            Continuar a Horarios
          </Button>
        </div>
      </div>
    </Modal>
  )
}
