/*import { DefaultOptions, QueryClient } from '@tanstack/react-query'

export const queryKeys = {
  me: ['me'] as const,
  courses: {
    root: ['courses'] as const,
    byId: (id: string | number) => ['courses', id] as const,
  },
  promotions: {
    root: ['promotions'] as const,
    byId: (id: string | number) => ['promotions', id] as const,
  },
} as const

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  },
}

export const createQueryClient = () => new QueryClient({ defaultOptions: defaultQueryOptions })
*/
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
