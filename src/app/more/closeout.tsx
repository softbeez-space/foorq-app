import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Wallet, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCloseOut, useRecordCloseOut } from '@/features/cashier/hooks';
import { useBranchStore } from '@/features/branches/store';
import { useAuthStore } from '@/features/auth/store';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function CloseOutScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branch = useBranchStore((s) => s.selectedBranchId);
  const role = useAuthStore((s) => s.user?.role);
  const canClose = role === 'owner' || role === 'manager';
  const [date] = useState(todayStr());
  const [counted, setCounted] = useState('');

  const { data: preview, isLoading } = useCloseOut(date);
  const record = useRecordCloseOut();

  const variance =
    counted.trim() !== '' && preview
      ? Math.round((Number(counted) - preview.expectedCash) * 100) / 100
      : null;

  const handleSignOff = () => {
    if (!branch) return;
    const n = Number(counted);
    if (!Number.isFinite(n) || n < 0) {
      Alert.alert(t('more.invalidAmount'), t('more.invalidAmountBody'));
      return;
    }
    record.mutate({ branchId: branch, date, countedCash: n });
    setCounted('');
  };

  return (
    <Screen padded={false}>
      <ScreenHeader title={t('more.closeoutTitle')} />

      <View style={styles.main}>
        {isLoading ? (
          <Skeleton width="100%" height={200} radius={16} />
        ) : preview ? (
          <>
            <Card style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Wallet size={22} color={colors.accent} />
              <Text style={[styles.expected, { color: colors.ink }]}>৳{preview.expectedCash.toLocaleString()}</Text>
              <Text style={[styles.sub, { color: colors.inkSoft }]}>
                {t('more.closeExpected', { orders: preview.paidOrders, date: preview.date })}
              </Text>
            </Card>

            <Card style={[styles.rows, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Row label={t('more.refunded')} value={`৳${preview.refundedCash.toLocaleString()} (${preview.refundedOrders})`} colors={colors} />
              <Row label={t('more.discountsGiven')} value={`৳${preview.discountsGiven.toLocaleString()}`} colors={colors} />
              <Row label={t('more.voidedOrders')} value={String(preview.voidedOrders)} colors={colors} last />
            </Card>

            {preview.alreadyClosed ? (
              <View style={[styles.closed, { backgroundColor: colors.successBg }]}>
                <CheckCircle2 size={18} color={colors.successText} />
                <Text style={[styles.closedText, { color: colors.successText }]}>
                  {t('more.drawerClosed', { date: preview.date })}
                </Text>
              </View>
            ) : canClose ? (
              <Card style={[styles.rows, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  value={counted}
                  onChangeText={(v) => setCounted(v.replace(/[^0-9.]/g, ''))}
                  placeholder={t('more.countedCashPh')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                />
                {variance !== null && Number.isFinite(variance) && (
                  <Text style={[styles.variance, {
                    color: variance === 0 ? colors.successText : variance > 0 ? colors.amber : colors.dangerText,
                  }]}>
                    {variance === 0 ? t('more.exactMatch') : variance > 0 ? t('more.overBy', { v: variance }) : t('more.shortBy', { v: Math.abs(variance) })}
                  </Text>
                )}
                <Button onPress={handleSignOff} loading={record.isPending} size="lg">
                  {t('more.signOff')}
                </Button>
              </Card>
            ) : (
              <Text style={[styles.note, { color: colors.inkSoft }]}>
                {t('more.closeNote')}
              </Text>
            )}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function Row({ label, value, colors, last }: { label: string; value: string; colors: any; last?: boolean }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  hero: { alignItems: 'center', gap: 4, padding: 20 },
  expected: { fontSize: 32, fontWeight: '800' },
  sub: { fontSize: typography.caption.size },
  rows: { padding: 16, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: typography.body.size },
  rowValue: { fontSize: typography.body.size, fontWeight: '700' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '700' },
  variance: { fontSize: typography.caption.size, fontWeight: '700', textAlign: 'center' },
  closed: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12 },
  closedText: { fontSize: typography.body.size, fontWeight: '700' },
  note: { fontSize: typography.body.size, textAlign: 'center', marginTop: 8 },
});
