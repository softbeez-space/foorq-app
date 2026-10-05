import { StyleSheet, Text, View } from 'react-native';
import { Bike, Package, ShoppingBag, UtensilsCrossed, type LucideIcon } from 'lucide-react-native';
import { Circle, G, Svg, Text as SvgText } from 'react-native-svg';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import type { DashboardStats } from '@/entities/dashboard';

const TYPE_META: Record<string, { color: string; icon: LucideIcon }> = {
  'dine-in': { color: '#F97316', icon: UtensilsCrossed },
  takeaway: { color: '#06B6D4', icon: Package },
  delivery: { color: '#8B5CF6', icon: Bike },
};
const FALLBACK = { color: '#84CC16', icon: ShoppingBag };

interface Props {
  distribution: DashboardStats['orderTypeDistribution'];
}

const SIZE = 180;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function OrderTypeChart({ distribution }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const data = Object.entries(distribution ?? {}).map(([key, d]) => {
    const meta = TYPE_META[key.toLowerCase()] ?? FALLBACK;
    return {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: (d as any).count ?? 0,
      ...meta,
    };
  });
  const total = data.reduce((s, d) => s + d.value, 0);
  let accumulated = 0;

  return (
    <Card style={styles.card}>
      <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('tabs.orderTypes')}</Text>

      <View style={styles.chartWrap}>
        {total === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('tabs.noOrdersChart')}</Text>
          </View>
        ) : (
          <View style={styles.svgWrap}>
            <Svg width={SIZE} height={SIZE}>
              <G rotation={-90} originX={CX} originY={CY}>
                <Circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.surface2} strokeWidth={STROKE} />
                {data.map((d) => {
                  const frac = d.value / total;
                  const len = frac * C;
                  const seg = (
                    <Circle
                      key={d.key}
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={STROKE}
                      strokeDasharray={`${len} ${C - len}`}
                      strokeDashoffset={-accumulated}
                      strokeLinecap="round"
                    />
                  );
                  accumulated += len;
                  return seg;
                })}
              </G>
              <SvgText x={CX} y={CY - 2} fontSize={24} fontWeight="700" fill={colors.ink} textAnchor="middle">
                {total}
              </SvgText>
              <SvgText x={CX} y={CY + 16} fontSize={10} fill={colors.inkSoft} textAnchor="middle">
                {t('tabs.ordersCenter')}
              </SvgText>
            </Svg>
          </View>
        )}
      </View>

      {data.map((d, i) => {
        const Icon = d.icon;
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        return (
          <View
            key={d.key}
            style={[styles.row, i < data.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
          >
            <View style={[styles.icon, { backgroundColor: `${d.color}1F` }]}>
              <Icon size={16} color={d.color} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, { color: colors.ink }]}>{d.name}</Text>
              <Text style={[styles.rowPct, { color: colors.inkSoft }]}>{t('tabs.pctOfOrders', { pct: pct })}</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.ink, fontFamily: fontFamilies.uiBold }]}>
              {d.value}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  chartWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  svgWrap: { width: SIZE, height: SIZE },
  empty: { height: SIZE, width: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.caption.size, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  icon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowInfo: { flex: 1, gap: 1 },
  rowName: { fontSize: typography.body.size, fontWeight: '600' },
  rowPct: { fontSize: typography.caption.size },
  rowValue: { fontSize: typography.h1.size },
});
