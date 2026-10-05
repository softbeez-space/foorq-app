import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBranchReviews, setReviewHidden, saveGoogleReviewUrl } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useBranchReviews() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['branch-reviews', branchId],
    queryFn: () => fetchBranchReviews(branchId!),
    enabled: !!branchId,
  });
}

export function useToggleReviewHidden() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => setReviewHidden(id, hidden),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-reviews', branchId] }),
  });
}

export function useSaveGoogleReviewUrl() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useMutation({
    mutationFn: (url: string) => saveGoogleReviewUrl(branchId!, url),
  });
}
