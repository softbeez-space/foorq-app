import { api } from '@/shared/api/client';

export interface LoyaltyProgram {
  _id: string;
  isEnabled: boolean;
  earningRate: number;
  minimumSpend: number;
  pointsExpirationDays: number;
  welcomePoints: number;
}

export interface LoyaltyReward {
  _id: string;
  name: string;
  type: 'discount' | 'free_item';
  pointsRequired: number;
  discountValue?: number;
  isPercentage?: boolean;
  menuItemId?: string;
  isActive: boolean;
  usageCount: number;
}

export interface LoyaltyStats {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

export async function fetchProgram(): Promise<LoyaltyProgram> {
  const res = await api.get('/loyalty/program');
  return res.data.data;
}

export async function updateProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
  const res = await api.patch('/loyalty/program', data);
  return res.data.data;
}

export async function fetchRewards(): Promise<LoyaltyReward[]> {
  const res = await api.get('/loyalty/rewards');
  return res.data.data ?? [];
}

export async function createReward(data: {
  name: string;
  type: 'discount' | 'free_item';
  pointsRequired: number;
  discountValue?: number;
  isPercentage?: boolean;
  isActive?: boolean;
}): Promise<LoyaltyReward> {
  const res = await api.post('/loyalty/rewards', data);
  return res.data.data;
}

export async function updateReward(id: string, data: Partial<LoyaltyReward>): Promise<LoyaltyReward> {
  const res = await api.patch(`/loyalty/rewards/${id}`, data);
  return res.data.data;
}

export async function deleteReward(id: string): Promise<void> {
  await api.delete(`/loyalty/rewards/${id}`);
}

export async function fetchStats(): Promise<LoyaltyStats> {
  const res = await api.get('/loyalty/stats');
  return res.data.data;
}
