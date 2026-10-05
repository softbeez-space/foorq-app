import { Alert, Share, StyleSheet, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { Button } from '@/ui/Button';
import { useLocale } from '@/i18n/LocaleContext';
import { formatCurrency } from '@/shared/format';
import type { WeeklyReport } from '@/entities/analytics';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

function buildShareText(t: TFn, report: WeeklyReport, branchName: string, summary: string): string {
  const k = report.facts.kpis;
  const lines = [
    t('more.shareTitle', { branch: branchName }),
    `${report.weekStart} → ${report.weekEnd}`,
    t('more.shareMeta', { orders: k.orders, rev: formatCurrency(k.revenue), profit: formatCurrency(k.profit) }),
    '',
  ];
  if (report.source === 'ai' && summary) lines.push(summary, '');
  const section = (emoji: string, titleKey: string, items: { title: string; detail: string }[]) => {
    if (!items.length) return;
    lines.push(`${emoji} ${t(titleKey)}`);
    items.forEach((i) => lines.push(`• ${i.title} — ${i.detail}`));
    lines.push('');
  };
  section('✅', 'more.shareWins', report.highlights.wins);
  section('⚠️', 'more.shareProblems', report.highlights.problems);
  section('🎯', 'more.shareNext', report.highlights.actions);
  const text = lines.join('\n').trim();
  return text.length > 1800 ? `${text.slice(0, 1790)}…` : text;
}

export function ShareRow({ report, branchName }: { report: WeeklyReport; branchName: string }) {
  const { t, locale } = useLocale();
  const summary = locale === 'bn' ? (report.aiReport?.summaryBn || report.aiReport?.summaryEn || '') : (report.aiReport?.summaryEn || '');
  const onShare = async () => {
    try {
      await Share.share({ message: buildShareText(t, report, branchName, summary) });
    } catch {
      Alert.alert(t('more.shareFailed'), t('more.shareFailedBody'));
    }
  };
  return (
    <View style={styles.row}>
      <Button variant="outline" shape="pill" onPress={onShare} leftIcon={<Send size={14} />}>
        {t('more.shareReport')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
