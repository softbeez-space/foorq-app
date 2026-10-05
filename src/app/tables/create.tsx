import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useCreateTable } from '@/features/tables/hooks';
import { useBranchStore } from '@/features/branches/store';
import { useLocale } from '@/i18n/LocaleContext';

export default function CreateTableScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branchId = useBranchStore((s) => s.selectedBranchId);
  const createMutation = useCreateTable();
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleCreate = async () => {
    if (!number.trim() || !capacity || !branchId) {
      Alert.alert(t('tables.create.requiredT'), t('tables.create.requiredM'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        branchId,
        data: { number: number.trim(), capacity: Number(capacity), status: 'available' },
      });
      router.back();
    } catch {}
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('tables.create.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('tables.create.numberLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
            value={number}
            onChangeText={setNumber}
            placeholder={t('tables.create.numberPh')}
            placeholderTextColor={colors.inkSoft}
          />
        </View>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('tables.create.capacityLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
            value={capacity}
            onChangeText={setCapacity}
            placeholder={t('tables.create.capacityPh')}
            placeholderTextColor={colors.inkSoft}
            keyboardType="number-pad"
          />
        </View>
        <Button onPress={handleCreate} loading={createMutation.isPending} size="lg">
          {t('tables.create.submit')}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  fieldLabel: { fontSize: typography.caption.size, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, fontSize: typography.body.size },
});
