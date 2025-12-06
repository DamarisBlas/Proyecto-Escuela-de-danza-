import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, type, title, message }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTitleColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-900'
      case 'error':
        return 'text-red-900'
      case 'warning':
        return 'text-yellow-900'
      case 'info':
        return 'text-blue-900'
    }
  }

  const getMessageColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      case 'info':
        return 'text-blue-700'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getStyles(toast.type)} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${getTitleColor(toast.type)}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`text-sm mt-1 ${getMessageColor(toast.type)}`}>
                  {toast.message}
                </p>
              )}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function Toast() { return null }
