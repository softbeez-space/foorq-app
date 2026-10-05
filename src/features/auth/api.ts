import { api } from '@/shared/api/client';
import type { User, Restaurant } from '@/entities/user';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  restaurant?: Restaurant;
}

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post('/auth/login', payload);
  console.log("loginnn", res)
  return res.data.data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  restaurantName: string;
}): Promise<AuthResponse> {
  const res = await api.post('/auth/register', payload);
  return res.data.data;
}

export async function getProfile(): Promise<{
  _id: string;
  name: string;
  email: string;
  role: string;
  restaurantId?: Restaurant & { _id: string };
  branchId?: { _id: string };
}> {
  const res = await api.get('/auth/me');
  return res.data.data;
}

export async function forgotPassword(email: string): Promise<{ sent: boolean }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data.data ?? { sent: true };
}
