import { create } from 'zustand';
import { secureStorage } from '@/shared/storage/secure';
import { STORAGE_KEYS } from '@/shared/config/env';

export interface NotificationPrefs {
  notifyOrders: boolean;
  notifySound: boolean;
  notifyHaptic: boolean;
}

const DEFAULTS: NotificationPrefs = {
  notifyOrders: true,
  notifySound: true,
  notifyHaptic: true,
};

interface NotificationPrefsState extends NotificationPrefs {
  loading: boolean;
  load: () => Promise<void>;
  toggle: (key: keyof NotificationPrefs) => Promise<void>;
}

export const useNotificationPrefs = create<NotificationPrefsState>((set, get) => ({
  ...DEFAULTS,
  loading: true,

  load: async () => {
    try {
      const raw = await secureStorage.getItem(STORAGE_KEYS.notificationPrefs);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ ...parsed, loading: false });
      } else {
        set({ ...DEFAULTS, loading: false });
      }
    } catch {
      set({ ...DEFAULTS, loading: false });
    }
  },

  toggle: async (key) => {
    const current = get()[key];
    const next = !current;
    set({ [key]: next });
    const prefs: NotificationPrefs = {
      notifyOrders: key === 'notifyOrders' ? next : get().notifyOrders,
      notifySound: key === 'notifySound' ? next : get().notifySound,
      notifyHaptic: key === 'notifyHaptic' ? next : get().notifyHaptic,
    };
    await secureStorage.setItem(STORAGE_KEYS.notificationPrefs, JSON.stringify(prefs));
  },
}));
