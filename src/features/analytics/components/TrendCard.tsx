import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import type { HistoryWeek } from '@/entities/analytics';

const CHART_W = 320;
const CHART_H = 150;
const PAD_L = 8;
const PAD_B = 18;

function shortTk(v: number) {
  if (Math.abs(v) >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return `${Math.round(v)}`;
}

function weekLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function TrendCard({ weeks }: { weeks: HistoryWeek[] }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  if (weeks.length < 2) return null;

  const max = Math.max(1, ...weeks.map((w) => Math.max(w.revenue, w.profit)));
  const n = weeks.length;
  const slot = (CHART_W - PAD_L * 2) / n;
  const barW = Math.max(6, Math.min(22, slot * 0.52));
  const y = (v: number) => CHART_H - PAD_B - (Math.max(0, v) / max) * (CHART_H - PAD_B - 8);
  const cx = (i: number) => PAD_L + slot * i + slot / 2;

  const profitPts = weeks.map((w, i) => `${cx(i)},${y(w.profit)}`).join(' ');

  return (
    <Card>
      <Text style={[styles.title, { color: colors.ink }]}>
        {t('more.trendTitle')}
      </Text>
      <Text style={[styles.sub, { color: colors.inkSoft }]}>
        {t('more.trendSub', { n: weeks.length })}
      </Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.ink }]} />
          <Text style={[styles.legendText, { color: colors.inkSoft }]}>{t('more.kpiRevenue')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.inkSoft }]}>{t('more.kpiProfit')}</Text>
        </View>
        <Text style={[styles.maxLabel, { color: colors.inkSoft }]}>
          {shortTk(max)}
        </Text>
      </View>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Line
          x1={PAD_L}
          x2={CHART_W - PAD_L}
          y1={CHART_H - PAD_B}
          y2={CHART_H - PAD_B}
          stroke={colors.border}
          strokeWidth={1}
        />
        {weeks.map((w, i) => (
          <Rect
            key={w.weekStart}
            x={cx(i) - barW / 2}
            y={y(w.revenue)}
            width={barW}
            height={Math.max(2, CHART_H - PAD_B - y(w.revenue))}
            rx={3}
            fill={i === n - 1 ? colors.primary : colors.ink}
            opacity={i === n - 1 ? 1 : 0.75}
          />
        ))}
        <Polyline points={profitPts} fill="none" stroke={colors.primary} strokeWidth={2} />
        {weeks.map((w, i) =>
          i === 0 || i === n - 1 ? (
            <SvgText
              key={`l-${w.weekStart}`}
              x={cx(i)}
              y={CHART_H - 4}
              fontSize={9}
              fill={colors.inkSoft}
              textAnchor="middle"
            >
              {weekLabel(w.weekStart)}
            </SvgText>
          ) : null
        )}
      </Svg>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.h2.size, fontWeight: '700' as const, fontFamily: fontFamilies.display },
  sub: { fontSize: typography.caption.size, marginTop: 2, marginBottom: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600' as const },
  maxLabel: { marginLeft: 'auto', fontSize: 10, fontWeight: '700' as const },
});
