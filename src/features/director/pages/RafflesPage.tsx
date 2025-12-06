/*import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRaffles, drawRaffle } from '../api/director'

export default function RafflesPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['director','raffles'], queryFn: fetchRaffles })
  const m = useMutation({
    mutationFn: (id: string) => drawRaffle(id),
    onSuccess: (_, id) => { qc.invalidateQueries({ queryKey: ['director','raffles'] }); alert('Sorteo realizado ✔') }
  })

  if (!data) return null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sorteos</h1>
      {data.map(r => (
        <div key={r.id} className="bg-white border rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{r.title}</div>
            {r.winners?.length ? <div className="text-sm text-graphite mt-1">Ganadoras: {r.winners.join(', ')}</div> : null}
          </div>
          <button className="rounded-md px-3 py-2 text-white bg-femme-magenta hover:bg-femme-rose" onClick={()=>m.mutate(r.id)}>Sortear</button>
        </div>
      ))}
    </div>
  )
}
*/


import React, { useMemo, useState, useEffect } from "react";
import { Gift, Eye, Mail, Trash2, Filter, Trophy, Shuffle, ChevronDown, ChevronUp } from "lucide-react";


export default function RafflesPage() {
  // Ciclos
  const cycles = ["Todos", "Ciclo 1-2024", "Ciclo 2-2024", "Ciclo 1-2025"];
  const [cycleFilter, setCycleFilter] = useState<string>(cycles[3]);

  // Ganadoras históricas (mock)
  type Winner = { id: string; name: string; userType: string; prize: string; raffleTitle: string; cycle: string };
  const [winners, setWinners] = useState<Winner[]>([
    { id: "w1", name: "Ana", userType: "Cliente", prize: "70% (Tarjeta C/Full)", raffleTitle: "SORTEO FEMME — 27 Ene", cycle: "Ciclo 1-2025" },
    { id: "w2", name: "María", userType: "Cliente", prize: "70% (Tarjeta C/Full)", raffleTitle: "SORTEO FEMME — 27 Ene", cycle: "Ciclo 1-2025" },
  ]);

  // Sorteos (mock)
  type RaffleStatus = "activo" | "inactivo" | "finalizado";
  type Raffle = { id: string; cycle: string; title: string; deadline: string; description: string; enrolled: number; status: RaffleStatus };
  const [raffles] = useState<Raffle[]>([
    { id: "r1", cycle: "Ciclo 1-2025", title: "Sorteo FEMME — 27/01", deadline: "2025-01-27T20:00:00", description: "Promo válida para Tarjeta C y FULL PASS.", enrolled: 34, status: "activo" },
    { id: "r2", cycle: "Ciclo 1-2025", title: "Sorteo FEMME — 15/03", deadline: "2025-03-15T18:00:00", description: "Descuentos escalonados.", enrolled: 52, status: "finalizado" },
    { id: "r3", cycle: "Ciclo 2-2024", title: "Sorteo FEMME — 10/11", deadline: "2024-11-10T19:30:00", description: "Edición pasada.", enrolled: 20, status: "inactivo" },
  ]);

  const filteredWinners = useMemo(() => winners.filter(w => cycleFilter === "Todos" || w.cycle === cycleFilter), [winners, cycleFilter]);
  const filteredRaffles = useMemo(() => raffles.filter(r => cycleFilter === "Todos" || r.cycle === cycleFilter), [raffles, cycleFilter]);

  // Detalle fuera de la tabla
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = useMemo(() => filteredRaffles.find(r => r.id === openId) || null, [filteredRaffles, openId]);

  return (
    <div className="space-y-6">
      {/* Header minimal */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Sorteos</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-graphite">Ciclo</label>
          <div className="relative">
            <select
              className="rounded-lg border border-femme-magenta/40 px-3 py-2 pe-8 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-femme-magenta"
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
            >
              {cycles.map((c) => (<option key={c}>{c}</option>))}
            </select>
            <Filter className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-graphite" />
          </div>
        </div>
      </header>

      {/* Ganadoras */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2"><Trophy className="size-5 text-femme-magenta" /><h2 className="font-medium text-ink">Ganadoras</h2></div>
          <span className="rounded-full bg-femme-softyellow/50 px-2 py-0.5 text-xs text-ink">{cycleFilter === "Todos" ? "Todos los ciclos" : cycleFilter}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-graphite">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Premio</th>
                <th className="px-3 py-2 font-medium">Sorteo</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.length === 0 ? (
                <tr><td className="px-3 py-3 text-graphite" colSpan={6}>Sin ganadoras.</td></tr>
              ) : (
                filteredWinners.map((w, i) => (
                  <tr key={w.id}>
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{w.name}</td>
                    <td className="px-3 py-2">{w.userType}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-md bg-femme-amber/30 px-2 py-0.5 text-xs font-semibold text-ink">{w.prize}</span>
                    </td>
                    <td className="px-3 py-2">{w.raffleTitle}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg border border-femme-coral px-2 py-1 text-xs text-femme-coral hover:bg-femme-coral/10" title="Enviar notificación"><Mail className="size-4" /></button>
                        <button className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Listado de sorteos (tabla) */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2"><Gift className="size-5 text-femme-rose" /><h2 className="font-medium text-ink">Listado</h2></div>
          <span className="text-xs text-graphite">Activos e inactivos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-graphite">
              <tr>
                <th className="px-3 py-2 font-medium">Ciclo</th>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Límite</th>
                <th className="px-3 py-2 font-medium">Inscritas</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredRaffles.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.cycle}</td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2">{fmtDateTime(r.deadline)}</td>
                  <td className="px-3 py-2">{r.enrolled}</td>
                  <td className="px-3 py-2">{statusBadge(r.status)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className={`${r.status === "activo" ? "bg-gradient-to-r from-femme-magenta to-femme-rose hover:shadow" : "bg-graphite/30 cursor-not-allowed"} rounded-lg px-3 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-femme-magenta focus:ring-offset-2`}
                        disabled={r.status !== "activo"}
                        onClick={() => setOpenId(prev => prev === r.id ? null : r.id)}
                      >
                        {openId === r.id ? (
                          <span className="inline-flex items-center gap-1">Cerrar <ChevronUp className="size-4"/></span>
                        ) : (
                          <span className="inline-flex items-center gap-1">Sortear <ChevronDown className="size-4"/></span>
                        )}
                      </button>
                      <button
                        className="rounded-lg border border-femme-coral px-3 py-1 text-xs font-medium text-femme-coral hover:bg-femme-coral/10 focus:outline-none focus:ring-2 focus:ring-femme-coral/60"
                        onClick={() => setOpenId(prev => prev === r.id ? null : r.id)}
                        title="Detalle"
                      >
                        <Eye className="mr-1 inline size-4" />Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalle debajo de la tabla */}
      {selected && (
        <section className="rounded-2xl border bg-white p-3 shadow-sm">
          <RaffleInlineDetail raffle={selected} onClose={() => setOpenId(null)} onAddWinners={(ww)=>setWinners(prev=>[...ww, ...prev])} />
        </section>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Detalle simple inline (debajo de la tabla)
function RaffleInlineDetail({ raffle, onClose, onAddWinners }: { raffle: { id: string; cycle: string; title: string; deadline: string; description: string; enrolled: number }; onClose: ()=>void; onAddWinners: (w: { id: string; name: string; userType: string; prize: string; raffleTitle: string; cycle: string }[]) => void; }) {
  type Participant = { id: string; name: string; userType: string; enrolledAt: string; include: boolean };
  const [participants, setParticipants] = useState<Participant[]>(() => sampleParticipants(raffle.enrolled));

  // Orden por fecha/hora (asc)
  const ordered = useMemo(() => [...participants].sort((a,b)=>new Date(a.enrolledAt).getTime()-new Date(b.enrolledAt).getTime()), [participants]);
  const [typeFilter, setTypeFilter] = useState<string>("Todos");
  const filtered = useMemo(() => typeFilter === "Todos" ? ordered : ordered.filter(p => p.userType === typeFilter), [ordered, typeFilter]);

  // Ganadoras y premios
  const [winnersCount, setWinnersCount] = useState<number>(3);
  const [prizes, setPrizes] = useState<number[]>([70, 50, 40]);

  // Autogenerar premios al cambiar la cantidad
  useEffect(()=>{
    setPrizes(prev => {
      const next = [...prev];
      if (winnersCount > next.length) {
        while (next.length < winnersCount) next.push(70);
      } else if (winnersCount < next.length) {
        next.length = winnersCount;
      }
      return next;
    });
  }, [winnersCount]);

  function setPrizeAt(i: number, val: number) { setPrizes(prev => prev.map((p, idx) => idx === i ? val : p)); }
  function toggleInclude(id: string) { setParticipants(prev => prev.map(p => p.id===id?{...p, include: !p.include}:p)); }
  function selectAll(val: boolean) { setParticipants(prev => prev.map(p => ({...p, include: val}))); }

  // Seleccionadas actuales
  const selectedNow = useMemo(() => filtered.filter(p=>p.include), [filtered]);

  type Picked = { participant: Participant; discount: number };
  const [picked, setPicked] = useState<Picked[]>([]);
  const [announce, setAnnounce] = useState<string>("");

  function runDraw() {
    const pool = selectedNow;
    if (pool.length === 0) {
      setAnnounce("Selecciona al menos una participante para sortear.");
      setPicked([]);
      return;
    }
    const qty = Math.min(winnersCount, pool.length);
    const candidates = [...pool];
    const res: Picked[] = [];
    for (let i=0; i<qty; i++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const chosen = candidates.splice(idx,1)[0];
      res.push({ participant: chosen, discount: prizes[i] ?? prizes[prizes.length-1] ?? 0 });
    }
    setPicked(res);
    const msg = res.map((x, i) => `${i+1}. ${x.participant.name} (${x.discount}%)`).join(" · ");
    setAnnounce(`Ganadoras: ${msg}`);
  }

  function confirm() {
    if (picked.length === 0) return;
    const mapped = picked.map(({participant, discount}) => ({
      id: `w-${participant.id}-${Date.now()}`,
      name: participant.name,
      userType: participant.userType,
      prize: `${discount}% (Tarjeta C/Full)`,
      raffleTitle: raffle.title,
      cycle: raffle.cycle,
    }));
    onAddWinners(mapped);
    onClose();
  }

  // Selector de cantidad (como botón)
  const [openQty, setOpenQty] = useState(false);

  return (
    <div className="space-y-4">
      {/* Encabezado del detalle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div>
          <p className="text-sm font-medium text-ink">{raffle.title}</p>
          <p className="text-xs text-graphite">{raffle.cycle} · Límite {fmtDateTime(raffle.deadline)}</p>
        </div>
        <button onClick={onClose} className="rounded-lg border px-3 py-1 text-xs text-graphite hover:bg-graphite/5">Cerrar detalle</button>
      </div>

      {/* Premios y participantes */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Premios */}
        <div className="relative rounded-2xl border bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Premios</p>
            <div className="relative">
              <button
                className="rounded-lg border border-femme-amber/60 px-2 py-1 text-xs font-medium text-ink hover:bg-femme-amber/20 focus:outline-none focus:ring-2 focus:ring-femme-amber"
                onClick={()=>setOpenQty(v=>!v)}
              >
                N° ganadoras: {winnersCount}
              </button>
              {openQty && (
                <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border bg-white p-2 shadow-md">
                  <div className="grid grid-cols-6 gap-1 text-xs">
                    {Array.from({length: 12}).map((_,i)=>{
                      const n = i+1;
                      const isSel = n===winnersCount;
                      return (
                        <button
                          key={n}
                          className={`rounded-md border px-2 py-1 ${isSel?"bg-femme-softyellow/70 border-femme-softyellow text-ink":"hover:bg-femme-rose/10"}`}
                          onClick={()=>{setWinnersCount(n); setOpenQty(false);}}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {prizes.map((p, i) => (
              <label key={i} className="flex items-center justify-between rounded-lg border px-2 py-2 text-sm">
                <span className="text-ink">Ganadora {i+1}</span>
                <span className="flex items-center gap-2">
                  <input type="number" min={0} max={100} className="w-20 rounded-md border px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta" value={p} onChange={(e)=>setPrizeAt(i, Number(e.target.value)||0)} />
                  <span className="text-ink">%</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Participantes */}
        <div className="rounded-2xl border bg-white p-3 shadow-sm md:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">Participantes ({filtered.length})</p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-graphite">Tipo</label>
              <select className="rounded-lg border border-femme-magenta/40 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta" value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}>
                {"Todos,Cliente,Femme,Alumno".split(",").map(t => (<option key={t}>{t}</option>))}
              </select>
              <button className="rounded-lg border px-2 py-1 text-xs font-medium text-ink hover:bg-graphite/5" onClick={()=>selectAll(true)}>Seleccionar todo</button>
              <button className="rounded-lg border px-2 py-1 text-xs font-medium text-ink hover:bg-graphite/5" onClick={()=>selectAll(false)}>Limpiar</button>
            </div>
          </div>
          <div className="max-h-72 overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-femme-softyellow/40 text-left text-graphite">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Inscripción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2"><input type="checkbox" checked={p.include} onChange={()=>toggleInclude(p.id)} /></td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.userType}</td>
                    <td className="px-3 py-2">{fmtDateTime(p.enrolledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-graphite">Seleccionadas: <b>{selectedNow.length}</b></div>
        </div>
      </div>

      {/* Bloque de seleccionadas + botón Sortear y resultados */}
      <div className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Seleccionadas</p>
          <button className="rounded-lg bg-gradient-to-r from-femme-magenta to-femme-rose px-3 py-2 text-xs font-semibold text-white shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-femme-magenta focus:ring-offset-2" onClick={runDraw}>
            <Shuffle className="mr-1 inline size-4"/> Sortear
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          {selectedNow.length === 0 ? (
            <p className="p-3 text-sm text-graphite">No hay seleccionadas.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-graphite/10 text-left text-graphite">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Inscripción</th>
                </tr>
              </thead>
              <tbody>
                {selectedNow.map((p, i) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{i+1}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.userType}</td>
                    <td className="px-3 py-2">{fmtDateTime(p.enrolledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mensaje/alerta de ganadoras */}
        {announce && (
          <div className="mt-3 rounded-lg border border-femme-amber bg-femme-softyellow/40 px-3 py-2 text-xs text-ink">
            {announce}
          </div>
        )}

        {/* Tabla de ganadoras */}
        {picked.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-graphite/10 text-left text-graphite">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Inscripción</th>
                  <th className="px-3 py-2 font-medium">Premio</th>
                </tr>
              </thead>
              <tbody>
                {picked.map(({participant, discount}, i) => (
                  <tr key={participant.id}>
                    <td className="px-3 py-2">{i+1}</td>
                    <td className="px-3 py-2">{participant.name}</td>
                    <td className="px-3 py-2">{participant.userType}</td>
                    <td className="px-3 py-2">{fmtDateTime(participant.enrolledAt)}</td>
                    <td className="px-3 py-2"><span className="rounded-md bg-femme-amber/40 px-2 py-0.5 text-xs font-semibold text-ink">{discount}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm text-ink hover:bg-graphite/5">Cerrar</button>
          <button onClick={confirm} disabled={picked.length===0} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()} ${hh}:${min}`;
}

function statusBadge(status: "activo" | "inactivo" | "finalizado") {
  const map: Record<string, string> = {
    activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactivo: "bg-graphite/10 text-graphite border-graphite/20",
    finalizado: "bg-femme-softyellow/40 text-ink border-femme-softyellow/60",
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${map[status]}`}>{status}</span>;
}

function sampleParticipants(n: number): { id: string; name: string; userType: string; enrolledAt: string; include: boolean }[] {
  const names = [
    "Ana", "María", "Sofía", "Lucía", "Camila", "Valentina", "Fernanda", "Carla", "Paula", "Daniela",
    "Laura", "Julieta", "Micaela", "Adriana", "Rocío", "Gabriela", "Natalia", "Andrea", "Bianca", "Jimena",
    "Karla", "Noelia", "Patricia", "Yesenia", "Zoe", "Fiorella", "Ivanna", "Alejandra", "Mónica", "Diana",
  ];
  const types = ["Cliente", "Femme", "Alumno"];
  return Array.from({ length: Math.min(n, names.length) }).map((_, i) => {
    const day = 20 + Math.floor(i / 6);
    const hr = 16 + (i % 6);
    const date = new Date(`2025-01-${String(day).padStart(2, "0")}T${String(hr).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`);
    return { id: `p${i + 1}`, name: names[i % names.length], userType: types[i % types.length], enrolledAt: date.toISOString(), include: true };
  });
}
