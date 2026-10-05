import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import type { DayPoint } from '@/entities/analytics';

export function DayBars({ daily }: { daily: DayPoint[] }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  if (!daily.length) return null;
  const max = Math.max(1, ...daily.map((d) => d.revenue));
  return (
    <Card>
      <Text style={[styles.title, { color: colors.ink }]}>{t('more.weekByDay')}</Text>
      <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('more.revPerDay')}</Text>
      <View style={styles.bars}>
        {daily.map((d) => (
          <View key={d.date} style={styles.col}>
            <Text style={[styles.amt, { color: colors.inkSoft }]} numberOfLines={1}>
              {d.revenue >= 1000 ? `${Math.round(d.revenue / 1000)}k` : Math.round(d.revenue)}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: d.day === 'Friday' ? colors.primary : colors.ink,
                    height: `${Math.max(4, (d.revenue / max) * 100)}%` as `${number}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.day, { color: colors.inkSoft }]}>{d.day.slice(0, 3)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.h2.size, fontWeight: '700' as const, fontFamily: fontFamilies.display },
  sub: { fontSize: typography.caption.size, marginTop: 2, marginBottom: 14 },
  bars: { flexDirection: 'row', gap: 6 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  amt: { fontSize: typography.micro.size, fontWeight: '700' as const },
  track: { height: 110, width: '100%', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  fill: { width: '100%', borderRadius: 8 },
  day: { fontSize: typography.micro.size, fontWeight: '600' as const },
});
