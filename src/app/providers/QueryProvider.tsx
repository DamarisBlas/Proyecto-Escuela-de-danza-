
/*import { PropsWithChildren, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createQueryClient } from '@lib/query'
import { env } from '@config/env'

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => createQueryClient())
  return (
    <QueryClientProvider client={client}>
      {children}
      {env.ENABLE_RQ_DEVTOOLS ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}*/
import { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

