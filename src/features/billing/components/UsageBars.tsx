import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { Card } from '@/ui/Card';
import type { PlanConfig, Usage } from '@/entities/billing';

interface Props {
  plan: PlanConfig;
  usage?: Usage;
}

export function UsageBars({ plan, usage }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  if (!usage) return null;

  const items: { label: string; used: number; limit: number }[] = [
    { label: t('billing.branches'), used: usage.branches, limit: plan.limits.maxBranches },
    { label: t('billing.menuItems'), used: usage.menuItems, limit: plan.limits.maxMenuItems },
    { label: t('billing.staff'), used: usage.staff, limit: plan.limits.maxStaff },
  ];

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('billing.usage')}</Text>
      {items.map((item) => {
        const isUnlimited = item.limit === -1;
        const ratio = isUnlimited ? 1 : Math.min(item.used / item.limit, 1);
        const barColor = ratio > 0.9 ? colors.rose : ratio > 0.7 ? colors.amber : colors.primary;

        return (
          <View key={item.label} style={styles.barRow}>
            <View style={styles.barHeader}>
              <Text style={[styles.barLabel, { color: colors.ink }]}>{item.label}</Text>
              <Text style={[styles.barValues, { color: colors.inkSoft }]}>
                {item.used} / {item.limit === -1 ? t('billing.unlimited') : item.limit.toString()}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: isUnlimited ? '100%' : `${Math.max(ratio * 100, 4)}%`,
                    backgroundColor: isUnlimited ? colors.accent : barColor,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: typography.h1.size, fontWeight: '700', marginBottom: spacing.md },
  barRow: { marginBottom: spacing.md },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: typography.body.size, fontWeight: '600' },
  barValues: { fontSize: typography.caption.size },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, minWidth: 4 },
});
