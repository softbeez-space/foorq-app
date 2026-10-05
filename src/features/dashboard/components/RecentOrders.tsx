import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Bike, ChevronRight, Package, ShoppingBag, UtensilsCrossed, type LucideIcon } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { Badge } from '@/ui/Badge';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { formatCurrency, formatTime } from '@/shared/format';
import { STATUS_COLOR_KEY, ORDER_STATUS_LABEL } from '@/shared/constants/status';
import type { Order } from '@/entities/order';

interface Props {
  orders: Order[];
}

const TYPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  'dine-in': { icon: UtensilsCrossed, color: '#F97316' },
  takeaway: { icon: Package, color: '#06B6D4' },
  delivery: { icon: Bike, color: '#8B5CF6' },
};
const TYPE_FALLBACK = { icon: ShoppingBag, color: '#84CC16' };

/** Revolut transaction-row pattern: type icon, order + meta, amount + status. */
export function RecentOrders({ orders }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Card style={styles.card} padded={false}>
      <View style={[styles.head, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('tabs.recentOrders')}</Text>
        <Link href="/orders">
          <Text style={[styles.link, { color: colors.primary700 }]}>{t('tabs.viewAll')}</Text>
        </Link>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface2 }]}>
            <ShoppingBag size={24} color={colors.inkSoft} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t('tabs.noOrdersYet')}</Text>
          <Text style={[styles.emptyText, { color: colors.inkSoft }]}>
            {t('tabs.noOrdersSub')}
          </Text>
        </View>
      ) : (
        orders.slice(0, 6).map((o, i) => {
          const meta = TYPE_ICON[(o.orderType ?? '').toLowerCase()] ?? TYPE_FALLBACK;
          const Icon = meta.icon;
          const last = i === Math.min(orders.length, 6) - 1;
          return (
            <Pressable
              key={o._id}
              onPress={() => router.push(`/orders/${o._id}` as any)}
              style={({ pressed }) => [
                styles.row,
                !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel={t('tabs.orderLabel', { num: o.orderNumber })}
            >
              <View style={[styles.icon, { backgroundColor: `${meta.color}1F` }]}>
                <Icon size={19} color={meta.color} />
              </View>
              <View style={styles.middle}>
                <Text style={[styles.no, { color: colors.ink }]}>#{o.orderNumber}</Text>
                <Text style={[styles.meta, { color: colors.inkSoft }]} numberOfLines={1}>
                  {o.customerName || t('tabs.guest')} · {o.orderType} · {formatTime(o.createdAt)}
                </Text>
                <View style={styles.badgeRow}>
                  <Badge label={ORDER_STATUS_LABEL[o.status]} color={STATUS_COLOR_KEY[o.status]} />
                </View>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.ink }]}>
                  {formatCurrency(o.total)}
                </Text>
                <ChevronRight size={16} color={colors.inkSoft} />
              </View>
            </Pressable>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: typography.h2.size, fontWeight: '700' },
  link: { fontSize: typography.caption.size, fontWeight: '700' },
  empty: { padding: 28, alignItems: 'center', gap: 6 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: typography.body.size, fontWeight: '700' },
  emptyText: { fontSize: typography.caption.size, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  icon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  middle: { flex: 1, gap: 2 },
  no: { fontSize: typography.body.size, fontWeight: '800' },
  meta: { fontSize: typography.caption.size },
  badgeRow: { flexDirection: 'row', marginTop: 3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amount: { fontSize: typography.body.size, fontWeight: '800' },
});
