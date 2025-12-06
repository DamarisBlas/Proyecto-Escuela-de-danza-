import {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type Theme = 'light' | 'dark' | 'system'
type ThemeContextValue = {
  /** preferencia del usuario (light/dark/system) */
  theme: Theme
  /** tema aplicado tras resolver 'system' */
  resolvedTheme: 'light' | 'dark'
  /** setear explícitamente */
  setTheme: (t: Theme) => void
  /** toggle rápido (light → dark → system) */
  toggle: () => void
}

const STORAGE_KEY = 'theme'
const ThemeCtx = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
  })

  const systemPrefersDark = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
    return theme
  }, [theme])

  // Aplica/remueve la clase 'dark' y persiste preferencia
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, resolvedTheme])

  // Si está en 'system', reacciona a cambios del SO
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme === 'system') {
        const isDark = mql.matches
        document.documentElement.classList.toggle('dark', isDark)
      }
    }
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggle: () =>
        setTheme((prev) =>
          prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
        ),
    }),
    [theme, resolvedTheme]
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
