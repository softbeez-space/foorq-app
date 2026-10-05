import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import {
  useLoyaltyRewards,
  useCreateReward,
  useUpdateReward,
} from '@/features/loyalty/hooks';

export default function LoyaltyRewardScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id;
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: rewards } = useLoyaltyRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();

  const existing = !isNew ? rewards?.find((r) => r._id === id) : undefined;

  const [name, setName] = useState<string | null>(null);
  const [type, setType] = useState<'discount' | 'free_item' | null>(null);
  const [points, setPoints] = useState<string | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const curName = name ?? existing?.name ?? '';
  const curType = type ?? existing?.type ?? 'discount';
  const curPoints = points ?? (existing ? String(existing.pointsRequired) : '');
  const curValue = value ?? (existing?.discountValue != null ? String(existing.discountValue) : '');
  const curIsPct = isPercentage ?? existing?.isPercentage ?? false;
  const curActive = active ?? existing?.isActive ?? true;

  const valid = curName.trim().length > 0 && Number(curPoints) > 0;

  const handleSave = async () => {
    setError(null);
    if (!valid) {
      setError(t('loyalty.invalid'));
      return;
    }
    const payload: any = {
      name: curName.trim(),
      type: curType,
      pointsRequired: Math.round(Number(curPoints)),
      isActive: curActive,
    };
    if (curType === 'discount' && curValue.trim() !== '') {
      payload.discountValue = Number(curValue);
      payload.isPercentage = curIsPct;
    }
    try {
      if (isNew) await createMutation.mutateAsync(payload);
      else await updateMutation.mutateAsync({ id: id!, data: payload });
      router.back();
    } catch {
      setError(t('loyalty.saveFail'));
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Screen padded={false}>
      <ScreenHeader title={isNew ? t('loyalty.newReward') : t('loyalty.editReward')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: 12 }}>
          <Input label={t('loyalty.nameLabel')} value={curName} onChangeText={setName} />

          <View>
            <Text style={[styles.label, { color: colors.inkSoft }]}>{t('loyalty.typeLabel')}</Text>
            <View style={styles.segRow}>
              {(
                [
                  { key: 'discount', label: t('loyalty.typeDiscount') },
                  { key: 'free_item', label: t('loyalty.typeFreeItem') },
                ] as const
              ).map((o) => (
                <Pressable
                  key={o.key}
                  onPress={() => setType(o.key)}
                  style={[
                    styles.seg,
                    {
                      backgroundColor: curType === o.key ? colors.ink : colors.surface2,
                    },
                  ]}
                >
                  <Text style={[styles.segText, { color: curType === o.key ? '#FFF' : colors.ink }]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label={t('loyalty.pointsLabel')}
            value={curPoints}
            onChangeText={(v) => setPoints(v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />

          {curType === 'discount' && (
            <>
              <Input
                label={t('loyalty.valueLabel')}
                value={curValue}
                onChangeText={(v) => setValue(v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
              />
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.ink }]}>
                  {t('loyalty.percentLabel')}
                </Text>
                <Switch
                  value={curIsPct}
                  onValueChange={setIsPercentage}
                  trackColor={{ false: colors.surface2, true: colors.primary }}
                  thumbColor="#FFF"
                />
              </View>
            </>
          )}

          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.ink }]}>{t('loyalty.activeLabel')}</Text>
            <Switch
              value={curActive}
              onValueChange={setActive}
              trackColor={{ false: colors.surface2, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>

        {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

        <Button onPress={handleSave} loading={pending} disabled={!valid} size="lg" shape="pill">
          {t('loyalty.save')}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  segText: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.ui },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  switchLabel: { fontSize: 14, fontWeight: '600', fontFamily: fontFamilies.ui },
  error: { fontSize: 12, fontWeight: '600' },
});
