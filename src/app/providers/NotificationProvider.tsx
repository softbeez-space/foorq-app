import { useEffect, type ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuthStore } from '@/features/auth/store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.user);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (existing !== 'granted') {
          const res = await Notifications.requestPermissionsAsync();
          status = res.status;
        }
        if (status !== 'granted') return;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', {
            name: 'Orders',
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
        await Notifications.getExpoPushTokenAsync();
      } catch {
        // best-effort
      }
    })();
  }, [isAuthenticated]);

  return <>{children}</>;
}
