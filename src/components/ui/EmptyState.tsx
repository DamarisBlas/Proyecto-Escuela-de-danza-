export function EmptyState({ title = 'Sin datos', subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="text-center text-sm text-zinc-500 border rounded-md p-8">
      <div className="font-medium mb-1">{title}</div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  )
}
