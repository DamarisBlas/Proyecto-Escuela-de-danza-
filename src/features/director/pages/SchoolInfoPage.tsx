
import React, { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";



import { fetchSchoolInfo, updateSchoolInfo } from '../api/director'




type SchoolInfo = {
  name: string;
  branches: string[];
  address: string;
  about: string;
  mission?: string;
  vision?: string;
  values?: string;
  social: { instagram?: string; facebook?: string; whatsapp?: string };
  faq: { id: number | string; question: string; answer: string }[];
};

const QK = { school: ["director", "school"] as const };

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ============================
   Componente principal
   ============================ */
export default function SchoolInfoPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery<SchoolInfo>({
    queryKey: QK.school,
    queryFn: fetchSchoolInfo,
    staleTime: 30_000,
  });

  const mutSave = useMutation({
    mutationFn: (payload: SchoolInfo) => updateSchoolInfo(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: QK.school });
      const prev = qc.getQueryData<SchoolInfo>(QK.school);
      qc.setQueryData(QK.school, payload);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QK.school, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK.school }),
  });

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<SchoolInfo | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    address: false,
    about: false,
    mission: false,
    vision: false,
    values: false,
  });

  const current = form ?? data ?? null;
  const invalid = useMemo(() => {
    if (!current) return true;
    const nameOK = current.name.trim().length > 2;
    const addrOK = current.address.trim().length > 4;
    const aboutOK = current.about.trim().length > 10;
    return !(nameOK && addrOK && aboutOK);
  }, [current]);

  function startEdit() {
    if (!data) return;
    setForm(JSON.parse(JSON.stringify(data)));
    setEditMode(true);
    setTouched({ name: false, address: false, about: false , mission: false, vision: false, values: false});
  }
  function cancelEdit() {
    setForm(null);
    setEditMode(false);
  }
  async function save() {
    if (!current) return;
    if (invalid) {
      setTouched({ name: true, address: true, about: true, mission: true, vision: true, values: true });
      return;
    }
    await mutSave.mutateAsync(current);
    setEditMode(false);
  }

  function addBranch() {
    if (!current) return;
    setForm({
      ...(form ?? current),
      branches: [...(current.branches ?? []), ""],
    });
  }
  function removeBranch(i: number) {
    if (!current) return;
    const branches = [...current.branches];
    branches.splice(i, 1);
    setForm({ ...(form ?? current), branches });
  }
  function updateBranch(i: number, v: string) {
    if (!current) return;
    const branches = [...current.branches];
    branches[i] = v;
    setForm({ ...(form ?? current), branches });
  }

  function updateFaq(id: number | string, changes: Partial<{ question: string; answer: string }>) {
    if (!current) return;
    const faq = (current.faq ?? []).map(f =>
      f.id === id ? { ...f, ...changes } : f
    );
    setForm({ ...(form ?? current), faq });
  }

  function removeFaq(id: number | string) {
    if (!current) return;
    const faq = (current.faq ?? []).filter(f => f.id !== id);
    setForm({ ...(form ?? current), faq });
  }

  function addFaq() {
    if (!current) return;
    const faq = [
      ...(current.faq ?? []),
      {
        id: Date.now(),
        question: "",
        answer: "",
      },
    ];
    setForm({ ...(form ?? current), faq });
  }
  
  
  return (
    <div className="min-h-[80vh] bg-neutral-50 py-8">
      <div className="mx-auto max-w-6xl rounded-2xl border bg-white p-6 shadow-sm">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Información de la Escuela</h1>
            <p className="text-sm text-neutral-500">Administra nombre, sucursales, redes y preguntas frecuentes</p>
          </div>
          <div className="ml-auto flex gap-2">
            {!editMode ? (
              <>
                <button
                  onClick={() => refetch()}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                >
                  Refrescar
                </button>
                <button
                  onClick={startEdit}
                  className="rounded-xl bg-femme-magenta px-4 py-2 text-sm font-medium text-white hover:bg-femme-rose"
                >
                  Editar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={invalid || mutSave.status === "pending"}
                  className={classNames(
                    "rounded-xl px-4 py-2 text-sm font-medium text-white",
                    invalid || mutSave.status === "pending"
                      ? "bg-neutral-300 cursor-not-allowed"
                      : "bg-femme-magenta hover:bg-femme-rose"
                  )}
                >
                  {mutSave.status === "pending" ? "Guardando…" : "Guardar cambios"}
                </button>
              </>
            )}
          </div>
        </header>

        {isLoading && <div className="py-16 text-center text-neutral-500">Cargando…</div>}
        {isError && <div className="py-16 text-center text-red-600">No se pudo cargar la información.</div>}

        {!isLoading && !isError && current && (
          <div className="space-y-8">
            {/* Básicos */}
            <section>
              <h2 className="text-lg font-semibold">Datos básicos</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    disabled={!editMode}
                    value={current.name}
                    onChange={(e) => setForm({ ...(form ?? current), name: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={classNames(
                      "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                      !editMode
                        ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                        : touched.name && !current.name.trim()
                        ? "border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:ring-neutral-200"
                    )}
                  />
                  {editMode && touched.name && !current.name.trim() && (
                    <p className="mt-1 text-xs text-red-600">Requerido</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Dirección</label>
                  <input
                    disabled={!editMode}
                    value={current.address}
                    onChange={(e) => setForm({ ...(form ?? current), address: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                    className={classNames(
                      "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                      !editMode
                        ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                        : touched.address && current.address.trim().length < 5
                        ? "border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:ring-neutral-200"
                    )}
                  />
                  {editMode && touched.address && current.address.trim().length < 5 && (
                    <p className="mt-1 text-xs text-red-600">Dirección muy corta</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Sobre la escuela</label>
                  <textarea
                    disabled={!editMode}
                    value={current.about}
                    onChange={(e) => setForm({ ...(form ?? current), about: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, about: true }))}
                    className={classNames(
                      "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                      !editMode
                        ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                        : touched.about && current.about.trim().length < 10
                        ? "border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:ring-neutral-200"
                    )}
                    rows={3}
                  />
                  {editMode && touched.about && current.about.trim().length < 10 && (
                    <p className="mt-1 text-xs text-red-600">Describe un poco más</p>
                  )}
                </div>

                 {/* Misión, Visión, Valores */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Misión</label>
                    <textarea
                      disabled={!editMode}
                      value={current.mission ?? ""}
                      onChange={(e) => setForm({ ...(form ?? current), mission: e.target.value })}
                      className={classNames(
                        "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                        !editMode
                          ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                          : "border-neutral-300 focus:ring-neutral-200"
                      )}

                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Visión</label>
                    <textarea
                      disabled={!editMode}
                      value={current.vision ?? ""}
                      onChange={(e) => setForm({ ...(form ?? current), vision: e.target.value })}
                      className={classNames(
                        "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                        !editMode
                          ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                          : touched.vision && (current.vision?.trim().length ?? 0) < 10
                          ? "border-red-400 focus:ring-red-100"
                          : "border-neutral-300 focus:ring-neutral-200"
                      )}

                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Valores</label>
                    <textarea
                      disabled={!editMode}
                      value={current.values ?? ""}
                      onChange={(e) => setForm({ ...(form ?? current), values: e.target.value })}
                      className={classNames(
                        "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                        !editMode 
                          ? "border-neutral-200 bg-neutral-50 focus:ring-transparent"
                          : touched.values && (current.values?.trim().length ?? 0) < 10
                          ? "border-red-400 focus:ring-red-100"
                          : "border-neutral-300 focus:ring-neutral-200"
                      )}

                      rows={2}
                    />
                  </div>
               
               </div>

            </section>

            {/* Sucursales */}
            <section>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Sucursales</h2>
                {editMode && (
                  <button
                    onClick={addBranch}
                    className="ml-auto rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    + Agregar sucursal
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {(current.branches ?? []).map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      disabled={!editMode}
                      value={b}
                      onChange={(e) => updateBranch(i, e.target.value)}
                      className={classNames(
                        "w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                        editMode ? "border-neutral-300 focus:ring-neutral-200" : "border-neutral-200 bg-neutral-50"
                      )}
                      placeholder="Nombre de la sede"
                    />
                    {editMode && (
                      <button
                        onClick={() => removeBranch(i)}
                        className="rounded-xl border border-red-400 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        title="Eliminar sucursal"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                ))}
                {editMode && (current.branches ?? []).length === 0 && (
                  <p className="text-sm text-neutral-500">No hay sucursales. Agrega la primera.</p>
                )}
              </div>
            </section>

            {/* Redes sociales */}
            <section>
              <h2 className="text-lg font-semibold">Redes</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                {(["instagram", "facebook", "whatsapp"] as const).map((k) => (
                  <div key={k}>
                    <label className="text-sm font-medium capitalize">{k}</label>
                    <input
                      disabled={!editMode}
                      value={current.social?.[k] ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...(form ?? current),
                          social: { ...(current.social ?? {}), [k]: e.target.value },
                        })
                      }
                      className={classNames(
                        "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4",
                        editMode ? "border-neutral-300 focus:ring-neutral-200" : "border-neutral-200 bg-neutral-50"
                      )}
                      placeholder={
                        k === "whatsapp" ? "+591 7xxxxxxx" : `https://${k}.com/tu_cuenta`
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
                {editMode && (
                  <button
                    onClick={addFaq}
                    className="ml-auto rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    + Agregar pregunta
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-3">
                {(current.faq ?? []).map((f) => (
                  <div key={f.id} className="rounded-xl border p-3">
                    {!editMode ? (
                      <>
                        <p className="font-medium">{f.question}</p>
                        <p className="text-sm text-neutral-600">{f.answer}</p>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          value={f.question}
                          onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200"
                          placeholder="Pregunta"
                        />
                        <textarea
                          value={f.answer}
                          onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200"
                          placeholder="Respuesta"
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeFaq(f.id)}
                            className="rounded-xl border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (current.faq ?? []).length === 0 && (
                  <p className="text-sm text-neutral-500">No hay preguntas. Agrega la primera.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================
   Standalone con Provider
   ============================ */
export function SchoolInfoPageStandalone() {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <SchoolInfoPage />
    </QueryClientProvider>
  );
}

/* ===========================================================
   PRUEBAS MANUALES (checklist)
   1) Render: ver card con datos de la escuela.
   2) Click “Editar”: habilita inputs, agrega sucursales/FAQ.
   3) Guardar con campos vacíos -> errores en rojo (nombre, dirección, about).
   4) Guardar válido -> se desactiva edición, datos actualizados (optimistic).
   5) Refrescar -> vuelve a cargar desde la API.
   6) Sin backend -> deben verse los mocks.*/