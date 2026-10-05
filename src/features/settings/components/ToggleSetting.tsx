import { View, Text, Switch, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleSetting({ icon: Icon, title, description, value, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Icon size={20} color={colors.inkSoft} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.desc, { color: colors.inkSoft }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surface2, true: colors.primary50 }}
        thumbColor={value ? colors.primary : colors.inkSoft}
        accessibilityLabel={`${title}, ${value ? t('settings.on') : t('settings.off')}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: typography.body.size, fontWeight: '600' },
  desc: { fontSize: typography.caption.size, marginTop: 2 },
});
