import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { weekRangeLabel } from '../week';

interface Props {
  week: string;
  onChange: (week: string) => void;
  shift: (week: string, weeks: number) => string;
}

export function WeekStepper({ week, onChange, shift }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const arrow = (dir: -1 | 1) => (
    <Pressable
      onPress={() => onChange(shift(week, dir))}
      hitSlop={12}
      style={({ pressed }) => [styles.arrow, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}
      accessibilityLabel={dir === -1 ? t('more.prevWeek') : t('more.nextWeek')}
    >
      {dir === -1 ? <ChevronLeft size={16} color={colors.ink} /> : <ChevronRight size={16} color={colors.ink} />}
    </Pressable>
  );
  return (
    <View style={styles.row}>
      {arrow(-1)}
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: colors.ink }]}>{weekRangeLabel(week)}</Text>
        <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('more.satFri')}</Text>
      </View>
      {arrow(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  labelWrap: { alignItems: 'center' },
  label: { fontSize: typography.h2.size, fontWeight: '700' as const },
  sub: { fontSize: typography.micro.size, marginTop: 2 },
});
