import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { Button } from '@/ui/Button';
import { SegmentedControl } from '@/ui/SegmentedControl';
import type { PlanConfig } from '@/entities/billing';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentTier: string;
  allowedUpgrades: PlanConfig[];
  upgrading: boolean;
  onUpgrade: (tier: string, cycle: string) => void;
}

export function UpgradeSheet({ visible, onClose, currentTier, allowedUpgrades, upgrading, onUpgrade }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [annual, setAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  if (!visible) return null;

  const getPrice = (plan: PlanConfig): number => {
    if (plan.priceMonthly === 0) return 0;
    return annual ? plan.priceAnnual : plan.priceMonthly;
  };

  const getPriceLabel = (plan: PlanConfig): string => {
    if (plan.priceMonthly === 0) return t('billing.free');
    const price = getPrice(plan);
    const cycle = annual ? t('billing.perYear') : t('billing.perMonth');
    return `৳${price.toLocaleString()}${cycle}`;
  };

  const canUpgrade = !!selectedTier && selectedTier !== currentTier && !upgrading;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.ink }]}>{t('billing.upgradePlan')}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={22} color={colors.inkSoft} />
          </Pressable>
        </View>

        <View style={styles.toggleWrap}>
          <SegmentedControl
            segments={[t('billing.monthly'), t('billing.annual')]}
            index={annual ? 1 : 0}
            onChange={(i) => setAnnual(i === 1)}
          />
        </View>

        <ScrollView contentContainerStyle={styles.planList} showsVerticalScrollIndicator={false}>
          {allowedUpgrades.map((plan) => {
            const isSelected = selectedTier === plan.tier;
            const isCurrent = plan.tier === currentTier;

            return (
              <Pressable
                key={plan.tier}
                onPress={() => !isCurrent && setSelectedTier(plan.tier)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : isCurrent ? colors.border : 'transparent',
                  },
                ]}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planName, { color: colors.ink }]}>{plan.name}</Text>
                    <Text style={[styles.planDesc, { color: colors.inkSoft }]}>{plan.description}</Text>
                  </View>
                  <Text style={[styles.planPrice, { color: colors.ink }]}>{getPriceLabel(plan)}</Text>
                </View>
                {plan.features.map((feat) => (
                  <View key={feat} style={styles.featRow}>
                    <Check size={14} color={colors.lime} />
                    <Text style={[styles.featText, { color: colors.inkSoft }]}>
                      {feat === 'qrMenu' ? t('billing.featQr') :
                       feat === 'tableOrdering' ? t('billing.featTable') :
                       feat === 'analytics' ? t('billing.featAnalytics') :
                       feat === 'crmLoyalty' ? t('billing.featCrm') : feat}
                    </Text>
                  </View>
                ))}
                {isCurrent && (
                  <Text style={[styles.currentBadge, { color: colors.primaryText }]}>{t('billing.currentPlanBadge')}</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Button
            onPress={() => selectedTier && onUpgrade(selectedTier, annual ? 'annual' : 'monthly')}
            loading={upgrading}
            disabled={!canUpgrade}
            size="lg"
          >
            {upgrading ? t('billing.processing') : t('billing.upgradeCta')}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: typography.h1.size, fontWeight: '700' },
  toggleWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  planList: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  planCard: { padding: 16, borderRadius: 16, borderWidth: 2 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: typography.h2.size, fontWeight: '700' },
  planDesc: { fontSize: typography.caption.size, marginTop: 2 },
  planPrice: { fontSize: typography.h2.size, fontWeight: '800', fontFamily: 'monospace' },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  featText: { fontSize: typography.caption.size },
  currentBadge: { fontSize: typography.caption.size, fontWeight: '700', marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
