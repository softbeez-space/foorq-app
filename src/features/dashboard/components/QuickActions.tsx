import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Zap, UtensilsCrossed, ClipboardList, QrCode, ScanLine, type LucideIcon } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';

interface Shortcut {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const SHORTCUTS: Shortcut[] = [
  { labelKey: 'tabs.qaNewOrder', href: '/pos', icon: Zap, color: '#F97316' },
  { labelKey: 'tabs.qaScan', href: '/orders/scan?mode=review', icon: ScanLine, color: '#0EA5E9' },
  { labelKey: 'tabs.qaMenu', href: '/menu', icon: UtensilsCrossed, color: '#06B6D4' },
  { labelKey: 'tabs.qaOrders', href: '/orders', icon: ClipboardList, color: '#8B5CF6' },
  { labelKey: 'tabs.qaQr', href: '/qr', icon: QrCode, color: '#84CC16' },
];

/** Shopee seller-grid pattern: one centered row of icon tiles. */
export function QuickActions() {
  const { colors } = useTheme();
  const { t } = useLocale();
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.ink }]}>{t('tabs.quickActions')}</Text>
      <View style={styles.grid}>
        {SHORTCUTS.map((s) => {
          const label = t(s.labelKey);
          return (
          <Pressable
            key={s.labelKey}
            onPress={() => router.push(s.href as any)}
            style={({ pressed }) => [styles.cell, pressed && { opacity: 0.7 }]}
            accessibilityLabel={label}
            accessibilityRole="button"
          >
            <View style={[styles.icon, { backgroundColor: `${s.color}1F` }]}>
              <s.icon size={22} color={s.color} />
            </View>
            <Text style={[styles.label, { color: colors.ink }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 14 },
  title: { fontSize: typography.h2.size, fontWeight: '700', textAlign: 'left' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  cell: { width: 62, alignItems: 'center', justifyContent: 'flex-start', gap: 8 },
  icon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: typography.micro.size, fontWeight: '700', textAlign: 'center' },
});
