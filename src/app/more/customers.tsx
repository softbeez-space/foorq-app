import { useState, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Search, X, Phone, Star, ChevronRight, Plus, Users, TrendingUp, UserRound } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Avatar } from '@/ui/Avatar';
import { EmptyState } from '@/ui/EmptyState';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import { useLocale } from '@/i18n/LocaleContext';
import { useCustomers } from '@/features/customers/hooks';
import type { Customer } from '@/entities/customer';

// PayPal "Customers" rows (avatar + name + handle, pill search) with
// Fresha-style rating lines (★ points · orders) and a Meetup-style
// "about" summary card on top.
export default function CustomersScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useCustomers(search || undefined);

  const stats = useMemo(() => {
    const list = customers ?? [];
    const total = list.length;
    const avgPoints = total > 0
      ? Math.round(list.reduce((s, c) => s + (c.loyaltyPoints || 0), 0) / total)
      : 0;
    const totalSpent = list.reduce((s, c) => s + (c.totalSpent || 0), 0);
    return { total, avgPoints, totalSpent };
  }, [customers]);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.customersTitle')}
        right={
          <Pressable
            hitSlop={10}
            onPress={() => router.push('/more/customers/create')}
            style={[styles.addBtn, { backgroundColor: colors.surface2 }]}
            accessibilityLabel={t('more.addCustomer')}
          >
            <Plus size={20} color={colors.ink} />
          </Pressable>
        }
      />

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Overview — single summary card */}
            {!isLoading && (customers ?? []).length > 0 && (
              <View>
                <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.overview')}</Text>
                <Card padded={false} style={styles.summaryCard}>
                  <OverviewRow
                    icon={<Users size={16} color={colors.accent} />}
                    label={t('more.totalCustomers')}
                    value={String(stats.total)}
                  />
                  <OverviewRow
                    icon={<Star size={16} color={colors.amber} />}
                    label={t('more.avgLoyalty')}
                    value={String(stats.avgPoints)}
                  />
                  <OverviewRow
                    icon={<TrendingUp size={16} color={colors.lime} />}
                    label={t('more.lifetimeRevenue')}
                    value={formatCurrency(stats.totalSpent)}
                  />
                </Card>
              </View>
            )}

            {/* Search — pill, PayPal pattern */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Search size={18} color={colors.inkSoft} />
              <TextInput
                placeholder={t('more.custSearchPh')}
                placeholderTextColor={colors.inkSoft}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: colors.ink }]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {search ? (
                <Pressable hitSlop={10} onPress={() => setSearch('')} accessibilityLabel={t('more.clearSearch')}>
                  <X size={16} color={colors.inkSoft} />
                </Pressable>
              ) : null}
            </View>

            {!isLoading && (customers ?? []).length > 0 && (
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>
                {search ? t('more.results') : t('more.allCustomers', { total: stats.total })}
              </Text>
            )}

            {isLoading && (
              <View style={{ gap: 10 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} width="100%" height={84} radius={16} />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<UserRound size={28} color={colors.inkSoft} />}
              title={search ? t('more.noCustSearch') : t('more.noCustYet')}
              subtitle={search ? t('more.noCustSearchSub') : t('more.noCustYetSub')}
              action={
                !search ? (
                  <Pressable
                    onPress={() => router.push('/more/customers/create')}
                    style={[styles.emptyCta, { backgroundColor: colors.primary }]}
                  >
                    <Plus size={16} color={colors.onPrimary} />
                    <Text style={[styles.emptyCtaText, { color: colors.onPrimary }]}>{t('more.addCustomer')}</Text>
                  </Pressable>
                ) : undefined
              }
            />
          ) : null
        }
        renderItem={({ item }) => <CustomerRow item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </Screen>
  );
}

function OverviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryIcon, { backgroundColor: colors.surface2 }]}>{icon}</View>
      <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

function CustomerRow({ item }: { item: Customer }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const orders = item.totalOrders ?? 0;
  const points = item.loyaltyPoints ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/more/customers/${item._id}`)}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      accessibilityLabel={t('more.customerDetails', { name: item.name })}
    >
      <Card style={styles.row}>
        <Avatar name={item.name} size={48} />
        <View style={styles.rowInfo}>
          <View style={styles.topLine}>
            <Text style={[styles.rowName, { color: colors.ink }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.totalSpent > 0 && (
              <Text style={[styles.spent, { color: colors.ink }]} numberOfLines={1}>
                {formatCurrency(item.totalSpent)}
              </Text>
            )}
          </View>
          <View style={styles.rowMeta}>
            <Phone size={12} color={colors.inkSoft} />
            <Text style={[styles.rowSub, { color: colors.inkSoft }]} numberOfLines={1}>
              {item.phone}
            </Text>
          </View>
          <View style={styles.ratingLine}>
            <Star size={11} color={colors.amber} />
            <Text style={[styles.ratingText, { color: colors.amber }]}>
              {t('more.pts', { count: points })} · {t(orders === 1 ? 'more.orderCountOne' : 'more.ordersCount', { count: orders })}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={colors.inkSoft} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  summaryCard: { overflow: 'hidden', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  summaryIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { flex: 1, fontSize: typography.body.size, fontWeight: '600' },
  summaryValue: { fontSize: typography.h2.size, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: typography.body.size },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 14 },
  rowInfo: { flex: 1, gap: 3 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowName: { fontSize: typography.body.size, fontWeight: '700', flex: 1 },
  spent: { fontSize: typography.body.size, fontWeight: '800' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowSub: { fontSize: typography.caption.size, flex: 1 },
  ratingLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: typography.micro.size, fontWeight: '700' },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 999 },
  emptyCtaText: { fontSize: typography.body.size, fontWeight: '800' },
});
