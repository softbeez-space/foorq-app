import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return <>{children}</>;
}
