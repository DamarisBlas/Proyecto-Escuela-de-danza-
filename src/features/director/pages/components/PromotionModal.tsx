import React, { useState, useId, useEffect } from "react";
import { X, ImageIcon } from "lucide-react";

// Types (these will be shared across components)
type PromotionType = "percentage" | "beforeAfter" | "twoForOne" | "tieredByCount";
type AppliesTo = "regulares" | "talleres" | "intensivos" | "especiales";
type PackageCode = "A" | "B" | "C" | "D" | "FULL_PASS" | "CLASE_SUELTA";
type Cycle = { id: string; label: string };
type CatalogItem = { id: string; label: string };
type Catalog = {
  regulares: CatalogItem | null;
  talleres: CatalogItem[];
  intensivos: CatalogItem[];
  especiales: CatalogItem[];
};

export type Promotion = {
  id: string;
  cycleId: string;
  targetId?: string;
  targetLabel?: string;
  name: string;
  details?: string;
  imageUrl?: string;
  type: PromotionType;
  appliesTo: AppliesTo;
  packages?: PackageCode[];
  percent?: number;
  beforePrice?: number;
  afterPrice?: number;
  tiers?: { count: number; price: number }[];
  deadline?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
};

// Shared data (TODO: move to separate files later)
const cycles: Cycle[] = [
  { id: "c1-2025", label: "Ciclo 1 · Feb–Mar 2025" },
  { id: "c2-2025", label: "Ciclo 2 · May–Jul 2025" },
  { id: "c3-2025", label: "Ciclo 3 · Oct–Dic 2025" },
];

const catalogByCycle: Record<string, Catalog> = {
  "c1-2025": {
    regulares: { id: "reg-heel-1", label: "Regular Heels Beginner" },
    talleres: [
      { id: "tlr-hips", label: "Taller Hips Control" },
      { id: "tlr-freestyle", label: "Taller Freestyle" },
      { id: "tlr-brazilero", label: "Taller Brazilero (3 sesiones)" },
    ],
    intensivos: [{ id: "int-afro", label: "Intensivo Afro Basics" }],
    especiales: [{ id: "esp-love", label: "Especial Love Yourself" }],
  },
  "c2-2025": {
    regulares: { id: "reg-heel-2", label: "Regular Heels Intermedio" },
    talleres: [{ id: "tlr-hips-2", label: "Taller Hips Control" }],
    intensivos: [{ id: "int-groove", label: "Intensivo Groove Lab" }],
    especiales: [{ id: "esp-mid", label: "Especial Mid-Year" }],
  },
  "c3-2025": {
    regulares: { id: "reg-heel-3", label: "Regular Heels Advance" },
    talleres: [{ id: "tlr-iso", label: "Taller Aislamientos" }],
    intensivos: [],
    especiales: [{ id: "esp-halloween", label: "Especial Halloween" }],
  },
};

// Helper functions
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2);
}

function numberOrUndefined(n: number | "") {
  return n === "" ? undefined : Number(n);
}

function labelForTarget(appliesTo: AppliesTo) {
  switch (appliesTo) {
    case "talleres":
      return "Selecciona el taller";
    case "intensivos":
      return "Selecciona el intensivo";
    case "especiales":
      return "Selecciona el especial";
    default:
      return "Selecciona";
  }
}

function getTargetOptions(cat: Catalog, appliesTo: AppliesTo): CatalogItem[] {
  switch (appliesTo) {
    case "talleres":
      return cat.talleres;
    case "intensivos":
      return cat.intensivos;
    case "especiales":
      return cat.especiales;
    default:
      return [];
  }
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
  const [type, setType] = useState<PromotionType>(initial?.type ?? "percentage");
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(initial?.appliesTo ?? "regulares");
  const [percent, setPercent] = useState<number | "">(initial?.percent ?? ("" as const));
  const [before, setBefore] = useState<number | "">(initial?.beforePrice ?? ("" as const));
  const [after, setAfter] = useState<number | "">(initial?.afterPrice ?? ("" as const));
  const [t1, setT1] = useState<number | "">(initial?.tiers?.find((t) => t.count === 1)?.price ?? ("" as const));
  const [t2, setT2] = useState<number | "">(initial?.tiers?.find((t) => t.count === 2)?.price ?? ("" as const));
  const [t3, setT3] = useState<number | "">(initial?.tiers?.find((t) => t.count === 3)?.price ?? ("" as const));
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [packages, setPackages] = useState<PackageCode[]>(initial?.packages ?? []);
  const [cycleId, setCycleId] = useState<string>(initial?.cycleId ?? cycles[0].id);
  const [targetId, setTargetId] = useState<string>(initial?.targetId ?? "");

  const nameId = useId();
  const typeId = useId();
  const appliesId = useId();
  const deadId = useId();
  const cycleIdDom = useId();
  const targetIdDom = useId();

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const currentCatalog = catalogByCycle[cycleId] as Catalog;
  const targetOptions: CatalogItem[] = getTargetOptions(currentCatalog, appliesTo);

  useEffect(() => {
    if (appliesTo === "regulares") {
      setTargetId("");
    } else if (targetOptions.length > 0 && !targetOptions.some((t) => t.id === targetId)) {
      setTargetId(targetOptions[0].id);
    }
  }, [cycleId, appliesTo, targetOptions, targetId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const chosen = targetOptions.find((t) => t.id === targetId);
    const tiers =
      type === "tieredByCount"
        ? [
            t1 !== "" ? { count: 1, price: Number(t1) } : null,
            t2 !== "" ? { count: 2, price: Number(t2) } : null,
            t3 !== "" ? { count: 3, price: Number(t3) } : null,
          ].filter(Boolean) as { count: number; price: number }[]
        : undefined;

    const base: Promotion = {
      id: initial?.id ?? cryptoRandomId(),
      cycleId,
      targetId: appliesTo === "regulares" ? undefined : targetId || undefined,
      targetLabel: appliesTo === "regulares" ? undefined : chosen?.label,
      name: name.trim(),
      details: details.trim() || undefined,
      type,
      appliesTo,
      percent: type === "percentage" ? numberOrUndefined(percent) : undefined,
      beforePrice: type === "beforeAfter" ? numberOrUndefined(before) : undefined,
      afterPrice: type === "beforeAfter" ? numberOrUndefined(after) : undefined,
      tiers,
      packages: appliesTo === "regulares" ? packages : undefined,
      deadline: deadline || undefined,
      imageUrl: imageUrl || undefined,
      active,
    };

    onSave(base);
  }

  const allowPackages = appliesTo === "regulares";
  const showTargetCombo = appliesTo !== "regulares" && targetOptions.length > 0;

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
            <div>
              <label htmlFor={cycleIdDom} className="mb-1 block text-sm font-medium text-ink">Ciclo</label>
              <select
                id={cycleIdDom}
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-graphite/60">Cada ciclo tiene un solo curso regular, pero puede tener varios talleres, intensivos y especiales.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={appliesId} className="mb-1 block text-sm font-medium text-ink">Aplica a</label>
                <select
                  id={appliesId}
                  value={appliesTo}
                  onChange={(e) => setAppliesTo(e.target.value as AppliesTo)}
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                >
                  <option value="regulares">Cursos regulares</option>
                  <option value="talleres">Talleres</option>
                  <option value="intensivos">Intensivos</option>
                  <option value="especiales">Especiales</option>
                </select>
              </div>

              <div>
                <label htmlFor={typeId} className="mb-1 block text-sm font-medium text-ink">Tipo de descuento</label>
                <select
                  id={typeId}
                  value={type}
                  onChange={(e) => setType(e.target.value as PromotionType)}
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="beforeAfter">Antes X / Ahora Y</option>
                  <option value="twoForOne">2 × 1</option>
                  <option value="tieredByCount">Precio por cantidad (1, 2, 3)</option>
                </select>
              </div>
            </div>

            {showTargetCombo && (
              <div>
                <label htmlFor={targetIdDom} className="mb-1 block text-sm font-medium text-ink">{labelForTarget(appliesTo)}</label>
                <select
                  id={targetIdDom}
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                >
                  {targetOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!showTargetCombo && appliesTo === "regulares" && currentCatalog.regulares && (
              <div className="rounded-lg border border-gray-200/70 p-3 text-sm text-graphite/80 dark:border-white/10">
                Curso regular del ciclo: <span className="font-medium text-ink">{currentCatalog.regulares.label}</span>
              </div>
            )}

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

            {type === "percentage" && (
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Porcentaje</label>
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
            )}

            {type === "beforeAfter" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Antes (Bs)</label>
                  <input
                    inputMode="numeric"
                    value={before}
                    onChange={(e) => setBefore(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="40"
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Ahora (Bs)</label>
                  <input
                    inputMode="numeric"
                    value={after}
                    onChange={(e) => setAfter(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="30"
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                </div>
              </div>
            )}

            {type === "tieredByCount" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">1 taller (Bs)</label>
                  <input
                    inputMode="numeric"
                    value={t1}
                    onChange={(e) => setT1(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="40"
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">2 talleres (Bs)</label>
                  <input
                    inputMode="numeric"
                    value={t2}
                    onChange={(e) => setT2(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="50"
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">3 talleres (Bs)</label>
                  <input
                    inputMode="numeric"
                    value={t3}
                    onChange={(e) => setT3(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="60"
                    className="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
                  />
                </div>
              </div>
            )}

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

            {allowPackages && (
              <fieldset className="rounded-lg border border-gray-200/70 p-3 dark:border-white/10">
                <legend className="px-1 text-sm font-medium text-ink">Paquetes a los que aplica</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(
                    [
                      ["A", "Paquete A (4 clases)"],
                      ["B", "Paquete B (8 clases)"],
                      ["C", "Paquete C (12 clases)"],
                      ["D", "Paquete D (20 clases)"],
                      ["FULL_PASS", "Full Pass"],
                      ["CLASE_SUELTA", "Clase suelta"],
                    ] as [PackageCode, string][]
                  ).map(([code, label]) => (
                    <label key={code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={packages.includes(code)}
                        onChange={(e) =>
                          setPackages((prev) =>
                            e.target.checked ? [...prev, code] : prev.filter((c) => c !== code)
                          )
                        }
                        className="size-4 rounded border-gray-300 text-femme-magenta focus:ring-femme-magenta"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink hover:bg-black/5">Cancelar</button>
              <button type="submit" className="rounded-lg bg-femme-magenta px-4 py-2 text-sm font-medium text-snow shadow-sm hover:bg-femme-rose">
                {isEdit ? "Guardar cambios" : "Publicar promoción"}
              </button>
            </div>
          </div>

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
