import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useBranchTables, useUpdateTable, useDeleteTable } from '@/features/tables/hooks';
import { useBranchStore } from '@/features/branches/store';
import { useLocale } from '@/i18n/LocaleContext';

const STATUS_CYCLE = ['available', 'occupied', 'reserved'] as const;

export default function TableDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const branchId = useBranchStore((s) => s.selectedBranchId);
  const { data: branch, isLoading } = useBranchTables();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Skeleton width="100%" height={220} radius={24} />
        </View>
      </Screen>
    );
  }

  const table = branch?.tables?.find((t) => t._id === id);

  if (!table) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('tables.detail.notFound')}</Text>
        </View>
      </Screen>
    );
  }

  const statusColor = { available: colors.lime, occupied: colors.amber, reserved: colors.accent }[table.status];
  const statusBg = { available: colors.successBg, occupied: colors.warningBg, reserved: colors.accentBg }[table.status];

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(table.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    if (branchId) updateTable.mutate({ branchId, tableId: table._id, data: { status: next } });
  };

  const handleSave = async () => {
    if (!branchId) return;
    try {
      await updateTable.mutateAsync({
        branchId,
        tableId: table._id,
        data: { number: number.trim() || undefined, capacity: capacity ? Number(capacity) : undefined },
      });
      setEditing(false);
    } catch {}
  };

  const handleDelete = () => {
    Alert.alert(t('tables.detail.delete'), t('tables.detail.deleteM'), [
      { text: t('tables.detail.cancel'), style: 'cancel' },
      { text: t('tables.detail.confirmDelete'), style: 'destructive', onPress: async () => {
        if (branchId) { await deleteTable.mutateAsync({ branchId, tableId: table._id }); router.back(); }
      } },
    ]);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.navBtn}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('tables.detail.title')}</Text>
        <Pressable 
          hitSlop={12} 
          onPress={() => {
            if (!editing) { setNumber(table.number); setCapacity(String(table.capacity)); }
            setEditing(!editing);
          }}
          style={styles.editTouch}
        >
          <Text style={[styles.editBtn, { color: editing ? colors.rose : colors.accent }]}>
            {editing ? t('tables.detail.cancel') : t('tables.detail.edit')}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.heroLabel, { color: colors.inkSoft }]}>{t('tables.detail.identifier')}</Text>
          <Text style={[styles.tableNumber, { color: colors.ink }]}>{table.number}</Text>
          
          <Pressable onPress={cycleStatus} style={[styles.statusBadge, { backgroundColor: statusBg }]} hitSlop={8}>
            <Text style={[styles.statusText, { color: statusColor }]}>{t(`tables.status.${table.status}`)}</Text>
          </Pressable>
          <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('tables.detail.tapHint')}</Text>
        </Card>

        <Card style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('tables.detail.config')}</Text>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('tables.detail.numberLabel')}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.ink }]} 
                  value={number} 
                  onChangeText={setNumber} 
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('tables.detail.capacityLabel')}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.ink }]} 
                  value={capacity} 
                  onChangeText={setCapacity} 
                  keyboardType="number-pad" 
                />
              </View>
              <Button onPress={handleSave} loading={updateTable.isPending} style={styles.saveBtn}>
                {t('tables.detail.save')}
              </Button>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('tables.detail.capacity')}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{t('tables.detail.guests', { count: table.capacity })}</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('tables.detail.currentState')}</Text>
                <Text style={[styles.detailValue, { color: statusColor, textTransform: 'capitalize' }]}>{t(`tables.status.${table.status}`)}</Text>
              </View>
            </View>
          )}
        </Card>

        {table.qrCode && (
          <Card style={[styles.qrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.ink, marginBottom: 16 }]}>{t('tables.detail.digitalQr')}</Text>
            <View style={[styles.qrContainer, { borderColor: colors.border }]}>
              <Image source={{ uri: table.qrCode }} style={styles.qrImage} />
            </View>
            <Text style={[styles.qrNote, { color: colors.inkSoft }]}>{t('tables.detail.qrNote')}</Text>
          </Card>
        )}

        <View style={styles.actionWrap}>
          <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.rose }]}>
            <Text style={[styles.deleteText, { color: colors.rose }]}>{t('tables.detail.delete')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 16 
  },
  emptyText: {
    fontSize: typography.body.size,
    fontWeight: '500',
    textAlign: 'center'
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
    paddingHorizontal: 4
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
  heroCard: { 
    alignItems: 'center', 
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  heroLabel: {
    fontSize: typography.micro.size,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  tableNumber: { 
    fontSize: typography.displayXl.size, 
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 10
  },
  statusBadge: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusText: { 
    fontSize: typography.caption.size, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  hint: { 
    fontSize: typography.micro.size, 
    fontWeight: '500',
    marginTop: 8 
  },
  detailsCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1
  },
  sectionTitle: { 
    fontSize: typography.body.size, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16
  },
  editForm: {
    gap: 14
  },
  inputWrapper: {
    gap: 6
  },
  fieldLabel: { 
    fontSize: typography.caption.size, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginLeft: 2
  },
  input: { 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 14, 
    height: 48, 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  saveBtn: {
    marginTop: 4
  },
  infoList: {
    gap: 12
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 2
  },
  detailLabel: { 
    fontSize: typography.body.size,
    fontWeight: '500'
  },
  detailValue: { 
    fontSize: typography.body.size, 
    fontWeight: '700' 
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.6
  },
  qrCard: { 
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1
  },
  qrContainer: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginBottom: 12
  },
  qrImage: { 
    width: 150, 
    height: 150,
    resizeMode: 'contain'
  },
  qrNote: { 
    fontSize: typography.caption.size, 
    fontWeight: '500',
    textAlign: 'center' 
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