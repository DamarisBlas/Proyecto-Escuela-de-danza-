import React, { useState } from 'react'
import { Ciclo, Subcategoria } from '../ui/ManageListDialog'
import { useOfertas } from '../../../api/integrationService'
import { Spinner } from '@/components/ui/Spinner'

interface OfferingViewProps {
  ciclos: Ciclo[]
  subcategorias: Subcategoria[]
  onEditOferta: (ofertaId: number) => void
}

export function OfferingView({ ciclos, subcategorias, onEditOferta }: OfferingViewProps) {
  const [selectedCiclo, setSelectedCiclo] = useState<string>('')
  
  // Obtener ofertas desde el backend
  const { data: ofertasBackend = [], isLoading, error } = useOfertas()
  
  console.log('🔍 Ofertas recibidas:', ofertasBackend)
  console.log('🔍 Ciclos disponibles:', ciclos)
  console.log('🔍 Subcategorías disponibles:', subcategorias)
  
  // Mapear ofertas del backend al formato de la tabla
  const ofertas = ofertasBackend.map((oferta: any) => {
    console.log('🔎 Procesando oferta completa:', oferta)
    console.log('🔎 Campos de la oferta:', Object.keys(oferta))
    
    // Buscar el ciclo por ID (comparando como números)
    const cicloId = Number(oferta.ciclo_id_ciclo)
    const ciclo = ciclos.find(c => Number(c.id) === cicloId)
    console.log(`🗓️ Buscando ciclo: oferta.ciclo_id_ciclo=${oferta.ciclo_id_ciclo}, cicloId=${cicloId}, encontrado:`, ciclo)
    
    // Buscar la subcategoría por ID (comparando como números)
    const subcategoriaId = Number(oferta.Subcategoria_id_subcategoria)
    const subcategoria = subcategorias.find(s => Number(s.id) === subcategoriaId)
    console.log(`📑 Buscando subcategoría: oferta.Subcategoria_id_subcategoria=${oferta.Subcategoria_id_subcategoria}, subcategoriaId=${subcategoriaId}, encontrado:`, subcategoria)
    
    return {
      id: oferta.id_oferta,
      subcategoria: subcategoria?.nombre || 'Sin subcategoría',
      ciclo: ciclo?.nombre || 'Sin ciclo',
      nombre: oferta.nombre_oferta,
      descripcion: oferta.descripcion || '',
      fechaInicio: oferta.fecha_inicio,
      fechaFin: oferta.fecha_fin,
      totalPaquetes: oferta.total_paquetes || 0,
      totalHorarios: oferta.total_horarios || 0,
      inscripcionesActivas: oferta.inscripciones_activas || 0
    }
  })

  const filteredOfertas = selectedCiclo 
    ? ofertas.filter((oferta: any) => oferta.ciclo === selectedCiclo)
    : ofertas

  const editOferta = (id: number) => {
    console.log('🔧 Editar oferta:', id)
    onEditOferta(id)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error al cargar ofertas: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ofertas Disponibles</h2>
        
        {/* Filtro por ciclo */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filtrar por ciclo:</label>
          <select 
            value={selectedCiclo}
            onChange={(e) => setSelectedCiclo(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">Todos los ciclos</option>
            {ciclos.map((ciclo) => (
              <option key={ciclo.id} value={ciclo.nombre}>{ciclo.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciclo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOfertas.map((oferta: any) => (
              <tr key={oferta.id}>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">{oferta.subcategoria}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{oferta.ciclo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">{oferta.nombre}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{oferta.descripcion}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{new Date(oferta.fechaInicio).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{new Date(oferta.fechaFin).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => editOferta(oferta.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOfertas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay ofertas disponibles{selectedCiclo ? ` para el ciclo "${selectedCiclo}"` : ''}.</p>
        </div>
      )}
    </div>
  )
}
