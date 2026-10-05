import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { UserCog, User, Mail, Lock, Phone } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCreateStaff } from '@/features/staff/hooks';

const ROLES = [
  { value: 'manager' as const, labelKey: 'more.manager', icon: UserCog },
  { value: 'staff' as const, labelKey: 'more.staffRole', icon: User },
];

export default function CreateStaffScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');
  const [phone, setPhone] = useState('');
  const createMutation = useCreateStaff();

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t('more.required'), t('more.staffRequiredBody'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('more.invalid'), t('more.invalidPwBody'));
      return;
    }
    try {
      const member = await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
      });
      router.replace(`/more/staff/${member._id}`);
    } catch { /* handled by hook */ }
  };

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.addStaff')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Role */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('more.role')}</Text>
          <View style={styles.typeGrid}>
            {ROLES.map((r) => {
              const selected = role === r.value;
              const RoleIcon = r.icon;
              const roleLabel = t(r.labelKey);
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selected ? colors.primary50 : colors.surface2,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityLabel={roleLabel}
                >
                  <RoleIcon size={24} color={selected ? colors.primary : colors.inkSoft} />
                  <Text style={[styles.typeLabel, { color: selected ? colors.primaryText : colors.inkSoft }]}>
                    {roleLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Info */}
        <View style={styles.sectionGap}>
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('more.staffDetails')}</Text>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.fName')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                value={name}
                onChangeText={setName}
                placeholder={t('more.staffNamePh2')}
                placeholderTextColor={colors.inkSoft}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.staffEmail')}</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Mail size={16} color={colors.inkSoft} style={{ marginLeft: 14 }} />
                <TextInput
                  style={[styles.inputInner, { color: colors.ink }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('more.staffEmailPh')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.staffPassword')}</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Lock size={16} color={colors.inkSoft} style={{ marginLeft: 14 }} />
                <TextInput
                  style={[styles.inputInner, { color: colors.ink }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('more.staffPwPh')}
                  placeholderTextColor={colors.inkSoft}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={[styles.field, { marginBottom: 0 }]}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.staffPhone')}</Text>
              <View style={[styles.iconInput, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Phone size={16} color={colors.inkSoft} style={{ marginLeft: 14 }} />
                <TextInput
                  style={[styles.inputInner, { color: colors.ink }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('more.staffPhonePh2')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Button onPress={handleCreate} loading={createMutation.isPending} size="lg">
                {t('more.addStaffMember')}
              </Button>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionGap: { marginTop: 16 },
  sectionTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: spacing.md },

  // Type grid
  typeGrid: { flexDirection: 'row', gap: spacing.sm },
  typeCard: {
    flex: 1, alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.lg, borderRadius: 16, borderWidth: 1.5,
  },
  typeLabel: { fontSize: typography.caption.size, fontWeight: '700' },

  // Fields
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: typography.caption.size, fontWeight: '600', marginBottom: 4 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: typography.body.size },
  iconInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, gap: 10, overflow: 'hidden' },
  inputInner: { flex: 1, fontSize: typography.body.size, paddingVertical: 12, paddingRight: 14 },
});
