import React, { useMemo, useState, useId, useEffect } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PromotionModal, { Promotion } from "./componentsPromotions/PromotionModal";
import PromotionsList from "./componentsPromotions/PromotionsList";
import ConfirmDialog from "./componentsPromotions/ConfirmDialog";
import { fetchPromociones, fetchCiclosBackend, togglePromocionActivo, deletePromocionLogico } from "../api/backend";
import { toast } from "sonner";
import { env } from '@/config/env';

// Interface para mapear las promociones del backend
interface BackendPromocion {
  id_promocion: number;
  nombre_promocion: string;
  descricpcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  Oferta_id_oferta: number;
  porcentaje_descuento?: number;
  paquetes_especificos?: string;
  publico_objetivo?: string;
  img?: string;
  tiene_sorteo?: boolean;
  cantidad_premios?: number;
  cantidad_beneficiarios?: number;
  aplica_nuevos_usuarios?: boolean;
  estado: boolean;
  activo: boolean;
}

// Función para transformar datos del backend a formato del frontend
function mapBackendToPromotion(backend: BackendPromocion): Promotion {
  // Validar y construir imageUrl correctamente
  let imageUrl = backend.img;
  
  if (imageUrl) {
    // Si es base64, verificar que tenga contenido válido
    if (imageUrl.startsWith('data:image')) {
      // Verificar que no sea un placeholder inválido
      if (imageUrl.includes('test_image_data_here') || imageUrl.length < 50) {
        imageUrl = undefined;
      }
      // Si es base64 válido, usarlo tal cual
    }
    // Si es solo el nombre del archivo (ej: "promo_123.png")
    else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = `${env.API_URL}/promociones/uploads/promociones/${imageUrl}`;
    }
    // Si es una ruta relativa que empieza con /uploads/
    else if (imageUrl.startsWith('/uploads/promociones/')) {
      imageUrl = `${env.API_URL}/promociones${imageUrl}`;
    }
    // Si es otra ruta relativa
    else if (imageUrl.startsWith('/')) {
      imageUrl = `${env.API_URL}/promociones/uploads/promociones${imageUrl}`;
    }
  }

  console.log('Imagen mapeada:', { original: backend.img, final: imageUrl });

  return {
    id: backend.id_promocion.toString(),
    cycleId: "c1-2025", // TODO: Obtener del backend cuando esté disponible
    ofertaId: backend.Oferta_id_oferta.toString(),
    name: backend.nombre_promocion,
    details: backend.descricpcion,
    imageUrl,
    type: "percentage",
    percent: backend.porcentaje_descuento,
    paqueteIds: backend.paquetes_especificos?.split(',').filter(Boolean),
    startDate: backend.fecha_inicio,
    deadline: backend.fecha_fin,
    active: backend.activo, // Usar el campo activo en lugar de estado
    tieneSorteo: backend.tiene_sorteo,
    premios: [], // TODO: Obtener premios del backend si están disponibles
    cantidadBeneficiarios: backend.cantidad_beneficiarios ?? undefined,
  };
}

export default function PromotionsAdminPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [confirm, setConfirm] = useState<Promotion | null>(null);

  // Query para obtener promociones del backend
  const { data: backendPromociones = [], isLoading } = useQuery({
    queryKey: ['promociones'],
    queryFn: fetchPromociones,
  });

  // Transformar datos del backend a formato del frontend
  const promos = useMemo(() => {
    return backendPromociones.map(mapBackendToPromotion);
  }, [backendPromociones]);

  async function toggleActive(id: string) {
    try {
      const promo = promos.find((p: Promotion) => p.id === id);
      if (!promo) return;
      
      const newActiveState = !promo.active;
      await togglePromocionActivo(parseInt(id), newActiveState);
      
      // Invalidar query para recargar datos
      queryClient.invalidateQueries({ queryKey: ['promociones'] });
      toast.success(`Promoción ${newActiveState ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado activo:', error);
      toast.error('Error al actualizar el estado de la promoción');
    }
  }

  function openCreate() {
    setEditing(null);
    setIsModalOpen(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setIsModalOpen(true);
  }

  function onSave(p: Promotion) {
    // Invalidar la query para recargar promociones del backend
    queryClient.invalidateQueries({ queryKey: ['promociones'] });
    setIsModalOpen(false);
    toast.success("Promoción guardada exitosamente");
  }

  function onDelete(p: Promotion) {
    setConfirm(p);
  }

  async function confirmDelete() {
    if (!confirm) return;
    
    try {
      await deletePromocionLogico(parseInt(confirm.id));
      
      // Invalidar query para recargar datos
      queryClient.invalidateQueries({ queryKey: ['promociones'] });
      toast.success('Promoción eliminada exitosamente');
      setConfirm(null);
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      toast.error('Error al eliminar la promoción');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Promociones</h1>
          <p className="text-sm text-graphite/80">
            Crea, edita, activa o desactiva promociones para cursos regulares, talleres, intensivos y especiales.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-femme-magenta px-4 py-2 text-snow shadow-sm hover:bg-femme-rose transition"
          >
            <Plus className="size-4" /> Nueva promoción
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-femme-magenta border-r-transparent"></div>
            <p className="mt-4 text-sm text-graphite/80">Cargando promociones...</p>
          </div>
        </div>
      ) : (
        <PromotionsList
          promotions={promos}
          query={query}
          cycleFilter={cycleFilter}
          onQueryChange={setQuery}
          onCycleFilterChange={setCycleFilter}
          onToggleActive={toggleActive}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      )}

      {isModalOpen && (
        <PromotionModal
          key={editing?.id || "new"}
          initial={editing}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar promoción"
          description={
            <>
              ¿Seguro que deseas eliminar <strong>{confirm.name}</strong>? Esta acción no se puede deshacer.
            </>
          }
          onCancel={() => setConfirm(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
