import React from 'react'
import { DAY_OPTS } from '../utils/helpers'

interface DaysCheckboxesProps {
  value: string[]
  onChange: (v: string[]) => void
}

// DaysCheckboxes: accessible checkbox group for selecting days
export function DaysCheckboxes({ value, onChange }: DaysCheckboxesProps) {
  const toggle = (k: string, checked: boolean) => {
    if (checked) onChange([...value, k]); else onChange(value.filter(x => x !== k));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAY_OPTS.map(d => {
        const checked = value.includes(d.key)
        return (
          <label
            key={d.key}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 cursor-pointer select-none ${checked ? 'bg-pink-600 text-white border-pink-600' : 'bg-white'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => toggle(d.key, e.target.checked)}
              className="w-4 h-4 rounded-sm accent-femme-magenta"
            />
            <span className="text-sm" title={d.label}>{d.short}</span>
          </label>
        )
      })}
    </div>
  )
}