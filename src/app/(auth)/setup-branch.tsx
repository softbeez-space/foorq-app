import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Store, MapPin, Phone } from 'lucide-react-native';
import { api } from '@/shared/api/client';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import { AuthHeader, ProgressBars } from './_components/AuthHeader';

const TABLE_PRESETS = [4, 8, 12, 16, 20];
const MAX_TABLES = 50;

export default function SetupBranchScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const loadBranches = useBranchStore((s) => s.loadBranches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [tableCount, setTableCount] = useState<number | null>(8);
  const [customTables, setCustomTables] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tables = customTables.trim() ? Number(customTables) : (tableCount ?? 0);

  const STEP_TITLES = [t('auth.setupStep1Title'), t('auth.setupStep2Title'), t('auth.setupStep3Title')];
  const STEP_SUBTITLES = [t('auth.setupStep1Sub'), t('auth.setupStep2Sub'), t('auth.setupStep3Sub')];

  const stepValid =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? address.trim().length > 0
        : Number.isFinite(tables) && tables >= 0 && tables <= MAX_TABLES;

  const next = () => {
    setError(null);
    if (!stepValid) {
      setError(
        step === 0
          ? t('auth.setupErrName')
          : step === 1
            ? t('auth.setupErrAddress')
            : t('auth.setupErrTables', { max: MAX_TABLES }),
      );
      return;
    }
    if (step < 2) setStep((s) => s + 1);
    else submit();
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/restaurant/branches', {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
      });
      const created: any = res.data?.data ?? res.data;
      const newId: string | undefined = created?._id ?? created?.branch?._id;

      // Create numbered tables (best effort — a branch without tables is fine).
      if (newId && tables > 0) {
        const count = Math.min(Math.floor(tables), MAX_TABLES);
        for (let i = 1; i <= count; i++) {
          try {
            await api.post(`/restaurant/branches/${newId}/tables`, {
              number: String(i),
              capacity: 4,
            });
          } catch {
            // Keep going — staff can add the rest from Tables later.
          }
        }
      }

      await loadBranches();
      if (newId) await setBranch(newId);
      else if (useBranchStore.getState().branches[0]) {
        await setBranch(useBranchStore.getState().branches[0]._id);
      }
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('auth.setupErrFallback'));
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
            <Input
              label={t('auth.setupBranchName')}
              value={name}
              onChangeText={setName}
              placeholder={t('auth.setupBranchNamePh')}
              autoCapitalize="words"
              leftIcon={<Store size={18} color={colors.inkSoft} />}
            />
          )}

          {step === 1 && (
            <>
              <Input
                label={t('auth.setupAddress')}
                value={address}
                onChangeText={setAddress}
                placeholder={t('auth.setupAddressPh')}
                autoCapitalize="words"
                leftIcon={<MapPin size={18} color={colors.inkSoft} />}
              />
              <Input
                label={t('auth.setupPhone')}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('auth.setupPhonePh')}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={colors.inkSoft} />}
              />
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.chips}>
                {TABLE_PRESETS.map((n) => {
                  const active = !customTables.trim() && tableCount === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => {
                        setTableCount(n);
                        setCustomTables('');
                      }}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primaryBg : colors.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? colors.primary700 : colors.inkSoft },
                        ]}
                      >
                        {n}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Input
                label={t('auth.setupExactCount')}
                value={customTables}
                onChangeText={(v) => setCustomTables(v.replace(/[^0-9]/g, ''))}
                placeholder={t('auth.setupExactCountPh')}
                keyboardType="numeric"
              />
              <Text style={[styles.hint, { color: colors.inkSoft }]}>
                {t('auth.setupHintTakeaway')}
              </Text>
            </>
          )}

          {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

          <Button onPress={next} loading={loading} disabled={!stepValid} size="lg" shape="pill">
            {step < 2 ? t('auth.continue') : tables > 0 ? t('auth.setupCreateBranchTables', { count: Math.min(Math.floor(tables), MAX_TABLES) }) : t('auth.setupCreateBranch')}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingVertical: 32 },
  form: { gap: 14 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    minWidth: 56,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  chipText: { fontSize: typography.body.size, fontWeight: '700' },
  hint: { fontSize: typography.caption.size, lineHeight: 18 },
  error: { fontSize: typography.caption.size, fontWeight: '600' },
});
