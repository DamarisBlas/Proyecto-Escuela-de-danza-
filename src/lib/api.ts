import axios from 'axios'
import { env } from '@/config/env'

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación (opcional)
api.interceptors.request.use(
  (config) => {
    console.log(` API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirigir a login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    // Logging detallado de errores
    console.error(' API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    return Promise.reject(error)
  }
)
