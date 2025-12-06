import React, { useMemo } from "react";
import { Pencil, Trash2, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Promotion } from "./PromotionModal";

// Types and helper functions
type AppliesTo = "regulares" | "talleres" | "intensivos" | "especiales";
type PackageCode = "A" | "B" | "C" | "D" | "FULL_PASS" | "CLASE_SUELTA";
type Cycle = { id: string; label: string };

// Shared data (TODO: move to separate files later)
const cycles: Cycle[] = [
  { id: "c1-2025", label: "Ciclo 1 · Feb–Mar 2025" },
  { id: "c2-2025", label: "Ciclo 2 · May–Jul 2025" },
  { id: "c3-2025", label: "Ciclo 3 · Oct–Dic 2025" },
];

// Helper functions
function cycleLabel(cycleId: string) {
  return cycles.find((c) => c.id === cycleId)?.label ?? cycleId;
}

function appliesToLabel(appliesTo: AppliesTo) {
  switch (appliesTo) {
    case "regulares":
      return "Cursos regulares";
    case "talleres":
      return "Talleres";
    case "intensivos":
      return "Intensivos";
    case "especiales":
      return "Especiales";
    default:
      return appliesTo;
  }
}

function pkgLabel(pkg: PackageCode) {
  switch (pkg) {
    case "A":
      return "A (4)";
    case "B":
      return "B (8)";
    case "C":
      return "C (12)";
    case "D":
      return "D (20)";
    case "FULL_PASS":
      return "Full Pass";
    case "CLASE_SUELTA":
      return "Clase suelta";
    default:
      return pkg;
  }
}

function discountLabel(p: Promotion) {
  if (p.type === "percentage" && p.percent !== undefined) {
    return `-${p.percent}%`;
  }
  return "—";
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatRange(a: string, b: string) {
  return `${formatDate(a)} – ${formatDate(b)}`;
}

function Toggle({
  pressed,
  onToggle,
  onLabel = "ON",
  offLabel = "OFF",
}: {
  pressed: boolean;
  onToggle: () => void;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={pressed}
      className={
        "inline-flex h-7 items-center rounded-full border px-1 transition " +
        (pressed
          ? "border-green-300 bg-green-500/10"
          : "border-gray-300 bg-gray-200/60 dark:border-white/10 dark:bg-white/10")
      }
    >
      <span className={"text-[10px] font-semibold " + (pressed ? "text-green-700" : "text-gray-600")}>{pressed ? onLabel : offLabel}</span>
      <span className={"ml-2 inline-block size-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform " + (pressed ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

function BadgeType({ promotion }: { promotion: Promotion }) {
  // Determinar el badge basado en si tiene paquetes específicos o es general
  const hasSpecificPackages = promotion.paqueteIds && promotion.paqueteIds.length > 0;
  
  if (hasSpecificPackages) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-black/5 bg-femme-softyellow/70 text-ink">
        Paquetes específicos
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-black/5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      Oferta completa
    </span>
  );
}

type PromotionsListProps = {
  promotions: Promotion[];
  query: string;
  cycleFilter: string;
  onQueryChange: (query: string) => void;
  onCycleFilterChange: (cycle: string) => void;
  onToggleActive: (id: string) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
};

export default function PromotionsList({
  promotions,
  query,
  cycleFilter,
  onQueryChange,
  onCycleFilterChange,
  onToggleActive,
  onEdit,
  onDelete,
}: PromotionsListProps) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((p) => {
      const matchesQuery = q
        ? [
            p.name,
            p.details ?? "",
            p.ofertaId ?? "",
            (p.paqueteIds || []).join(" "),
            discountLabel(p),
            cycleLabel(p.cycleId),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
        : true;
      const matchesCycle = cycleFilter === "all" ? true : p.cycleId === cycleFilter;
      return matchesQuery && matchesCycle;
    });
  }, [promotions, query, cycleFilter]);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200/60 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-graphite/70">Ciclo</label>
            <select
              value={cycleFilter}
              onChange={(e) => onCycleFilterChange(e.target.value)}
              className="w-52 rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
            >
              <option value="all">Todos los ciclos</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Buscar por nombre, tipo, detalle, alcance…"
                className="w-72 rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-femme-magenta dark:border-white/10 dark:bg-neutral-900"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="size-4 rotate-90" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <table className="min-w-full table-fixed divide-y divide-gray-200/70 dark:divide-white/10">
          <thead className="bg-gray-50/60 dark:bg-neutral-800/60">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-graphite/70">
              <th className="w-24 px-4 py-3">Banner</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="w-48 px-4 py-3">Ciclo</th>
              <th className="w-36 px-4 py-3">Tipo</th>
              <th className="w-56 px-4 py-3">Alcance</th>
              <th className="w-40 px-4 py-3">Validez</th>
              <th className="w-40 px-4 py-3">Descuento</th>
              <th className="w-28 px-4 py-3">Estado</th>
              <th className="w-40 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70 text-sm dark:divide-white/10">
            {filtered.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="aspect-[16/9] w-24 overflow-hidden rounded-lg bg-graphite/5 ring-1 ring-black/5 dark:bg-white/5">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-graphite/40">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{p.name}</div>
                  {p.details && (
                    <div className="mt-1 line-clamp-2 text-xs text-graphite/80">{p.details}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-graphite/80">{cycleLabel(p.cycleId)}</div>
                </td>
                <td className="px-4 py-3">
                  <BadgeType promotion={p} />
                </td>
                <td className="px-4 py-3">
                  {p.paqueteIds && p.paqueteIds.length > 0 ? (
                    <div className="text-xs text-graphite/80">
                      {p.paqueteIds.length} paquete{p.paqueteIds.length !== 1 ? 's' : ''} seleccionado{p.paqueteIds.length !== 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div className="text-xs text-graphite/80">
                      Todos los paquetes
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-graphite/80">
                    {p.startDate && p.deadline
                      ? formatRange(p.startDate, p.deadline)
                      : p.deadline
                      ? `Hasta ${formatDate(p.deadline)}`
                      : p.startDate
                      ? `Desde ${formatDate(p.startDate)}`
                      : "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-ink">{discountLabel(p)}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 " +
                      (p.active
                        ? "bg-green-50 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900"
                        : "bg-gray-50 text-gray-600 ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10")
                    }
                  >
                    <span className={`size-1.5 rounded-full ${p.active ? "bg-green-500" : "bg-gray-400"}`} />
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Toggle
                      pressed={p.active}
                      onToggle={() => onToggleActive(p.id)}
                      onLabel="ON"
                      offLabel="OFF"
                    />
                    <button
                      onClick={() => onEdit(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200/70 px-2.5 py-1.5 text-xs text-ink hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <Pencil className="size-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
                    >
                      <Trash2 className="size-3.5" /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-graphite/70">
                  No hay promociones que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
