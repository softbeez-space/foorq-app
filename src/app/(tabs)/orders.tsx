import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo } from 'react';
import { ChefHat, ClipboardList, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { EmptyState } from '@/ui/EmptyState';
import { Button } from '@/ui/Button';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { useOrders } from '@/features/orders/hooks';
import { useOrdersStore } from '@/features/orders/store';
import { useLocale } from '@/i18n/LocaleContext';
import type { Order } from '@/entities/order';

const FILTER_MAP: (string | undefined)[] = [undefined, 'pending', 'preparing', 'ready', 'served'];
const SEG_KEYS = ['orders.seg.all', 'orders.seg.pending', 'orders.seg.preparing', 'orders.seg.ready', 'orders.seg.served'];

function NewOrderFab() {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/pos')}
      style={[styles.fab, { backgroundColor: colors.primary }]}
      hitSlop={12}
    >
      <Plus size={24} color={colors.onPrimary} />
    </Pressable>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const segment = useOrdersStore((s) => s.selectedSegment);
  const setSegment = useOrdersStore((s) => s.setSelectedSegment);
  const segments = SEG_KEYS.map((k) => t(k));
  const statusFilter = FILTER_MAP[segment];
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } = useOrders(statusFilter);

  const orders = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((p) => p.orders);
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard order={item} onPress={() => router.push(`/orders/${item._id}` as any)} />
    ),
    [],
  );

  const ListFooter = useCallback(
    () => (
      <View style={styles.footer}>
        {isFetchingNextPage && <ActivityIndicator color={colors.primary} size="small" />}
        {!hasNextPage && orders.length > 0 && (
          <Text style={[styles.endText, { color: colors.inkSoft }]}>{t('orders.list.noMore')}</Text>
        )}
      </View>
    ),
    [isFetchingNextPage, hasNextPage, orders.length, colors.inkSoft, colors.primary],
  );

  const header = (
    <View style={[styles.headerWrap, { backgroundColor: colors.bg }]}>
      <View style={styles.headRow}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>{t('orders.list.title')}</Text>
          {orders.length > 0 && (
            <Text style={[styles.count, { color: colors.inkSoft }]}>
              {t('orders.list.openCount', { count: orders.length, segment: segments[segment] })}
            </Text>
          )}
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => router.push('/orders/kitchen' as any)}
          style={[styles.kdsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityLabel={t('orders.list.openKitchen')}
        >
          <ChefHat size={15} color={colors.primary} />
          <Text style={[styles.kdsText, { color: colors.ink }]}>{t('orders.list.kitchen')}</Text>
        </Pressable>
      </View>
      <SegmentedControl segments={segments} index={segment} onChange={setSegment} />
    </View>
  );

  if (isLoading) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        {header}
        <View style={styles.skelWrap}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={100} style={{ marginBottom: 12, borderRadius: 20 }} />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon={<ClipboardList size={28} color={colors.inkSoft} />}
            title={t('orders.list.emptyTitle')}
            subtitle={segment === 0 ? t('orders.list.emptyAll') : t('orders.list.emptyFilter', { segment: segments[segment].toLowerCase() })}
            action={<Button onPress={() => router.push('/pos')}>{t('orders.list.create')}</Button>}
          />
        }
        ListFooterComponent={ListFooter}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <NewOrderFab />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingTop: 16, paddingBottom: 12, gap: 12 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  count: { fontSize: typography.caption.size, fontWeight: '600', marginTop: 2 },
  kdsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  kdsText: { fontSize: typography.caption.size, fontWeight: '700' },
  list: { paddingBottom: 120 },
  skelWrap: { paddingTop: 8 },
  footer: { paddingVertical: 20, alignItems: 'center' },
  endText: { fontSize: typography.caption.size, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
