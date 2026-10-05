import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Edit2, ShoppingBag, Star, Calendar, Trash2, X } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Avatar } from '@/ui/Avatar';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/features/customers/hooks';
import { formatDate, formatCurrency } from '@/shared/format';

// Fresha "My profile" card (centered avatar, stacked contact rows) with a
// Box Box Club-style loyalty pill. Edit mode reuses the New Customer
// grouped form so both flows look and behave the same.
export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: customer, isLoading } = useCustomer(id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const valid = name.trim().length > 0 && phone.trim().length > 0;

  const startEdit = () => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email ?? '');
    setAddress(customer.address ?? '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!valid) {
      Alert.alert(t('more.required'), t('more.custRequiredBody'));
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        data: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, address: address.trim() || undefined },
      });
      setEditing(false);
    } catch { /* handled by hook */ }
  };

  const handleDelete = () => {
    Alert.alert(t('more.deleteCustomer'), t('more.deleteCustBody'), [
      { text: t('more.cancel'), style: 'cancel' },
      {
        text: t('more.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('more.customerTitle')} />
        <View style={styles.loading}>
          <Skeleton width="100%" height={220} radius={20} />
          <View style={{ height: 16 }} />
          <Skeleton width="100%" height={180} radius={20} />
        </View>
      </Screen>
    );
  }

  if (!customer) {
    return (
      <Screen>
        <ScreenHeader title={t('more.customerTitle')} />
        <View style={styles.loading}>
          <Text style={[styles.notFound, { color: colors.inkSoft }]}>{t('more.custNotFound')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.customerTitle')}
        right={
          editing ? (
            <Pressable
              hitSlop={10}
              onPress={handleSave}
              disabled={!valid || updateMutation.isPending}
              style={[styles.headerAction, valid && { backgroundColor: colors.primary }]}
              accessibilityLabel={t('more.saveChangesA11y')}
            >
              <Check size={18} color={valid ? colors.onPrimary : colors.inkSoft} />
            </Pressable>
          ) : (
            <Pressable
              hitSlop={10}
              onPress={startEdit}
              style={[styles.headerAction, { backgroundColor: colors.surface2 }]}
              accessibilityLabel={t('more.editCustomer')}
            >
              <Edit2 size={18} color={colors.ink} />
            </Pressable>
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {editing ? (
          <View>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.editContact')}</Text>
            <Card padded={false} style={styles.groupCard}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>
                  {t('more.fName')} <Text style={{ color: colors.rose }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('more.custNamePh')}
                  placeholderTextColor={colors.inkSoft}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>
                  {t('more.fPhone')} <Text style={{ color: colors.rose }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('more.custPhonePh')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.fEmail')}</Text>
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('more.custEmailPh')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.fAddress')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.ink }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('more.custAddressPh')}
                  placeholderTextColor={colors.inkSoft}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </Card>
            <View style={styles.editActions}>
              <Pressable
                onPress={cancelEdit}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                accessibilityLabel={t('more.cancelEditing')}
              >
                <X size={16} color={colors.inkSoft} />
                <Text style={[styles.cancelText, { color: colors.inkSoft }]}>{t('more.cancel')}</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button
                  onPress={handleSave}
                  loading={updateMutation.isPending}
                  disabled={!valid}
                  shape="pill"
                >
                  {t('more.saveChanges')}
                </Button>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* ── Profile hero ── */}
            <Card style={styles.hero}>
              <Avatar name={customer.name} size={76} />
              <Text style={[styles.name, { color: colors.ink }]} numberOfLines={2}>
                {customer.name}
              </Text>
              <Text style={[styles.handle, { color: colors.inkSoft }]} numberOfLines={1}>
                {customer.phone}
              </Text>
              <View style={[styles.loyaltyPill, { backgroundColor: colors.warningBg }]}>
                <Star size={13} color={colors.amber} />
                <Text style={[styles.loyaltyText, { color: colors.amber }]}>
                  {t('more.pts', { count: customer.loyaltyPoints ?? 0 })}
                </Text>
              </View>
              {customer.lastOrderDate && (
                <Text style={[styles.lastVisit, { color: colors.inkSoft }]}>
                  {t('more.lastVisit', { date: formatDate(customer.lastOrderDate) })}
                </Text>
              )}
            </Card>

            {/* ── Contact rows, Fresha stacked pattern ── */}
            <View>
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.contact')}</Text>
              <Card padded={false} style={styles.groupCard}>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${customer.phone}`).catch(() => {})}
                  style={styles.contactField}
                  accessibilityLabel={t('more.callLabel', { name: customer.name })}
                >
                  <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.fPhone')}</Text>
                  <Text style={[styles.contactValue, { color: colors.accent }]}>{customer.phone}</Text>
                </Pressable>
                <View style={styles.contactField}>
                  <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.fEmail')}</Text>
                  <Text style={[styles.contactValue, { color: colors.ink }]}>
                    {customer.email || t('more.notSet')}
                  </Text>
                </View>
                <View style={styles.contactField}>
                  <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.fAddress')}</Text>
                  <Text style={[styles.contactValue, { color: colors.ink }]} numberOfLines={3}>
                    {customer.address || t('more.notSet')}
                  </Text>
                </View>
              </Card>
            </View>

            {/* ── Activity tiles ── */}
            <View>
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.activity')}</Text>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
                  <ShoppingBag size={18} color={colors.accent} />
                  <Text style={[styles.summaryValue, { color: colors.ink }]}>{customer.totalOrders}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('more.actOrders')}</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
                  <Star size={18} color={colors.amber} />
                  <Text style={[styles.summaryValue, { color: colors.amber }]}>{customer.loyaltyPoints}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('more.actPoints')}</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
                  <Calendar size={18} color={colors.lime} />
                  <Text style={[styles.summaryValue, { color: colors.ink }]}>
                    {customer.totalSpent > 0 ? formatCurrency(customer.totalSpent) : '৳0'}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('more.actSpent')}</Text>
                </View>
              </View>
            </View>

            {/* ── Delete ── */}
            <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.rose }]}>
              <Trash2 size={18} color={colors.rose} />
              <Text style={[styles.deleteText, { color: colors.rose }]}>{t('more.deleteCustomer')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  loading: { padding: 20, gap: 16 },
  notFound: { fontSize: typography.body.size, textAlign: 'center', paddingVertical: 48 },
  headerAction: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  // Hero
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 6 },
  name: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display, textAlign: 'center' },
  handle: { fontSize: typography.caption.size },
  loyaltyPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, marginTop: 4 },
  loyaltyText: { fontSize: typography.caption.size, fontWeight: '800' },
  lastVisit: { fontSize: typography.caption.size },

  // Grouped card + form (matches New Customer)
  groupCard: { paddingHorizontal: 16, paddingVertical: 10, gap: 18 },
  field: { gap: 4 },
  contactField: { gap: 4 },
  label: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: typography.body.size, fontWeight: '600', paddingVertical: 4 },
  textArea: { minHeight: 72 },
  contactValue: { fontSize: typography.body.size, fontWeight: '600' },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 50, borderRadius: 9999, borderWidth: 1.5 },
  cancelText: { fontSize: typography.body.size, fontWeight: '700' },

  // Activity tiles
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryItem: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6 },
  summaryValue: { fontSize: typography.h2.size, fontWeight: '800' },
  summaryLabel: { fontSize: typography.micro.size, textAlign: 'center' },

  // Delete
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, borderWidth: 1.5 },
  deleteText: { fontSize: typography.body.size, fontWeight: '700' },
});
