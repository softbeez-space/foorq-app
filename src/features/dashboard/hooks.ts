import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from './api';

export function useDashboardStats(branchId: string | null, range: string) {
  return useQuery({
    queryKey: ['dashboard-stats', branchId, range],
    queryFn: () => fetchDashboardStats(branchId as string, range),
    enabled: !!branchId,
  });
}
