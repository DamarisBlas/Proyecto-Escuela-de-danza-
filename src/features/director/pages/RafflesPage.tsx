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
import { Gift, Mail, Trash2, Filter, Trophy, Shuffle, ChevronDown, ChevronUp } from "lucide-react";
import { env } from "@/config/env";


export default function RafflesPage() {
  // Ciclos
  const cycles = ["Todos", "Ciclo 1-2024", "Ciclo 2-2024", "Ciclo 1-2025"];
  const [cycleFilter, setCycleFilter] = useState<string>("Todos");

  // Ganadoras históricas
  type Winner = { id: string; name: string; userType: string; prize: string; raffleTitle: string; cycle: string; phone?: string };
  const [winners, setWinners] = useState<Winner[]>([]);

  const fetchAllWinners = async () => {
    try {
      const response = await fetch(`${env.API_URL}/sorteos/ganadores-detalle`);
      if (!response.ok) {
        console.error('Error fetching winners:', response.status);
        return;
      }
      const data = await response.json();
      const allWinners: Winner[] = [];
      
      data.sorteos.forEach((sorteoItem: any) => {
        const sorteoInfo = sorteoItem.sorteo;
        sorteoItem.ganadores.forEach((ganador: any, idx: number) => {
          allWinners.push({
            id: `w-${sorteoInfo.id_sorteo}-${ganador.id_ganador}`,
            name: ganador.nombre_completo,
            userType: ganador.tipo_cuenta === 'alumno' ? 'Alumno' : ganador.tipo_cuenta === 'profesor' ? 'Profesor' : 'Cliente',
            prize: `${ganador.premio.descuento}%`,
            raffleTitle: sorteoInfo.promocion,
            cycle: 'N/A', // No hay info de ciclo en este endpoint
            phone: ganador.celular
          });
        });
      });
      
      setWinners(allWinners);
      console.log('Winners loaded:', allWinners.length);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  };

  // Fetch winners on mount
  useEffect(() => {
    fetchAllWinners();
  }, []);

  // Sorteos
  type RaffleStatus = "activo" | "inactivo" | "finalizado";
  type Raffle = { id: string; cycle: string; title: string; deadline: string; description: string; enrolled: number; status: RaffleStatus };
  const [raffles, setRaffles] = useState<Raffle[]>([]);

  // Fetch raffles from API
  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const response = await fetch(`${env.API_URL}/promociones/sorteos`);
        if (!response.ok) throw new Error('Error fetching raffles');
        const data = await response.json();
        const mappedRaffles: Raffle[] = data.map((item: any) => ({
          id: String(item.id_promocion),
          cycle: item.ciclo.nombre_ciclo,
          title: item.nombre_promocion,
          deadline: item.fecha_fin,
          description: item.descricpcion,
          enrolled: item.cantidad_beneficiarios_inscritos,
          status: item.activo ? "activo" : "inactivo" as RaffleStatus
        }));
        setRaffles(mappedRaffles);
      } catch (error) {
        console.error('Error fetching raffles:', error);
      }
    };
    fetchRaffles();
  }, []);

  const filteredWinners = useMemo(() => winners.filter(w => cycleFilter === "Todos" || w.cycle === cycleFilter), [winners, cycleFilter]);
  const filteredRaffles = useMemo(() => raffles.filter(r => cycleFilter === "Todos" || r.cycle === cycleFilter), [raffles, cycleFilter]);

  function sendWhatsAppMessage(winner: Winner) {
    if (!winner.phone) {
      alert('No hay número de teléfono para esta ganadora.');
      return;
    }
    const message = `¡Felicidades ${winner.name}! 🎉\n\nHas sido ganadora del sorteo "${winner.raffleTitle}" con un descuento del ${winner.prize}.\n\n¡Gracias por participar!`;
    const phone = winner.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

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
                        <button onClick={() => sendWhatsAppMessage(w)} className="rounded-lg border border-femme-coral px-2 py-1 text-xs text-femme-coral hover:bg-femme-coral/10" title="Enviar felicitación por WhatsApp"><Mail className="size-4" /></button>
                        {/* <button className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 className="size-4" /></button> */}
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
          <RaffleInlineDetail raffle={selected} onClose={() => setOpenId(null)} onRefreshWinners={fetchAllWinners} />
        </section>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Detalle simple inline (debajo de la tabla)
function RaffleInlineDetail({ raffle, onClose, onRefreshWinners }: { raffle: { id: string; cycle: string; title: string; deadline: string; description: string; enrolled: number }; onClose: ()=>void; onRefreshWinners: () => void; }) {
  type Participant = { id: string; name: string; userType: string; enrolledAt: string; include: boolean };
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Fetch participants from API
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`${env.API_URL}/promociones/personasdeunsorteo/${raffle.id}`);
        if (!response.ok) throw new Error('Error fetching participants');
        const data = await response.json();
        // Unique by id_persona, prefer PAGADO if duplicate
        const uniqueMap = new Map();
        data.personas.forEach((p: any) => {
          if (!uniqueMap.has(p.id_persona)) {
            uniqueMap.set(p.id_persona, p);
          } else {
            if (p.estado_pago === 'PAGADO') {
              uniqueMap.set(p.id_persona, p);
            }
          }
        });
        const uniquePersonas = Array.from(uniqueMap.values());
        const mappedParticipants: Participant[] = uniquePersonas.map((p: any) => ({
          id: String(p.id_persona),
          name: `${p.nombre} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.trim(),
          userType: p.tipo_cuenta === 'alumno' ? 'Alumno' : p.tipo_cuenta === 'profesor' ? 'Profesor' : 'Cliente',
          enrolledAt: p.fecha_inscripcion,
          include: p.estado_inscripcion === 'ACTIVO'
        }));
        setParticipants(mappedParticipants);
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };
    fetchParticipants();
  }, [raffle.id]);

  // Orden por fecha/hora (asc)
  const ordered = useMemo(() => [...participants].sort((a,b)=>new Date(a.enrolledAt).getTime()-new Date(b.enrolledAt).getTime()), [participants]);
  const [typeFilter, setTypeFilter] = useState<string>("Todos");
  const filtered = useMemo(() => typeFilter === "Todos" ? ordered : ordered.filter(p => p.userType === typeFilter), [ordered, typeFilter]);

  // Ganadoras y premios
  type Prize = { id_premio: number; descuento: number; estado: boolean };
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winnersCount, setWinnersCount] = useState<number>(0);

  // Fetch prizes from API
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetch(`${env.API_URL}/promociones/${raffle.id}/premios`);
        if (!response.ok) throw new Error('Error fetching prizes');
        const data = await response.json();
        const activePrizes = data.filter((p: any) => p.estado);
        setPrizes(activePrizes);
        setWinnersCount(activePrizes.length);
      } catch (error) {
        console.error('Error fetching prizes:', error);
      }
    };
    fetchPrizes();
  }, [raffle.id]);

  function setPrizeAt(i: number, val: number) { setPrizes(prev => prev.map((p, idx) => idx === i ? {...p, descuento: val} : p)); }
  function toggleInclude(id: string) { setParticipants(prev => prev.map(p => p.id===id?{...p, include: !p.include}:p)); }
  function selectAll(val: boolean) { setParticipants(prev => prev.map(p => ({...p, include: val}))); }

  // Seleccionadas actuales
  const selectedNow = useMemo(() => filtered.filter(p=>p.include), [filtered]);

  type Picked = { participant: Participant; discount: number; prizeId?: number };
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
      const discount = prizes[i]?.descuento ?? 0;
      res.push({ participant: chosen, discount, prizeId: prizes[i]?.id_premio });
    }
    setPicked(res);
    const msg = res.map((x, i) => `${i+1}. ${x.participant.name} (${x.discount}%)`).join(" · ");
    setAnnounce(`Ganadoras: ${msg}`);
  }

  async function confirm() {
    if (picked.length === 0) return;
    try {
      console.log('Creating sorteo for promocion:', raffle.id);
      // 1. Create sorteo
      const sorteoPayload = {
        Promocion_id_promocion: parseInt(raffle.id)
      };
      console.log('Sorteo payload:', sorteoPayload);
      
      const sorteoResponse = await fetch(`${env.API_URL}/sorteos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sorteoPayload)
      });
      
      if (!sorteoResponse.ok) {
        const errorText = await sorteoResponse.text();
        console.error('Sorteo creation failed:', sorteoResponse.status, errorText);
        throw new Error(`Error creating sorteo: ${sorteoResponse.status}`);
      }
      
      const sorteoData = await sorteoResponse.json();
      console.log('Sorteo created:', sorteoData);
      const idSorteo = sorteoData.sorteo.id_sorteo;

      // 2. Create winners
      for (const winner of picked) {
        const ganadorPayload = {
          Persona_id_persona: parseInt(winner.participant.id),
          Sorteo_id_sorteo: idSorteo,
          Premios_id_premio: winner.prizeId
        };
        console.log('Creating ganador:', ganadorPayload);
        
        const ganadorResponse = await fetch(`${env.API_URL}/ganadores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ganadorPayload)
        });
        
        if (!ganadorResponse.ok) {
          const errorText = await ganadorResponse.text();
          console.error('Ganador creation failed:', ganadorResponse.status, errorText);
        }
      }

      // 3. Refresh all winners table
      onRefreshWinners();
      onClose();
    } catch (error) {
      console.error('Error confirming raffle:', error);
      alert('Error al confirmar el sorteo. Intenta de nuevo.');
    }
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
                  <input type="number" min={0} max={100} className="w-20 rounded-md border px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-femme-magenta" value={p.descuento} onChange={(e)=>setPrizeAt(i, Number(e.target.value)||0)} />
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


