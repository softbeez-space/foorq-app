import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStaff, createStaff, updateStaff, deleteStaff } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useStaff() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['staff', branchId],
    queryFn: () => fetchStaff(branchId ?? undefined),
    enabled: true,
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff-by-id', id],
    queryFn: async () => {
      const all = await fetchStaff();
      return all.find((s) => s._id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateStaff>[1] }) => updateStaff(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}
