import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { openSession, joinSession, fetchTab, settleSession } from './api';

export function useOpenSession() {
  return useMutation({
    mutationFn: openSession,
    onError: (err: any) => {
      Alert.alert('Table unavailable', err?.response?.data?.message ?? 'Could not claim the table.');
    },
  });
}

export function useJoinSession() {
  return useMutation({
    mutationFn: joinSession,
    onError: (err: any) => {
      Alert.alert('Join failed', err?.response?.data?.message ?? 'Invalid table code.');
    },
  });
}

export function useSessionTab(sessionId: string | null, restaurantId: string | null) {
  return useQuery({
    queryKey: ['session-tab', sessionId],
    queryFn: () => fetchTab(sessionId!, restaurantId!),
    enabled: !!sessionId && !!restaurantId,
    refetchInterval: 10000,
  });
}

export function useSettleSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, tendered, note }: { sessionId: string; tendered?: number; note?: string }) =>
      settleSession(sessionId, tendered, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['session-tab'] });
    },
    onError: (err: any) => {
      Alert.alert('Settle failed', err?.response?.data?.message ?? 'Please try again.');
    },
  });
}
