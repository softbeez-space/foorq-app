import { View, Text, Switch, StyleSheet } from 'react-native';
import { Banknote, Smartphone, Landmark, type LucideIcon } from 'lucide-react-native';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { ToggleSetting } from './ToggleSetting';

interface Props {
  enabled: boolean;
  onToggle: () => void;
  payments: Record<string, boolean>;
  onPaymentToggle: (key: string) => void;
}

const METHODS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'bkash', label: 'bKash', icon: Smartphone },
  { key: 'sslcommerz', label: 'SSLCommerz', icon: Landmark },
];

export function PaymentSection({ enabled, onToggle, payments, onPaymentToggle }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View>
      <ToggleSetting
        icon={Banknote}
        title={t('settings.tablePayment')}
        description={t('settings.tablePaymentSub')}
        value={enabled}
        onChange={onToggle}
      />

      {enabled && (
        <View style={[styles.sub, { borderLeftColor: colors.border, backgroundColor: colors.surface2 }]}>
          {METHODS.map(({ key, label, icon: Icon }) => (
            <View key={key} style={[styles.subRow, { borderBottomColor: colors.border }]}>
              <View style={styles.subInfo}>
                <View style={[styles.subIcon, { backgroundColor: colors.surface }]}>
                  <Icon size={14} color={colors.inkSoft} />
                </View>
                <Text style={[styles.subLabel, { color: colors.ink }]}>{label}</Text>
              </View>
              <Switch
                value={payments[key]}
                onValueChange={() => onPaymentToggle(key)}
                trackColor={{ false: colors.surface2, true: colors.primary50 }}
                thumbColor={payments[key] ? colors.primary : colors.inkSoft}
                accessibilityLabel={`${label}, ${payments[key] ? t('settings.enabled') : t('settings.disabled')}`}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sub: {
    marginLeft: 56,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 2,
    borderRadius: 8,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  subIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subLabel: { fontSize: typography.caption.size, fontWeight: '600' },
});
