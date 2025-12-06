import React, { useState, useId, useEffect } from "react";
import { X, ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchCategoriasBackend, 
  fetchSubcategoriasByCategoriaBackend, 
  fetchOfertasActivasBackend,
  fetchCiclosBackend,
  uploadPromocionImagen,
  createPromocion
} from "../../api/backend";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Types (these will be shared across components)
type PromotionType = "percentage";
type PackageCode = "A" | "B" | "C" | "D" | "FULL_PASS" | "CLASE_SUELTA";

export type Promotion = {
  id: string;
  cycleId: string;
  categoriaId?: string;
  subcategoriaId?: string;
  ofertaId?: string;
  name: string;
  details?: string;
  imageUrl?: string;
  type: PromotionType;
  paqueteIds?: string[]; // IDs de los paquetes seleccionados de la oferta
  percent?: number;
  startDate?: string;
  deadline?: string;
  active: boolean;
  tieneSorteo?: boolean;
  premios?: number[]; // Array de porcentajes de descuento
  cantidadBeneficiarios?: number
};

// Helper functions
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2);
}

function numberOrUndefined(n: number | "") {
  return n === "" ? undefined : Number(n);
}

type PromotionModalProps = {
  initial: Promotion | null;
  onClose: () => void;
  onSave: (p: Promotion) => void;
};

export default function PromotionModal({ initial, onClose, onSave }: PromotionModalProps) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [type] = useState<PromotionType>("percentage"); // Solo porcentaje
  const [percent, setPercent] = useState<number | "">(initial?.percent ?? ("" as const));
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [paqueteIds, setPaqueteIds] = useState<string[]>(initial?.paqueteIds ?? []);
  const [cycleId, setCycleId] = useState<string>(initial?.cycleId ?? "");
  
  // Nuevos estados para categoría, subcategoría y oferta
  const [categoriaId, setCategoriaId] = useState<string>(initial?.categoriaId ?? "");
  const [subcategoriaId, setSubcategoriaId] = useState<string>(initial?.subcategoriaId ?? "");
  const [ofertaId, setOfertaId] = useState<string>(initial?.ofertaId ?? "");
  
  // Estados para sorteo
  const [tieneSorteo, setTieneSorteo] = useState(initial?.tieneSorteo ?? false);
  const [cantidadPremios, setCantidadPremios] = useState(initial?.premios?.length ?? 0);
  const [premios, setPremios] = useState<(number | "")[]>(initial?.premios ?? []);
  const [cantidadBeneficiarios, setCantidadBeneficiarios] = useState<number | "">(typeof initial?.cantidadBeneficiarios === 'number' ? initial?.cantidadBeneficiarios : "");

  const nameId = useId();
  const startDateId = useId();
  const deadId = useId();
  const cycleIdDom = useId();

  // Cargar ciclos desde el backend
  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos'],
    queryFn: fetchCiclosBackend,
  });

  // Cargar categorías
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategoriasBackend,
  });

  // Cargar subcategorías basadas en la categoría seleccionada
  const { data: subcategorias = [] } = useQuery({
    queryKey: ['subcategorias', categoriaId],
    queryFn: () => categoriaId ? fetchSubcategoriasByCategoriaBackend(Number(categoriaId)) : Promise.resolve([]),
    enabled: !!categoriaId,
  });

  // Cargar ofertas activas (filtraremos por subcategoría y ciclo)
  const { data: todasOfertas = [] } = useQuery({
    queryKey: ['ofertas'],
    queryFn: fetchOfertasActivasBackend,
  });

  // Filtrar ofertas por ciclo y subcategoría seleccionados
  const ofertasFiltradas = todasOfertas.filter(o => {
    const cumpleCiclo = cycleId ? o.ciclo_id_ciclo === Number(cycleId) : true;
    const cumpleSubcategoria = subcategoriaId ? o.Subcategoria_id_subcategoria === Number(subcategoriaId) : true;
    return cumpleCiclo && cumpleSubcategoria;
  });

  console.log('🔍 Filtrado de ofertas:', {
    cycleId,
    subcategoriaId,
    todasOfertas: todasOfertas.length,
    ofertasFiltradas: ofertasFiltradas.length,
    ofertas: ofertasFiltradas
  });

  // Cargar oferta completa con paquetes cuando se selecciona una oferta
  const { data: ofertaCompleta } = useQuery({
    queryKey: ['oferta-completa', ofertaId],
    queryFn: async () => {
      if (!ofertaId) return null;
      console.log('🔍 Cargando oferta completa:', ofertaId);
      const response = await api.get(`/ofertas/${ofertaId}/completa`);
      console.log('✅ Oferta completa recibida:', response.data);
      console.log('📦 Paquetes encontrados:', response.data.paquetes);
      return response.data;
    },
    enabled: !!ofertaId,
  });

  // Obtener paquetes de la oferta completa
  const paquetesOferta = ofertaCompleta?.paquetes || [];
  
  console.log('🎁 Paquetes de oferta disponibles:', paquetesOferta);
  
  // IDs de los paquetes disponibles en la oferta
  const paquetesDisponiblesIds = paquetesOferta.map((p: any) => p.id_paquete?.toString() || '');

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Resetear cuando cambia el ciclo
  useEffect(() => {
    setCategoriaId("");
    setSubcategoriaId("");
    setOfertaId("");
    setPaqueteIds([]);
  }, [cycleId]);

  // Resetear subcategoría cuando cambia la categoría
  useEffect(() => {
    setSubcategoriaId("");
    setOfertaId("");
    setPaqueteIds([]);
  }, [categoriaId]);

  // Resetear oferta cuando cambia la subcategoría
  useEffect(() => {
    setOfertaId("");
    setPaqueteIds([]);
  }, [subcategoriaId]);

  // Resetear paquetes seleccionados cuando cambia la oferta
  useEffect(() => {
    setPaqueteIds([]);
  }, [ofertaId]);

  // Ajustar array de premios cuando cambia la cantidad
  useEffect(() => {
    if (tieneSorteo) {
      const newPremios = Array(cantidadPremios).fill("").map((_, i) => premios[i] ?? "");
      setPremios(newPremios);
    } else {
      setPremios([]);
    }
  }, [cantidadPremios, tieneSorteo]);

  // Cuando cambie la promoción inicial (modo editar), sincronizar los campos que pueden haber llegado del backend
  useEffect(() => {
    setName(initial?.name ?? "");
    setDetails(initial?.details ?? "");
    setPercent(initial?.percent ?? "");
    setStartDate(initial?.startDate ?? "");
    setDeadline(initial?.deadline ?? "");
    setActive(initial?.active ?? true);
    setImageUrl(initial?.imageUrl ?? "");
    setPaqueteIds(initial?.paqueteIds ?? []);
    setCycleId(initial?.cycleId ?? "");
    setCategoriaId(initial?.categoriaId ?? "");
    setSubcategoriaId(initial?.subcategoriaId ?? "");
    setOfertaId(initial?.ofertaId ?? "");
    setTieneSorteo(initial?.tieneSorteo ?? false);
    setCantidadPremios(initial?.premios?.length ?? 0);
    setPremios(initial?.premios ?? []);
    setCantidadBeneficiarios(typeof initial?.cantidadBeneficiarios === 'number' ? initial?.cantidadBeneficiarios : "");
  }, [initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      toast.error("El nombre de la promoción es requerido");
      return;
    }

    if (!ofertaId) {
      toast.error("Debes seleccionar una oferta");
      return;
    }

    if (!cycleId) {
      toast.error("Debes seleccionar un ciclo");
      return;
    }

    // Validación de cantidad de beneficiarios: si se especifica, debe ser mayor o igual a 1
    if (cantidadBeneficiarios !== "" && (typeof cantidadBeneficiarios !== 'number' || cantidadBeneficiarios < 1)) {
      toast.error("La cantidad de beneficiarios debe ser un número entero mayor o igual a 1");
      return;
    }

    // Validación de fechas: fecha_inicio debe ser anterior a fecha_fin
    if (startDate && deadline) {
      const fechaInicio = new Date(startDate);
      const fechaFin = new Date(deadline);
      
      if (fechaInicio >= fechaFin) {
        toast.error("La fecha de inicio debe ser anterior a la fecha límite");
        return;
      }
    }

    try {
      let serverImageUrl = imageUrl;

      // Si hay un archivo nuevo para subir
      if (file) {
        toast.loading("Subiendo imagen...", { id: "upload-image" });
        serverImageUrl = await uploadPromocionImagen(file);
        toast.success("Imagen subida exitosamente", { id: "upload-image" });
      }

      // Crear la promoción en el backend
      toast.loading("Creando promoción...", { id: "create-promo" });
      
      const response = await createPromocion({
        name: name.trim(),
        details: details.trim() || undefined,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        ofertaId,
        percent: numberOrUndefined(percent),
        paqueteIds: paqueteIds.length > 0 ? paqueteIds : undefined,
        imageUrl: serverImageUrl || undefined,
        tieneSorteo,
        cantidadPremios: tieneSorteo ? cantidadPremios : undefined,
        premios: tieneSorteo ? premios.filter(p => p !== "").map(Number) : undefined,
        cantidadBeneficiarios: typeof cantidadBeneficiarios === 'number' ? cantidadBeneficiarios : undefined,
      });

      console.log("Respuesta del backend:", response);
      toast.success("Promoción creada exitosamente", { id: "create-promo" });

      // Extraer el ID de la promoción de la respuesta
      const promocionId = response?.promocion?.id_promocion 
        || response?.informacion_adicional?.id_promocion 
        || cryptoRandomId();

      // Crear objeto local para actualizar la UI
      const base: Promotion = {
        id: promocionId.toString(),
        cycleId,
        categoriaId: categoriaId || undefined,
        subcategoriaId: subcategoriaId || undefined,
        ofertaId: ofertaId || undefined,
        name: name.trim(),
        details: details.trim() || undefined,
        type,
        percent: numberOrUndefined(percent),
        paqueteIds: paqueteIds.length > 0 ? paqueteIds : undefined,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        imageUrl: serverImageUrl || undefined,
        active,
        tieneSorteo,
        premios: tieneSorteo ? premios.filter(p => p !== "").map(Number) : undefined,
        cantidadBeneficiarios: typeof cantidadBeneficiarios === 'number' ? cantidadBeneficiarios : undefined,
      };

      onSave(base);
      onClose(); // Cerrar el modal después de guardar exitosamente
    } catch (error: any) {
      console.error("❌ Error al crear promoción:", error);
      const backendError = error?.response?.data?.error || error?.message || 'Error desconocido';
      console.error("❌ Detalle del error:", backendError);
      toast.error(`Error al crear la promoción: ${backendError}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[min(960px,92vw)] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200/70 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{isEdit ? "Editar promoción" : "Nueva promoción"}</h2>
            <p className="text-sm text-graphite/80">Completa los campos y guarda para {isEdit ? "actualizar" : "publicar"}.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-graphite/60 hover:bg-black/5">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-4">
            {/* 1. Nombre de la promoción */}
            <div>
              <label htmlFor={nameId} className="mb-1 block text-sm font-medium text-ink">Nombre de la promoción</label>
              <input
                id={nameId}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Anticipada 20% — Paquetes C y Full Pass"
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
            </div>

            {/* 2. Detalles */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Detalles</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Mensaje público y condiciones (p. ej. válido solo para paquetes C y Full Pass)"
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
            </div>

            {/* 2.1 Cantidad de beneficiarios */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cantidad de beneficiarios</label>
              <input
                inputMode="numeric"
                type="number"
                min={1}
                value={cantidadBeneficiarios}
                onChange={(e) => setCantidadBeneficiarios(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej. 50 (dejar vacío para ilimitado)"
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
              <p className="mt-1 text-xs text-graphite/60">Dejar vacío para que la promoción aplique a todo el público (ilimitado).</p>
            </div>

            {/* 3. Fecha de inicio */}
            <div>
              <label htmlFor={startDateId} className="mb-1 block text-sm font-medium text-ink">Fecha de inicio</label>
              <input
                id={startDateId}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
              <p className="mt-1 text-xs text-graphite/60">Fecha desde cuando aplica la promoción.</p>
            </div>

            {/* 4. Fecha límite */}
            <div>
              <label htmlFor={deadId} className="mb-1 block text-sm font-medium text-ink">Fecha límite</label>
              <input
                id={deadId}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
              <p className="mt-1 text-xs text-graphite/60">Puedes dejar vacío si la promo no tiene límite.</p>
            </div>

            {/* 5. Ciclo */}
            <div>
              <label htmlFor={cycleIdDom} className="mb-1 block text-sm font-medium text-ink">Ciclo</label>
              <select
                id={cycleIdDom}
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              >
                <option value="">Selecciona un ciclo</option>
                {ciclos.map((ciclo) => (
                  <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
                    {ciclo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Categoría */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Categoría</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Subcategoría */}
            {categoriaId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Subcategoría</label>
                <select
                  value={subcategoriaId}
                  onChange={(e) => setSubcategoriaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                >
                  <option value="">Selecciona una subcategoría</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                      {sub.nombre_subcategoria}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 8. Oferta */}
            {subcategoriaId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Nombre de la oferta</label>
                <select
                  value={ofertaId}
                  onChange={(e) => setOfertaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                >
                  <option value="">Selecciona una oferta</option>
                  {ofertasFiltradas.map((oferta) => (
                    <option key={oferta.id_oferta} value={oferta.id_oferta}>
                      {oferta.nombre_oferta}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 9. Paquetes de la oferta - Mostrar y seleccionar */}
            {ofertaId && paquetesOferta.length > 0 && (
              <div className="space-y-3">
             

                <fieldset className="rounded-lg border border-gray-200/70 p-3 dark:border-white/10">
                  <legend className="px-1 text-sm font-medium text-ink">¿A qué paquetes aplica la promoción?</legend>
                  <p className="mb-2 text-xs text-graphite/60">Selecciona los paquetes de esta oferta que tendrán descuento</p>
                  <div className="mt-2 space-y-2">
                    {paquetesOferta.map((paq: any) => {
                      const paqueteId = paq.id_paquete?.toString() || '';
                      return (
                        <label key={paqueteId} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={paqueteIds.includes(paqueteId)}
                            onChange={(e) =>
                              setPaqueteIds((prev) =>
                                e.target.checked 
                                  ? [...prev, paqueteId] 
                                  : prev.filter((id) => id !== paqueteId)
                              )
                            }
                            className="size-4 rounded border-gray-300 text-femme-magenta focus:ring-femme-magenta"
                          />
                          <span className="font-medium">{paq.nombre}</span>
                          <span className="text-graphite/70">
                            ({paq.ilimitado ? 'Ilimitado' : `${paq.cantidad_clases} clases`} - Bs {paq.precio})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            )}

            {/* 10. Porcentaje de descuento */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Porcentaje de descuento</label>
                <input
                  inputMode="numeric"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="20"
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                />
              </div>
              <span className="mt-6 text-sm text-graphite/70">%</span>
            </div>

            {/* 11. ¿Tiene sorteo? */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={tieneSorteo}
                  onChange={(e) => setTieneSorteo(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-femme-magenta focus:ring-femme-magenta"
                />
                ¿La promoción tiene un sorteo?
              </label>
            </div>

            {/* 12. Cantidad de premios y porcentajes */}
            {tieneSorteo && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Cantidad de premios</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cantidadPremios}
                    onChange={(e) => setCantidadPremios(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                  <p className="mt-1 text-xs text-graphite/60">Los premios son descuentos en porcentaje.</p>
                </div>

                {cantidadPremios > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ink">Porcentaje de cada premio:</p>
                    {Array.from({ length: cantidadPremios }, (_, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-graphite/70">Premio {i + 1}</label>
                          <input
                            inputMode="numeric"
                            value={premios[i] ?? ""}
                            onChange={(e) => {
                              const newPremios = [...premios];
                              newPremios[i] = e.target.value === "" ? "" : Number(e.target.value);
                              setPremios(newPremios);
                            }}
                            placeholder="10"
                            className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                          />
                        </div>
                        <span className="mt-5 text-sm text-graphite/70">%</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink hover:bg-black/5">Cancelar</button>
              <button type="submit" className="rounded-lg bg-femme-magenta px-4 py-2 text-sm font-medium text-snow shadow-sm hover:bg-femme-rose">
                {isEdit ? "Guardar cambios" : "Publicar promoción"}
              </button>
            </div>
          </div>

          {/* Columna derecha - Imagen */}
          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium text-ink">Imagen (banner)</label>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-graphite/5 dark:border-white/10 dark:bg-white/5">
              {imageUrl ? (
                <img src={imageUrl} alt="banner" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center gap-2 text-graphite/60">
                  <ImageIcon className="size-5" />
                  <span className="text-sm">Previsualización</span>
                </div>
              )}
            </div>
            <label htmlFor="promo-image-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800">
              <input id="promo-image-upload" type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <ImageIcon className="size-4" />
              Subir imagen
            </label>
            <p className="text-xs text-graphite/60">Recomendado: 1200×750 px (jpeg/png/webp). UI local: se guarda como dataURL para previsualizar en la tabla.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
