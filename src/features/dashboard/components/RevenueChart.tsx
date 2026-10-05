import { useWindowDimensions, StyleSheet, Text, View } from 'react-native';
import { Circle, Defs, LinearGradient, Path, Rect, Stop, Svg, Text as SvgText } from 'react-native-svg';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import type { DailyRevenuePoint } from '@/entities/dashboard';

interface Props {
  data: DailyRevenuePoint[];
  rangeLabel: string;
}

const CHART_H = 200;

export function RevenueChart({ data, rangeLabel }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { width: windowW } = useWindowDimensions();
  const width = Math.max(windowW - 72, 240);
  const padX = 8;
  const padTop = 16;
  const padBottom = 26;
  const innerW = width - padX * 2;
  const innerH = CHART_H - padTop - padBottom;

  const points = data.map((d) => ({ label: shortDate(d._id), y: d.revenue ?? 0 }));
  const maxY = Math.max(1, ...points.map((p) => p.y));

  const stepX = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: padTop + innerH - (p.y / maxY) * innerH,
  }));

  const linePath = coords.length
    ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
    : '';
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${padTop + innerH} L ${coords[0].x.toFixed(1)} ${padTop + innerH} Z`
    : '';

  const gridLines = [0, 0.5, 1].map((t) => padTop + innerH * t);

  return (
    <Card style={styles.card}>
      <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('tabs.revenueGrowth', { range: rangeLabel })}</Text>
      {points.length > 0 && (
        <View style={styles.heroRow}>
          <Text style={[styles.total, { color: colors.ink, fontFamily: fontFamilies.display }]}>
            {formatCurrency(points.reduce((s, p) => s + p.y, 0))}
          </Text>
          <Text style={[styles.avg, { color: colors.inkSoft }]}>
            {t('tabs.avgDay', { avg: formatCurrency(points.reduce((s, p) => s + p.y, 0) / points.length) })}
          </Text>
        </View>
      )}

      {points.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('tabs.noRevenue')}</Text>
        </View>
      ) : (
        <Svg width={width} height={CHART_H}>
          <Defs>
            <LinearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.28} />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {gridLines.map((y, i) => (
            <Rect key={i} x={padX} y={y} width={innerW} height={1} fill={colors.border} />
          ))}
          <SvgText x={width - padX} y={padTop - 4} fontSize={9} fill={colors.inkSoft} textAnchor="end">
            {formatCurrency(maxY)}
          </SvgText>
          <Path d={areaPath} fill="url(#revFill)" />
          <Path d={linePath} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {coords.length > 0 && (
            <Circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r={4}
              fill={colors.primary}
              stroke={colors.surface}
              strokeWidth={2}
            />
          )}
          {coords.map((c, i) => {
            const label = points[i]?.label ?? '';
            return i % Math.ceil(coords.length / 5 || 1) === 0 ? (
              <SvgText key={i} x={c.x} y={CHART_H - 6} fontSize={9} fill={colors.inkSoft} textAnchor="middle">
                {label}
              </SvgText>
            ) : null;
          })}
        </Svg>
      )}
    </Card>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4, marginBottom: 8 },
  total: { fontSize: 30, lineHeight: 36 },
  avg: { fontSize: typography.caption.size, fontWeight: '600' },
  empty: { height: CHART_H, width: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  emptyText: { fontSize: typography.caption.size, fontWeight: '600' },
});
