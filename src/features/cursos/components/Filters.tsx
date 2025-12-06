import { Select } from '@components/ui/Select'
import type { CourseType } from '../types'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

type Props = {
  branch: string
  type: 'Todos' | 'REGULAR' | 'TALLER'
  teachers: string[]
  branchOptions: string[]
  teacherOptions: string[]
  onBranchChange: (b: string) => void
  onTypeChange: (t: 'Todos' | 'REGULAR' | 'TALLER') => void
  onTeachersChange: (teachers: string[]) => void
}

// ---------- Multi-select para profesores ----------
interface MultiSelectProps {
  options: string[]
  selected: string[]
  setSelected: (values: string[]) => void
  placeholder?: string
}

function MultiSelect({ options, selected, setSelected, placeholder = 'Selecciona' }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handle)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', handle)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const hasAll = selected.includes('Todos')
  const label = hasAll
    ? 'Todos'
    : selected.length === 0
    ? placeholder
    : selected.length === 1
    ? selected[0]
    : `${selected.length} seleccionados`

  const toggle = (opt: string) => {
    if (opt === 'Todos') {
      setSelected(['Todos'])
      return
    }
    const base = hasAll ? [] : [...selected]
    const idx = base.indexOf(opt)
    if (idx >= 0) base.splice(idx, 1)
    else base.push(opt)
    if (base.length === 0) setSelected(['Todos'])
    else setSelected(base)
  }

  const checked = (opt: string) => (opt === 'Todos' ? hasAll : selected.includes(opt))

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-magenta"
      >
        <span className="truncate text-slate-700">{label}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            {options.map((opt) => (
              <li key={opt}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-femme-magenta"
                    checked={checked(opt)}
                    onChange={() => toggle(opt)}
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
            <button onClick={() => setSelected(['Todos'])} className="text-xs font-medium text-slate-600 hover:text-slate-800">
              Seleccionar todos
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-femme-magenta px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-femme-rose"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Field wrapper ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 text-sm text-slate-600">{label}</label>
      {children}
    </div>
  )
}

// ---------- Chip ----------
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 shadow-sm">
      {children}
    </span>
  )
}

export default function Filters({
  branch,
  type,
  teachers,
  branchOptions,
  teacherOptions,
  onBranchChange,
  onTypeChange,
  onTeachersChange,
}: Props) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Sucursal">
          <select
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-femme-magenta focus:ring-femme-magenta"
          >
            {branchOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as any)}
            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-femme-magenta focus:ring-femme-magenta"
          >
            <option>Todos</option>
            <option>REGULAR</option>
            <option>TALLER</option>
          </select>
        </Field>
        <Field label="Profesor">
          <MultiSelect options={teacherOptions} selected={teachers} setSelected={onTeachersChange} placeholder="Todos" />
        </Field>
      </div>
      {/* Chips de filtros activos */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Filtros:</span>
        <Chip>{branch}</Chip>
        <Chip>{type}</Chip>
        {teachers.filter((t) => t !== 'Todos').map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
        <button
          onClick={() => {
            onBranchChange('Todas')
            onTypeChange('Todos')
            onTeachersChange(['Todos'])
          }}
          className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-femme-magenta hover:underline"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
