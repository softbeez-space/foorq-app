import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '@/shared/api/socket';
import { secureStorage } from '@/shared/storage/secure';
import { STORAGE_KEYS } from '@/shared/config/env';
import { useBranchStore } from '@/features/branches/store';
import type { Order } from '@/entities/order';

export function useOrderSocket() {
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.selectedBranchId);

  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    let s: ReturnType<typeof connectSocket> | null = null;

    const onNewOrder = (order: Order) => {
      qc.setQueryData<Order[]>(['orders', branchId, undefined], (old = []) => [order, ...old]);
      qc.setQueryData<Order[]>(['orders', branchId, 'pending'], (old = []) => [order, ...old]);
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
    };

    const onStatusUpdate = (order: Order) => {
      const updateLists = (old: Order[] = []) => {
        const idx = old.findIndex((o) => o._id === order._id);
        if (idx >= 0) {
          const copy = [...old];
          copy[idx] = order;
          return copy;
        }
        return [order, ...old];
      };

      qc.setQueryData(['orders', branchId, undefined], updateLists);
      qc.setQueryData(['orders', branchId, order.status], updateLists);
      qc.invalidateQueries({ queryKey: ['order', order._id] });
    };

    (async () => {
      const token = await secureStorage.getItem(STORAGE_KEYS.accessToken);
      if (cancelled) return;
      s = connectSocket(token || undefined);
      s.emit('join-branch', branchId, token || undefined);
      s.on('new-order', onNewOrder);
      s.on('order-status-updated', onStatusUpdate);
    })();

    return () => {
      cancelled = true;
      s?.off('new-order', onNewOrder);
      s?.off('order-status-updated', onStatusUpdate);
    };
  }, [branchId, qc]);
}
