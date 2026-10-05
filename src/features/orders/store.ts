import { create } from 'zustand';
import type { Order } from '@/entities/order';

const SEGMENTS = ['All', 'Pending', 'Preparing', 'Ready', 'Served'];

interface OrdersState {
  liveOrders: Order[];
  setLiveOrders: (orders: Order[]) => void;
  upsertOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  selectedSegment: number;
  setSelectedSegment: (i: number) => void;
  segments: string[];
}

export const useOrdersStore = create<OrdersState>((set) => ({
  liveOrders: [],
  setLiveOrders: (orders) => set({ liveOrders: orders }),
  upsertOrder: (order) =>
    set((s) => {
      const idx = s.liveOrders.findIndex((o) => o._id === order._id);
      if (idx >= 0) {
        const copy = [...s.liveOrders];
        copy[idx] = order;
        return { liveOrders: copy };
      }
      return { liveOrders: [order, ...s.liveOrders] };
    }),
  removeOrder: (id) =>
    set((s) => ({ liveOrders: s.liveOrders.filter((o) => o._id !== id) })),
  selectedSegment: 0,
  setSelectedSegment: (i) => set({ selectedSegment: i }),
  segments: SEGMENTS,
}));
