import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, LayoutGrid, MoreHorizontal } from 'lucide-react-native';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';

type TabBarProps = {
  state: { routes: { name: string; key: string }[]; index: number };
  navigation: { emit: (e: any) => any; navigate: (name: string) => void };
  descriptors: Record<string, { options: { title?: string } }>;
};

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  menu: UtensilsCrossed,
  operations: LayoutGrid,
  more: MoreHorizontal,
};

const LABEL_KEYS: Record<string, string> = {
  dashboard: 'tabs.home',
  orders: 'tabs.orders',
  menu: 'tabs.menu',
  operations: 'tabs.ops',
  more: 'tabs.more',
};

export function TabBar({ state, navigation }: TabBarProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {state.routes.map((route, i) => {
        const active = i === state.index;
        const Icon = ICONS[route.name] ?? LayoutDashboard;
        const labelKey = LABEL_KEYS[route.name];
        const label = labelKey ? t(labelKey) : route.name;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            hitSlop={4}
          >
            <Icon
              size={22}
              color={active ? colors.primary : colors.inkSoft}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.inkSoft, fontWeight: active ? '700' : '500' },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: typography.micro.size, textAlign: 'center' },
});
