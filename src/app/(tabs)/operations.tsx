import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QrCode, Table2, Users, Plus } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Skeleton } from '@/ui/Skeleton';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useBranchTables } from '@/features/tables/hooks';
import type { TableInfo } from '@/entities/branch';
import { useLocale } from '@/i18n/LocaleContext';

function TableCard({ table, onPress }: { table: TableInfo; onPress: () => void }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  
  const statusColor = {
    available: colors.lime,
    occupied: colors.amber,
    reserved: colors.accent,
  }[table.status];
  
  const statusBg = {
    available: colors.successBg,
    occupied: colors.warningBg,
    reserved: colors.accentBg,
  }[table.status];

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.tableStatus, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
        <View style={styles.tableMeta}>
          <Users size={12} color={colors.inkSoft} />
          <Text style={[styles.tableCapacity, { color: colors.inkSoft }]}>{table.capacity}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.tableNumber, { color: colors.ink }]}>{table.number}</Text>
        <Text style={[styles.tableStatusLabel, { color: statusColor }]}>{t(`tables.status.${table.status}`)}</Text>
      </View>
    </Pressable>
  );
}

export default function OperationsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: branch, isLoading } = useBranchTables();
  const [segment, setSegment] = useState(0);
  const segments = [t('tables.segFloor'), t('tables.segQr')];

  const tables = useMemo(() => branch?.tables ?? [], [branch]);
  
  const floorColumns = useMemo(() => {
    const cols: TableInfo[][] = [];
    for (let i = 0; i < tables.length; i += 3) {
      cols.push(tables.slice(i, i + 3));
    }
    return cols;
  }, [tables]);

  if (isLoading) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.ink }]}>{t('tables.title')}</Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={80} radius={16} />)}
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']} padded={false}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('tables.title')}</Text>
        <Pressable
          hitSlop={12}
          onPress={() => router.push('/tables/create' as any)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
      
      <View style={styles.controlWrapper}>
        <SegmentedControl segments={segments} index={segment} onChange={setSegment} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {segment === 0 ? (
          tables.length === 0 ? (
            <EmptyState
              icon={<Table2 size={28} color={colors.inkSoft} />}
              title={t('tables.emptyTablesT')}
              subtitle={t('tables.emptyTablesS')}
            />
          ) : (
            <View style={styles.tabContent}>
              <View style={styles.legend}>
                {(['available', 'occupied', 'reserved'] as const).map((s) => (
                  <View key={s} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: { available: colors.lime, occupied: colors.amber, reserved: colors.accent }[s] }]} />
                    <Text style={[styles.legendText, { color: colors.inkSoft }]}>{t(`tables.status.${s}`)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.grid}>
                {floorColumns.map((col, ci) => (
                  <View key={ci} style={styles.gridRow}>
                    {col.map((table) => (
                      <TableCard
                        key={table._id}
                        table={table}
                        onPress={() => router.push(`/tables/${table._id}` as any)}
                      />
                    ))}
                    {col.length < 3 && Array.from({ length: 3 - col.length }).map((_, i) => (
                      <View key={`empty-${i}`} style={styles.gridEmptyFill} />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )
        ) : (
          tables.length === 0 ? (
            <EmptyState
              icon={<QrCode size={28} color={colors.inkSoft} />}
              title={t('tables.emptyQrT')}
              subtitle={t('tables.emptyQrS')}
            />
          ) : (
            <View style={styles.tabContent}>
              {branch?.qrCode && (
                <Card style={[styles.mainQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('tables.branchQr')}</Text>
                  <View style={[styles.qrContainer, { borderColor: colors.border }]}>
                    <Image source={{ uri: branch.qrCode }} style={styles.qrImage} />
                  </View>
                  <Text style={[styles.qrNote, { color: colors.inkSoft }]}>
                    {t('tables.branchQrNote')}
                  </Text>
                </Card>
              )}
              
              <View style={styles.qrList}>
                {tables.map((tbl) => (
                  <Card key={tbl._id} style={[styles.qrRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {tbl.qrCode ? (
                      <Image source={{ uri: tbl.qrCode }} style={styles.qrImageSmall} />
                    ) : (
                      <View style={[styles.qrPlaceholder, { backgroundColor: colors.bg, borderColor: colors.border }]} />
                    )}
                    <View style={styles.qrMetaBlock}>
                      <Text style={[styles.qrTableName, { color: colors.ink }]}>{tbl.number}</Text>
                      <Text style={[styles.qrTableStatus, { color: colors.inkSoft }]}>
                        {t('tables.qrRowMeta', { status: t(`tables.status.${tbl.status}`).toUpperCase(), capacity: tbl.capacity })}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 16, 
    paddingBottom: 12,
    paddingHorizontal: 16 
  },
  title: { 
    fontSize: typography.displayM.size, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  addBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  controlWrapper: {
    paddingHorizontal: 16,
    marginBottom: 4
  },
  skeletonContainer: { 
    padding: 16, 
    gap: 12 
  },
  scroll: { 
    paddingBottom: 40 
  },
  tabContent: {
    paddingHorizontal: 16
  },
  legend: { 
    flexDirection: 'row', 
    gap: 16, 
    paddingVertical: 14,
    justifyContent: 'flex-start'
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  legendDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  legendText: { 
    fontSize: typography.micro.size, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  grid: { 
    gap: 12 
  },
  gridRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  gridEmptyFill: {
    flex: 1
  },
  tableCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  tableStatus: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  tableMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  tableCapacity: { 
    fontSize: typography.micro.size, 
    fontWeight: '700' 
  },
  cardContent: {
    marginTop: 12,
    alignItems: 'flex-start'
  },
  tableNumber: { 
    fontSize: typography.h2.size, 
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2
  },
  tableStatusLabel: { 
    fontSize: typography.micro.size, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  mainQrCard: { 
    marginTop: 12,
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1
  },
  sectionTitle: { 
    fontSize: typography.body.size, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14
  },
  qrContainer: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginBottom: 12
  },
  qrNote: { 
    fontSize: typography.caption.size, 
    fontWeight: '500',
    textAlign: 'center' 
  },
  qrImage: { 
    width: 140, 
    height: 140,
    resizeMode: 'contain'
  },
  qrList: {
    marginTop: 16,
    gap: 10
  },
  qrRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12,
    borderRadius: 16,
    borderWidth: 1
  },
  qrImageSmall: { 
    width: 52, 
    height: 52, 
    borderRadius: 8,
    resizeMode: 'contain'
  },
  qrPlaceholder: { 
    width: 52, 
    height: 52, 
    borderRadius: 8, 
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  qrMetaBlock: { 
    flex: 1,
    marginLeft: 14
  },
  qrTableName: { 
    fontSize: typography.body.size, 
    fontWeight: '700',
    marginBottom: 2
  },
  qrTableStatus: { 
    fontSize: typography.caption.size,
    fontWeight: '600',
    letterSpacing: 0.2
  },
});