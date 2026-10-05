import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenuItems, fetchMenuItem, toggleItemAvailability, updateMenuItem, createMenuItem, fetchCategories } from './api';
import { useBranchStore } from '@/features/branches/store';

export function useMenuItems() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['menu-items', branchId],
    queryFn: () => fetchMenuItems(branchId!),
    enabled: !!branchId,
  });
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: ['menu-item', id],
    queryFn: () => fetchMenuItem(id),
    enabled: !!id,
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleItemAvailability(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      qc.invalidateQueries({ queryKey: ['menu-item'] });
    },
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof updateMenuItem>[1]> }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      qc.invalidateQueries({ queryKey: ['menu-item'] });
    },
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
}

export function useMenuCategories() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['menu-categories', branchId],
    queryFn: () => fetchCategories(branchId!),
    enabled: !!branchId,
  });
}

