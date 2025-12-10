import { z } from 'zod'

interface ImportMetaEnv {
  VITE_API_URL: string
  VITE_APP_NAME?: string
  VITE_ENABLE_REACT_QUERY_DEVTOOLS?: string
  VITE_STRIPE_PUBLIC_KEY: string
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
  VITE_STRIPE_PUBLIC_KEY: z.string().min(1),
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
  STRIPE_PUBLIC_KEY: parsed.data.VITE_STRIPE_PUBLIC_KEY,
} as const
