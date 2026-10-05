import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useAuthStore } from '@/features/auth/store';
import { AuthHeader } from './_components/AuthHeader';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t('auth.errEmpty'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('auth.errFallback'));
    } finally {
      setLoading(false);
    }
  };

  const biometricUnlock = async () => {
    setError(null);
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.bioPrompt'),
        fallbackLabel: t('auth.bioFallback'),
      });
      if (!res.success) return;
      await useAuthStore.getState().loadSession();
      if (useAuthStore.getState().user) {
        router.replace('/dashboard');
      } else {
        setError(t('auth.errNoSession'));
      }
    } catch {
      setError(t('auth.errBioUnavailable'));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} />

        <View style={styles.form}>
          <Input
            label={t('auth.emailLabel')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPh')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={colors.inkSoft} />}
          />
          <Input
            label={t('auth.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            leftIcon={<Lock size={18} color={colors.inkSoft} />}
          />

          <View style={styles.helperRow}>
            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
              <Text style={[styles.link, { color: colors.primary700 }]}>{t('auth.forgot')}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPw((v) => !v)}
              hitSlop={8}
              style={styles.showPw}
              accessibilityLabel={showPw ? t('auth.hidePw') : t('auth.showPw')}
            >
              {showPw ? (
                <Eye size={16} color={colors.inkSoft} />
              ) : (
                <EyeOff size={16} color={colors.inkSoft} />
              )}
              <Text style={[styles.showPwText, { color: colors.inkSoft }]}>
                {showPw ? t('auth.hide') : t('auth.show')}
              </Text>
            </Pressable>
          </View>

          {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

          <Button onPress={submit} loading={loading} size="lg" shape="pill">
            {t('auth.signIn')}
          </Button>

          <Pressable onPress={biometricUnlock} style={styles.bioRow} hitSlop={8}>
            <Fingerprint size={18} color={colors.primary700} />
            <Text style={[styles.bioText, { color: colors.primary700 }]}>{t('auth.useBiometrics')}</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.inkSoft }]}>{t('auth.footerNew')}</Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={[styles.footerLink, { color: colors.primary700 }]}>{t('auth.footerCreate')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 32 },
  form: { gap: 14 },
  helperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: typography.caption.size, fontWeight: '600' },
  showPw: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  showPwText: { fontSize: typography.caption.size, fontWeight: '600' },
  error: { fontSize: typography.caption.size, fontWeight: '600' },
  bioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  bioText: { fontSize: typography.body.size, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: typography.body.size },
  footerLink: { fontSize: typography.body.size, fontWeight: '700' },
});
