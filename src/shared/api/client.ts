import axios, { type AxiosInstance } from 'axios';
import { ENV, STORAGE_KEYS } from '../config/env';
import { secureStorage } from '../storage/secure';
import type { StorageAdapter } from './storage';

let onAuthExpired: (() => void) | null = null;
export function setAuthExpiredHandler(fn: () => void) {
  onAuthExpired = fn;
}

const storage: StorageAdapter = secureStorage;

async function getToken(key: string): Promise<string | null> {
  const v = await storage.getItem(key);
  return v ?? null;
}

export const api: AxiosInstance = axios.create({
  baseURL: ENV.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await getToken(STORAGE_KEYS.refreshToken);
        if (refreshToken) {
          const res = await axios.post(`${ENV.apiUrl}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          await storage.setItem(STORAGE_KEYS.accessToken, accessToken);
          await storage.setItem(STORAGE_KEYS.refreshToken, newRefresh);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        // fall through to logout
      }
      await storage.removeItem(STORAGE_KEYS.accessToken);
      await storage.removeItem(STORAGE_KEYS.refreshToken);
      onAuthExpired?.();
    }
    return Promise.reject(error);
  },
);
