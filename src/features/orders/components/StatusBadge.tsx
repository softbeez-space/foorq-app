import { StyleSheet, Text, View } from 'react-native';
import { typography } from '@/ui/theme/tokens';
import { useTheme } from '@/ui/theme/useTheme';
import type { OrderStatus } from '@/shared/constants/status';
import { STATUS_COLOR_KEY } from '@/shared/constants/status';
import { useLocale } from '@/i18n/LocaleContext';

const colorMap: Record<string, 'primary' | 'accent' | 'lime' | 'amber' | 'rose'> = {
  amber: 'amber',
  accent: 'accent',
  primary: 'primary',
  lime: 'lime',
  rose: 'rose',
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const key = STATUS_COLOR_KEY[status];
  const pair = pairFor(colorMap[key] ?? 'amber', colors);
  return (
    <View style={[styles.badge, { backgroundColor: pair.bg }]}>
      <Text style={[styles.text, { color: pair.text }]}>{t(`orders.status.${status}`)}</Text>
    </View>
  );
}

function pairFor(key: 'primary' | 'accent' | 'lime' | 'amber' | 'rose', c: ReturnType<typeof useTheme>['colors']) {
  switch (key) {
    case 'primary': return { bg: c.primaryBg, text: c.primaryText };
    case 'accent': return { bg: c.accentBg, text: c.accentText };
    case 'lime': return { bg: c.successBg, text: c.successText };
    case 'amber': return { bg: c.warningBg, text: c.warningText };
    case 'rose': return { bg: c.dangerBg, text: c.dangerText };
  }
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, alignSelf: 'flex-start' },
  text: { fontSize: typography.micro.size, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
});
