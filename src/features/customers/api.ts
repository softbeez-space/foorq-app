import { api } from '@/shared/api/client';
import type { Customer } from '@/entities/customer';

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const params = search ? { search } : {};
  const res = await api.get('/customers', { params });
  return res.data.data;
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await api.get(`/customers/${id}`);
  return res.data.data;
}

export async function createCustomer(data: { name: string; phone: string; email?: string; address?: string }): Promise<Customer> {
  const res = await api.post('/customers', data);
  return res.data.data;
}

export async function updateCustomer(id: string, data: Partial<{ name: string; phone: string; email: string; address: string }>): Promise<Customer> {
  const res = await api.patch(`/customers/${id}`, data);
  return res.data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
