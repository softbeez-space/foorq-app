import { View, Text, StyleSheet } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { Card } from '@/ui/Card';
import type { PaymentRecord } from '@/entities/billing';

interface Props {
  payments: PaymentRecord[];
}

export function PaymentHistory({ payments }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('billing.paymentHistory')}</Text>
      {payments.length === 0 ? (
        <Text style={[styles.empty, { color: colors.inkSoft }]}>{t('billing.noPayments')}</Text>
      ) : (
        payments.map((p, idx) => (
          <View
            key={p.transactionId || idx}
            style={[styles.row, idx < payments.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>
              <Receipt size={18} color={colors.inkSoft} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.amount, { color: colors.ink }]}>৳{p.amount.toLocaleString()}</Text>
              <Text style={[styles.meta, { color: colors.inkSoft }]}>
                {p.method?.toUpperCase()} · {new Date(p.paidAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.txnId, { color: colors.inkSoft }]} numberOfLines={1}>
              {p.transactionId?.slice(0, 12)}...
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: typography.h1.size, fontWeight: '700', marginBottom: spacing.md },
  empty: { fontSize: typography.body.size, paddingVertical: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  amount: { fontSize: typography.body.size, fontWeight: '700' },
  meta: { fontSize: typography.caption.size, marginTop: 2 },
  txnId: { fontSize: typography.micro.size, maxWidth: 100 },
});
