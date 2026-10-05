import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';
import { api } from '@/shared/api/client';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { PLANS } from '@/shared/constants/plans';
import { formatCurrency } from '@/shared/format';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useBranchStore } from '@/features/branches/store';

interface PlanRow {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  highlighted?: boolean;
}

export default function SelectPlanScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { refreshProfile } = useSession();
  const loadBranches = useBranchStore((s) => s.loadBranches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const [cycle, setCycle] = useState(0);
  const [plans, setPlans] = useState<PlanRow[]>(PLANS);
  const [selectedId, setSelectedId] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/billing/plans')
      .then((res) => {
        const rows = (res.data.data ?? []) as any[];
        if (rows.length) {
          setPlans(
            rows.map((r) => ({
              id: r.tier ?? r.id ?? r.name.toLowerCase(),
              name: r.name,
              tagline: r.description ?? '',
              priceMonthly: r.priceMonthly ?? 0,
              priceAnnual: r.priceAnnual ?? 0,
              features: r.features ?? [],
              highlighted: r.popular,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const confirm = async (planId: string = selectedId, planCycle: number = cycle) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/billing/confirm-plan', { plan: planId, cycle: planCycle === 0 ? 'monthly' : 'annual' }).catch(() => {});
      await api.post('/billing/confirm-plan').catch(() => {});
      await refreshProfile();
      await loadBranches();
      const { branches, selectedBranchId } = useBranchStore.getState();
      if (branches.length > 0) {
        if (!selectedBranchId) await setBranch(branches[0]._id);
        router.replace('/dashboard');
      } else {
        router.replace('/setup-branch');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('auth.planErrFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('auth.planTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{t('auth.planSubtitle')}</Text>

        <View style={styles.toggleWrap}>
          <SegmentedControl segments={[t('auth.planMonthly'), t('auth.planAnnual')]} index={cycle} onChange={setCycle} />
        </View>

        <View style={styles.plans}>
          {plans.map((plan) => {
            const selected = plan.id === selectedId;
            const price = cycle === 0 ? plan.priceMonthly : Math.round(plan.priceAnnual / 12);
            return (
              <Pressable key={plan.id} onPress={() => setSelectedId(plan.id)}>
                <Card
                  style={[
                    styles.planCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={styles.planHead}>
                    <View>
                      <Text style={[styles.planName, { color: colors.ink }]}>{plan.name}</Text>
                      <Text style={[styles.planTag, { color: colors.inkSoft }]}>{plan.tagline}</Text>
                    </View>
                    {plan.highlighted && (
                      <View style={[styles.popular, { backgroundColor: colors.primary }]}>
                        <Sparkles size={12} color={colors.onPrimary} />
                        <Text style={[styles.popularText, { color: colors.onPrimary }]}>{t('auth.planPopular')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.ink }]}>{formatCurrency(price)}</Text>
                    <Text style={[styles.perMonth, { color: colors.inkSoft }]}>{t('auth.planPerMonth')}</Text>
                  </View>
                  <View style={styles.features}>
                    {plan.features.map((f) => (
                      <View key={f} style={styles.featureRow}>
                        <View style={[styles.check, { backgroundColor: colors.primaryBg }]}>
                          <Check size={12} color={colors.primary700} strokeWidth={3} />
                        </View>
                        <Text style={[styles.featureText, { color: colors.inkSoft }]}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

        <Button onPress={() => confirm()} loading={loading} size="lg" shape="pill" style={{ marginTop: 8 }}>
          {t('auth.planContinueWith', { plan: plans.find((p) => p.id === selectedId)?.name ?? 'plan' })}
        </Button>

        <Pressable onPress={() => confirm('free', 0)} disabled={loading} style={styles.skipRow}>
          <Text style={[styles.skipText, { color: colors.primary700 }]}>{t('auth.planStartFree')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32, gap: 8 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  subtitle: { fontSize: typography.body.size, marginTop: 4 },
  toggleWrap: { marginVertical: 16 },
  plans: { gap: 12 },
  planCard: { padding: 18 },
  planHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  planName: { fontSize: typography.h1.size, fontWeight: '700' },
  planTag: { fontSize: typography.caption.size, marginTop: 2 },
  popular: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  popularText: { fontSize: 10, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 14 },
  price: { fontSize: typography.displayL.size, fontWeight: '700', fontFamily: fontFamilies.display },
  perMonth: { fontSize: typography.caption.size },
  features: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: typography.caption.size, flex: 1 },
  error: { fontSize: typography.caption.size, fontWeight: '600', marginTop: 8 },
  skipRow: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: typography.body.size, fontWeight: '700' },
});
