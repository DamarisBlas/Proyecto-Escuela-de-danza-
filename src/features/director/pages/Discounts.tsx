



import React, { useMemo, useState, useEffect } from "react";
import {
  BadgeDollarSign, Bell, Filter, X, ChevronDown, CheckCircle2, BadgePercent
} from "lucide-react";

/** --- Tipos simples para la maqueta --- */
type TipoAlumno = "NORMAL" | "FEMME" | "ELENCO";
// Programa único según contexto
type Programa = "Camino Femme";
// Áreas donde SÍ se aplican descuentos
type Area = "TECNICO" | "COMPLEMENTARIO"; // (No se aplica en PRÁCTICO)
// Subdivisiones
type SubtipoTecnico = "Regulares" | "Intensivos" | "Talleres";
type SubtipoComplementario = "Especiales";
type TipoCurso = SubtipoTecnico | SubtipoComplementario;

type Paquete = "A" | "B" | "C" | "D" | "Full Pass" | "Clase suelta";
type EstadoPago = "PAGADO" | "PENDIENTE" | "EN PROCESO";

type AlumnaInscrita = {
  id: string;
  nombre: string;
  tipoAlumno: TipoAlumno;
  programa: Programa; // siempre "Camino Femme"
  area: Area; // Técnico o Complementario
  tipoCurso: TipoCurso; // Regulares/Intensivos/Talleres o Especiales
  curso: string;
  sede: string;
  paquete: Paquete;
  precioTotal: number;
  descuentoActual: number; // % aplicado actualmente (si hay)
  inscritaEl: string; // ISO
  estadoPago: EstadoPago;
};

/** Utilidad: opciones de subtipo por área */
function getSubtipoOptions(area: "" | Area): string[] {
  if (area === "TECNICO") return ["", "Regulares", "Intensivos", "Talleres"];
  if (area === "COMPLEMENTARIO") return ["", "Especiales"];
  return [""]; // sin área seleccionada
}

/** --- Datos de demo (puedes borrar luego) --- */
const DEMO_ALUMNAS: AlumnaInscrita[] = [
  { id: "1", nombre: "María R.",   tipoAlumno: "NORMAL", programa: "Camino Femme", area: "TECNICO",        tipoCurso: "Regulares",   curso: "Heels BASIC",            sede: "Centro",     paquete: "B",         precioTotal: 200, descuentoActual: 0,  inscritaEl: "2025-09-10", estadoPago: "PENDIENTE" },
  { id: "2", nombre: "Carla A.",   tipoAlumno: "FEMME",  programa: "Camino Femme", area: "TECNICO",        tipoCurso: "Regulares",   curso: "Twerk BASIC",            sede: "Sopocachi",  paquete: "C",         precioTotal: 320, descuentoActual: 20, inscritaEl: "2025-09-11", estadoPago: "EN PROCESO" },
  { id: "3", nombre: "Daniela V.", tipoAlumno: "ELENCO", programa: "Camino Femme", area: "TECNICO",        tipoCurso: "Regulares",   curso: "Elenco",                  sede: "Sopocachi",  paquete: "Full Pass", precioTotal: 450, descuentoActual: 40, inscritaEl: "2025-09-12", estadoPago: "PAGADO" },
  { id: "4", nombre: "Liz C.",     tipoAlumno: "NORMAL", programa: "Camino Femme", area: "TECNICO",        tipoCurso: "Intensivos",  curso: "Heels Avanzado (1 día)", sede: "Centro",     paquete: "Clase suelta", precioTotal: 40, descuentoActual: 0,  inscritaEl: "2025-09-08", estadoPago: "PENDIENTE" },
  { id: "5", nombre: "Sofía M.",   tipoAlumno: "FEMME",  programa: "Camino Femme", area: "COMPLEMENTARIO", tipoCurso: "Especiales",  curso: "Dancehall Bruk Out",     sede: "Miraflores", paquete: "A",         precioTotal: 120, descuentoActual: 0,  inscritaEl: "2025-09-09", estadoPago: "EN PROCESO" },
];

/** --- Página de Descuentos (solo UI) --- */
export default function Discounts() {
  // Filtros
  const [ciclo, setCiclo] = useState("Ciclo 3-2025");
  const [area, setArea] = useState<"" | Area>(""); // Técnico o Complementario
  const [subtipo, setSubtipo] = useState<string>(""); // depende del área
  const [tipoAlumno, setTipoAlumno] = useState<"" | TipoAlumno>("");
  const [q, setQ] = useState("");

  // Selección
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedAlumnas = useMemo(() => DEMO_ALUMNAS.filter(a => selectedIds.includes(a.id)), [selectedIds]);
  const allSelected = useMemo(
    () => filteredAlumnas().length > 0 && selectedIds.length === filteredAlumnas().length,
    [selectedIds, ciclo, area, subtipo, tipoAlumno, q]
  );

  // Modales
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [openApplyModal, setOpenApplyModal] = useState(false);

  function filteredAlumnas() {
    return DEMO_ALUMNAS.filter(a => {
      const byArea = area ? a.area === area : true;
      const bySubtipo = subtipo ? a.tipoCurso === (subtipo as TipoCurso) : true;
      const byTipoAlumno = tipoAlumno ? a.tipoAlumno === tipoAlumno : true;
      const byQ = q ? `${a.nombre} ${a.curso} ${a.sede}`.toLowerCase().includes(q.toLowerCase()) : true;
      return byArea && bySubtipo && byTipoAlumno && byQ;
    });
  }

  function toggleSelectAll() {
    const rows = filteredAlumnas();
    setSelectedIds(allSelected ? [] : rows.map(r => r.id));
  }
  function toggleSelectOne(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  // helper precio con descuento
  function calcPrecioConDescuento(precio: number, descuentoPct: number) {
    const v = precio * (1 - (descuentoPct || 0) / 100);
    return Math.max(0, Math.round(v * 100) / 100);
  }

  // --- Smoke tests (no rompen la UI) ---
  useEffect(() => {
    try {
      // 1) Programa único
      console.assert(DEMO_ALUMNAS.every(a => a.programa === "Camino Femme"), "Programa debe ser 'Camino Femme'");
      // 2) Sin PRÁCTICO
      const areaOpts = ["", "TECNICO", "COMPLEMENTARIO"];
      console.assert(!areaOpts.includes("PRACTICO" as any), "No debe existir PRÁCTICO en descuentos");
      // 3) Subtipos por área
      console.assert(JSON.stringify(getSubtipoOptions("TECNICO")) === JSON.stringify(["", "Regulares", "Intensivos", "Talleres"]), "Subtipos técnicos incorrectos");
      console.assert(JSON.stringify(getSubtipoOptions("COMPLEMENTARIO")) === JSON.stringify(["", "Especiales"]), "Subtipos complementarios incorrectos");
      // 4) Cálculo de precio con descuento
      console.assert(calcPrecioConDescuento(100, 20) === 80, "El 20% de 100 debe ser 80");
    } catch {}
  }, []);

  return (
    <section className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink text-gray-900">Descuentos</h1>
          <p className="text-sm text-graphite/70 text-gray-600">Programa: <b>Camino Femme</b> · Aplicable en <b>Técnico</b> y <b>Complementario</b></p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          
          {/* 

<button className="h-9 rounded-md border px-3 text-sm inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setOpenDiscountModal(true)}
            className="h-9 rounded-md bg-femme-magenta px-3 text-sm font-medium text-snow text-white hover:bg-femme-rose transition inline-flex items-center gap-2 disabled:opacity-40"
          >
            <BadgePercent className="h-4 w-4" /> Ofrecer descuento
          </button>
          
          
          */}

          <button
            disabled={selectedIds.length === 0}
            onClick={() => setOpenApplyModal(true)}
            className="h-9 rounded-md bg-femme-magenta px-3 text-sm font-medium text-ink text-white hover:bg-femme-rose transition inline-flex items-center gap-2 disabled:opacity-40"
          >
            <BadgeDollarSign className="h-4 w-4" /> Aplicar descuento
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="rounded-xl border p-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Select label="Ciclo" value={ciclo} onChange={setCiclo} options={["Ciclo 3-2025","Ciclo 2-2025","Ciclo 1-2025"]} />
        <Select label="Área" value={area} onChange={v=>{ setArea(v as any); setSubtipo(""); }} options={["", "TECNICO", "COMPLEMENTARIO"]} />
        <Select label="Subtipo" value={subtipo} onChange={setSubtipo} options={getSubtipoOptions(area)} />
        <Select label="Tipo de alumna" value={tipoAlumno} onChange={v=>setTipoAlumno(v as any)} options={["","NORMAL","FEMME","ELENCO"]} />
        <div className="sm:col-span-2">
          <label className="text-xs text-graphite/70 text-gray-600 block mb-1">Buscar</label>
          <input className="h-9 w-full rounded-md border px-3 text-sm" placeholder="Nombre, curso o sede…" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
              </th>
              <Th>Alumna</Th>
              <Th>Tipo</Th>
              <Th>Área</Th>
              <Th>Subtipo</Th>
              <Th>Curso</Th>
              <Th>Paquete</Th>
              <Th>Precio</Th>
              <Th>Desc. actual</Th>
              <Th>Precio con descuento</Th>
              <Th>Pago</Th>
              <Th>Inscrita</Th>
            </tr>
          </thead>
          <tbody>
            {filteredAlumnas().map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50/60">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={()=>toggleSelectOne(a.id)} />
                </td>
                <Td>{a.nombre}</Td>
                <Td>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    a.tipoAlumno==="FEMME" ? "bg-femme-softyellow/70" :
                    a.tipoAlumno==="ELENCO" ? "bg-femme-coral/20" : "bg-gray-100"
                  }`}>{a.tipoAlumno}</span>
                </Td>
                <Td>{a.area === "TECNICO" ? "Técnico" : "Complementario"}</Td>
                <Td>{a.tipoCurso}</Td>
                <Td>{a.curso}</Td>
                <Td>{renderPaquete(a.paquete)}</Td>
                <Td>Bs {a.precioTotal}</Td>
                <Td>{a.descuentoActual}%</Td>
                <Td>Bs {calcPrecioConDescuento(a.precioTotal, a.descuentoActual).toFixed(2)}</Td>
                <Td>{a.estadoPago}</Td>
                <Td>{new Date(a.inscritaEl).toLocaleDateString()}</Td>
              </tr>
            ))}
            {filteredAlumnas().length === 0 && (
              <tr><td colSpan={12} className="px-3 py-6 text-center text-graphite/60 text-gray-600">Sin resultados con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales (solo visual) */}
      {openDiscountModal && (
        <DiscountModal
          selectedAlumnas={selectedAlumnas}
          onClose={()=>setOpenDiscountModal(false)}
        />
      )}
      {openApplyModal && (
        <ApplyDiscountModal
          selectedAlumnas={selectedAlumnas}
          onClose={()=>setOpenApplyModal(false)}
        />
      )}
    </section>
  );
}

/** ---------- Subcomponentes ---------- */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
function renderPaquete(p: Paquete) {
  if (p === "A") return "A (4 clases)";
  if (p === "B") return "B (8 clases)";
  if (p === "C") return "C (12 clases)";
  if (p === "D") return "D (16 clases)";
  if (p === "Full Pass") return "Full Pass";
  return "Clase suelta";
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string)=>void; options: string[]; }) {
  return (
    <label className="block">
      <span className="text-xs text-graphite/70 text-gray-600">{label}</span>
      <div className="relative mt-1">
        <select
          className="h-9 w-full appearance-none rounded-md border px-3 text-sm pr-8"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        >
          {options.map(o => <option key={o} value={o}>{o || "Todos"}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-graphite/60 text-gray-500" />
      </div>
    </label>
  );
}

/** --- Modal de CONFIGURAR DESCUENTO (opcional paso previo) --- */
function DiscountModal({ selectedAlumnas, onClose }: { selectedAlumnas: AlumnaInscrita[]; onClose: ()=>void; }) {
  const [step, setStep] = useState<1|2>(1);
  const [modo, setModo] = useState<"GRUPAL"|"POR_ALUMNA">("GRUPAL");
  const [tipo, setTipo] = useState<"PORCENTAJE"|"MONTO">("PORCENTAJE");
  const [valor, setValor] = useState<number>(20);
  const [vigencia, setVigencia] = useState<string>("");
  const [aplica, setAplica] = useState<{[K in Paquete]?: boolean}>({ A:true, B:true, C:true, D:false, ["Full Pass"]:true, ["Clase suelta"]:false });
  const [condiciones, setCondiciones] = useState<string>("Válido solo para el ciclo vigente. No acumulable con otros descuentos.");

  // mapa por alumna (para modo POR_ALUMNA)
  type Item = { tipo: "PORCENTAJE" | "MONTO"; valor: number };
  const [porAlumna, setPorAlumna] = useState<Record<string, Item>>(
    () => Object.fromEntries(selectedAlumnas.map(a => [a.id, { tipo: "PORCENTAJE", valor: 20 }]))
  );

  const tipoSimbolo = tipo === "PORCENTAJE" ? "%" : "Bs";
  const mensajeBase = "¡Hola {nombre}! Tienes un descuento de {valor}{tipoSimbolo} en {curso}. Válido hasta {vigencia}.";
  const preview = mensajeBase
    .replace("{nombre}", selectedAlumnas[0]?.nombre || "Alumna")
    .replace("{valor}", String(modo === "GRUPAL" ? valor : porAlumna[selectedAlumnas[0]?.id || ""]?.valor ?? valor))
    .replace("{tipoSimbolo}", modo === "GRUPAL" ? tipoSimbolo : (porAlumna[selectedAlumnas[0]?.id || ""]?.tipo === "PORCENTAJE" ? "%" : "Bs"))
    .replace("{curso}", selectedAlumnas[0]?.curso || "curso")
    .replace("{vigencia}", vigencia || "dd/mm/aaaa");

  // --- Smoke tests ---
  useEffect(() => {
    try {
      console.assert(((["A","B","C","D","Full Pass","Clase suelta"] as Paquete[]).length) === 6, "Debe haber 6 paquetes");
      console.assert(selectedAlumnas.length >= 0, "Debe permitir 0+ seleccionadas");
      console.assert(Object.keys(porAlumna).length === selectedAlumnas.length, "El mapa por alumna debe coincidir con la selección");
    } catch {}
  }, [selectedAlumnas.length]);

  return (
    <Modal title="Configurar descuento" onClose={onClose}>
      {/* Stepper */}
      <div className="flex items-center gap-3 mb-4">
        <Step active={step===1} label="Definir descuento" icon={<BadgeDollarSign className="h-4 w-4" />} />
        <div className="h-px flex-1 bg-gray-200" />
        <Step active={step===2} label="Resumen" icon={<Bell className="h-4 w-4" />} />
      </div>

      {step === 1 && (
        <div className="grid gap-3">
          {/* Modo de aplicación */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Modo:</span>
            <button onClick={()=>setModo("GRUPAL")} className={`px-3 py-1.5 rounded-md border text-sm ${modo==="GRUPAL"?"bg-femme-softyellow/70":"hover:bg-gray-50"}`}>Mismo descuento para todas</button>
            <button onClick={()=>setModo("POR_ALUMNA")} className={`px-3 py-1.5 rounded-md border text-sm ${modo==="POR_ALUMNA"?"bg-femme-softyellow/70":"hover:bg-gray-50"}`}>Definir por alumna</button>
            <span className="ml-auto text-sm text-graphite/70">Aplicar a <b>{selectedAlumnas.length}</b> alumna(s)</span>
          </div>

          {modo === "GRUPAL" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm">Tipo de descuento</span>
                <div className="mt-1 flex gap-2">
                  <button onClick={()=>setTipo("PORCENTAJE")} className={`px-3 py-1.5 rounded-md border text-sm ${tipo==="PORCENTAJE"?"bg-femme-softyellow/70":"hover:bg-gray-50"}`}>Porcentaje</button>
                  <button onClick={()=>setTipo("MONTO")} className={`px-3 py-1.5 rounded-md border text-sm ${tipo==="MONTO"?"bg-femme-softyellow/70":"hover:bg-gray-50"}`}>Monto fijo</button>
                </div>
              </label>

              <label className="block">
                <span className="text-sm">Valor</span>
                <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={valor} onChange={(e)=>setValor(Number(e.target.value))} />
              </label>

              <label className="block">
                <span className="text-sm">Vigencia (fecha límite)</span>
                <input type="date" className="mt-1 w-full rounded-md border px-3 py-2" value={vigencia} onChange={(e)=>setVigencia(e.target.value)} />
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm">Paquetes aplicables</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["A","B","C","D","Full Pass","Clase suelta"] as Paquete[]).map(pk => (
                    <label key={pk} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!aplica[pk]} onChange={()=>setAplica(s=>({...s,[pk]:!s[pk]}))}/>
                      {renderPaquete(pk)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block sm:col-span-2">
                <span className="text-sm">Condiciones</span>
                <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2" value={condiciones} onChange={(e)=>setCondiciones(e.target.value)} />
              </label>
            </div>
          )}

          {modo === "POR_ALUMNA" && (
            <div className="rounded-lg border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Alumna</Th>
                    <Th>Curso</Th>
                    <Th>Tipo</Th>
                    <Th>Valor</Th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAlumnas.map(a => (
                    <tr key={a.id} className="border-t">
                      <Td>{a.nombre}</Td>
                      <Td>{a.curso}</Td>
                      <Td>
                        <select className="rounded-md border px-2 py-1"
                          value={porAlumna[a.id]?.tipo}
                          onChange={(e)=>setPorAlumna(prev=>({ ...prev, [a.id]: { ...prev[a.id], tipo: e.target.value as Item["tipo"] } }))}
                        >
                          <option value="PORCENTAJE">%</option>
                          <option value="MONTO">Bs</option>
                        </select>
                      </Td>
                      <Td>
                        <input type="number" className="w-28 rounded-md border px-2 py-1"
                          value={porAlumna[a.id]?.valor ?? 0}
                          onChange={(e)=>setPorAlumna(prev=>({ ...prev, [a.id]: { ...prev[a.id], valor: Number(e.target.value) } }))}
                        />
                      </Td>
                    </tr>
                  ))}
                  {selectedAlumnas.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-4 text-center text-graphite/60">No hay alumnas seleccionadas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded-md border px-3 py-2 text-sm">Cancelar</button>
            <button onClick={()=>setStep(2)} className="rounded-md bg-femme-magenta px-3 py-2 text-sm font-medium text-snow text-white">Continuar</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2 text-graphite/80 text-gray-700">
              <Bell className="h-4 w-4" /><span className="text-sm font-medium">Resumen</span>
            </div>
            <ul className="list-disc pl-5 text-sm">
              {selectedAlumnas.map(a => (
                <li key={a.id}>{a.nombre} – {a.curso}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between">
            <button onClick={()=>setStep(1)} className="rounded-md border px-3 py-2 text-sm">Atrás</button>
            <button onClick={onClose} className="rounded-md bg-femme-amber px-3 py-2 text-sm font-medium text-ink text-gray-900">Guardar (demo)</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** --- Modal de APLICAR DESCUENTO (según pedido) --- */
function ApplyDiscountModal({ selectedAlumnas, onClose }: { selectedAlumnas: AlumnaInscrita[]; onClose: ()=>void; }) {
  const isSingle = selectedAlumnas.length === 1;
  const [porcentajeGlobal, setPorcentajeGlobal] = useState<number>(20);
  const [motivo, setMotivo] = useState<string>("");
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>(
    () => Object.fromEntries(selectedAlumnas.map(a => [a.id, 20]))
  );

  useEffect(() => {
    // Mantener el estado en sync si cambian las seleccionadas
    setPorcentajes(Object.fromEntries(selectedAlumnas.map(a => [a.id, porcentajes[a.id] ?? porcentajeGlobal])));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlumnas.length]);

  return (
    <Modal title="Aplicar descuento" onClose={onClose}>
      {isSingle ? (
        <div className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <div className="font-medium">{selectedAlumnas[0].nombre}</div>
            <div className="text-graphite/70">{selectedAlumnas[0].curso}</div>
            <div className="mt-1">Precio actual: <b>Bs {selectedAlumnas[0].precioTotal}</b></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Porcentaje de descuento (%)</span>
              <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={porcentajeGlobal} onChange={(e)=>setPorcentajeGlobal(Number(e.target.value))} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm">Motivo</span>
              <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Ej.: reconocimiento, fidelidad, recuperación, etc." value={motivo} onChange={(e)=>setMotivo(e.target.value)} />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <div className="font-medium">Alumnas seleccionadas ({selectedAlumnas.length})</div>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Alumna</Th>
                    <Th>Curso</Th>
                    <Th>Precio actual</Th>
                    <Th>% Descuento</Th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAlumnas.map(a => (
                    <tr key={a.id} className="border-t">
                      <Td>{a.nombre}</Td>
                      <Td>{a.curso}</Td>
                      <Td>Bs {a.precioTotal}</Td>
                      <Td>
                        <input
                          type="number"
                          className="w-24 rounded-md border px-2 py-1"
                          value={porcentajes[a.id] ?? 0}
                          onChange={(e)=>setPorcentajes(prev=>({ ...prev, [a.id]: Number(e.target.value) }))}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <label className="block">
            <span className="text-sm">Motivo</span>
            <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Ej.: reconocimiento, fidelidad, recuperación, etc." value={motivo} onChange={(e)=>setMotivo(e.target.value)} />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button onClick={onClose} className="rounded-md border px-3 py-2 text-sm">Cancelar</button>
        <button onClick={onClose} className="rounded-md bg-femme-magenta px-3 py-2 text-sm font-medium text-snow">Guardar y notificar</button>
      </div>
    </Modal>
  );
}

/** --- Modal base --- */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: ()=>void; }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <BadgePercent className="h-5 w-5 text-femme-magenta" /><h3 className="font-medium">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100"><X className="h-5 w-5"/></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Step({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${active ? "bg-femme-softyellow/70" : "bg-white"}`}>
      {icon} <span>{label}</span>
    </div>
  );
}
