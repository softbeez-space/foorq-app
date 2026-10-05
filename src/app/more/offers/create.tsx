import { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  Modal, Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Calendar as CalendarIcon, Percent, Layers, Gift, Wallet, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useCreateOffer } from '@/features/offers/hooks';

const OFFER_TYPES = [
  { value: 'discount' as const, labelKey: 'more.offerDiscount', icon: Percent },
  { value: 'bogo' as const, labelKey: 'more.offerBogo', icon: Layers },
  { value: 'free_item' as const, labelKey: 'more.offerFreeItem', icon: Gift },
];

const DISCOUNT_TYPES = [
  { value: 'percentage' as const, labelKey: 'more.discPerc', suffix: '%' },
  { value: 'fixed' as const, labelKey: 'more.discFixed', suffix: '৳' },
];

function fmt(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const WEEK_MS = 7 * 86400000;
const defaultEndDate = () => new Date(Date.now() + WEEK_MS);

export default function CreateOfferScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'discount' | 'bogo' | 'free_item'>('discount');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [promoCode, setPromoCode] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const createMutation = useCreateOffer();

  // Date picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [pickerDate, setPickerDate] = useState(new Date());

  const openPicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
    setPickerDate(mode === 'start' ? startDate : endDate);
    setPickerOpen(true);
  };

  const onPickerChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
      if (date) {
        if (pickerMode === 'start') setStartDate(date);
        else setEndDate(date);
      }
    } else {
      if (date) setPickerDate(date);
    }
  };

  const confirmPicker = () => {
    if (pickerMode === 'start') setStartDate(pickerDate);
    else setEndDate(pickerDate);
    setPickerOpen(false);
  };

  const cancelPicker = () => setPickerOpen(false);

  const handleCreate = async () => {
    if (!name.trim() || !discountValue || !startDate || !endDate) {
      Alert.alert(t('more.required'), t('more.offerCreateRequired'));
      return;
    }
    if (endDate <= startDate) {
      Alert.alert(t('more.invalidDates'), t('more.invalidDatesBody'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        discountType: type === 'discount' ? discountType : undefined,
        discountValue: Number(discountValue),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        promoCode: promoCode.trim().toUpperCase() || undefined,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
      });
      router.back();
    } catch { /* handled by hook */ }
  };

  const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.newOfferTitle')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Offer Type ── */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.offerTypeEyebrow')}</Text>
          <Card>
          <View style={styles.typeGrid}>
            {OFFER_TYPES.map((ot) => {
              const selected = type === ot.value;
              const TypeIcon = ot.icon;
              const typeLabel = t(ot.labelKey);
              return (
                <Pressable
                  key={ot.value}
                  onPress={() => {
                    setType(ot.value);
                    if (ot.value !== 'discount') setDiscountValue('0');
                  }}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selected ? colors.primary50 : colors.surface2,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityLabel={typeLabel}
                >
                  <TypeIcon size={24} color={selected ? colors.primary : colors.inkSoft} />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: selected ? colors.primaryText : colors.inkSoft },
                    ]}
                  >
                    {typeLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </Card>
        </View>

        {/* ── Basic Info ── */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.basics')}</Text>
          <Card padded={false} style={styles.groupCard}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.inkSoft }]}>
                {t('more.offerNameLabel')} <Text style={{ color: colors.rose }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { color: colors.ink }]}
                value={name}
                onChangeText={setName}
                placeholder={t('more.offerNamePh2')}
                placeholderTextColor={colors.inkSoft}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.expDescLabel')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.ink }]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('more.offerDescPh2')}
                placeholderTextColor={colors.inkSoft}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.offerPromo')}</Text>
              <TextInput
                style={[styles.input, { color: colors.ink }]}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder={t('more.offerPromoPh')}
                placeholderTextColor={colors.inkSoft}
                autoCapitalize="characters"
              />
            </View>
          </Card>
        </View>

        {/* ── Discount Config ── */}
        {type === 'discount' && (
          <View>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.valueEyebrow')}</Text>
            <Card style={styles.stackCard}>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.offerType')}</Text>
                <View style={styles.chipRow}>
                  {DISCOUNT_TYPES.map((dt) => {
                    const selected = discountType === dt.value;
                    return (
                      <Pressable
                        key={dt.value}
                        onPress={() => setDiscountType(dt.value)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface2,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                        accessibilityRole="radio"
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: selected ? colors.onPrimary : colors.inkSoft },
                          ]}
                        >
                          {t(dt.labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.valueReq')}</Text>
                <View
                  style={[
                    styles.valueInputRow,
                    { backgroundColor: colors.surface2, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.valueInput, { color: colors.ink }]}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder={discountType === 'percentage' ? '10' : '100'}
                    placeholderTextColor={colors.inkSoft}
                    keyboardType="decimal-pad"
                  />
                  <View style={[styles.valueSuffix, { backgroundColor: colors.primaryBg }]}>
                    <Text style={[styles.valueSuffixText, { color: colors.primary }]}>
                      {discountType === 'percentage' ? '%' : '৳'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* ── Schedule ── */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.schedule')}</Text>
          <Card style={styles.stackCard}>

            {/* Start Date */}
            <Pressable
              onPress={() => openPicker('start')}
              style={styles.dateRow}
              accessibilityLabel={t('more.startDateA11y', { date: fmt(startDate) })}
              accessibilityRole="button"
            >
              <View style={[styles.dateIcon, { backgroundColor: colors.accentBg }]}>
                <CalendarIcon size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateLabel, { color: colors.inkSoft }]}>{t('more.startDate')}</Text>
                <Text style={[styles.dateValue, { color: colors.ink }]}>{fmt(startDate)}</Text>
              </View>
              <ChevronRight size={18} color={colors.inkSoft} />
            </Pressable>

            {/* End Date */}
            <Pressable
              onPress={() => openPicker('end')}
              style={styles.dateRow}
              accessibilityLabel={t('more.endDateA11y', { date: fmt(endDate) })}
              accessibilityRole="button"
            >
              <View style={[styles.dateIcon, { backgroundColor: colors.dangerBg }]}>
                <CalendarIcon size={20} color={colors.rose} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateLabel, { color: colors.inkSoft }]}>{t('more.endDate')}</Text>
                <Text style={[styles.dateValue, { color: colors.ink }]}>{fmt(endDate)}</Text>
              </View>
              <ChevronRight size={18} color={colors.inkSoft} />
            </Pressable>

            {/* Duration hint */}
            <View style={[styles.durationRow, { backgroundColor: colors.surface2 }]}>
              <CalendarIcon size={14} color={colors.inkSoft} />
              <Text style={[styles.durationText, { color: colors.inkSoft }]}>
                {t('more.durationDays', { days: durationDays })}{durationDays < 0 ? t('more.expiredAdjust') : ' '}
                {t('more.dateRange', { start: fmt(startDate), end: fmt(endDate) })}
              </Text>
            </View>
          </Card>
        </View>

        {/* ── Limits ── */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.limits')}</Text>
          <Card padded={false} style={styles.groupCard}>

            <View style={styles.limitRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.minOrderTk')}</Text>
                <View style={styles.limitInput}>
                  <Wallet size={14} color={colors.inkSoft} />
                  <TextInput
                    style={[styles.limitInputField, { color: colors.ink }]}
                    value={minOrderAmount}
                    onChangeText={setMinOrderAmount}
                    placeholder="0"
                    placeholderTextColor={colors.inkSoft}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.usageLimit')}</Text>
                <TextInput
                  style={[styles.limitInputField, { color: colors.ink }]}
                  value={usageLimit}
                  onChangeText={setUsageLimit}
                  placeholder={t('more.unlimited')}
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </Card>
        </View>

        {/* ── Submit ── */}
        <Button onPress={handleCreate} loading={createMutation.isPending} size="lg" shape="pill">
          {t('more.createOffer')}
        </Button>
      </ScrollView>

      {/* ─── Date Picker Modal ─── */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={cancelPicker}
      >
        <Pressable style={styles.overlay} onPress={cancelPicker}>
          <Pressable
            style={[styles.pickerSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={cancelPicker} hitSlop={12}>
                <Text style={[styles.pickerCancel, { color: colors.inkSoft }]}>{t('more.pickerCancel')}</Text>
              </Pressable>
              <Text style={[styles.pickerTitle, { color: colors.ink }]}>
                {pickerMode === 'start' ? t('more.startDateTitle') : t('more.endDateTitle')}
              </Text>
              <Pressable onPress={confirmPicker} hitSlop={12}>
                <Text style={[styles.pickerDone, { color: colors.primary }]}>{t('more.pickerDone')}</Text>
              </Pressable>
            </View>

            {/* Picker */}
            <View style={styles.pickerBody}>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                onChange={onPickerChange}
                minimumDate={pickerMode === 'end' ? startDate : new Date()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  groupCard: { paddingHorizontal: 16, paddingVertical: 10, gap: 18 },
  stackCard: { gap: 18 },

  // Type grid
  typeGrid: { flexDirection: 'row', gap: spacing.sm },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  typeLabel: { fontSize: typography.caption.size, fontWeight: '700' },

  // Fields (grouped standard: small-caps labels, borderless inputs)
  field: { gap: 4 },
  label: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: typography.body.size, fontWeight: '600', paddingVertical: 4 },
  textArea: { minHeight: 72 },

  // Discount
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: typography.caption.size, fontWeight: '600' },
  valueInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  valueInput: {
    flex: 1,
    fontSize: typography.h2.size,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  valueSuffix: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  valueSuffixText: { fontSize: typography.h2.size, fontWeight: '800' },

  // Schedule
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 4,
  },
  dateIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  dateLabel: { fontSize: typography.micro.size, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  dateValue: { fontSize: typography.body.size, fontWeight: '600' },
  durationRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
  },
  durationText: { fontSize: typography.micro.size, fontWeight: '600' },

  // Limits
  limitRow: { flexDirection: 'row', gap: spacing.md },
  limitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  limitInputField: { flex: 1, fontSize: typography.body.size, fontWeight: '600', paddingVertical: 4 },

  // Picker modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerCancel: { fontSize: typography.body.size, fontWeight: '500' },
  pickerTitle: { fontSize: typography.h2.size, fontWeight: '700' },
  pickerDone: { fontSize: typography.body.size, fontWeight: '700' },
  pickerBody: { alignItems: 'center', paddingVertical: 8 },
});
