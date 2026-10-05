import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { ENV, STORAGE_KEYS } from '@/shared/config/env';
import { secureStorage } from '@/shared/storage/secure';
import { useAuthStore } from '@/features/auth/store';
import { useBranchStore } from '@/features/branches/store';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.user);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const value = useMemo<SocketContextValue>(() => ({ socket: null, connected: false }), []);

  useEffect(() => {
    if (!isAuthenticated || !selectedBranchId) return;
    let socket: Socket | null = null;
    (async () => {
      const token = await secureStorage.getItem(STORAGE_KEYS.accessToken);
      const baseUrl = ENV.apiUrl.replace(/\/api$/, '');
      try {
        socket = io(baseUrl, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
        });
        socket.emit('join-kitchen', selectedBranchId);
      } catch {
        // ignore — kitchen realtime is best-effort
      }
    })();
    return () => {
      socket?.disconnect();
    };
  }, [isAuthenticated, selectedBranchId]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
