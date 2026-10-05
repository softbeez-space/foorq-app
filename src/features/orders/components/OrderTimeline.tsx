import { StyleSheet, Text, View } from 'react-native';
import { Check, ChefHat, Clock, CookingPot, Hand, Truck } from 'lucide-react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { formatTime } from '@/shared/format';
import type { OrderStatus } from '@/shared/constants/status';
import { useLocale } from '@/i18n/LocaleContext';

interface TimelineStep {
  status: OrderStatus;
  time?: string;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Clock,
  preparing: CookingPot,
  ready: ChefHat,
  served: Hand,
  completed: Check,
  cancelled: Hand,
  delivered: Truck,
};

interface OrderTimelineProps {
  steps: TimelineStep[];
  currentStatus: OrderStatus;
}

export function OrderTimeline({ steps, currentStatus }: OrderTimelineProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const currentIdx = steps.findIndex((s) => s.status === currentStatus);

  return (
    <View style={styles.wrap}>
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const Icon = STATUS_ICONS[step.status] ?? Clock;
        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.column}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: done ? colors.primary : colors.surface2, borderColor: colors.border },
                ]}
              >
                <Icon size={12} color={done ? colors.onPrimary : colors.inkSoft} />
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.line, { backgroundColor: done ? colors.primary : colors.border }]} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, { color: done ? colors.ink : colors.inkSoft }]}>
                {t(`orders.status.${step.status}`)}
              </Text>
              {step.time && (
                <Text style={[styles.time, { color: colors.inkSoft }]}>{formatTime(step.time)}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: 'row', gap: 12 },
  column: { alignItems: 'center', width: 24 },
  dot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  line: { width: 2, flex: 1, minHeight: 24, marginTop: 2 },
  content: { flex: 1, paddingBottom: 20, paddingTop: 2 },
  label: { fontSize: typography.body.size, fontWeight: '600' },
  time: { fontSize: typography.caption.size, marginTop: 2 },
});
