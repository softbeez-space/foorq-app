import { api } from '@/shared/api/client';
import type { Staff } from '@/entities/staff';

export async function fetchStaff(branchId?: string): Promise<Staff[]> {
  const params = branchId ? { branchId } : {};
  const res = await api.get('/staff', { params });
  return res.data.data;
}

export async function createStaff(data: {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'staff';
  branchId?: string;
  phone?: string;
  avatar?: string;
}): Promise<Staff> {
  const res = await api.post('/staff', data);
  return res.data.data;
}

export async function updateStaff(id: string, data: Partial<Parameters<typeof createStaff>[0]>): Promise<Staff> {
  const res = await api.patch(`/staff/${id}`, data);
  return res.data.data;
}

export async function deleteStaff(id: string): Promise<void> {
  await api.delete(`/staff/${id}`);
}
