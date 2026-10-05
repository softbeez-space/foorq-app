import { api } from '@/shared/api/client';
import type { PlanConfig, MyPlanResponse, Usage, InitPaymentResponse, Subscription } from '@/entities/billing';

export async function fetchPlans(): Promise<PlanConfig[]> {
  const res = await api.get('/billing/plans');
  return res.data.data;
}

export async function fetchMyPlan(): Promise<MyPlanResponse> {
  const res = await api.get('/billing/my-plan');
  return res.data.data;
}

export async function fetchUsage(): Promise<Usage> {
  const res = await api.get('/billing/usage');
  return res.data.data;
}

export async function initPayment(plan: string, cycle: string): Promise<InitPaymentResponse> {
  const res = await api.post('/billing/init-payment', { plan, cycle });
  return res.data.data;
}

export async function upgradePlan(plan: string, cycle: string): Promise<{ subscription: Subscription }> {
  const res = await api.post('/billing/upgrade', { plan, cycle });
  return res.data.data;
}

export async function confirmPlan(): Promise<void> {
  await api.post('/billing/confirm-plan');
}
