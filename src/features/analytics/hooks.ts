import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBranchScores,
  fetchForecast,
  fetchHistory,
  fetchPulse,
  fetchWeeklyReport,
  generateAiReport,
  saveActionChecks,
} from './api';
import type { WeeklyReport } from '@/entities/analytics';

export function useWeeklyReport(branchId: string | null, week: string) {
  return useQuery({
    queryKey: ['analytics-weekly', branchId, week],
    queryFn: () => fetchWeeklyReport(branchId as string, week),
    enabled: !!branchId,
  });
}

export function usePulse(branchId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['analytics-pulse', branchId],
    queryFn: () => fetchPulse(branchId as string),
    enabled: !!branchId && enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useForecast(branchId: string | null) {
  return useQuery({
    queryKey: ['analytics-forecast', branchId],
    queryFn: () => fetchForecast(branchId as string),
    enabled: !!branchId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useHistory(branchId: string | null, weeks = 12) {
  return useQuery({
    queryKey: ['analytics-history', branchId, weeks],
    queryFn: () => fetchHistory(branchId as string, weeks),
    enabled: !!branchId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBranchScores(week: string, enabled: boolean) {
  return useQuery({
    queryKey: ['analytics-branches', week],
    queryFn: () => fetchBranchScores(week),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateAi(branchId: string | null, week: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateAiReport(branchId as string, week),
    onSuccess: (data) => {
      queryClient.setQueryData(['analytics-weekly', branchId, week], data);
    },
  });
}

export function useActionChecks(branchId: string | null, week: string) {
  const queryClient = useQueryClient();
  const key = ['analytics-weekly', branchId, week];
  return useMutation({
    mutationFn: (checks: { title: string; done: boolean }[]) =>
      saveActionChecks(branchId as string, week, checks),
    onMutate: async (checks) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<WeeklyReport>(key);
      if (prev?.actionChecklist) {
        const map = new Map(checks.map((c) => [c.title, c.done] as const));
        queryClient.setQueryData<WeeklyReport>(key, {
          ...prev,
          actionChecklist: prev.actionChecklist.map((c) =>
            map.has(c.title) ? { ...c, done: map.get(c.title)! } : c,
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
