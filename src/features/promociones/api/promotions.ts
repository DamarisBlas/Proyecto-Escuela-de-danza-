import { api } from '@lib/api'
import type { Promotion } from '@/types'

export async function listPromotions(): Promise<Promotion[]> {
  const { data } = await api.get('/promotions')
  return data
}

export async function getPromotion(id: string): Promise<Promotion> {
  const { data } = await api.get(`/promotions/${id}`)
  return data
}
