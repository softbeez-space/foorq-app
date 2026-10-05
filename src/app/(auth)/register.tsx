import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, User as UserIcon, Store, QrCode, CookingPot, Wallet, Check } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { AuthHeader, ProgressBars } from './_components/AuthHeader';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { register } = useSession();

  const STEP_TITLES = [t('auth.regStep1Title'), t('auth.regStep2Title'), t('auth.regStep3Title')];
  const STEP_SUBTITLES = [t('auth.regStep1Sub'), t('auth.regStep2Sub'), t('auth.regStep3Sub')];

  const BENEFITS = [
    { Icon: QrCode, text: t('auth.regBenefit1') },
    { Icon: CookingPot, text: t('auth.regBenefit2') },
    { Icon: Wallet, text: t('auth.regBenefit3') },
  ];
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password rules mirror the backend (min 8 + upper/lower/number).
  const rules = useMemo(
    () => [
      { label: t('auth.rule8'), met: password.length >= 8 },
      { label: t('auth.ruleLower'), met: /[a-z]/.test(password) },
      { label: t('auth.ruleUpper'), met: /[A-Z]/.test(password) },
      { label: t('auth.ruleNumber'), met: /\d/.test(password) },
      { label: t('auth.ruleMatch'), met: password.length > 0 && password === confirm },
    ],
    [password, confirm, t],
  );

  const emailValid = email.trim().length > 3 && email.includes('@');
  const stepValid =
    step === 0
      ? firstName.trim().length > 0 && lastName.trim().length > 0 && emailValid
      : step === 1
        ? rules.every((r) => r.met)
        : restaurantName.trim().length > 0;

  const next = () => {
    setError(null);
    if (!stepValid) {
      setError(
        step === 0
          ? t('auth.regErrStep0')
          : step === 1
            ? t('auth.regErrStep1')
            : t('auth.regErrStep2'),
      );
      return;
    }
    if (step < 2) setStep((s) => s + 1);
    else submit();
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await register(
        `${firstName.trim()} ${lastName.trim()}`,
        email.trim(),
        password,
        restaurantName.trim(),
      );
      router.replace('/select-plan');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('auth.regErrFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader
          showBack
          onBack={() => (step > 0 ? setStep((s) => s - 1) : router.back())}
          showBrand={false}
          title={STEP_TITLES[step]}
          subtitle={STEP_SUBTITLES[step]}
        />
        <ProgressBars total={3} index={step} />

        <View style={styles.form}>
          {step === 0 && (
            <>
              <View style={styles.benefits}>
                {BENEFITS.map(({ Icon, text }) => (
                  <View key={text} style={styles.benefitRow}>
                    <View style={[styles.benefitIcon, { backgroundColor: colors.primaryBg }]}>
                      <Icon size={16} color={colors.primary700} />
                    </View>
                    <Text style={[styles.benefitText, { color: colors.ink }]}>{text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.nameRow}>
                <Input
                  label={t('auth.firstName')}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('auth.firstNamePh')}
                  autoCapitalize="words"
                  leftIcon={<UserIcon size={18} color={colors.inkSoft} />}
                  style={{ flex: 1 }}
                />
                <Input
                  label={t('auth.lastName')}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('auth.lastNamePh')}
                  autoCapitalize="words"
                  style={{ flex: 1 }}
                />
              </View>
              <Input
                label={t('auth.regEmail')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.regEmailPh')}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.inkSoft} />}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Input
                label={t('auth.regPassword')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.regPasswordPh')}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.inkSoft} />}
              />
              <Input
                label={t('auth.confirmPw')}
                value={confirm}
                onChangeText={setConfirm}
                placeholder={t('auth.confirmPwPh')}
                secureTextEntry
                leftIcon={<Lock size={18} color={colors.inkSoft} />}
              />
              <View style={styles.rules}>
                {rules.map((r) => (
                  <View key={r.label} style={styles.ruleRow}>
                    <View
                      style={[
                        styles.ruleCheck,
                        { backgroundColor: r.met ? colors.successBg : colors.surface2 },
                      ]}
                    >
                      <Check
                        size={12}
                        strokeWidth={3}
                        color={r.met ? colors.successText : colors.inkSoft}
                      />
                    </View>
                    <Text
                      style={[
                        styles.ruleText,
                        { color: r.met ? colors.successText : colors.inkSoft },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label={t('auth.restaurantName')}
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder={t('auth.restaurantNamePh')}
                autoCapitalize="words"
                leftIcon={<Store size={18} color={colors.inkSoft} />}
              />
              <Text style={[styles.hint, { color: colors.inkSoft }]}>
                {t('auth.regHintNext')}
              </Text>
            </>
          )}

          {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

          <Button onPress={next} loading={loading} disabled={!stepValid} size="lg" shape="pill">
            {step < 2 ? t('auth.continue') : t('auth.createAccount')}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.inkSoft }]}>{t('auth.footerHave')}</Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={[styles.footerLink, { color: colors.primary700 }]}>{t('auth.signInLink')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingVertical: 32 },
  form: { gap: 14 },
  benefits: { gap: 10, marginBottom: 4 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  benefitText: { fontSize: typography.caption.size, fontWeight: '600', flex: 1 },
  nameRow: { flexDirection: 'row', gap: 10 },
  rules: { gap: 8, marginTop: 2 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleCheck: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  ruleText: { fontSize: typography.caption.size, fontWeight: '600' },
  hint: { fontSize: typography.caption.size, lineHeight: 18 },
  error: { fontSize: typography.caption.size, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: typography.body.size },
  footerLink: { fontSize: typography.body.size, fontWeight: '700' },
});
