import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import type { RankedItem } from '@/entities/analytics';

export function TopItemsCard({ items }: { items: RankedItem[] }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const max = items.length > 0 ? Math.max(...items.map((i) => i.totalRevenue)) : 1;
  return (
    <Card>
      <View style={styles.head}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>{t('more.topItems')}</Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('more.topItemsSub')}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/menu' as any)}
          style={[styles.menuBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.menuText, { color: colors.inkSoft }]}>{t('more.viewMenu')}</Text>
          <ArrowUpRight size={13} color={colors.inkSoft} />
        </Pressable>
      </View>
      {items.slice(0, 6).map((item, idx) => (
        <View key={item._id} style={styles.row}>
          <Text style={[styles.rank, { color: colors.inkSoft }]}>
            {String(idx + 1).padStart(2, '0')}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.name, { color: colors.ink }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.sub2, { color: colors.inkSoft }]} numberOfLines={1}>
              {item.categoryName || 'Menu'} · {t('more.soldSuffix', { n: item.totalQuantity })}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: idx === 0 ? colors.primary : colors.ink,
                    width: `${Math.max(6, (item.totalRevenue / max) * 100)}%` as `${number}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.revenue, { color: colors.ink }]}>
            ৳{Math.round(item.totalRevenue).toLocaleString()}
          </Text>
        </View>
      ))}
      {items.length === 0 && (
        <Text style={[styles.empty, { color: colors.inkSoft }]}>{t('more.noSales')}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: typography.h2.size, fontWeight: '700' as const, fontFamily: fontFamilies.display },
  sub: { fontSize: typography.caption.size, marginTop: 2 },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  menuText: { fontSize: 12, fontWeight: '600' as const },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  rank: { width: 20, fontSize: 11, fontWeight: '700' as const, textAlign: 'center' },
  meta: { flex: 1 },
  name: { fontSize: 13.5, fontWeight: '600' as const },
  sub2: { fontSize: 10, marginTop: 1 },
  track: { height: 4, borderRadius: 9999, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999 },
  revenue: { fontSize: 13, fontWeight: '700' as const },
  empty: { textAlign: 'center', fontSize: 12.5, paddingVertical: 24 },
});
