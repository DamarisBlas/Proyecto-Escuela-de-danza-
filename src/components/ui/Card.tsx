import type { PropsWithChildren } from 'react'
import { cn } from '@lib/utils'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('border rounded-md p-4 bg-white dark:bg-zinc-950', className)}>{children}</div>
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('p-2', className)}>{children}</div>;
}
