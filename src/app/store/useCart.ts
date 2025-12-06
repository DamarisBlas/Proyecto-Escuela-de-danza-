/*import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@types'

type CartState = {
  items: CartItem[]
}

type CartActions = {
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCart = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set({ items: get().items.map(i => i.id === item.id ? { ...i, qty: i.qty + item.qty } : i) })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      remove: (id) => set({ items: get().items.filter(i => i.id != id) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' }
  )
)

export const cartSelectors = {
  total: () => useCart.getState().items.reduce((acc, i) => acc + i.price * i.qty, 0),
}
*/
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = { 
  id: string
  title: string
  price: number
  qty: number
  image?: string
  details?: string // Para guardar detalles adicionales como las fechas de clases (deprecated, usar detailsAutomaticas y detailsManuales)
  detailsAutomaticas?: string // Clases seleccionadas automáticamente desde WeeklySchedule
  detailsManuales?: string // Clases agregadas manualmente por el usuario
  paqueteId?: number // ID del paquete seleccionado
  clasesSeleccionadas?: number[] // IDs de las sesiones seleccionadas (números)
  fechaPrimeraClase?: string // Fecha de la primera clase seleccionada
  ciclo?: string // Ciclo del paquete
  promocionId?: number // ID de la promoción aplicada
  descuentoAplicado?: number // Monto del descuento aplicado
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
  count: () => number
  total: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const current = items.find((i) => i.id === item.id)
        if (current) {
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)),
          })
        } else {
          set({ items: [...items, item] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((acc, i) => acc + i.qty, 0),
      total: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
    }),
    { name: 'cart' }
  )
)
