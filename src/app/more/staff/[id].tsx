import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, UserCog, User, Mail, Phone, Calendar, X } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Avatar } from '@/ui/Avatar';
import { Badge } from '@/ui/Badge';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useStaffMember, useUpdateStaff, useDeleteStaff } from '@/features/staff/hooks';
import { formatDate } from '@/shared/format';

const ROLE_ICONS = { owner: ShieldCheck, manager: UserCog, staff: User } as const;
const ROLE_COLORS = { owner: '#F97316', manager: '#8B5CF6', staff: '#06B6D4' } as const;

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: member, isLoading } = useStaffMember(id);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const openEdit = () => {
    if (!member) return;
    setName(member.name);
    setPhone(member.phone || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, data: { name: name.trim(), phone: phone.trim() || undefined } });
      setModalOpen(false);
    } catch { /* handled by hook */ }
  };

  const handleDelete = () => {
    Alert.alert(t('more.removeStaffTitle'), t('more.removeStaffBody'), [
      { text: t('more.cancel'), style: 'cancel' },
      { text: t('more.remove'), style: 'destructive', onPress: async () => { await deleteMutation.mutateAsync(id); router.back(); } },
    ]);
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('more.staffProfile')} />
        <View style={styles.loading}><Skeleton width="100%" height={280} radius={24} /></View>
      </Screen>
    );
  }

  if (!member) {
    return (
      <Screen>
        <ScreenHeader title={t('more.staffProfile')} />
        <View style={styles.notFound}><Text style={{ color: colors.inkSoft }}>{t('more.staffNotFound')}</Text></View>
      </Screen>
    );
  }

  const RoleIcon = ROLE_ICONS[member.role];
  const roleColor = ROLE_COLORS[member.role];
  const branchName = typeof member.branchId === 'object' ? member.branchId.name : '';
  const isActive = member.status === 'active';

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.staffProfile')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Card style={styles.hero}>
          <Avatar name={member.name} size={72} />
          <Text style={[styles.name, { color: colors.ink }]}>{member.name}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '15', borderColor: roleColor + '30' }]}>
              <RoleIcon size={14} color={roleColor} />
              <Text style={[styles.roleText, { color: roleColor }]}>{member.role}</Text>
            </View>
            <Badge
              label={isActive ? t('more.active') : t('more.inactive')}
              color={isActive ? 'lime' : 'neutral'}
              uppercase
            />
          </View>

          <Button onPress={openEdit} variant="ghost" style={styles.editBtn}>
            {t('more.editDetails')}
          </Button>
        </Card>

        {/* Details */}
        <View style={styles.sectionGap}>
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('more.contactInfo2')}</Text>

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.surface2 }]}>
                <Mail size={16} color={colors.inkSoft} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.staffEmail')}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{member.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.surface2 }]}>
                <Phone size={16} color={colors.inkSoft} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.staffPhone')}</Text>
                <Text style={[styles.detailValue, { color: member.phone ? colors.ink : colors.inkSoft }]}>
                  {member.phone || t('more.notAvailable')}
                </Text>
              </View>
            </View>

            {branchName ? (
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: colors.surface2 }]}>
                  <Calendar size={16} color={colors.inkSoft} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.staffBranch')}</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{branchName}</Text>
                </View>
              </View>
            ) : null}

            {member.lastLogin ? (
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: colors.surface2 }]}>
                  <Calendar size={16} color={colors.inkSoft} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.lastLogin')}</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{formatDate(member.lastLogin)}</Text>
                </View>
              </View>
            ) : null}
          </Card>
        </View>

        {/* Delete */}
        <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.rose }]}>
          <Text style={[styles.deleteText, { color: colors.rose }]}>{t('more.removeStaff')}</Text>
        </Pressable>
      </ScrollView>

      {/* ─── Edit Modal ─── */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Pressable hitSlop={12} onPress={() => setModalOpen(false)}>
              <X size={22} color={colors.inkSoft} />
            </Pressable>
            <Text style={[styles.sheetTitle, { color: colors.ink }]}>{t('more.editStaff')}</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView contentContainerStyle={styles.sheetBody}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.fName')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                value={name}
                onChangeText={setName}
                placeholder={t('more.staffNamePh')}
                placeholderTextColor={colors.inkSoft}
                autoFocus
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.staffPhone')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('more.staffPhonePh')}
                placeholderTextColor={colors.inkSoft}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

          <View style={[styles.sheetFooter, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <Button onPress={handleSave} loading={updateMutation.isPending} size="lg">
              {t('more.saveChanges')}
            </Button>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  loading: { padding: 20, flex: 1, justifyContent: 'center' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionGap: { marginTop: 16 },

  // Hero
  hero: { alignItems: 'center', padding: 24, gap: spacing.md },
  name: { fontSize: typography.h1.size, fontWeight: '800', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  roleText: { fontSize: typography.caption.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  editBtn: { width: 'auto', marginTop: 4 },

  // Section
  sectionTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: spacing.md },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: typography.micro.size, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: typography.body.size, fontWeight: '600' },

  // Delete
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 24,
  },
  deleteText: { fontSize: typography.body.size, fontWeight: '700' },

  // Modal (pageSheet)
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: typography.h2.size, fontWeight: '700' },
  sheetBody: { padding: 20, gap: spacing.md },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // Form fields
  field: { gap: 4 },
  fieldLabel: { fontSize: typography.caption.size, fontWeight: '600' },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: typography.body.size },
});
