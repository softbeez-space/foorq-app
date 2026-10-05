import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronDown, RefreshCw, Plus, ScanLine, Star, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Card } from '@/ui/Card';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useBranchStore, useSelectedBranch } from '@/features/branches/store';
import { useDashboardStats } from '@/features/dashboard/hooks';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { OrderTypeChart } from '@/features/dashboard/components/OrderTypeChart';
import { RecentOrders } from '@/features/dashboard/components/RecentOrders';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { formatCurrency, formatNumber } from '@/shared/format';

const RANGE_KEYS = ['tabs.rangeToday', 'tabs.range7d', 'tabs.range30d', 'tabs.range90d'];
const RANGE_VALUES = ['today', '7d', '30d', '90d'];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { user, restaurant } = useSession();
  const branches = useBranchStore((s) => s.branches);
  const selectedBranch = useSelectedBranch();
  const [rangeIdx, setRangeIdx] = useState(0);
  const { data: stats, isLoading, isRefetching, refetch } = useDashboardStats(selectedBranch?._id ?? null, RANGE_VALUES[rangeIdx]);

  const summary = stats?.summary;
  const revenueChange =
    summary && summary.yesterdayRevenue > 0
      ? ((summary.todayRevenue - summary.yesterdayRevenue) / summary.yesterdayRevenue) * 100
      : 0;

  const isToday = rangeIdx === 0;
  const heroValue = isToday ? (summary?.todayRevenue ?? 0) : (summary?.totalRevenue ?? 0);
  const ranges = RANGE_KEYS.map((k) => t(k));

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Store header (Posh pattern): branch switcher + refresh */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push('/select-branch')}
            style={[styles.branchPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel={t('tabs.switchBranch')}
          >
            <View style={[styles.branchDot, { backgroundColor: colors.primary }]}>
              <Text style={[styles.branchInitial, { color: colors.onPrimary }]}>
                {(selectedBranch?.name ?? restaurant?.name ?? '?').trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.branchName, { color: colors.ink }]} numberOfLines={1}>
                {selectedBranch?.name ?? t('tabs.selectBranch')}
              </Text>
              <Text style={[styles.branchSub, { color: colors.inkSoft }]} numberOfLines={1}>
                {branches.length > 1
                  ? t('tabs.locationsSwitch', { count: branches.length })
                  : (restaurant?.name ?? user?.name ?? '')}
              </Text>
            </View>
            {branches.length > 1 && <ChevronDown size={18} color={colors.inkSoft} />}
          </Pressable>
          <Pressable
            onPress={() => router.push('/orders/scan?mode=review' as any)}
            style={[styles.iconBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            hitSlop={10}
            accessibilityLabel={t('tabs.scanQr')}
          >
            <ScanLine size={16} color={colors.onPrimary} />
          </Pressable>
          <Pressable
            onPress={() => refetch()}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            hitSlop={10}
            accessibilityLabel={t('tabs.refreshDash')}
          >
            <RefreshCw size={16} color={colors.inkSoft} />
          </Pressable>
        </View>

        <View style={{ marginBottom: 14 }}>
          <SegmentedControl segments={ranges} index={rangeIdx} onChange={setRangeIdx} />
        </View>

        {isLoading && !stats ? (
          <DashboardSkeleton />
        ) : stats ? (
          <View style={styles.body}>
            {/* Revenue hero (Airbnb statement + Shopify total-sales) */}
            <Card style={[styles.hero, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '30' }]}>
              <Text style={[styles.eyebrow, { color: colors.primary700 }]}>
                {isToday ? t('tabs.todayRevenue') : t('tabs.rangeRevenue', { range: ranges[rangeIdx] })}
              </Text>
              <Text style={[styles.heroValue, { color: colors.ink }]}>
                {formatCurrency(heroValue)}
              </Text>
              <View style={styles.heroFoot}>
                {isToday && (
                  <ChangePill change={isRefetching ? 0 : revenueChange} />
                )}
                <Text style={[styles.heroSub, { color: colors.inkSoft }]}>
                  {t('tabs.heroOrdersAvg', { orders: formatNumber(summary?.todayOrders ?? 0), avg: formatCurrency(summary?.aov ?? 0) })}
                </Text>
              </View>
            </Card>

            {/* Metric strip (Squarespace overview pattern) */}
            <Card style={styles.strip} padded={false}>
              <MetricCell
                label={t('tabs.metricOrders')}
                value={formatNumber(summary?.todayOrders ?? 0)}
                bordered={false}
              />
              <MetricCell label={t('tabs.metricAvg')} value={formatCurrency(summary?.aov ?? 0)} bordered />
              <MetricCell
                label={t('tabs.metricTotal')}
                value={formatCurrency(summary?.totalRevenue ?? 0)}
                bordered
              />
            </Card>

            {stats.rating && stats.rating.count > 0 && (
              <Card>
                <View style={styles.ratingRow}>
                  <Star size={18} color={colors.amber} fill={colors.amber} />
                  <Text style={[styles.ratingValue, { color: colors.ink }]}>
                    {stats.rating.avg.toFixed(1)}
                  </Text>
                  <Text style={[styles.ratingSub, { color: colors.inkSoft }]}>
                    {t(stats.rating.count === 1 ? 'tabs.reviewOne' : 'tabs.reviewsMany', { count: stats.rating.count })}
                  </Text>
                  {stats.rating.lowCount > 0 && (
                    <Text style={[styles.ratingAlert, { color: colors.dangerText }]}>
                      {t('tabs.needAttention', { count: stats.rating.lowCount })}
                    </Text>
                  )}
                </View>
              </Card>
            )}

            {(stats.lowStockCount ?? 0) > 0 && (
              <Card style={{ borderColor: colors.warningBg }}>
                <View style={styles.ratingRow}>
                  <TriangleAlert size={18} color={colors.amber} />
                  <Text style={[styles.ratingValue, { color: colors.ink }]}>
                    {stats.lowStockCount}
                  </Text>
                  <Text style={[styles.ratingSub, { color: colors.inkSoft }]}>
                    {t(stats.lowStockCount === 1 ? 'tabs.lowStockOne' : 'tabs.lowStockMany')}
                  </Text>
                </View>
              </Card>
            )}

            <RevenueChart data={stats.dailyRevenue ?? []} rangeLabel={ranges[rangeIdx]} />
            <OrderTypeChart distribution={stats.orderTypeDistribution} />

            <RecentOrders orders={stats.recentOrders ?? []} />

            <QuickActions />
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      <NewOrderFab />
    </Screen>
  );
}

function ChangePill({ change }: { change: number }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <View style={[styles.change, { backgroundColor: up ? colors.successBg : colors.dangerBg }]}>
      <Icon size={12} color={up ? colors.successText : colors.dangerText} />
      <Text style={[styles.changeText, { color: up ? colors.successText : colors.dangerText }]}>
        {t('tabs.vsYesterday', { change: `${up ? '+' : ''}${change.toFixed(1)}` })}
      </Text>
    </View>
  );
}

function MetricCell({ label, value, bordered }: { label: string; value: string; bordered: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.cell, bordered && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border }]}>
      <Text style={[styles.cellLabel, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[styles.cellValue, { color: colors.ink }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function NewOrderFab() {
  const { colors } = useTheme();
  const { t } = useLocale();
  return (
    <Pressable
      onPress={() => router.push('/pos')}
      style={[styles.fab, { backgroundColor: colors.primary }]}
      hitSlop={12}
      accessibilityLabel={t('tabs.newOrder')}
    >
      <Plus size={24} color={colors.onPrimary} />
    </Pressable>
  );
}

function DashboardSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      <Card style={{ padding: 18, gap: 10 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={180} height={34} />
        <Skeleton width={220} height={12} />
      </Card>
      <Card style={{ padding: 16 }}>
        <Skeleton width="100%" height={54} radius={12} />
      </Card>
      <Card style={{ padding: 16, gap: 12 }}>
        <Skeleton width={140} height={16} />
        <Skeleton width="100%" height={220} radius={12} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 8, paddingTop: 16, paddingBottom: 4, marginBottom: 12, alignItems: 'center' },
  branchPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  branchDot: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  branchInitial: { fontSize: typography.h2.size, fontWeight: '800' },
  branchName: { fontSize: typography.body.size, fontWeight: '700' },
  branchSub: { fontSize: typography.caption.size, marginTop: 1 },
  iconBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', alignItems: 'center' },
  body: { gap: 16 },
  hero: { padding: 20, borderWidth: 1 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontSize: 40, lineHeight: 46, fontFamily: fontFamilies.display, marginTop: 6 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  heroSub: { fontSize: typography.caption.size, fontWeight: '600' },
  change: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9999 },
  changeText: { fontSize: typography.micro.size, fontWeight: '800' },
  strip: { flexDirection: 'row', overflow: 'hidden' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ratingValue: { fontSize: typography.h1.size, fontWeight: '800' },
  ratingSub: { fontSize: typography.caption.size, fontWeight: '600' },
  ratingAlert: { fontSize: typography.caption.size, fontWeight: '700' },
  cell: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  cellLabel: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cellValue: { fontSize: typography.h1.size, fontWeight: '800' },
  center: { paddingVertical: 48, alignItems: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
});
