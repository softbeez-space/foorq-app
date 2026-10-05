import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GitBranch } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import type { BranchScore } from '@/entities/analytics';

export function BranchRanks({
  scores,
  selectedBranchId,
  onSelect,
}: {
  scores: BranchScore[];
  selectedBranchId?: string | null;
  onSelect: (branchId: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const max = Math.max(1, ...scores.map((s) => s.revenue));
  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.surface2 }]}>
          <GitBranch size={16} color={colors.inkSoft} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>{t('more.branchesWeek')}</Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('more.rankedBy')}</Text>
        </View>
      </View>
      {scores.map((s) => {
        const active = s.branchId === selectedBranchId;
        return (
          <Pressable
            key={s.branchId}
            onPress={() => onSelect(s.branchId)}
            style={({ pressed }) => [
              styles.row,
              active && { backgroundColor: colors.ink },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.rank, { color: active ? '#fff' : s.rank === 1 ? colors.primary : colors.inkSoft }]}>
              {s.rank}
            </Text>
            <View style={styles.mid}>
              <Text style={[styles.name, { color: active ? '#fff' : colors.ink }]} numberOfLines={1}>
                {s.branchName}
              </Text>
              <View style={[styles.bar, { backgroundColor: active ? '#ffffff2e' : colors.surface2 }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: active ? '#fff' : colors.primary,
                      width: `${Math.max(4, (s.revenue / max) * 100)}%` as `${number}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.right}>
              <Text style={[styles.rev, { color: active ? '#fff' : colors.ink }]}>
                {formatCurrency(s.revenue)}
              </Text>
              <Text style={[styles.ord, { color: active ? '#ffffff99' : colors.inkSoft }]}>
                {typeof s.revenueDelta === 'number'
                  ? `${s.revenueDelta >= 0 ? '+' : ''}${s.revenueDelta.toFixed(1)}%`
                  : t('more.ordersCount', { count: s.orders })}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.h2.size, fontWeight: '700' as const },
  sub: { fontSize: typography.caption.size, marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 10 },
  rank: { width: 20, textAlign: 'center', fontSize: typography.h2.size, fontWeight: '700' as const },
  mid: { flex: 1, gap: 6 },
  name: { fontSize: typography.body.size, fontWeight: '600' as const },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  right: { alignItems: 'flex-end' },
  rev: { fontSize: typography.caption.size, fontWeight: '700' as const },
  ord: { fontSize: typography.micro.size, marginTop: 2 },
});
