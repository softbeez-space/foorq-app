import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Lock, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useAuthStore } from '@/features/auth/store';
import { useBranchStore, useSelectedBranch } from '@/features/branches/store';
import {
  useActionChecks,
  useBranchScores,
  useForecast,
  useGenerateAi,
  useHistory,
  usePulse,
  useWeeklyReport,
} from '../hooks';
import { useMyPlan } from '@/features/billing/hooks';
import { isWednesday, saturdayOfWeek, shiftWeek } from '../week';
import { WeekStepper } from '../components/WeekStepper';
import { KpiGrid } from '../components/KpiGrid';
import { AiSummaryCard } from '../components/AiSummaryCard';
import { ActionsCard, ProblemsCard, WinsCard } from '../components/HighlightsList';
import { DayBars } from '../components/DayBars';
import { TopItemsCard } from '../components/TopItemsCard';
import { TrendCard } from '../components/TrendCard';
import { ForecastStrip, PulseBanner } from '../components/PulseAndForecast';
import { BranchRanks } from '../components/BranchRanks';
import { ShareRow } from '../components/ShareRow';

export function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branch = useSelectedBranch();
  const branches = useBranchStore((s) => s.branches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const role = useAuthStore((s) => s.user?.role);
  const canGenerate = role === 'owner' || role === 'manager';

  const [week, setWeek] = useState(() => saturdayOfWeek());
  const [pulseDismissed, setPulseDismissed] = useState(false);

  const branchId = branch?._id ?? null;
  const weekly = useWeeklyReport(branchId, week);
  const pulse = usePulse(branchId, isWednesday() && !pulseDismissed);
  const forecast = useForecast(branchId);
  const history = useHistory(branchId);
  const scores = useBranchScores(week, canGenerate && branches.length > 1);
  const prevWeek = shiftWeek(week, -1);
  const prev = useWeeklyReport(branchId, prevWeek);

  const generate = useGenerateAi(branchId, week);
  const checks = useActionChecks(branchId, week);
  const { data: myPlan } = useMyPlan();

  const report = weekly.data;
  const facts = report?.facts;

  const onGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: () => {},
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('more.aiReportFallback');
        Alert.alert(t('more.aiReportAlert'), msg);
      },
    });
  };

  const onToggleCheck = (title: string, done: boolean) => {
    const base =
      report?.actionChecklist?.length
        ? report.actionChecklist
        : (report?.highlights.actions ?? []).map((a) => ({ ...a, done: false }));
    checks.mutate(base.map((c) => ({ title: c.title, done: c.title === title ? done : c.done })));
  };

  const headerRight = canGenerate ? (
    <Button
      variant="secondary"
      shape="pill"
      size="md"
      loading={generate.isPending}
      disabled={!facts || facts.kpis.orders === 0}
      onPress={onGenerate}
      leftIcon={<Sparkles size={14} />}
    >
      {report?.source === 'ai' ? t('more.regenerate') : t('more.aiReport')}
    </Button>
  ) : undefined;

  if (!branch) {
    return (
      <Screen>
        <ScreenHeader title={t('more.analyticsTitle')} />
        <EmptyState title={t('more.noBranchSel')} subtitle={t('more.noBranchSelSub')} />
      </Screen>
    );
  }

  if (myPlan && !(myPlan.plan?.features || []).includes('analytics')) {
    return (
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <ScreenHeader title={t('more.analyticsTitle')} />
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Card style={{ alignItems: 'center', paddingVertical: 36, gap: 10 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.surface2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={24} color={colors.inkSoft} />
            </View>
            <Text
              style={{ fontSize: typography.h2.size, fontWeight: '700', fontFamily: fontFamilies.display, color: colors.ink, textAlign: 'center' }}
            >
              {t('more.lockedTitle')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.inkSoft, textAlign: 'center' }}>
              {t('more.lockedSub')}
            </Text>
            <Button shape="pill" onPress={() => router.push('/more/billing' as any)}>
              {t('more.upgradeNow')}
            </Button>
          </Card>
        </View>
      </Screen>
    );
  }

  if (weekly.isError) {
    return (
      <Screen>
        <ScreenHeader title={t('more.analyticsTitle')} />
        <EmptyState
          title={t('more.reportError')}
          subtitle={t('more.reportErrorSub')}
          action={<Button onPress={() => weekly.refetch()}>{t('more.retry')}</Button>}
        />
      </Screen>
    );
  }

  if (weekly.isLoading || !report || !facts) {
    return (
      <Screen>
        <ScreenHeader title={t('more.analyticsTitle')} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const prevList = prev.data?.actionChecklist ?? [];
  const prevDone = prevList.filter((c) => c.done).length;

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.weeklyReport')} right={headerRight} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <WeekStepper week={week} onChange={setWeek} shift={shiftWeek} />

        {facts.kpis.orders === 0 ? (
          <EmptyState
            title={t('more.noSales')}
            subtitle={t('more.noSalesSub')}
          />
        ) : (
          <>
            {pulse.data ? <PulseBanner pulse={pulse.data} onDismiss={() => setPulseDismissed(true)} /> : null}

            <KpiGrid kpis={facts.kpis} deltas={facts.deltas} />

            {report.source === 'ai' && report.aiReport ? (
              <AiSummaryCard
                summaryEn={report.aiReport.summaryEn}
                summaryBn={report.aiReport.summaryBn}
                generatedAt={report.aiGeneratedAt}
              />
            ) : null}

            <WinsCard items={report.highlights.wins} />
            <ProblemsCard items={report.highlights.problems} />
            <ActionsCard
              actions={report.highlights.actions}
              checklist={report.actionChecklist ?? []}
              onToggle={onToggleCheck}
            />

            {prevList.length > 0 ? (
              <Card>
                <Text style={[styles.followTitle, { color: colors.ink }]}>
                  {t('more.lastWeekDone', { done: prevDone, total: prevList.length })}
                </Text>
                <Text style={[styles.followSub, { color: colors.inkSoft }]}>
                  {typeof facts.deltas.revenue === 'number'
                    ? facts.deltas.revenue >= 0
                      ? t('more.revUp', { pct: `+${facts.deltas.revenue.toFixed(1)}%` })
                      : t('more.revDown', { pct: `${facts.deltas.revenue.toFixed(1)}%` })
                    : t('more.keepStreak')}
                </Text>
                <Pressable onPress={() => setWeek(prevWeek)} hitSlop={8}>
                  <Text style={[styles.link, { color: colors.primary }]}>{t('more.reviewLastWeek')}</Text>
                </Pressable>
              </Card>
            ) : null}

            <DayBars daily={facts.daily ?? []} />

            {history.data && history.data.length > 1 ? (
              <TrendCard weeks={history.data} />
            ) : null}

            <TopItemsCard items={facts.topItems ?? []} />

            {forecast.data ? (
              <ForecastStrip
                projected={forecast.data.projectedRevenue}
                low={forecast.data.low}
                high={forecast.data.high}
                orders={forecast.data.projectedOrders}
                trend={forecast.data.trend}
                weeksUsed={forecast.data.weeksUsed}
              />
            ) : null}

            {canGenerate && scores.data && scores.data.length > 1 ? (
              <BranchRanks scores={scores.data} selectedBranchId={branchId} onSelect={setBranch} />
            ) : null}

            <ShareRow report={report} branchName={branch.name} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  followTitle: { fontSize: typography.body.size, fontWeight: '700' as const },
  followSub: { fontSize: typography.caption.size, lineHeight: 19, marginTop: 4 },
  link: { fontSize: typography.caption.size, fontWeight: '700' as const, marginTop: 10 },
});
