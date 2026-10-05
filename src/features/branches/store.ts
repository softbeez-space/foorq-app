import { create } from 'zustand';
import { api } from '@/shared/api/client';
import { secureStorage } from '@/shared/storage/secure';
import { STORAGE_KEYS } from '@/shared/config/env';
import type { Branch } from '@/entities/branch';

interface BranchState {
  branches: Branch[];
  selectedBranchId: string | null;
  loading: boolean;
  loaded: boolean;
  loadBranches: (restaurantId?: string) => Promise<void>;
  setBranch: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  reset: () => void;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  selectedBranchId: null,
  loading: false,
  loaded: false,

  async loadBranches() {
    set({ loading: true });
    try {
      const res = await api.get('/restaurant/branches');
      const list: Branch[] = res.data.data ?? res.data ?? [];
      // Staff locked to assigned branch (mirrors web BranchContext).
      // Import lazily to avoid a store cycle.
      let assignedBranchId: string | null = null;
      try {
        const { useAuthStore } = await import('@/features/auth/store');
        assignedBranchId = useAuthStore.getState().user?.branchId ?? null;
      } catch {
        assignedBranchId = null;
      }
      let selected = get().selectedBranchId;
      const assignedInList = assignedBranchId
        ? list.find((b) => b._id === assignedBranchId)
        : undefined;
      if (assignedInList) {
        selected = assignedInList._id;
      } else if (!selected && list.length > 0) {
        selected = list[0]._id;
      } else if (selected && !list.some((b) => b._id === selected)) {
        selected = list.length > 0 ? list[0]._id : null;
        if (assignedBranchId) selected = assignedBranchId;
      }
      set({ branches: list, selectedBranchId: selected, loading: false, loaded: true });
      if (selected) await secureStorage.setItem(STORAGE_KEYS.selectedBranchId, selected);
    } catch {
      set({ loading: false, loaded: true });
    }
  },

  async setBranch(id) {
    // Guard: branch-locked staff cannot switch away from their assignment.
    try {
      const { useAuthStore } = await import('@/features/auth/store');
      const assigned = useAuthStore.getState().user?.branchId;
      if (assigned && id !== assigned) return;
    } catch {
      // ignore guard failure, allow switch
    }
    set({ selectedBranchId: id });
    await secureStorage.setItem(STORAGE_KEYS.selectedBranchId, id);
  },

  async hydrate() {
    const stored = await secureStorage.getItem(STORAGE_KEYS.selectedBranchId);
    if (stored) set({ selectedBranchId: stored });
  },

  reset() {
    set({ branches: [], selectedBranchId: null, loaded: false });
  },
}));

export function useSelectedBranch(): Branch | null {
  const { branches, selectedBranchId } = useBranchStore();
  return branches.find((b) => b._id === selectedBranchId) ?? null;
}
