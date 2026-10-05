import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCreateExpense } from '@/features/expenses/hooks';
import { useBranchStore } from '@/features/branches/store';

const CATEGORIES = ['Inventory', 'Salary', 'Utility', 'Rent', 'Marketing', 'Maintenance', 'Others'] as const;
const PAYMENT_METHODS = ['Cash', 'Bank', 'Mobile Banking'] as const;

const CATEGORY_KEYS: Record<string, string> = {
  Inventory: 'more.catInventory',
  Salary: 'more.catSalary',
  Utility: 'more.catUtility',
  Rent: 'more.catRent',
  Marketing: 'more.catMarketing',
  Maintenance: 'more.catMaintenance',
  Others: 'more.catOthers',
};

const PAY_METHOD_KEYS: Record<string, string> = {
  Cash: 'more.payCash',
  Bank: 'more.payBank',
  'Mobile Banking': 'more.payMobile',
};

export default function CreateExpenseScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branchId = useBranchStore((s) => s.selectedBranchId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Others');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const createMutation = useCreateExpense();

  const handleCreate = async () => {
    if (!title.trim() || !amount || !branchId) {
      Alert.alert(t('more.required'), t('more.expRequiredBody'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        branchId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount),
        category: category as any,
        paymentMethod: paymentMethod as any,
        date: date || undefined,
      });
      router.back();
    } catch {}
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.navBtn}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('more.newExpense')}</Text>
        <View style={styles.navBtnPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formField}>
          <Input
            label={t('more.expTitleLabel')}
            value={title}
            onChangeText={setTitle}
            placeholder={t('more.expTitlePh')}
          />
        </View>

        <View style={styles.formField}>
          <Input
            label={t('more.expDescLabel')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('more.expDescPh')}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formField}>
          <Input
            label={t('more.expAmountLabel')}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('more.expAmountPh')}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.formField}>
          <Select
            label={t('more.expCategoryLabel')}
            value={category}
            options={CATEGORIES.map((c) => ({ value: c, label: t(CATEGORY_KEYS[c]) }))}
            onChange={setCategory}
          />
        </View>

        <View style={styles.selectorField}>
          <Text style={[styles.fieldLabel, { color: colors.inkSoft, paddingHorizontal: 16 }]}>{t('more.expPayMethodLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm;
              return (
                <Pressable
                  key={pm}
                  onPress={() => setPaymentMethod(pm)}
                  style={[
                    styles.chip, 
                    { 
                      borderColor: isSelected ? colors.accent : colors.border, 
                      backgroundColor: isSelected ? colors.accent + '12' : colors.surface 
                    }
                  ]}
                >
                  <Text style={[styles.chipText, { color: isSelected ? colors.accent : colors.inkSoft }]}>{t(PAY_METHOD_KEYS[pm])}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formField}>
          <Input
            label={t('more.expDateLabel')}
            value={date}
            onChangeText={setDate}
            placeholder={t('more.expDatePh')}
          />
        </View>

        <View style={styles.actionContainer}>
          <Button onPress={handleCreate} loading={createMutation.isPending}>
            {t('more.addExpense')}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 16, 
    paddingBottom: 16,
    paddingHorizontal: 16 
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPlaceholder: {
    width: 36,
  },
  title: { 
    fontSize: typography.displayM.size, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  scrollContainer: { 
    gap: 20, 
    paddingBottom: 40 
  },
  formField: {
    paddingHorizontal: 16,
  },
  selectorField: {
    marginVertical: 2,
  },
  fieldLabel: { 
    fontSize: typography.caption.size, 
    fontWeight: '700', 
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  input: { 
    borderRadius: 14, 
    borderWidth: 1, 
    paddingHorizontal: 16, 
    height: 48, 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  textArea: {
    height: 96, 
    textAlignVertical: 'top', 
    paddingTop: 14,
    paddingBottom: 14,
  },
  chipScrollContent: { 
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  chip: { 
    paddingHorizontal: 16, 
    height: 38, 
    borderRadius: 19, 
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chipText: { 
    fontSize: typography.caption.size, 
    fontWeight: '700' 
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 8
  }
});