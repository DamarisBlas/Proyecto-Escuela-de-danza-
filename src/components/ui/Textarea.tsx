import type { TextareaHTMLAttributes } from 'react'
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-sm" {...props} />
}
