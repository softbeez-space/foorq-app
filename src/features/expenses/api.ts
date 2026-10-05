import { api } from '@/shared/api/client';
import type { Expense } from '@/entities/expense';

export async function fetchExpenses(params?: { branchId?: string; category?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
  const res = await api.get('/expenses', { params });
  return res.data.data;
}

export async function fetchExpenseSummary(params?: { branchId?: string; range?: 'today' | '7d' | '30d' | '90d' }): Promise<{
  totalExpense: number;
  categoryTotals: { _id: string; totalAmount: number; count: number }[];
  range: string;
}> {
  const res = await api.get('/expenses/summary', { params });
  return res.data.data;
}

export async function createExpense(data: {
  branchId: string;
  title: string;
  description?: string;
  amount: number;
  category: Expense['category'];
  date?: string;
  paymentMethod: Expense['paymentMethod'];
  attachment?: string;
}): Promise<Expense> {
  const res = await api.post('/expenses', data);
  return res.data.data;
}

export async function updateExpense(id: string, data: Partial<Parameters<typeof createExpense>[0]>): Promise<Expense> {
  const res = await api.patch(`/expenses/${id}`, data);
  return res.data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
