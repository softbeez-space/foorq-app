import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, CircleDollarSign, TrendingDown } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Badge } from '@/ui/Badge';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useExpenses, useExpenseSummary } from '@/features/expenses/hooks';
import { formatDate, formatCurrency } from '@/shared/format';
import type { Expense } from '@/entities/expense';

const CATEGORIES = ['All', 'Inventory', 'Salary', 'Utility', 'Rent', 'Marketing', 'Maintenance', 'Others'] as const;

const CATEGORY_KEYS: Record<string, string> = {
  All: 'more.catAll',
  Inventory: 'more.catInventory',
  Salary: 'more.catSalary',
  Utility: 'more.catUtility',
  Rent: 'more.catRent',
  Marketing: 'more.catMarketing',
  Maintenance: 'more.catMaintenance',
  Others: 'more.catOthers',
};

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [category, setCategory] = useState<string>('All');
  const { data: expenses, isLoading } = useExpenses(category !== 'All' ? { category } : undefined);
  const { data: summary } = useExpenseSummary('30d');

  return (
    <Screen padded={false}>
      <ScreenHeader
        title={t('more.expensesTitle')}
        right={
          <Pressable hitSlop={12} onPress={() => router.push('/more/expenses/create')}>
            <Plus size={22} color={colors.accent} />
          </Pressable>
        }
      />

      <View style={styles.mainContainer}>
        {summary && (
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIconWrap, { backgroundColor: colors.rose + '12' }]}>
              <CircleDollarSign size={24} color={colors.rose} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('more.total30d')}</Text>
              <Text style={[styles.summaryValue, { color: colors.ink }]}>{formatCurrency(summary.totalExpense)}</Text>
            </View>
          </Card>
        )}

        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => {
              const isSelected = category === item;
              return (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[
                    styles.chip, 
                    { 
                      borderColor: isSelected ? colors.accent : colors.border, 
                      backgroundColor: isSelected ? colors.accent + '12' : colors.surface 
                    }
                  ]}
                >
                  <Text style={[styles.chipText, { color: isSelected ? colors.accent : colors.inkSoft }]}>
                    {t(CATEGORY_KEYS[item])}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {isLoading ? (
          <View style={styles.skeletonList}>
            {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={88} radius={16} />)}
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('more.noExpenses')}</Text>
              </View>
            }
            renderItem={({ item }) => <ExpenseRow item={item} colors={colors} />}
          />
        )}
      </View>
    </Screen>
  );
}

function ExpenseRow({ item, colors }: { item: Expense; colors: any }) {
  const branchName = typeof item.branchId === 'object' ? item.branchId.name : '';

  return (
    <Pressable onPress={() => router.push(`/more/expenses/${item._id}`)} style={styles.rowPressable}>
      <Card style={[styles.expenseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.expenseIcon, { backgroundColor: colors.rose + '12' }]}>
          <TrendingDown size={18} color={colors.rose} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseTitle, { color: colors.ink }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Badge label={item.category} color="neutral" uppercase />
            <Text style={[styles.expenseMeta, { color: colors.inkSoft }]}>{formatDate(item.date)}</Text>
            {branchName ? (
              <>
                <Text style={[styles.metaSeparator, { color: colors.border }]}>•</Text>
                <Text style={[styles.expenseMeta, { color: colors.inkSoft }]} numberOfLines={1}>
                  {branchName}
                </Text>
              </>
            ) : null}
          </View>
        </View>
        <Text style={[styles.expenseAmount, { color: colors.rose }]}>
          -{formatCurrency(item.amount)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 16,
  },
  summaryCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  summaryInfo: {
    marginLeft: 14,
    justifyContent: 'center'
  },
  summaryLabel: { 
    fontSize: typography.caption.size,
    fontWeight: '600',
    marginBottom: 2
  },
  summaryValue: { 
    fontSize: typography.h2.size, 
    fontWeight: '800',
    letterSpacing: -0.3
  },
  filterWrapper: {
    marginBottom: 16,
    height: 38
  },
  filterContent: { 
    gap: 8,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  chip: { 
    paddingHorizontal: 16, 
    height: 36, 
    borderRadius: 18, 
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chipText: { 
    fontSize: typography.caption.size, 
    fontWeight: '700' 
  },
  skeletonList: { 
    gap: 12,
    paddingHorizontal: 16 
  },
  listContent: { 
    paddingBottom: 40,
    paddingHorizontal: 16
  },
  emptyWrap: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: { 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  rowPressable: {
    marginBottom: 12,
  },
  expenseCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  expenseIcon: { 
    width: 42, 
    height: 42, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  expenseInfo: { 
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    justifyContent: 'center'
  },
  expenseTitle: { 
    fontSize: typography.body.size, 
    fontWeight: '700',
    marginBottom: 4
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexWrap: 'wrap'
  },
  metaSeparator: {
    marginHorizontal: 6,
    fontSize: typography.micro.size
  },
  expenseMeta: { 
    fontSize: typography.micro.size,
    fontWeight: '500',
    marginLeft: 6
  },
  expenseAmount: { 
    fontSize: typography.body.size, 
    fontWeight: '800',
    textAlign: 'right'
  },
});