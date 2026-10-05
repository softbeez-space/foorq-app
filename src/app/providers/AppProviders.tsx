import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './QueryProvider';
import { LocaleProvider } from '@/i18n/LocaleContext';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { BranchProvider } from './BranchProvider';
import { SocketProvider } from './SocketProvider';
import { NotificationProvider } from './NotificationProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocaleProvider>
          <QueryProvider>
            <AuthProvider>
              <BranchProvider>
                <SocketProvider>
                  <NotificationProvider>{children}</NotificationProvider>
                </SocketProvider>
              </BranchProvider>
            </AuthProvider>
          </QueryProvider>
          </LocaleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
