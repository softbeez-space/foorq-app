import { api } from '@/shared/api/client';

export interface CloseOutPreview {
  date: string;
  expectedCash: number;
  paidOrders: number;
  refundedCash: number;
  refundedOrders: number;
  discountsGiven: number;
  voidedOrders: number;
  alreadyClosed: boolean;
}

export async function fetchCloseOut(branchId: string, date?: string): Promise<CloseOutPreview> {
  const res = await api.get('/cashier/close-out', { params: { branchId, date } });
  return res.data.data;
}

export async function recordCloseOut(data: {
  branchId: string;
  date?: string;
  countedCash: number;
  note?: string;
}) {
  const res = await api.post('/cashier/close-out', data);
  return res.data.data;
}
