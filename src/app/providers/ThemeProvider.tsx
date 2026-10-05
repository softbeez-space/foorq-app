import { type ReactNode, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { themes } from '@/ui/theme/tokens';
import { deriveAccentedTheme } from '@/ui/theme/deriveAccentTheme';
import { ThemeContext } from '@/ui/theme/useTheme';
import { useAuthStore } from '@/features/auth/store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const accentColor = useAuthStore((s) => s.restaurant?.accentColor);
  const resolved = systemScheme === 'dark' ? 'dark' as const : 'light' as const;

  const value = useMemo(() => {
    const base = themes[resolved];
    if (accentColor && /^#[0-9a-f]{6}$/i.test(accentColor)) {
      return { colors: deriveAccentedTheme(base, accentColor), scheme: resolved };
    }
    return { colors: base, scheme: resolved };
  }, [resolved, accentColor]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}
