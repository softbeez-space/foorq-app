import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, TrendingDown, Calendar } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useExpenses, useUpdateExpense, useDeleteExpense } from '@/features/expenses/hooks';
import { formatDate, formatCurrency } from '@/shared/format';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: expenses } = useExpenses();
  const expense = expenses?.find((e) => e._id === id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  if (!expense) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('more.expenseNotFound')}</Text>
        </View>
      </Screen>
    );
  }

  const branchName = typeof expense.branchId === 'object' ? expense.branchId.name : '';
  const createdByName = typeof expense.createdBy === 'object' ? expense.createdBy.name : '';

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id, data: { title: title.trim(), description: description.trim() || undefined } });
      setEditing(false);
    } catch {}
  };

  const handleDelete = () => {
    Alert.alert(t('more.deleteExpense'), t('more.deleteExpenseBody'), [
      { text: t('more.cancel'), style: 'cancel' },
      { text: t('more.delete'), style: 'destructive', onPress: async () => { await deleteMutation.mutateAsync(id); router.back(); } },
    ]);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.navBtn}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('more.expenseTitle')}</Text>
        <Pressable 
          hitSlop={12}
          onPress={() => { 
            if (!editing) { 
              setTitle(expense.title); 
              setDescription(expense.description || ''); 
            } 
            setEditing(!editing); 
          }}
          style={styles.editTouch}
        >
          <Text style={[styles.editBtn, { color: editing ? colors.rose : colors.accent }]}>
            {editing ? t('more.cancel') : t('more.edit')}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.transactionHeader}>
            <View style={[styles.expenseIcon, { backgroundColor: colors.rose + '12' }]}>
              <TrendingDown size={22} color={colors.rose} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={[styles.expenseTitle, { color: colors.ink }]}>{expense.title}</Text>
              <Text style={[styles.amount, { color: colors.rose }]}>-{formatCurrency(expense.amount)}</Text>
            </View>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.ink }]} 
                  value={title} 
                  onChangeText={setTitle}
                  placeholder={t('more.expenseTitlePh')}
                  placeholderTextColor={colors.inkSoft}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={[styles.input, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.ink }]} 
                  value={description} 
                  onChangeText={setDescription} 
                  multiline
                  placeholder={t('more.expenseDescPh')}
                  placeholderTextColor={colors.inkSoft}
                />
              </View>
              <Button onPress={handleSave} loading={updateMutation.isPending}>{t('more.saveChanges')}</Button>
            </View>
          ) : (
            expense.description ? (
              <View style={[styles.descriptionWrap, { borderTopColor: colors.border }]}>
                <Text style={[styles.description, { color: colors.inkSoft }]}>{expense.description}</Text>
              </View>
            ) : null
          )}
        </Card>

        <Card style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('more.details')}</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.expenseCategory')}</Text>
            <Badge label={expense.category} color="neutral" uppercase />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.expensePayMethod')}</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>{expense.paymentMethod}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.expenseDate')}</Text>
            <View style={styles.iconValueRow}>
              <Calendar size={15} color={colors.inkSoft} style={styles.rowIcon} />
              <Text style={[styles.detailValue, { color: colors.ink }]}>{formatDate(expense.date)}</Text>
            </View>
          </View>

          {branchName ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.expenseBranch')}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{branchName}</Text>
              </View>
            </>
          ) : null}

          {createdByName ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('more.createdBy')}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{createdByName}</Text>
              </View>
            </>
          ) : null}
        </Card>

        <View style={styles.actionWrap}>
          <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.rose }]}>
            <Text style={[styles.deleteText, { color: colors.rose }]}>{t('more.deleteExpense')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: {
    fontSize: typography.body.size,
    fontWeight: '500'
  },
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
    alignItems: 'center'
  },
  editTouch: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  editBtn: { 
    fontSize: typography.body.size, 
    fontWeight: '700' 
  },
  title: { 
    fontSize: typography.displayM.size, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  scrollContainer: { 
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 16
  },
  mainCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expenseIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  titleBlock: {
    flex: 1,
    marginLeft: 16,
  },
  expenseTitle: { 
    fontSize: typography.h2.size, 
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4
  },
  amount: { 
    fontSize: typography.displayXl.size, 
    fontWeight: '800',
    letterSpacing: -1
  },
  descriptionWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  description: { 
    fontSize: typography.body.size,
    lineHeight: 22,
    fontWeight: '500'
  },
  editForm: { 
    gap: 14, 
    marginTop: 20 
  },
  inputContainer: {
    width: '100%',
  },
  input: { 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 14, 
    height: 46, 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  textArea: {
    height: 88, 
    textAlignVertical: 'top', 
    paddingTop: 12,
    paddingBottom: 12 
  },
  detailsCard: { 
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14
  },
  sectionTitle: { 
    fontSize: typography.body.size, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    minHeight: 24
  },
  detailLabel: { 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  detailValue: { 
    fontSize: typography.body.size, 
    fontWeight: '700' 
  },
  iconValueRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowIcon: {
    marginRight: 6
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.6
  },
  actionWrap: {
    marginTop: 8
  },
  deleteBtn: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 52, 
    borderRadius: 16, 
    borderWidth: 1.5,
    borderStyle: 'dashed'
  },
  deleteText: { 
    fontSize: typography.body.size, 
    fontWeight: '800' 
  },
});