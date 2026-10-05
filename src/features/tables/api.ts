import { api } from '@/shared/api/client';
import type { Branch } from '@/entities/branch';

export async function fetchBranch(id: string): Promise<Branch> {
  const res = await api.get(`/restaurant/branches/${id}`);
  return res.data.data;
}

export async function createTable(
  branchId: string,
  data: { number: string; capacity: number; status?: string },
): Promise<Branch> {
  const res = await api.post(`/restaurant/branches/${branchId}/tables`, data);
  return res.data.data as Branch;
}

export async function updateTable(
  branchId: string,
  tableId: string,
  data: { number?: string; capacity?: number; status?: string },
): Promise<Branch> {
  const res = await api.put(`/restaurant/branches/${branchId}/tables/${tableId}`, data);
  return res.data.data as Branch;
}

export async function deleteTable(branchId: string, tableId: string): Promise<Branch> {
  const res = await api.delete(`/restaurant/branches/${branchId}/tables/${tableId}`);
  return res.data.data as Branch;
}
