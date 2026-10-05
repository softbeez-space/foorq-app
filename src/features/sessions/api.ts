import { api } from '@/shared/api/client';

export interface TableSession {
  _id: string;
  tableNumber: string;
  code: string;
  status: string;
  members: { name: string; joinedAt: string }[];
}

export async function openSession(data: {
  restaurantId: string;
  branchId: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
}): Promise<TableSession> {
  const res = await api.post('/sessions/open', data);
  return res.data.data;
}

export async function joinSession(data: {
  restaurantId: string;
  branchId: string;
  code?: string;
  sessionId?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
}): Promise<TableSession> {
  const res = await api.post('/sessions/join', data);
  return res.data.data;
}

export async function fetchTab(sessionId: string, restaurantId: string) {
  const res = await api.get(`/sessions/${sessionId}/tab`, { params: { restaurantId } });
  return res.data.data as {
    session: TableSession;
    orders: any[];
    split: { perPerson: { name: string; phone: string; total: number; orderIds: string[] }[]; grandTotal: number };
    unpaidTotal: number;
  };
}

export async function settleSession(sessionId: string, tendered?: number, note?: string) {
  const res = await api.post(`/sessions/${sessionId}/settle`, { tendered, note });
  return res.data.data;
}
