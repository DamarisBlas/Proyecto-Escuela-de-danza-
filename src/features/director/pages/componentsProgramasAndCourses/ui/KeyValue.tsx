import React from 'react'

interface KeyValueProps {
  k: string
  v: string
}

export function KeyValue({ k, v }: KeyValueProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  )
}