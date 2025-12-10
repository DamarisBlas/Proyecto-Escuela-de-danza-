import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@components/ui/Button";
import Table, { TableColumn } from '@/components/ui/Table'
import { Switch } from '@components/ui/switch'
import { Pencil, Trash2 } from 'lucide-react'
import { env } from "@/config/env";
import { toast } from 'sonner';

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
  apellido_paterno?: string;
  apellido_materno?: string;
  password?: string;
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
            name: `${persona.nombre} ${persona.apellido_paterno || ''} ${persona.apellido_materno || ''}`.trim(),
            email: persona.email,
            role: determineRole(persona),
            active: persona.tipo_cuenta_info?.estado ?? persona.estado ?? false,
            celular: persona.celular,
            solicitud_user_especial: persona.solicitud_user_especial,
            tipo_cuenta: persona.tipo_cuenta,
            apellido_paterno: persona.apellido_paterno,
            apellido_materno: persona.apellido_materno
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
    setEdit({ 
      id: `t-${Date.now()}`, 
      name: "", 
      email: "", 
      role: "ALUMNO", 
      active: true, 
      apellido_paterno: "",
      apellido_materno: "",
      password: "",
      __isNew: true 
    });
    setOpen(true);
  }

  function openEdit(u: UserRow) {
    // Extraer apellido paterno y materno del nombre completo si no están separados
    const nameParts = u.name.split(' ');
    const nombre = nameParts[0] || '';
    const apellido_paterno = nameParts[1] || '';
    const apellido_materno = nameParts.slice(2).join(' ') || '';
    
    setEdit({ 
      ...u, 
      name: nombre,
      apellido_paterno: u.apellido_paterno || apellido_paterno,
      apellido_materno: u.apellido_materno || apellido_materno
    });
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
      if (edit.__isNew) {
        // Crear nuevo usuario
        // Map role to tipo_cuenta
        let tipo_cuenta: string = 'alumno'; // default
        if (edit.role === 'PROFESOR') tipo_cuenta = 'profesor';
        else if (edit.role === 'DIRECTOR') tipo_cuenta = 'director';
        else if (edit.role === 'ALUMNO') tipo_cuenta = 'alumno';
        else if (edit.role === 'FEMME') tipo_cuenta = 'femme';

        const payload = {
          nombre: edit.name,
          apellido_paterno: edit.apellido_paterno || '',
          apellido_materno: edit.apellido_materno || '',
          email: edit.email,
          password: edit.password || '',
          celular: edit.celular || '',
          tipo_cuenta
        };

        const response = await fetch(`${env.API_URL}/users/crearusuariosdesdeadmin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Show success toast
        toast.success(`Usuario ${edit.role.toLowerCase()} creado exitosamente`);

        // Add to local state (assuming the response includes user data)
        if (data.user_id) {
          const newUser: UserRow = {
            id: String(data.user_id),
            name: `${edit.name} ${edit.apellido_paterno || ''} ${edit.apellido_materno || ''}`.trim(),
            email: edit.email,
            role: edit.role,
            active: data.estado_rol ?? true,
            celular: edit.celular,
            tipo_cuenta: data.tipo_cuenta,
            apellido_paterno: edit.apellido_paterno,
            apellido_materno: edit.apellido_materno
          };

          setUsers((s) => [...s, newUser]);
        }
      } else {
        // Editar usuario existente
        const payload = {
          nombre: edit.name,
          apellido_paterno: edit.apellido_paterno || '',
          apellido_materno: edit.apellido_materno || '',
          email: edit.email,
          celular: edit.celular || ''
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

        // Show success toast
        toast.success(data.message || 'Usuario actualizado exitosamente');

        // Update local state with response data
        if (data.persona) {
          const updatedUser: UserRow = {
            id: String(data.persona.id_persona),
            name: `${data.persona.nombre} ${data.persona.apellido_paterno || ''} ${data.persona.apellido_materno || ''}`.trim(),
            email: data.persona.email,
            role: determineRole(data.persona),
            active: data.persona.tipo_cuenta_info?.estado ?? data.persona.estado ?? false,
            celular: data.persona.celular,
            solicitud_user_especial: data.persona.solicitud_user_especial,
            tipo_cuenta: data.persona.tipo_cuenta,
            apellido_paterno: data.persona.apellido_paterno,
            apellido_materno: data.persona.apellido_materno
          };

          setUsers((s) => s.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        }
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
    if (!user) {
      console.error('Usuario no encontrado:', id);
      return;
    }

    const habilitar = !user.active;
    console.log('Toggle status para usuario:', user.name, 'ID:', id, 'Nuevo estado:', habilitar);

    try {
      const response = await fetch(`${env.API_URL}/users/personas/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitar })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta del servidor:', response.status, errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // The endpoint returns the new estado in `estado` or `tipo_cuenta_info.estado`
      const nuevoEstado = data.tipo_cuenta_info?.estado ?? data.estado ?? habilitar;
      console.log('Nuevo estado calculado:', nuevoEstado);

      setUsers((s) => s.map((u) => (u.id === id ? { ...u, active: nuevoEstado } : u)));
      console.log('Estado local actualizado para usuario:', id);
    } catch (err) {
      console.error('Error al activar/desactivar usuario (toggle-status):', err);
      alert('Error al cambiar el estado del usuario. Intenta de nuevo.');
    }
  }

  // Delete user handler (UI + API). Removes locally on success.
  async function handleDeleteUser(u: UserRow) {
    if (!confirm(`Eliminar usuario ${u.name}? Esta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`${env.API_URL}/users/personas/${u.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // remove locally
      setUsers((s) => s.filter(x => x.id !== u.id));
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al eliminar el usuario. Intenta de nuevo.');
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
      res = res.filter((u) => (u.name?.toLowerCase().includes(q) || false) || (u.email?.toLowerCase().includes(q) || false));
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

  // Table columns for the reusable Table component
  const columns: TableColumn<UserRow>[] = [
    { key: 'index', label: '#', width: '80px', render: (_u, idx) => (<span className="text-sm text-slate-500">{idx + 1}</span>) },
    {
      key: 'name',
      label: 'Usuario',
      render: (u) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{u.name}</span>
          <span className="text-xs text-slate-500">{u.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      render: (u) => (
        <span className="text-sm text-slate-700">
          {u.role === 'ALUMNO' && 'Alumno'}
          {u.role === 'FEMME' && 'Femme'}
          {u.role === 'PROFESOR' && 'Profesor'}
          {u.role === 'DIRECTOR' && 'Director'}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Acceso',
      render: (u) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); toggleActiveLocal(u.id); }}
          role="button"
          aria-label={u.active ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
        >
          <div className="pointer-events-none">
            <Switch checked={u.active} onCheckedChange={() => { /* handled by container click */ }} />
          </div>
          <span className="text-xs text-slate-600">{u.active ? 'Habilitada' : 'Deshabilitada'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '140px',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDeleteUser(u)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

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
          <div>
            <Table
              data={visibles}
              columns={columns}
              loading={loading}
              // wire sorting to existing state/handler
              sorting={{ key: sortKey, direction: sortDir, onSort: (k) => toggleSort(k as keyof UserRow) }}
              emptyState={{ title: 'Sin resultados.', description: 'No se encontraron usuarios con los filtros seleccionados.' }}
              onRowClick={(u) => openEdit(u)}
              rowClassName={(u) => u.active ? '' : 'opacity-60'}
            />
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

            <div className={`grid gap-4 ${edit.__isNew ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={classNames("mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4", !edit.name ? "border-red-400 focus:ring-red-100" : "border-neutral-300 focus:ring-neutral-200")} placeholder="Nombre" />
                {!edit.name && <p className="mt-1 text-xs text-red-600">Requerido</p>}
              </div>

              {edit.__isNew && (
                <>
                  <div>
                    <label className="text-sm font-medium">Apellido Paterno</label>
                    <input value={edit.apellido_paterno || ''} onChange={(e) => setEdit({ ...edit, apellido_paterno: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="Apellido paterno" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Apellido Materno</label>
                    <input value={edit.apellido_materno || ''} onChange={(e) => setEdit({ ...edit, apellido_materno: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="Apellido materno" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Contraseña</label>
                    <input type="password" value={edit.password || ''} onChange={(e) => setEdit({ ...edit, password: e.target.value })} className={classNames("mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4", !edit.password ? "border-red-400 focus:ring-red-100" : "border-neutral-300 focus:ring-neutral-200")} placeholder="Contraseña" />
                    {!edit.password && <p className="mt-1 text-xs text-red-600">Requerido</p>}
                  </div>
                </>
              )}

              {!edit.__isNew && (
                <>
                  <div>
                    <label className="text-sm font-medium">Apellido Paterno</label>
                    <input value={edit.apellido_paterno || ''} onChange={(e) => setEdit({ ...edit, apellido_paterno: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="Apellido paterno" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Apellido Materno</label>
                    <input value={edit.apellido_materno || ''} onChange={(e) => setEdit({ ...edit, apellido_materno: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="Apellido materno" />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} className={classNames("mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-4", !edit.email.includes("@") ? "border-red-400 focus:ring-red-100" : "border-neutral-300 focus:ring-neutral-200")} placeholder="correo@dominio.com" />
                {!edit.email.includes("@") && <p className="mt-1 text-xs text-red-600">Email no válido</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Celular</label>
                <input value={edit.celular || ''} onChange={(e) => setEdit({ ...edit, celular: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200" placeholder="123456789" />
              </div>

              {edit.__isNew && (
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })} className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-4">
                    <option value="ALUMNO">Alumno</option>
                    <option value="FEMME">Femme</option>
                    <option value="PROFESOR">Profesor</option>
                    <option value="DIRECTOR">Director</option>
                  </select>
                </div>
              )}

              {!edit.__isNew && (
                <div className="text-sm text-neutral-600">
                  <strong>Rol:</strong> {edit.role === 'ALUMNO' && 'Alumno'}{edit.role === 'FEMME' && 'Femme'}{edit.role === 'PROFESOR' && 'Profesor'}{edit.role === 'DIRECTOR' && 'Director'}
                </div>
              )}
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
