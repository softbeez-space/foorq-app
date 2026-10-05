import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mail, CircleCheck } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { forgotPassword } from '@/features/auth/api';
import { AuthHeader } from './_components/AuthHeader';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError(t('auth.errInvalidEmail'));
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('auth.errForgotFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader
          showBack
          title={t('auth.forgotTitle')}
          subtitle={t('auth.forgotSubtitle')}
        />

        {sent ? (
          <View style={styles.sentWrap}>
            <View style={[styles.sentIcon, { backgroundColor: colors.successBg }]}>
              <CircleCheck size={28} color={colors.successText} />
            </View>
            <Text style={[styles.sentTitle, { color: colors.ink }]}>{t('auth.sentTitle')}</Text>
            <Text style={[styles.sentText, { color: colors.inkSoft }]}>
              {t('auth.sentText', { email: email.trim() })}
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label={t('auth.regEmail')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.regEmailPh')}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.inkSoft} />}
            />
            {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}
            <Button onPress={submit} loading={loading} size="lg" shape="pill">
              {t('auth.sendLink')}
            </Button>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingVertical: 32 },
  form: { gap: 14 },
  error: { fontSize: typography.caption.size, fontWeight: '600' },
  sentWrap: { alignItems: 'center', paddingTop: 32, gap: 8 },
  sentIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  sentTitle: { fontSize: typography.h1.size, fontWeight: '700' },
  sentText: { fontSize: typography.body.size, textAlign: 'center', lineHeight: 22 },
});
