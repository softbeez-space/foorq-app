import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBranch, createTable, updateTable, deleteTable } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useBranchTables() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['branch-tables', branchId],
    queryFn: () => fetchBranch(branchId!),
    enabled: !!branchId,
  });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { branchId: string; data: { number: string; capacity: number; status?: string } }) =>
      createTable(params.branchId, params.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-tables'] }),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { branchId: string; tableId: string; data: { number?: string; capacity?: number; status?: string } }) =>
      updateTable(params.branchId, params.tableId, params.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-tables'] }),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { branchId: string; tableId: string }) =>
      deleteTable(params.branchId, params.tableId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-tables'] }),
  });
}
