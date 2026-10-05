import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { useBranchStore } from '@/features/branches/store';

export function BranchProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.user);
  const restaurantId = useAuthStore((s) => s.user?.restaurantId);
  const hydrate = useBranchStore((s) => s.hydrate);
  const loadBranches = useBranchStore((s) => s.loadBranches);

  useEffect(() => {
    if (!isAuthenticated) return;
    hydrate();
  }, [isAuthenticated, hydrate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!restaurantId) return;
    if (useBranchStore.getState().loaded) return;
    loadBranches(restaurantId);
  }, [isAuthenticated, restaurantId, loadBranches]);

  return <>{children}</>;
}
