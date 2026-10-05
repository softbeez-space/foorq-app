import { api } from '@/shared/api/client';
import type { Offer } from '@/entities/offer';

export async function fetchOffers(activeOnly?: boolean): Promise<Offer[]> {
  const params = activeOnly ? { active: 'true' } : {};
  const res = await api.get('/offers', { params });
  return res.data.data;
}

export async function fetchOffer(id: string): Promise<Offer> {
  const res = await api.get(`/offers/${id}`);
  return res.data.data;
}

export async function createOffer(data: {
  name: string;
  description?: string;
  type: 'discount' | 'bogo' | 'free_item';
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  applicableItems?: string[];
  applicableCategories?: string[];
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  promoCode?: string;
  usageLimit?: number;
}): Promise<Offer> {
  const res = await api.post('/offers', data);
  return res.data.data;
}

export async function updateOffer(id: string, data: Partial<Parameters<typeof createOffer>[0]>): Promise<Offer> {
  const res = await api.put(`/offers/${id}`, data);
  return res.data.data;
}

export async function deleteOffer(id: string): Promise<void> {
  await api.delete(`/offers/${id}`);
}

export async function validatePromoCode(code: string, restaurantId?: string) {
  const res = await api.post('/offers/validate-promo', { promoCode: code, restaurantId });
  return res.data.data;
}
