import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { useLocale } from '@/i18n/LocaleContext';
import { useAuthStore } from '@/features/auth/store';
import { useMyPlan, useUsage, useInitPayment } from '../hooks';
import { CurrentPlanCard } from '../components/CurrentPlanCard';
import { UsageBars } from '../components/UsageBars';
import { PaymentHistory } from '../components/PaymentHistory';
import { UpgradeSheet } from '../components/UpgradeSheet';

export function BillingScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === 'owner';
  const { data, isLoading, error } = useMyPlan();
  const { data: usage } = useUsage();
  const paymentMutation = useInitPayment();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleUpgrade = useCallback(
    async (tier: string, cycle: string) => {
      if (!isOwner) {
        Alert.alert(t('billing.restricted'), t('billing.restrictedBody'));
        return;
      }
      try {
        const result = await paymentMutation.mutateAsync({ plan: tier, cycle });
        const authResult = await WebBrowser.openAuthSessionAsync(
          result.gatewayUrl,
          'foorq://billing/callback',
        );

        if (authResult.type === 'success') {
          setShowUpgrade(false);
          setTimeout(() => {
            Alert.alert(t('billing.paySuccess'), t('billing.paySuccessBody'));
          }, 500);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? t('billing.upgradeFailedBody');
        Alert.alert(t('billing.upgradeFailed'), msg);
      }
    },
    [paymentMutation, isOwner, t],
  );

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('billing.title')} />
        <View style={styles.center} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <ScreenHeader title={t('billing.title')} />
        <EmptyState
          icon={<View style={[styles.errIcon, { backgroundColor: colors.dangerBg }]} />}
          title={t('billing.loadError')}
          subtitle={t('billing.loadErrorSub')}
        />
      </Screen>
    );
  }

  const { subscription, plan, allowedUpgrades } = data;
  const hasUpgrades = allowedUpgrades.length > 0;

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('billing.title')} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <CurrentPlanCard subscription={subscription} plan={plan} />
        <View style={{ marginTop: 16 }}>
          <UsageBars plan={plan} usage={usage} />
        </View>
        {hasUpgrades && isOwner && (
          <View style={{ marginTop: 16 }}>
            <Button onPress={() => setShowUpgrade(true)} variant="primary">
              {t('billing.upgradePlan')}
            </Button>
          </View>
        )}
        {hasUpgrades && !isOwner && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: colors.inkSoft, fontSize: 13 }}>
              {t('billing.ownerOnly')}
            </Text>
          </View>
        )}
        <View style={{ marginTop: 16 }}>
          <PaymentHistory payments={subscription.paymentHistory ?? []} />
        </View>
      </ScrollView>

      <UpgradeSheet
        visible={showUpgrade && isOwner}
        onClose={() => setShowUpgrade(false)}
        currentTier={subscription.plan}
        allowedUpgrades={allowedUpgrades}
        upgrading={paymentMutation.isPending}
        onUpgrade={handleUpgrade}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errIcon: { width: 48, height: 48, borderRadius: 24 },
});
