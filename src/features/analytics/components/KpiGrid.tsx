import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { formatCurrency, formatNumber, formatPercent } from '@/shared/format';
import type { WeekDeltas, WeekKpis } from '@/entities/analytics';

function deltaBadge(change: number | null) {
  if (change === null || change === undefined) return null;
  return change;
}

export function KpiGrid({ kpis, deltas }: { kpis: WeekKpis; deltas: WeekDeltas }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const cards = [
    { label: t('more.kpiRevenue'), value: formatCurrency(kpis.revenue), change: deltaBadge(deltas.revenue) },
    { label: t('more.kpiProfit'), value: formatCurrency(kpis.profit), change: deltaBadge(deltas.profit) },
    { label: t('more.kpiOrders'), value: formatNumber(kpis.orders), change: deltaBadge(deltas.orders) },
    { label: t('more.kpiAvg'), value: formatCurrency(kpis.aov), change: deltaBadge(deltas.aov) },
  ];
  return (
    <View style={styles.grid}>
      {cards.map((c) => (
        <Card key={c.label} style={styles.card}>
          <View style={styles.head}>
            <Text style={[styles.label, { color: colors.inkSoft }]}>{c.label}</Text>
            {typeof c.change === 'number' && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: c.change >= 0 ? colors.successBg : colors.dangerBg },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: c.change >= 0 ? colors.successText : colors.dangerText },
                  ]}
                >
                  {formatPercent(c.change)}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.value, { color: colors.ink }]}>{c.value}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexBasis: '47%', flexGrow: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  label: { fontSize: typography.caption.size },
  value: { fontSize: typography.h1.size, fontWeight: '700' as const, marginTop: 6 },
  badge: { borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: typography.micro.size, fontWeight: '700' as const },
});
