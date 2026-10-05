import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOffers, fetchOffer, createOffer, updateOffer, deleteOffer } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useOffers(activeOnly?: boolean) {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['offers', branchId, activeOnly],
    queryFn: () => fetchOffers(activeOnly),
    enabled: !!branchId,
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => fetchOffer(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateOffer>[1] }) => updateOffer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useToggleOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateOffer(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}
