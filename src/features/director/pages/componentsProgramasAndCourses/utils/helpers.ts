// ================= Helpers: días y validaciones de horas =================
export const DAY_OPTS = [
  { key: 'mon', short: 'L', label: 'Lunes' },
  { key: 'tue', short: 'M', label: 'Martes' },
  { key: 'wed', short: 'M', label: 'Miércoles' },
  { key: 'thu', short: 'J', label: 'Jueves' },
  { key: 'fri', short: 'V', label: 'Viernes' },
  { key: 'sat', short: 'S', label: 'Sábado' },
  { key: 'sun', short: 'D', label: 'Domingo' },
]

export function isAfter(a?: string, b?: string) {
  if (!a || !b) return true
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  if (ah !== bh) return ah > bh
  return am > bm
}