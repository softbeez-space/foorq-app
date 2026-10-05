import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gauge, TrendingDown, TrendingUp, X, Zap } from 'lucide-react-native';
import { Link } from 'expo-router';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import type { MidweekPulse } from '@/entities/analytics';

export function PulseBanner({ pulse, onDismiss }: { pulse: MidweekPulse; onDismiss: () => void }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  if (pulse.pctBehind === null) return null;
  const ahead = !pulse.alert && (pulse.pctBehind ?? 0) >= 10;
  const Icon = pulse.alert ? Zap : ahead ? TrendingUp : Gauge;
  const tint = pulse.alert ? colors.dangerBg : ahead ? colors.successBg : colors.surface2;
  const iconColor = pulse.alert ? colors.dangerText : ahead ? colors.successText : colors.inkSoft;
  return (
    <Card style={[styles.card, { borderColor: pulse.alert ? colors.dangerText : colors.border }]}>
      <View style={[styles.icon, { backgroundColor: tint }]}>
        <Icon size={17} color={iconColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('more.wedPulse', { headline: pulse.headline })}</Text>
        <Text style={[styles.detail, { color: colors.inkSoft }]}>
          {t('more.pulseDetail', { rev: formatCurrency(pulse.revenueSoFar), base: formatCurrency(pulse.baselineRevenue), suggestion: pulse.suggestion })}
        </Text>
        {pulse.alert ? (
          <Link href="/more/offers" asChild>
            <Pressable style={[styles.cta, { backgroundColor: colors.ink }]}>
              <Zap size={13} color="#fff" />
              <Text style={styles.ctaText}>{t('more.makeOffer')}</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>
      <Pressable onPress={onDismiss} hitSlop={10} style={styles.x}>
        <X size={14} color={colors.inkSoft} />
      </Pressable>
    </Card>
  );
}

export function ForecastStrip({
  projected,
  low,
  high,
  orders,
  trend,
  weeksUsed,
}: {
  projected: number;
  low: number;
  high: number;
  orders: number;
  trend: 'up' | 'steady' | 'down';
  weeksUsed: number;
}) {
  const { colors } = useTheme();
  const { t } = useLocale();
  if (!weeksUsed) return null;
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Gauge;
  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primaryBg }]}>
          <Icon size={17} color={colors.primaryText} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.ink }]}>
            {t('more.nextWeekAmt', { amt: formatCurrency(projected) })}
          </Text>
          <Text style={[styles.detail, { color: colors.inkSoft }]}>
            {t('more.forecastDetail', { low: formatCurrency(low), high: formatCurrency(high), orders, trend, weeks: weeksUsed })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: typography.body.size, fontWeight: '700' as const, lineHeight: 21 },
  detail: { fontSize: typography.caption.size, lineHeight: 19, marginTop: 3 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10,
  },
  ctaText: { color: '#fff', fontSize: typography.caption.size, fontWeight: '700' as const },
  x: { padding: 4 },
});
