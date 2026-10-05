import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Users,
  TicketPercent,
  Receipt,
  UserCog,
  BarChart3,
  Settings as SettingsIcon,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  Wallet,
  Gift,
  MessageSquare,
  Palette,
  Printer,
  QrCode,
  type LucideIcon,
} from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Avatar } from '@/ui/Avatar';
import { Badge } from '@/ui/Badge';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { LocaleToggle } from '@/ui/LocaleToggle';
import { useSession } from '@/features/auth/hooks';

interface Item {
  key: string;
  icon: LucideIcon;
  color: string;
}

const GROUPS: { titleKey: string; items: Item[] }[] = [
  {
    titleKey: 'tabs.groupOverview',
    items: [{ key: 'analytics', icon: BarChart3, color: '#06B6D4' }],
  },
  {
    titleKey: 'tabs.groupOperations',
    items: [{ key: 'closeout', icon: Wallet, color: '#0EA5E9' }],
  },
  {
    titleKey: 'tabs.groupMenuGuests',
    items: [
      { key: 'offers', icon: TicketPercent, color: '#8B5CF6' },
      { key: 'customers', icon: Users, color: '#06B6D4' },
      { key: 'loyalty', icon: Gift, color: '#EAB308' },
      { key: 'reviews', icon: MessageSquare, color: '#0EA5E9' },
    ],
  },
  {
    titleKey: 'tabs.groupQrStudio',
    items: [
      { key: 'qrCodes', icon: QrCode, color: '#84CC16' },
      { key: 'qrDesigner', icon: Palette, color: '#A855F7' },
      { key: 'qrFlyers', icon: Printer, color: '#EC4899' },
      { key: 'branches', icon: Store, color: '#52525B' },
    ],
  },
  {
    titleKey: 'tabs.groupManage',
    items: [
      { key: 'expenses', icon: Receipt, color: '#F97316' },
      { key: 'staff', icon: UserCog, color: '#84CC16' },
      { key: 'settings', icon: SettingsIcon, color: '#52525B' },
      { key: 'billing', icon: CreditCard, color: '#F97316' },
      { key: 'help', icon: HelpCircle, color: '#94A3B8' },
    ],
  },
];

const ITEM_LABEL_KEYS: Record<string, string> = {
  branches: 'tabs.itemBranches',
  customers: 'tabs.itemCustomers',
  offers: 'tabs.itemOffers',
  loyalty: 'tabs.itemLoyalty',
  reviews: 'tabs.itemReviews',
  qrCodes: 'tabs.itemQrCodes',
  qrDesigner: 'tabs.itemQrDesigner',
  qrFlyers: 'tabs.itemQrFlyers',
  expenses: 'tabs.itemExpenses',
  closeout: 'tabs.itemCloseout',
  staff: 'tabs.itemStaff',
  analytics: 'tabs.itemAnalytics',
  settings: 'tabs.itemSettings',
  billing: 'tabs.itemBilling',
  help: 'tabs.itemHelp',
};

export default function MoreScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { user, restaurant, logout } = useSession();

  const handleNav = (key: string) => {
    if (key === 'branches') router.push('/more/branches' as any);
    else if (key === 'customers') router.push('/more/customers');
    else if (key === 'offers') router.push('/more/offers');
    else if (key === 'loyalty') router.push('/more/loyalty' as any);
    else if (key === 'reviews') router.push('/more/reviews' as any);
    else if (key === 'qrCodes') router.push('/qr' as any);
    else if (key === 'qrDesigner') router.push('/more/qr-designer' as any);
    else if (key === 'qrFlyers') router.push('/more/qr-flyers' as any);
    else if (key === 'expenses') router.push('/more/expenses');
    else if (key === 'closeout') router.push('/more/closeout' as any);
    else if (key === 'staff') router.push('/more/staff');
    else if (key === 'analytics') router.push('/more/analytics' as any);
    else if (key === 'settings') router.push('/more/settings' as any);
    else if (key === 'billing') router.push('/more/billing' as any);
    else if (key === 'help') router.push('/more/help' as any);
    else {
      const label = ITEM_LABEL_KEYS[key] ? t(ITEM_LABEL_KEYS[key]) : key;
      Alert.alert(label, t('tabs.comingSoon', { label }));
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.ink }]}>{t('tabs.moreTitle')}</Text>

        <Card style={styles.profileCard}>
          <Avatar name={user?.name} size={52} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.ink }]}>{user?.name ?? t('tabs.fallbackAdmin')}</Text>
            <Text style={[styles.profileEmail, { color: colors.inkSoft }]}>{user?.email}</Text>
            <View style={{ marginTop: 6 }}>
              <Badge label={restaurant?.name ?? t('tabs.fallbackRestaurant')} color="primary" uppercase={false} />
            </View>
          </View>
        </Card>

        {GROUPS.map((group) => (
          <View key={group.titleKey} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.inkSoft }]}>{t(group.titleKey)}</Text>
            <Card padded={false} style={styles.groupCard}>
              {group.items.map((item, i) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleNav(item.key)}
                  style={[styles.row, { borderBottomColor: colors.border }, i === group.items.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: `${item.color}22` }]}>
                    <item.icon size={18} color={item.color} />
                  </View>
                  <Text style={[styles.rowLabel, { color: colors.ink }]}>{t(ITEM_LABEL_KEYS[item.key])}</Text>
                  <ChevronRight size={18} color={colors.inkSoft} />
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <Card style={styles.langCard}>
          <Text style={[styles.rowLabel, { color: colors.ink }]}>{t('tabs.language')}</Text>
          <LocaleToggle />
        </Card>

        <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.rose }]}>
          <LogOut size={18} color={colors.rose} />
          <Text style={[styles.logoutText, { color: colors.rose }]}>{t('tabs.signOut')}</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.inkSoft }]}>foorq · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display, paddingTop: 16, paddingBottom: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 20 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: typography.h2.size, fontWeight: '700' },
  profileEmail: { fontSize: typography.caption.size, marginTop: 2 },
  group: { marginBottom: 20 },
  groupTitle: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  groupCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: typography.body.size, fontWeight: '600' },
  langCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, borderWidth: 1.5, marginTop: 8 },
  logoutText: { fontSize: typography.body.size, fontWeight: '700' },
  version: { fontSize: typography.micro.size, fontWeight: '600', textAlign: 'center', marginTop: 20 },
});
