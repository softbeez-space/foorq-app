import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { Card } from '@/ui/Card';
import { Badge } from '@/ui/Badge';
import type { PlanConfig, Subscription } from '@/entities/billing';

interface Props {
  subscription: Subscription;
  plan: PlanConfig;
}

function getCycleLabel(t: (key: string) => string, cycle: string): string {
  switch (cycle) {
    case 'monthly': return t('billing.cycleMonthly');
    case 'annual': return t('billing.cycleAnnual');
    case 'lifetime': return t('billing.cycleLifetime');
    default: return cycle;
  }
}

function getCyclePrice(plan: PlanConfig, cycle: string): string {
  switch (cycle) {
    case 'monthly': return `৳${plan.priceMonthly.toLocaleString()}`;
    case 'annual': return `৳${plan.priceAnnual.toLocaleString()}`;
    case 'lifetime': return `৳${plan.priceLifetime.toLocaleString()}`;
    default: return '৳0';
  }
}

export function CurrentPlanCard({ subscription, plan }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const statusIcon = (() => {
    switch (subscription.status) {
      case 'active': return <CheckCircle size={20} color={colors.lime} />;
      case 'past_due': return <AlertCircle size={20} color={colors.amber} />;
      default: return <Clock size={20} color={colors.inkSoft} />;
    }
  })();

  const statusColor =
    subscription.status === 'active' ? colors.successText :
    subscription.status === 'past_due' ? colors.warningText :
    colors.inkSoft;

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('billing.currentPlan')}</Text>
      <View style={styles.header}>
        <View style={styles.planInfo}>
          <Text style={[styles.planName, { color: colors.ink }]}>{plan.name}</Text>
          {plan.popular && <Badge label={t('billing.popular')} color="amber" />}
        </View>
        <View style={[styles.statusRow, { backgroundColor: colors.surface2 }]}>
          {statusIcon}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.price, { color: colors.ink }]}>
          {getCyclePrice(plan, subscription.cycle)}
        </Text>
        <Text style={[styles.cycle, { color: colors.inkSoft }]}>
          /{getCycleLabel(t, subscription.cycle)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('billing.started')}</Text>
        <Text style={[styles.detailValue, { color: colors.ink }]}>
          {new Date(subscription.startDate).toLocaleDateString()}
        </Text>
      </View>
      {subscription.endDate && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('billing.nextBilling')}</Text>
          <Text style={[styles.detailValue, { color: colors.ink }]}>
            {new Date(subscription.endDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: typography.h1.size, fontWeight: '700', marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  planInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planName: { fontSize: typography.h2.size, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: typography.micro.size, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md },
  price: { fontSize: typography.displayM.size, fontWeight: '800', fontFamily: 'monospace' },
  cycle: { fontSize: typography.caption.size },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: typography.body.size },
  detailValue: { fontSize: typography.body.size, fontWeight: '600' },
});
