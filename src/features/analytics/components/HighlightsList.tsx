import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Check, Target, Trophy } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import type { ActionCheck, InsightItem } from '@/entities/analytics';

export function WinsCard({ items }: { items: InsightItem[] }) {
  const { t } = useLocale();
  return (
    <InsightCard
      title={t('more.wins')}
      subtitle={t('more.winsSub')}
      icon={<Trophy size={16} color="#3F6212" />}
      tint="#ECFCCB"
      items={items}
      empty={t('more.noWins')}
    />
  );
}

export function ProblemsCard({ items }: { items: InsightItem[] }) {
  const { t } = useLocale();
  return (
    <InsightCard
      title={t('more.problems')}
      subtitle={t('more.problemsSub')}
      icon={<AlertTriangle size={16} color="#BE123C" />}
      tint="#FFE4E6"
      items={items}
      empty={t('more.noFlags')}
    />
  );
}

function InsightCard({
  title,
  subtitle,
  icon,
  tint,
  items,
  empty,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tint: string;
  items: InsightItem[];
  empty: string;
}) {
  const { colors } = useTheme();
  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: tint }]}>{icon}</View>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>{subtitle}</Text>
        </View>
      </View>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.inkSoft }]}>{empty}</Text>
      ) : (
        items.map((i) => (
          <View key={i.title} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: colors.inkSoft }]} />
            <View style={styles.textWrap}>
              <Text style={[styles.itemTitle, { color: colors.ink }]}>{i.title}</Text>
              <Text style={[styles.itemDetail, { color: colors.inkSoft }]}>{i.detail}</Text>
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

export function ActionsCard({
  actions,
  checklist,
  onToggle,
}: {
  actions: InsightItem[];
  checklist: ActionCheck[];
  onToggle: (title: string, done: boolean) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const rows = checklist.length > 0 ? checklist : actions.map((a) => ({ ...a, done: false }));
  const done = rows.filter((r) => r.done).length;
  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.ink }]}>
          <Target size={16} color="#fff" />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>{t('more.nextWeekCard')}</Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>
            {checklist.length > 0 ? t('more.tickOff', { done, total: rows.length }) : t('more.threeThings')}
          </Text>
        </View>
      </View>
      {rows.map((r) => (
        <Pressable
          key={r.title}
          onPress={() => onToggle(r.title, !r.done)}
          style={({ pressed }) => [
            styles.check,
            { backgroundColor: r.done ? colors.successBg : colors.surface2, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View
            style={[
              styles.box,
              {
                borderColor: r.done ? colors.successText : colors.border,
                backgroundColor: r.done ? colors.successText : 'transparent',
              },
            ]}
          >
            {r.done ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
          </View>
          <View style={styles.textWrap}>
            <Text
              style={[
                styles.itemTitle,
                { color: r.done ? colors.inkSoft : colors.ink },
                r.done && styles.struck,
              ]}
            >
              {r.title}
            </Text>
            <Text style={[styles.itemDetail, { color: colors.inkSoft }]}>{r.detail}</Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.h2.size, fontWeight: '700' as const },
  sub: { fontSize: typography.caption.size, marginTop: 1 },
  empty: { fontSize: typography.body.size },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, opacity: 0.4 },
  textWrap: { flex: 1 },
  itemTitle: { fontSize: typography.body.size, fontWeight: '600' as const, lineHeight: 21 },
  itemDetail: { fontSize: typography.caption.size, lineHeight: 19, marginTop: 2 },
  check: { flexDirection: 'row', gap: 10, borderRadius: 14, padding: 12, marginBottom: 8 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  struck: { textDecorationLine: 'line-through' },
});
