import type { SelectHTMLAttributes } from 'react'
import { cn } from '@lib/utils'
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-sm')} {...props} />
}
