import { z } from 'zod'

interface ImportMetaEnv {
  VITE_API_URL: string
  VITE_APP_NAME?: string
  VITE_ENABLE_REACT_QUERY_DEVTOOLS?: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const envSchema = z.object({
  VITE_API_URL: z.string().min(1),
  VITE_APP_NAME: z.string().default('App'),
  VITE_ENABLE_REACT_QUERY_DEVTOOLS: z.string().optional(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors)
  throw new Error('Env validation failed')
}

export const env = {
  API_URL: parsed.data.VITE_API_URL,
  APP_NAME: parsed.data.VITE_APP_NAME,
  ENABLE_RQ_DEVTOOLS: parsed.data.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
} as const
