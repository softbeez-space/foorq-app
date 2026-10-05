import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react-native';
import { ENV } from '@/shared/config/env';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showBrand?: boolean;
}

/**
 * Shared auth header (Mobbin login patterns: DoorDash minimal title,
 * Navan logo-first). Brand mark + serif title + soft subtitle, with an
 * optional back chevron for multi-step flows.
 */
export function AuthHeader({ title, subtitle, showBack, onBack, showBrand = true }: AuthHeaderProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  return (
    <View>
      {showBack && (
        <Pressable
          hitSlop={12}
          onPress={onBack ?? (() => router.back())}
          style={[styles.back, { borderColor: colors.border, backgroundColor: colors.surface }]}
          accessibilityLabel={t('auth.goBack')}
        >
          <ArrowLeft size={18} color={colors.ink} />
        </Pressable>
      )}
      {showBrand && (
        <View style={styles.brand}>
          <View style={[styles.mark, { backgroundColor: colors.primary }]}>
            <UtensilsCrossed size={24} color={colors.onPrimary} />
          </View>
          <Text style={[styles.appName, { color: colors.ink }]}>{ENV.appName}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProgressBars({ total, index }: { total: number; index: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressBar,
            { backgroundColor: i <= index ? colors.primary : colors.surface2, flex: 1 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: { alignItems: 'center', marginBottom: 20, gap: 8 },
  mark: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: typography.h1.size, fontWeight: '700' },
  title: { fontSize: typography.displayM.size, fontFamily: fontFamilies.display },
  subtitle: { fontSize: typography.body.size, marginTop: 4, marginBottom: 24 },
  progress: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  progressBar: { height: 4, borderRadius: 2 },
});
