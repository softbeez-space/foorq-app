import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, CookingPot, RefreshCw, Check, ScanLine } from 'lucide-react-native';
import type { Order } from '@/entities/order';
import type { OrderStatus } from '@/shared/constants/status';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Skeleton } from '@/ui/Skeleton';
import { PulseDot } from '@/features/orders/components/PulseDot';
import { useHeldOrders, useAcceptOrder, useOrders, useUpdateOrderStatus } from '@/features/orders/hooks';
import { useTheme } from '@/ui/theme/useTheme';
import { radii, spacing, typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import { pickupToken } from '@/shared/token';
import { useLocale } from '@/i18n/LocaleContext';

const COLUMNS: { key: 'pending' | 'preparing' | 'ready' }[] = [
  { key: 'pending' },
  { key: 'preparing' },
  { key: 'ready' },
];

function elapsed(createdAt: string, now: number): { mins: number; label: string } {
  const ms = now - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return { mins, label: `${mins}m` };
  return { mins, label: `${Math.floor(mins / 60)}h ${mins % 60}m` };
}

function overdueLevel(mins: number): 'ok' | 'warn' | 'overdue' {
  if (mins <= 10) return 'ok';
  if (mins <= 20) return 'warn';
  return 'overdue';
}

function KitchenCard({
  order,
  now,
  onAdvance,
  onPressDetail,
}: {
  order: Order;
  now: number;
  onAdvance: () => void;
  onPressDetail: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const time = useMemo(() => elapsed(order.createdAt, now), [order.createdAt, now]);
  const level = overdueLevel(time.mins);
  const advanceKey = order.status === 'pending' || order.status === 'confirmed'
    ? 'cook'
    : order.status === 'preparing'
      ? 'ready'
      : 'serve';
  const advanceA11y = order.status === 'pending' || order.status === 'confirmed'
    ? t('kitchen.a11yStartCooking')
    : order.status === 'preparing'
      ? t('kitchen.a11yMarkReady')
      : t('kitchen.a11yServe');

  const statusColors = {
    overdue: { accent: colors.rose, bg: colors.dangerBg, text: colors.dangerText },
    warn: { accent: colors.amber, bg: colors.warningBg, text: colors.warningText },
    ok: { accent: colors.primary, bg: colors.surface2, text: colors.inkSoft },
  }[level];

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.card }]}>
      <View style={styles.cardTop}>
        <Text style={[styles.cardOrderNum, { color: colors.ink }]} numberOfLines={1}>
          {order.orderType === 'takeaway' ? `T${pickupToken(order.orderNumber)}` : `#${order.orderNumber}`}
          {order.orderType === 'dine-in' && order.tableNumber ? ` · T${order.tableNumber}` : ''}
        </Text>
        <View style={styles.elapsedRow}>
          {level === 'overdue' && <PulseDot color={colors.rose} size={6} />}
          <Text style={[styles.elapsed, { color: level === 'ok' ? colors.inkSoft : statusColors.text }]}>
            {time.label}
          </Text>
        </View>
      </View>

      {/* Items */}
      <Pressable onPress={onPressDetail} style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.itemRow,
              index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
            ]}
          >
            <Text style={[styles.itemNameText, { color: colors.ink }]} numberOfLines={2}>
              {item.quantity}x {item.name}
            </Text>
            {!!item.specialInstructions && (
              <Text style={[styles.itemNote, { color: colors.warningText }]} numberOfLines={1}>
                {item.specialInstructions}
              </Text>
            )}
          </View>
        ))}
      </Pressable>

      {/* Footer + one clear action */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.inkSoft }]} numberOfLines={1}>
          {order.customerName ?? t('kitchen.guest')} · {formatCurrency(order.total)}
        </Text>
        <Pressable
          onPress={onAdvance}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.primary, borderRadius: radii.pill, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityLabel={advanceA11y}
        >
          <Text style={[styles.actionButtonText, { color: colors.onPrimary }]}>
            {advanceKey === 'cook' ? t('kitchen.cook') : advanceKey === 'ready' ? t('kitchen.ready') : t('kitchen.serve')}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function KitchenScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const { data, isLoading, refetch } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const { data: heldOrders = [], refetch: refetchHeld } = useHeldOrders();
  const accept = useAcceptOrder();
  const [activeCol, setActiveCol] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList>(null);

  const isTablet = width >= 768;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const orders = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((p) => p.orders);
  }, [data]);

  const columnOrders: any = useMemo(() => ({
    // Queued = accepted work only; unaccepted pending lives in Incoming above
    pending: orders.filter((o) => o.status === 'confirmed' || (o.status === 'pending' && ((o as any).acceptedAt || !(o as any).requiresConfirmation))),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready: orders.filter((o) => o.status === 'ready'),
  }), [orders]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchHeld()]);
      setNow(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchHeld]);

  const handleAdvance = useCallback((order: Order) => {
    const next: Record<string, OrderStatus> = {
      pending: 'preparing',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'served',
    };
    const s = next[order.status];
    if (s) updateStatus.mutate({ id: order._id, status: s });
  }, [updateStatus]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Skeleton width="100%" height={160} radius={radii.card} style={{ marginBottom: spacing.md }} />
          <Skeleton width="100%" height={140} radius={radii.card} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Top Bar Navigation Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={[styles.headerIconCircle, { backgroundColor: colors.surface2, borderRadius: radii.pill }]}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={[styles.topTitle, { color: colors.ink }]}>{t('kitchen.title')}</Text>
          <View style={[styles.livePill, { backgroundColor: colors.successBg }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.successText }]} />
            <Text style={[styles.liveText, { color: colors.successText }]}>
              {t('kitchen.live', { count: columnOrders.pending.length + columnOrders.preparing.length + columnOrders.ready.length })}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            hitSlop={12}
            onPress={handleRefresh}
            disabled={refreshing}
            style={[styles.headerIconCircle, { backgroundColor: colors.surface2, borderRadius: radii.pill }]}
            accessibilityLabel={t('kitchen.refresh')}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.ink} />
            ) : (
              <RefreshCw size={17} color={colors.ink} />
            )}
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={() => router.push('/orders/scan' as any)}
            style={[styles.headerIconCircle, { backgroundColor: colors.primary, borderRadius: radii.pill }]}
            accessibilityLabel={t('kitchen.scanPickup')}
          >
            <ScanLine size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Tabs Menu Section */}
      {!isTablet && (
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {COLUMNS.map((col, i) => {
            const count = columnOrders[col.key].length;
            const isActive = activeCol === i;
            const label = t(`orders.status.${col.key}`);
            return (
              <Pressable
                key={col.key}
                onPress={() => {
                  setActiveCol(i);
                  listRef.current?.scrollToIndex({ index: i, animated: true });
                }}
                style={[styles.tab, { backgroundColor: isActive ? colors.primary : colors.surface2, borderRadius: radii.pill }]}
              >
                <Text style={[styles.tabLabel, { color: isActive ? colors.onPrimary : colors.ink }]}>
                  {label}
                </Text>
                <View style={[styles.tabCount, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.surface, borderRadius: radii.pill }]}>
                  <Text style={[styles.tabCountText, { color: isActive ? colors.onPrimary : colors.ink }]}>
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Incoming: approval cards (Instacart pending-approval pattern).
          Rejections happen from order details (reason + guest message). */}
      {heldOrders.length > 0 && (
        <View style={styles.holdWrap}>
          <View style={styles.holdHead}>
            <Text style={[styles.holdTitle, { color: colors.ink }]}>
              {t('kitchen.incoming', { count: heldOrders.length })}
            </Text>
            <Pressable onPress={() => heldOrders.forEach((o) => accept.mutate({ id: o._id }))} hitSlop={8}>
              <Text style={[styles.acceptAll, { color: colors.primary700 }]}>{t('kitchen.acceptAll')}</Text>
            </Pressable>
          </View>
          {heldOrders.map((o) => (
            <Card key={o._id} style={styles.holdCard}>
              <Pressable onPress={() => router.push(`/orders/${o._id}` as any)}>
                <Text style={[styles.holdEyebrow, { color: colors.warningText }]}>
                  {t('kitchen.newOrderWaiting', { elapsed: elapsed(o.createdAt, now).label })}
                </Text>
                <Text style={[styles.holdNum, { color: colors.ink }]}>
                  {o.orderType === 'takeaway' ? t('kitchen.token', { token: pickupToken(o.orderNumber) }) : `#${o.orderNumber}`}
                </Text>
                <Text style={[styles.holdMeta, { color: colors.inkSoft }]} numberOfLines={2}>
                  {o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' · ')}
                </Text>
                <Text style={[styles.holdMeta, { color: colors.inkSoft }]} numberOfLines={1}>
                  {formatCurrency(o.total)}
                  {o.tableNumber ? ` · ${t('kitchen.table', { number: o.tableNumber })}` : ''}
                  {o.customerName ? ` · ${o.customerName.split(' ')[0]}` : ''}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => accept.mutate({ id: o._id })}
                style={({ pressed }) => [
                  styles.holdBtn,
                  { backgroundColor: colors.primary, borderRadius: radii.pill, opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityLabel={t('kitchen.acceptOrderA11y', { number: o.orderNumber })}
              >
                <Check size={15} color={colors.onPrimary} strokeWidth={3} />
                <Text style={[styles.holdBtnText, { color: colors.onPrimary }]}>{t('kitchen.acceptFire')}</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      )}

      {/* Main View Port Lists */}
      <View style={styles.flexView}>
        <FlatList
          ref={listRef}
          data={COLUMNS}
          horizontal={!isTablet}
          pagingEnabled={!isTablet}
          scrollEnabled={!isTablet}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            if (!isTablet) {
              setActiveCol(Math.round(e.nativeEvent.contentOffset.x / width));
            }
          }}
          keyExtractor={(col) => col.key}
          contentContainerStyle={isTablet ? styles.tabletGridContainer : undefined}
          renderItem={({ item: col }) => (
            <View style={[isTablet ? styles.tabletColumn : styles.mobileColumn, { width: isTablet ? undefined : width }]}>
              {isTablet && (
                <View style={[styles.tabletColHeader, { backgroundColor: colors.surface2, borderRadius: radii.card }]}>
                  <Text style={[styles.tabletColTitle, { color: colors.ink }]}>{t(`orders.status.${col.key}`)}</Text>
                  <View style={[styles.countBadge, { backgroundColor: colors.primary, borderRadius: radii.pill }]}>
                    <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: '700' }}>{columnOrders[col.key].length}</Text>
                  </View>
                </View>
              )}
              <FlatList
                data={columnOrders[col.key]}
                keyExtractor={(o) => o._id}
                renderItem={({ item }) => (
                  <KitchenCard
                    order={item}
                    now={now}
                    onAdvance={() => handleAdvance(item)}
                    onPressDetail={() => router.push(`/orders/${item._id}`)}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyCol}>
                    <CookingPot size={24} color={colors.inkSoft} />
                    <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('kitchen.emptyColumn', { status: t(`orders.status.${col.key}`).toLowerCase() })}</Text>
                  </View>
                }
                contentContainerStyle={styles.colList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flexView: { flex: 1 },
  holdWrap: { marginHorizontal: 16, marginTop: 12, gap: 8 },
  holdHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  holdTitle: { fontSize: typography.h2.size, fontWeight: '800' },
  holdCard: { padding: 16, gap: 10 },
  holdEyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  holdNum: { fontSize: typography.displayM.size, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  holdMeta: { fontSize: typography.caption.size, fontWeight: '600', marginTop: 2 },
  holdBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  holdBtnText: { fontSize: typography.body.size, fontWeight: '800' },
  acceptAll: { fontSize: typography.caption.size, fontWeight: '800' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: { alignItems: 'center', gap: 4 },
  topTitle: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: typography.micro.size, fontWeight: '800' },
  loading: { flex: 1, justifyContent: 'center', padding: 20 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  tabLabel: { fontSize: typography.body.size, fontWeight: '600' },
  tabCount: {
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabCountText: { fontSize: typography.micro.size, fontWeight: '700' },
  
  mobileColumn: { paddingHorizontal: 20, paddingTop: 12 },
  tabletGridContainer: { flex: 1, flexDirection: 'row', padding: 16, gap: 16 },
  tabletColumn: { flex: 1, height: '100%' },
  tabletColHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginBottom: 12 },
  tabletColTitle: { fontSize: 16, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2 },

  colList: { paddingBottom: 40 },
  card: { padding: 14, marginBottom: 12, borderLeftWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  elapsedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  elapsed: {
    fontSize: typography.h1.size,
    fontWeight: '800',
  },
  cardOrderNum: {
    fontSize: typography.h1.size,
    fontWeight: '800',
    letterSpacing: -0.5,
    flex: 1,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    paddingVertical: 6,
  },
  itemNameText: {
    fontSize: typography.body.size,
    fontWeight: '600',
  },
  itemNote: { fontSize: typography.caption.size, fontWeight: '600', marginTop: 1 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { fontSize: typography.caption.size, fontWeight: '600', flex: 1 },

  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  actionButtonText: {
    fontSize: typography.caption.size,
    fontWeight: '800',
  },

  emptyCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
  },
  emptyText: { fontSize: typography.body.size },
});