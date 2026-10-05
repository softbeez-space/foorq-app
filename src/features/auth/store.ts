import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { secureStorage } from '@/shared/storage/secure';
import { STORAGE_KEYS } from '@/shared/config/env';
import { setAuthExpiredHandler } from '@/shared/api/client';
import * as authApi from './api';
import type { User, Restaurant } from '@/entities/user';

interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, restaurantName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setRestaurant: (r: Restaurant | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  setAuthExpiredHandler(() => {
    set({ user: null, restaurant: null });
  });

  return {
    user: null,
    restaurant: null,
    loading: true,
    initialized: false,

    async loadSession() {
      try {
        const token = await secureStorage.getItem(STORAGE_KEYS.accessToken);
        if (!token) {
          set({ loading: false, initialized: true });
          return;
        }
        const profile = await authApi.getProfile();
        set({
          user: mapUser(profile),
          restaurant: mapRestaurant(profile),
          loading: false,
          initialized: true,
        });
      } catch {
        await secureStorage.removeItem(STORAGE_KEYS.accessToken);
        await secureStorage.removeItem(STORAGE_KEYS.refreshToken);
        set({ user: null, restaurant: null, loading: false, initialized: true });
      }
    },

    async login(email, password) {
      const data = await authApi.login({ email, password });
      await secureStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      set({ user: data.user, restaurant: data.restaurant ?? null });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },

    async register(name, email, password, restaurantName) {
      const data = await authApi.register({ name, email, password, restaurantName });
      await secureStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      set({ user: data.user, restaurant: data.restaurant ?? null });
    },

    async logout() {
      await secureStorage.removeItem(STORAGE_KEYS.accessToken);
      await secureStorage.removeItem(STORAGE_KEYS.refreshToken);
      await secureStorage.removeItem(STORAGE_KEYS.selectedBranchId);
      set({ user: null, restaurant: null });
    },

    setRestaurant(r) {
      set({ restaurant: r });
    },

    async refreshProfile() {
      try {
        const profile = await authApi.getProfile();
        set({ user: mapUser(profile), restaurant: mapRestaurant(profile) });
      } catch {
        // ignore
      }
    },
  };
});

function mapUser(profile: Awaited<ReturnType<typeof authApi.getProfile>>): User {
  return {
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: (profile.role as User['role']) ?? 'staff',
    restaurantId: profile.restaurantId?._id,
    branchId: profile.branchId?._id,
  };
}

function mapRestaurant(profile: Awaited<ReturnType<typeof authApi.getProfile>>): Restaurant | null {
  if (!profile.restaurantId || typeof profile.restaurantId !== 'object') return null;
  const r = profile.restaurantId;
  return {
    id: r._id,
    name: r.name,
    slug: r.slug,
    logo: r.logo,
    planSetupComplete: r.planSetupComplete,
    accentColor: r.accentColor,
  };
}
