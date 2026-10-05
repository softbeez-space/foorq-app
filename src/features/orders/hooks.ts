import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, fetchOrder, updateOrderStatus, createOrder, fetchMenuItems, searchCustomers, markOrderAsPaid, refundOrder, fetchHeldOrders, confirmHeldOrder, acceptOrder, rejectOrder, verifyPickupCode } from './api';
import { useBranchStore } from '@/features/branches/store';
import { useOrderSocket } from './useOrderSocket';

const PAGE_SIZE = 20;

export function useOrders(status?: string) {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  useOrderSocket();

  return useInfiniteQuery({
    queryKey: ['orders', branchId, status],
    queryFn: ({ pageParam = 1 }) =>
      fetchOrders({ branchId: branchId!, status, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!branchId,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useMarkOrderAsPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tendered }: { id: string; tendered?: number }) => markOrderAsPaid(id, tendered),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useRefundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => refundOrder(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useHeldOrders() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['held-orders', branchId],
    queryFn: () => fetchHeldOrders(branchId!),
    enabled: !!branchId,
    refetchInterval: 15000,
  });
}

export function useConfirmHeldOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => confirmHeldOrder(id),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['held-orders'] });
      // The detail screen reads ['order', id] — without this it keeps
      // showing "waiting for confirmation" after tapping Confirm.
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useAcceptOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, etaMinutes }: { id: string; etaMinutes?: number }) => acceptOrder(id, etaMinutes),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['held-orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useRejectOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, customerMessage }: { id: string; reason: string; customerMessage?: string }) =>
      rejectOrder(id, reason, customerMessage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['held-orders'] });
    },
  });
}

export function useVerifyPickupCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) => verifyPickupCode(id, code),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['held-orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useMenuItems() {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['menu-items', branchId],
    queryFn: () => fetchMenuItems(branchId!),
    enabled: !!branchId,
  });
}

export function useCustomerSearch(q: string) {
  return useQuery({
    queryKey: ['customer-search', q],
    queryFn: () => searchCustomers(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
  });
}
