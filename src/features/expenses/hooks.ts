import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpenses, fetchExpenseSummary, createExpense, updateExpense, deleteExpense } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useExpenses(params?: { category?: string; startDate?: string; endDate?: string }) {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['expenses', branchId, params],
    queryFn: () => fetchExpenses({ ...params, branchId: branchId! }),
    enabled: !!branchId,
  });
}

export function useExpenseSummary(range?: 'today' | '7d' | '30d' | '90d') {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['expense-summary', branchId, range],
    queryFn: () => fetchExpenseSummary({ branchId: branchId!, range }),
    enabled: !!branchId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateExpense>[1] }) => updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}
