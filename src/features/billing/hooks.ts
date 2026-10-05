import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { fetchPlans, fetchMyPlan, fetchUsage, initPayment, upgradePlan, confirmPlan } from './api';

export function useMyPlan() {
  return useQuery({ queryKey: ['billing-my-plan'], queryFn: fetchMyPlan });
}

export function usePlans() {
  return useQuery({ queryKey: ['billing-plans'], queryFn: fetchPlans });
}

export function useUsage() {
  return useQuery({ queryKey: ['billing-usage'], queryFn: fetchUsage });
}

export function useInitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cycle }: { plan: string; cycle: string }) => initPayment(plan, cycle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing-my-plan'] });
    },
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cycle }: { plan: string; cycle: string }) => upgradePlan(plan, cycle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing-my-plan'] });
      qc.invalidateQueries({ queryKey: ['billing-usage'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  });
}

export function useConfirmPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing-my-plan'] });
    },
  });
}
