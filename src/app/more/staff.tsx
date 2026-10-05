import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, ShieldCheck, UserCog, User, Circle } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Avatar } from '@/ui/Avatar';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useStaff } from '@/features/staff/hooks';
import type { Staff } from '@/entities/staff';

const ROLE_ICONS = { owner: ShieldCheck, manager: UserCog, staff: User } as const;
const ROLE_COLORS = { owner: '#F97316', manager: '#8B5CF6', staff: '#06B6D4' } as const;

export default function StaffScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: staff, isLoading } = useStaff();

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.staffTitle')}
        right={
          <Pressable hitSlop={8} onPress={() => router.push('/more/staff/create')}>
            <Plus size={22} color={colors.accent} />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={80} radius={16} />)}
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <User size={48} color={colors.inkSoft} />
              <Text style={[styles.emptyText, { color: colors.ink }]}>{t('more.noStaffYet')}</Text>
              <Text style={[styles.emptySub, { color: colors.inkSoft }]}>{t('more.noStaffSub')}</Text>
            </View>
          }
          renderItem={({ item }) => <StaffRow item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </Screen>
  );
}

function StaffRow({ item }: { item: Staff }) {
  const { colors } = useTheme();
  const RoleIcon = ROLE_ICONS[item.role];
  const roleColor = ROLE_COLORS[item.role];
  const branchName = typeof item.branchId === 'object' ? item.branchId.name : '';
  const isActive = item.status === 'active';

  return (
    <Pressable onPress={() => router.push(`/more/staff/${item._id}`)}>
      <Card style={styles.staffCard}>
        <View style={styles.avatarContainer}>
          <Avatar name={item.name} size={48} />
          <View style={[styles.statusDot, { backgroundColor: colors.surface }]}>
            <Circle
              size={10}
              color={isActive ? colors.lime : colors.inkSoft}
              fill={isActive ? colors.lime : colors.surface2}
            />
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={[styles.staffName, { color: colors.ink }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.staffEmail, { color: colors.inkSoft }]} numberOfLines={1}>{item.email}</Text>
          {branchName ? (
            <Text style={[styles.staffBranch, { color: colors.inkSoft }]} numberOfLines={1}>{branchName}</Text>
          ) : null}
        </View>

        <View style={[styles.roleBadge, { backgroundColor: roleColor + '15', borderColor: roleColor + '30' }]}>
          <RoleIcon size={12} color={roleColor} />
          <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skeletonList: { gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  emptyWrap: { alignItems: 'center', paddingVertical: 64, gap: 8 },
  emptyText: { fontSize: typography.h2.size, fontWeight: '700' },
  emptySub: { fontSize: typography.body.size },

  staffCard: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: spacing.md },
  avatarContainer: { position: 'relative' },
  statusDot: {
    position: 'absolute', bottom: -2, right: -2,
    borderRadius: 99, padding: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  infoBlock: { flex: 1, marginRight: spacing.sm },
  staffName: { fontSize: typography.body.size, fontWeight: '700', marginBottom: 2 },
  staffEmail: { fontSize: typography.caption.size, marginBottom: 2 },
  staffBranch: { fontSize: typography.micro.size, fontWeight: '500' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roleText: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase' },
});
