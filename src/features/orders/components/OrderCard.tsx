import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bike, ChevronRight, Package, UtensilsCrossed, type LucideIcon } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency, formatTime } from '@/shared/format';
import type { Order } from '@/entities/order';
import { useLocale } from '@/i18n/LocaleContext';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const TYPE_META: Record<string, { icon: LucideIcon; color: string; labelKey: string }> = {
  'dine-in': { icon: UtensilsCrossed, color: '#F97316', labelKey: 'orders.type.dineIn' },
  takeaway: { icon: Package, color: '#06B6D4', labelKey: 'orders.type.takeaway' },
  delivery: { icon: Bike, color: '#8B5CF6', labelKey: 'orders.type.delivery' },
};

/** Shopify order-row pattern: number + total, meta line, status + type strip. */
export function OrderCard({ order, onPress }: OrderCardProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const type = TYPE_META[order.orderType] ?? TYPE_META['dine-in'];
  const TypeIcon = type.icon;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.75 }}>
      <Card style={styles.card}>
        <View style={styles.top}>
          <Text style={[styles.orderNumber, { color: colors.ink, fontFamily: fontFamilies.display }]}>
            #{order.orderNumber}
          </Text>
          <Text style={[styles.total, { color: colors.ink }]}>{formatCurrency(order.total)}</Text>
        </View>
        <Text style={[styles.meta, { color: colors.inkSoft }]} numberOfLines={1}>
          {order.customerName || t('orders.card.guest')} · {t('orders.card.items', { count: itemCount })} · {formatTime(order.createdAt)}
          {order.orderType === 'dine-in' && order.tableNumber ? ` · ${t('kitchen.table', { number: order.tableNumber })}` : ''}
        </Text>
        <View style={[styles.strip, { borderTopColor: colors.border }]}>
          <StatusBadge status={order.status} />
          <View style={styles.typeWrap}>
            <TypeIcon size={13} color={type.color} />
            <Text style={[styles.typeText, { color: colors.inkSoft }]}>{t(type.labelKey)}</Text>
          </View>
          <ChevronRight size={16} color={colors.inkSoft} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, padding: 16, gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  orderNumber: { fontSize: typography.h1.size },
  total: { fontSize: typography.h1.size, fontWeight: '800' },
  meta: { fontSize: typography.caption.size },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  typeWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  typeText: { fontSize: typography.caption.size, fontWeight: '600' },
});
