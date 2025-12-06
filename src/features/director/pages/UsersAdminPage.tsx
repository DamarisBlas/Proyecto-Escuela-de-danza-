import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@components/ui/Button";

type Role = "ALUMNO" | "FEMME" | "PROFESOR" | "DIRECTOR";
type UserRow = { 
  id: string; 
  name: string; 
  email: string; 
  role: Role; 
  active: boolean;
  celular?: string;
  solicitud_user_especial?: boolean;
  tipo_cuenta?: string | null;
};

function classNames(...c: any[]) {
  return c.filter(Boolean).join(" ");
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"TODOS" | Role | string>("TODOS");
  const [activeFilter, setActiveFilter] = useState<"TODOS" | "ACTIVOS" | "INACTIVOS">("TODOS");
  const [sortKey, setSortKey] = useState<keyof UserRow | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<UserRow & { __isNew?: boolean } | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${env.API_URL}/users/personas`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const transformedUsers: UserRow[] = data.map((persona: any) => ({
            id: String(persona.id_persona),
            name: `${persona.nombre} ${persona.apellido}`,
            email: persona.email,
            role: determineRole(persona),
            active: persona.estado,
            celular: persona.celular,
            solicitud_user_especial: persona.solicitud_user_especial,
            tipo_cuenta: persona.tipo_cuenta
          }));

          setUsers(transformedUsers);
          console.log(`Usuarios cargados desde API: ${transformedUsers.length}`);
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper function to determine role based on backend data
  function determineRole(persona: any): Role {
    if (persona.tipo_cuenta === 'profesor') return 'PROFESOR';
    if (persona.tipo_cuenta === 'director') return 'DIRECTOR';
    if (persona.solicitud_user_especial) return 'FEMME';
    return 'ALUMNO';
  }

  // Simple local helpers
  function openCreate() {
    setEdit({ id: `t-${Date.now()}`, name: "", email: "", role: "ALUMNO", active: true, __isNew: true });
    setOpen(true);
  }

  function openEdit(u: UserRow) {
    setEdit({ ...u });
    setOpen(true);
  }

  function closeModal() {
    if (edit && edit.__isNew) setUsers((s) => s.filter((x) => x.id !== edit.id));
    setEdit(null);
    setOpen(false);
  }

  async function saveChanges() {
    if (!edit) return;

    try {
      // Split name into nombre and apellido
      const nameParts = edit.name.trim().split(' ');
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';

      // Map role to tipo_cuenta
      let tipo_cuenta: string | null = null;
      if (edit.role === 'PROFESOR') tipo_cuenta = 'profesor';
      else if (edit.role === 'DIRECTOR') tipo_cuenta = 'director';
      else if (edit.role === 'ALUMNO') tipo_cuenta = 'alumno';
      else if (edit.role === 'FEMME') tipo_cuenta = 'femme';

      const payload = {
        nombre,
        apellido,
        email: edit.email,
        celular: edit.celular || '',
        tipo_cuenta
      };

      const response = await fetch(`${env.API_URL}/users/personas/${edit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Update local state with response data
      if (data.persona) {
        const updatedUser: UserRow = {
          id: String(data.persona.id_persona),
          name: `${data.persona.nombre} ${data.persona.apellido}`,
          email: data.persona.email,
          role: determineRole(data.persona),
          active: data.persona.estado,
          celular: data.persona.celular,
          solicitud_user_especial: data.persona.solicitud_user_especial,
          tipo_cuenta: data.persona.tipo_cuenta
        };

        setUsers((s) => s.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      }

      setEdit(null);
      setOpen(false);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      alert('Error al guardar el usuario. Intenta de nuevo.');
    }
  }

  async function toggleActiveLocal(id: string) {
    const user = users.find(u => u.id === id);
    if (!user || user.role !== 'PROFESOR') return;

    try {
      const payload = {
        tipo_cuenta: "profesor",
        activar: !user.active
      };

      const response = await fetch(`${env.API_URL}/users/personas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Update local state with response data
      if (data.persona) {
        const updatedUser: UserRow = {
          id: String(data.persona.id_persona),
          name: `${data.persona.nombre} ${data.persona.apellido}`,
          email: data.persona.email,
          role: determineRole(data.persona),
          active: data.persona.estado,
          celular: data.persona.celular,
          solicitud_user_especial: data.persona.solicitud_user_especial,
          tipo_cuenta: data.persona.tipo_cuenta
        };

        setUsers((s) => s.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      }
    } catch (err) {
      console.error('Error al activar/desactivar profesor:', err);
      alert('Error al cambiar el estado del profesor. Intenta de nuevo.');
    }
  }

  function toggleSort(k: keyof UserRow) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  const visibles = useMemo(() => {
    let res = users.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter !== "TODOS") res = res.filter((u) => u.role === roleFilter);
    if (activeFilter === "ACTIVOS") res = res.filter((u) => u.active);
    if (activeFilter === "INACTIVOS") res = res.filter((u) => !u.active);
    if (sortKey) {
      res.sort((a, b) => {
        const av: any = a[sortKey];
        const bv: any = b[sortKey];
        if (av === bv) return 0;
        if (sortDir === "asc") return av > bv ? 1 : -1;
        return av > bv ? -1 : 1;
      });
    }
    return res;
  }, [users, search, roleFilter, activeFilter, sortKey, sortDir]);

  return (
    <div className="min-h-[80vh] bg-neutral-50 py-8">
      <div className="mx-auto max-w-6xl rounded-2xl border bg-white p-6 shadow-sm">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gestión de usuarios</h1>
            <p className="text-sm text-neutral-500">Administra los usuarios de la plataforma.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
               <Button onClick={openCreate} className="rounded-xl" variant="primary">+ Nuevo usuario</Button>
          </div>
        </header>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input placeholder="Buscar por nombre o email…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:col-span-2 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200">
            <option value="TODOS">Rol: Todos</option>
            <option value="ALUMNO">Alumno</option>
            <option value="FEMME">Femme</option>
            <option value="PROFESOR">Profesor</option>
            <option value="DIRECTOR">Director</option>
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as any)} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200">
            <option value="TODOS">Todos</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>
        </div>

        {loading && <div className="py-16 text-center text-neutral-500">Cargando…</div>}
        {error && <div className="py-16 text-center text-red-600">No se pudo cargar. Intenta de nuevo.</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-neutral-600">
                  {([
                    ["id", "#"],
                    ["name", "Nombre"],
                    ["email", "Email"],
                    ["role", "Rol"],
                    ["active", "Estado"],
                  ] as [keyof UserRow, string][]).map(([k, label]) => (
                    <th key={String(k)} className="cursor-pointer px-3 py-2" onClick={() => toggleSort(k)}>
                      <div className="flex items-center gap-1">
                        <span>{label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{u.id}</td>
                    <td className="px-3 py-2 font-medium">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">
                      <span className={classNames("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", u.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openEdit(u)} className="underline-offset-2 hover:underline text-pink-600">Ver / Editar</button>
                        {u.role === "PROFESOR" && (
                          <button onClick={() => toggleActiveLocal(u.id)} className="rounded-lg border px-2.5 py-1 text-xs">
                            {u.active ? "Desactivar cuenta" : "Activar cuenta"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-neutral-500">Sin resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{edit.__isNew ? "Nuevo usuario" : "Editar usuario"}</h2>
              {!edit.__isNew && <p className="text-xs text-neutral-500">ID: {edit.id} · {edit.email}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={classNames("mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4", !edit.name ? "border-red-400 focus:ring-red-100" : "border-neutral-300 focus:ring-neutral-200")} placeholder="Nombre completo" />
                {!edit.name && <p className="mt-1 text-xs text-red-600">Requerido</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} className={classNames("mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4", !edit.email.includes("@") ? "border-red-400 focus:ring-red-100" : "border-neutral-300 focus:ring-neutral-200")} placeholder="correo@dominio.com" />
                {!edit.email.includes("@") && <p className="mt-1 text-xs text-red-600">Email no válido</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Celular</label>
                <input value={edit.celular || ''} onChange={(e) => setEdit({ ...edit, celular: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="123456789" />
              </div>

              <div>
                <label className="text-sm font-medium">Rol</label>
                <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-4">
                  <option value="ALUMNO">Alumno</option>
                  <option value="FEMME">Femme</option>
                  <option value="PROFESOR">Profesor</option>
                  <option value="DIRECTOR">Director</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} />
                Activo
              </label>
            </div>
            {/** 
            ml-auto flex items-center gap-2*/}

            <div className=" justify-end mt-6 flex  flex-wrap gap-2 ">
              <Button onClick={() => saveChanges()} className="rounded-xl" variant="primary">{edit.__isNew ? "Crear usuario" : "Guardar cambios"}</Button>

                <Button onClick={closeModal} className="rounded-2xl border border-neutral-300 bg-femme-coral px-4 py-2 text-sm font-medium hover:bg-neutral-50">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

 