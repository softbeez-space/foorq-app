import { api } from '@/shared/api/client';
import type { DashboardStats } from '@/entities/dashboard';

export async function fetchDashboardStats(branchId: string, range: string): Promise<DashboardStats> {
  const res = await api.get(`/dashboard/stats`, { params: { branchId, range } });
  return res.data.data;
}
