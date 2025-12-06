/*import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from './providers/AuthProvider'
import App from './App'
import '@styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
)*/
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from 'sonner'
import { router } from './routes'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
)

