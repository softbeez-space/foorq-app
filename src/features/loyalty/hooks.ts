import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProgram,
  updateProgram,
  fetchRewards,
  createReward,
  updateReward,
  deleteReward,
  fetchStats,
  type LoyaltyReward,
} from './api';

export function useLoyaltyProgram() {
  return useQuery({ queryKey: ['loyalty-program'], queryFn: fetchProgram });
}

export function useUpdateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-program'] }),
  });
}

export function useLoyaltyRewards() {
  return useQuery({ queryKey: ['loyalty-rewards'], queryFn: fetchRewards });
}

export function useCreateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReward,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-rewards'] }),
  });
}

export function useUpdateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoyaltyReward> }) =>
      updateReward(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-rewards'] }),
  });
}

export function useDeleteReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReward,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-rewards'] }),
  });
}

export function useLoyaltyStats() {
  return useQuery({ queryKey: ['loyalty-stats'], queryFn: fetchStats });
}
