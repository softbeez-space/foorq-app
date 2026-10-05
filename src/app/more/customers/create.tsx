import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCreateCustomer } from '@/features/customers/hooks';

// Mesh "New Person" hero (avatar with live initial) over Grab-style
// required-field labels and a full-width pill save.
export default function CreateCustomerScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const createMutation = useCreateCustomer();

  const valid = name.trim().length > 0 && phone.trim().length > 0;

  const handleCreate = async () => {
    if (!valid) {
      Alert.alert(t('more.required'), t('more.custRequiredBody'));
      return;
    }
    try {
      const customer = await createMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      router.replace(`/more/customers/${customer._id}`);
    } catch { /* handled by hook */ }
  };

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.newCustomer')}
        right={
          <Pressable
            hitSlop={10}
            onPress={handleCreate}
            disabled={!valid || createMutation.isPending}
            style={[styles.headerSave, valid && { backgroundColor: colors.primary }]}
            accessibilityLabel={t('more.saveCustomer')}
          >
            <Check size={18} color={valid ? colors.onPrimary : colors.inkSoft} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar hero — updates live as the name is typed */}
        <View style={styles.hero}>
          <Avatar name={name.trim() || '?'} size={76} />
          <Text style={[styles.heroCaption, { color: colors.inkSoft }]}>
            {name.trim() || t('more.newCustomer')}
          </Text>
        </View>

        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.contactInfo')}</Text>
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
                autoFocus
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
        </View>

        <Button
          onPress={handleCreate}
          loading={createMutation.isPending}
          disabled={!valid}
          size="lg"
          shape="pill"
        >
          {t('more.addCustomer')}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  headerSave: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', gap: 10, paddingTop: 4 },
  heroCaption: { fontSize: typography.h2.size, fontWeight: '700' },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  groupCard: { paddingHorizontal: 16, paddingVertical: 10, gap: 18 },
  field: { gap: 4 },
  label: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: typography.body.size, fontWeight: '600', paddingVertical: 4 },
  textArea: { minHeight: 72 },
});
