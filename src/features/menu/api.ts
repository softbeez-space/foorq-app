import { api } from '@/shared/api/client';
import type { MenuItem } from '@/entities/menuItem';

export async function fetchMenuItems(branchId: string): Promise<MenuItem[]> {
  const res = await api.get('/menu/items', { params: { branchId } });
  return res.data.data;
}

export async function fetchMenuItem(id: string): Promise<MenuItem> {
  const res = await api.get(`/menu/items/${id}`);
  return res.data.data;
}

export async function toggleItemAvailability(id: string): Promise<MenuItem> {
  const res = await api.patch(`/menu/items/${id}/availability`);
  return res.data.data;
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  const res = await api.put(`/menu/items/${id}`, data);
  return res.data.data;
}

export async function createMenuItem(data: {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  tags?: string[];
  branchId?: string;
  stockQty?: number | null;
  lowThreshold?: number;
  relatedItems?: string[];
}): Promise<MenuItem> {
  const res = await api.post('/menu/items', data);
  return res.data.data;
}

export async function fetchCategories(branchId: string) {
  const res = await api.get('/menu/categories', { params: { branchId } });
  return res.data.data;
}

export interface LowStockItem {
  _id: string;
  name: string;
  stockQty: number;
  lowThreshold: number;
  outOfStock: boolean;
}

export async function fetchLowStock(branchId: string): Promise<LowStockItem[]> {
  const res = await api.get('/menu/low-stock', { params: { branchId } });
  return res.data.data;
}
