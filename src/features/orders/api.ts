import { api } from '@/shared/api/client';
import type { Order } from '@/entities/order';
import type { MenuItem, Customer } from '@/entities/menuItem';

export async function fetchOrders(params: {
  branchId: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await api.get('/orders', { params: { ...params, page: params.page ?? 1, limit: params.limit ?? 20 } });
  return { orders: res.data.data, meta: res.data.meta };
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data.data;
}

export async function updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
  const res = await api.patch(`/orders/${id}/status`, note ? { status, note } : { status });
  return res.data.data;
}

export async function createOrder(payload: {
  restaurantId: string;
  branchId: string;
  clientOrderId?: string;
  origin?: 'table-qr' | 'unbound-pickup' | 'unbound-table' | 'staff';
  sessionId?: string;
  items: {
    menuItemId: string;
    quantity: number;
    variant?: string;
    addons: string[];
    specialInstructions: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  orderType: string;
  tableNumber?: number;
  paymentMethod?: string;
  wifiSSID?: string;
  estimatedTime?: number;
}): Promise<Order> {
  const res = await api.post('/orders', payload);
  return res.data.data;
}

export async function fetchMenuItems(branchId: string): Promise<MenuItem[]> {
  const res = await api.get('/menu/items', { params: { branchId } });
  return res.data.data;
}

export async function searchCustomers(q: string): Promise<Customer[]> {
  const res = await api.get('/customers', { params: { search: q } });
  return res.data.data;
}

export async function markOrderAsPaid(id: string, tendered?: number): Promise<Order> {
  const res = await api.post(`/orders/${id}/mark-paid`, typeof tendered === 'number' ? { tendered } : {});
  return res.data.data;
}

export async function refundOrder(id: string, reason: string): Promise<Order> {
  const res = await api.post(`/orders/${id}/refund`, { reason });
  return res.data.data;
}

export async function fetchHeldOrders(branchId: string): Promise<Order[]> {
  const res = await api.get('/orders/held', { params: { branchId } });
  return res.data.data;
}

export async function confirmHeldOrder(id: string): Promise<Order> {
  const res = await api.post(`/orders/${id}/confirm`);
  return res.data.data;
}

export async function acceptOrder(id: string, etaMinutes?: number): Promise<Order> {
  const res = await api.post(`/orders/${id}/accept`, etaMinutes ? { etaMinutes } : {});
  return res.data.data;
}

export async function rejectOrder(id: string, reason: string, customerMessage?: string): Promise<Order> {
  const res = await api.post(`/orders/${id}/reject`, { reason, customerMessage });
  return res.data.data;
}

export async function verifyPickupCode(id: string, code: string): Promise<Order> {
  const res = await api.post(`/orders/${id}/verify`, { code });
  return res.data.data;
}
