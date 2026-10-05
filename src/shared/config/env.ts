export const ENV = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.foorq.com/api',
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Foorq',
  menuBaseUrl: (process.env.EXPO_PUBLIC_MENU_BASE_URL ?? 'https://foorq.com').replace(/\/+$/, ''),
};

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  selectedBranchId: 'selectedBranchId',
  biometricEnabled: 'biometricEnabled',
  notificationPrefs: 'notificationPrefs',
} as const;
