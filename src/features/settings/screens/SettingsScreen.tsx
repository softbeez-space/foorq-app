import { useEffect, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, View, Text, Pressable,
  TextInput, Image, Modal, Switch,
} from 'react-native';
import { Button } from '@/ui/Button';
import {
  Smartphone, Wifi, Wallet, Gavel, Clock,
  Bell, Music, Waves, Palette, Save, Loader2,
  Upload, ImageIcon, AlertTriangle, Check, ReceiptText,
} from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useRestaurant, useUpdateRestaurant, useUpdateVatSettings, useUploadLogo } from '../hooks';
import { useNotificationPrefs } from '../store';
import { ToggleSetting } from '../components/ToggleSetting';
import { PaymentSection } from '../components/PaymentSection';

const CURRENCIES = [
  { code: 'BDT', label: 'Bangladeshi Taka (৳)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
];

const TIMEZONES = [
  'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Dubai',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Australia/Sydney', 'UTC',
];

const VAT_TYPES = [
  { value: 'ordinary', label: 'Ordinary · 5%', rate: '5' },
  { value: 'ac-hotel', label: 'AC hotel · 15%', rate: '15' },
  { value: 'nonac-hotel', label: 'Non-AC hotel · ~10%', rate: '10' },
  { value: 'other', label: 'Other · confirm', rate: '15' },
];

const ACCENT_PALETTE = [
  { hex: '#F97316', label: 'Saffron' },
  { hex: '#FF6B6B', label: 'Coral' },
  { hex: '#0EA5E9', label: 'Azure' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#FB7185', label: 'Rose' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#64748B', label: 'Slate' },
];

export function SettingsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { user, refreshProfile } = useSession();
  const { data: restaurant, isLoading, error } = useRestaurant();
  const updateMutation = useUpdateRestaurant();
  const vatMutation = useUpdateVatSettings();
  const uploadMutation = useUploadLogo();
  const { load: loadNotifPrefs, ...prefs } = useNotificationPrefs();
  const isOwner = user?.role === 'owner';
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Local form state (mirrors web exactly) ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [logo, setLogo] = useState('');
  const [accentColor, setAccentColor] = useState('#F97316');
  const [enableOrdering, setEnableOrdering] = useState(true);
  const [restrictOrdersToWifi, setRestrictOrdersToWifi] = useState(false);
  const [enableTablePayment, setEnableTablePayment] = useState(false);
  const [payments, setPayments] = useState<Record<string, boolean>>({ cash: true, bkash: false, sslcommerz: false });
  const [currency, setCurrency] = useState('BDT');
  const [taxRate, setTaxRate] = useState(0);
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [vatEnabled, setVatEnabled] = useState(false);
  const [taxMode, setTaxMode] = useState('off');
  const [vatType, setVatType] = useState('ordinary');
  const [bin, setBin] = useState('');
  const [vatRate, setVatRate] = useState('5');
  const [turnoverRate, setTurnoverRate] = useState('4');
  const [vatConfirmed, setVatConfirmed] = useState(false);
  const [savingVat, setSavingVat] = useState(false);

  useEffect(() => { loadNotifPrefs(); }, [loadNotifPrefs]);
  useEffect(() => {
    if (!restaurant || hydrated) return;
    if (restaurant.name) setName(restaurant.name);
    if (restaurant.description) setDescription(restaurant.description);
    if (restaurant.cuisine?.length) setCuisine(restaurant.cuisine.join(', '));
    if (restaurant.logo) setLogo(restaurant.logo);
    if (restaurant.accentColor) setAccentColor(restaurant.accentColor);
    const s = restaurant.settings;
    if (!s) { setHydrated(true); return; }
    if (s.enableOrdering !== undefined) setEnableOrdering(s.enableOrdering);
    if (s.restrictOrdersToWifi !== undefined) setRestrictOrdersToWifi(s.restrictOrdersToWifi);
    if (s.enableTablePayment !== undefined) setEnableTablePayment(s.enableTablePayment);
    if (s.paymentMethods) {
      setPayments((prev) => ({
        ...prev,
        ...(s.paymentMethods.cash !== undefined && { cash: s.paymentMethods.cash }),
        ...(s.paymentMethods.bkash !== undefined && { bkash: s.paymentMethods.bkash }),
        ...(s.paymentMethods.sslcommerz !== undefined && { sslcommerz: s.paymentMethods.sslcommerz }),
      }));
    }
    if (s.currency) setCurrency(s.currency);
    if (s.taxRate !== undefined) setTaxRate(s.taxRate);
    if (s.timezone) setTimezone(s.timezone);
    if ((s as any).vatEnabled !== undefined) setVatEnabled(!!(s as any).vatEnabled);
    setTaxMode((s as any).taxMode || ((s as any).vatEnabled ? 'vat' : 'off'));
    if ((s as any).vatType) setVatType((s as any).vatType);
    if ((s as any).turnoverRate !== undefined) setTurnoverRate(String((s as any).turnoverRate ?? 4));
    if ((s as any).bin !== undefined) setBin((s as any).bin || '');
    if ((s as any).vatRate !== undefined) setVatRate(String((s as any).vatRate ?? 5));
    setHydrated(true);
  }, [restaurant, hydrated]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        name,
        description,
        cuisine: cuisine.split(',').map((c) => c.trim()).filter(Boolean),
        logo,
        accentColor,
        'settings.enableOrdering': enableOrdering,
        'settings.restrictOrdersToWifi': restrictOrdersToWifi,
        'settings.enableTablePayment': enableTablePayment,
        'settings.paymentMethods.cash': payments.cash,
        'settings.paymentMethods.bkash': payments.bkash,
        'settings.paymentMethods.sslcommerz': payments.sslcommerz,
        'settings.currency': currency,
        'settings.taxRate': taxRate,
        'settings.timezone': timezone,
      });
      refreshProfile();
      Alert.alert(t('settings.saved'), t('settings.savedBody'));
    } catch {
      Alert.alert(t('settings.errTitle'), t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoPick = async () => {
    try {
      const { launchImageLibraryAsync } = await import('expo-image-picker');
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        const url = await uploadMutation.mutateAsync(result.assets[0].uri);
        setLogo(url);
      }
    } catch { /* ignore */ }
  };

  const handlePaymentToggle = (key: string) => {
    setPayments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVatType = (value: string) => {
    setVatType(value);
    const t = VAT_TYPES.find((t) => t.value === value);
    if (t) setVatRate(t.rate);
  };

  const wasTaxOff = () => {
    const m = (restaurant as any)?.settings?.taxMode || ((restaurant as any)?.settings?.vatEnabled ? 'vat' : 'off');
    return m === 'off';
  };
  const wasVatOff = wasTaxOff;

  const handleSaveVat = async () => {
    const wasMode = (restaurant as any)?.settings?.taxMode || ((restaurant as any)?.settings?.vatEnabled ? 'vat' : 'off');
    if (taxMode !== 'off' && wasMode === 'off' && !vatConfirmed) {
      Alert.alert(t('settings.confirmFirst'), t('settings.confirmFirstBody'));
      return;
    }
    setSavingVat(true);
    try {
      await vatMutation.mutateAsync({
        taxMode,
        vatEnabled: taxMode !== 'off',
        vatType,
        bin: bin.trim(),
        vatRate: vatRate === '' ? undefined : Number(vatRate),
        turnoverRate: turnoverRate === '' ? undefined : Number(turnoverRate),
      });
      refreshProfile();
      Alert.alert(t('settings.saved'), t('settings.vatSavedBody'));
    } catch (e: any) {
      Alert.alert(t('settings.errTitle'), e?.response?.data?.message ?? t('settings.saveFailed'));
    } finally {
      setSavingVat(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('settings.title')} />
        <View style={styles.center} />
      </Screen>
    );
  }

  if (error || !restaurant) {
    return (
      <Screen>
        <ScreenHeader title={t('settings.title')} />
        <EmptyState
          icon={<AlertTriangle size={32} color={colors.inkSoft} />}
          title={t('settings.loadError')}
          subtitle={t('settings.loadErrorSub')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Section ── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>{t('settings.profile')}</Text>

          <View style={[styles.rowBetween, { borderBottomColor: colors.border }]}>
            <View style={styles.fieldInfo}>
              <Text style={[styles.fieldLabel, { color: colors.ink }]}>{t('settings.resName')}</Text>
              <PickerTextInput
                value={name}
                onChangeText={setName}
                placeholder={t('settings.resNamePh')}
                colors={colors}
              />
            </View>
          </View>

          <View style={[styles.rowBetween, { borderBottomColor: colors.border }]}>
            <View style={styles.fieldInfo}>
              <Text style={[styles.fieldLabel, { color: colors.ink }]}>{t('settings.description')}</Text>
              <PickerTextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t('settings.descriptionPh')}
                multiline
                colors={colors}
              />
            </View>
          </View>

          <View style={[styles.rowBetween, { borderBottomColor: colors.border }]}>
            <View style={styles.fieldInfo}>
              <Text style={[styles.fieldLabel, { color: colors.ink }]}>{t('settings.cuisine')}</Text>
              <PickerTextInput
                value={cuisine}
                onChangeText={setCuisine}
                placeholder={t('settings.cuisinePh')}
                colors={colors}
              />
              <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('settings.cuisineHint')}</Text>
            </View>
          </View>

          {/* Logo */}
          <View style={styles.rowBetween}>
            <View style={[styles.logoPreview, { backgroundColor: colors.surface2 }]}>
              {logo ? (
                <Image source={{ uri: logo }} style={styles.logoImg} />
              ) : (
                <ImageIcon size={24} color={colors.inkSoft} />
              )}
            </View>
            <View style={styles.fieldInfo}>
              <Text style={[styles.fieldLabel, { color: colors.ink }]}>{t('settings.logo')}</Text>
              <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('settings.logoHint')}</Text>
              <View style={styles.logoActions}>
                <Pressable
                  onPress={handleLogoPick}
                  style={[styles.chipBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                >
                  <Upload size={14} color={colors.inkSoft} />
                  <Text style={[styles.chipBtnText, { color: colors.inkSoft }]}>
                    {uploadMutation.isPending ? t('settings.uploading') : t('settings.upload')}
                  </Text>
                </Pressable>
                {!!logo && (
                  <Pressable onPress={() => setLogo('')}>
                    <Text style={[styles.removeText, { color: colors.rose }]}>{t('settings.remove')}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ── Restaurant Settings ── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>{t('settings.resSettings')}</Text>

          <ToggleSetting
            icon={Smartphone}
            title={t('settings.digitalOrdering')}
            description={t('settings.digitalOrderingSub')}
            value={enableOrdering}
            onChange={setEnableOrdering}
          />
          <ToggleSetting
            icon={Wifi}
            title={t('settings.wifiRestrict')}
            description={t('settings.wifiRestrictSub')}
            value={restrictOrdersToWifi}
            onChange={setRestrictOrdersToWifi}
          />

          <PaymentSection
            enabled={enableTablePayment}
            onToggle={() => setEnableTablePayment(!enableTablePayment)}
            payments={payments}
            onPaymentToggle={handlePaymentToggle}
          />

          {/* Currency */}
          <View style={[styles.rowBetween, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                <Wallet size={20} color={colors.inkSoft} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.ink }]}>{t('settings.currency')}</Text>
                <Text style={[styles.desc, { color: colors.inkSoft }]}>{t('settings.currencySub')}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {CURRENCIES.map((c) => {
                const sel = c.code === currency;
                return (
                  <Pressable
                    key={c.code}
                    onPress={() => setCurrency(c.code)}
                    style={[
                      styles.chip,
                      { backgroundColor: sel ? colors.primary : colors.surface2, borderColor: sel ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: sel ? colors.onPrimary : colors.inkSoft }]}>{c.code}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Tax Rate */}
          <View style={[styles.rowBetween, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                <Gavel size={20} color={colors.inkSoft} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.ink }]}>{t('settings.taxRate')}</Text>
                <Text style={[styles.desc, { color: colors.inkSoft }]}>{t('settings.taxRateSub')}</Text>
              </View>
            </View>
            <View style={[styles.taxInput, { borderColor: colors.border, backgroundColor: colors.surface2 }]}>
              <TextInput
                value={taxRate.toString()}
                onChangeText={(t) => { const n = parseFloat(t); if (!isNaN(n)) setTaxRate(n); }}
                keyboardType="numeric"
                style={[styles.taxInputField, { color: colors.ink }]}
                placeholder="0"
                placeholderTextColor={colors.inkSoft}
              />
              <Text style={[styles.suffix, { color: colors.inkSoft }]}>%</Text>
            </View>
          </View>

          {/* Timezone */}
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                <Clock size={20} color={colors.inkSoft} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.ink }]}>{t('settings.timezone')}</Text>
                <Text style={[styles.desc, { color: colors.inkSoft }]}>{t('settings.timezoneSub')}</Text>
              </View>
            </View>
            <TimePicker value={timezone} onChange={setTimezone} options={TIMEZONES} colors={colors} />
          </View>
        </View>

        {/* ── VAT (Mushak) ── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
              <ReceiptText size={20} color={colors.inkSoft} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.ink }]}>{t('settings.taxRegime')}</Text>
              <Text style={[styles.desc, { color: colors.inkSoft }]}>{t('settings.taxRegimeSub')}</Text>
            </View>
          </View>
          <View style={[styles.vatTypeRow, { marginTop: 12 }]}>
            {[
              { value: 'off', label: t('settings.taxOff') },
              { value: 'vat', label: t('settings.taxVat') },
              { value: 'turnover', label: t('settings.taxTurnover') },
            ].map((m) => {
              const sel = taxMode === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => { setTaxMode(m.value); setVatEnabled(m.value !== 'off'); }}
                  style={[styles.vatTypeChip, { borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.primaryBg : colors.surface }]}
                >
                  <Text style={[styles.vatTypeText, { color: sel ? colors.primary700 : colors.ink }]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {taxMode === 'turnover' && (
            <View style={{ marginTop: 12, gap: 12 }}>
              <View>
                <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('settings.turnoverHint')}</Text>
                <TextInput
                  value={turnoverRate}
                  onChangeText={(t) => setTurnoverRate(t.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor={colors.inkSoft}
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                />
              </View>
              {wasVatOff() && (
                <Pressable onPress={() => setVatConfirmed(!vatConfirmed)} style={styles.confirmRow} hitSlop={8}>
                  <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: vatConfirmed ? colors.accent : 'transparent' }]}>
                    {vatConfirmed && <Check size={14} color="#FFF" />}
                  </View>
                  <Text style={[styles.hint, { color: colors.ink }]}>{t('settings.confirmTax')}</Text>
                </Pressable>
              )}
              <Button onPress={handleSaveVat} loading={savingVat} size="md" shape="pill" leftIcon={<Save size={16} color={colors.onPrimary} />}>
                {t('settings.saveTax')}
              </Button>
            </View>
          )}
          {taxMode === 'vat' && (
            <View style={{ marginTop: 12, gap: 12 }}>
              <View style={styles.vatTypeRow}>
                {VAT_TYPES.map((t) => {
                  const sel = vatType === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => handleVatType(t.value)}
                      style={[styles.vatTypeChip, { borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.primaryBg : colors.surface }]}
                    >
                      <Text style={[styles.vatTypeText, { color: sel ? colors.primary700 : colors.ink }]}>{t.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('settings.binHint')}</Text>
                  <TextInput
                    value={bin}
                    onChangeText={(v) => setBin(v.replace(/[^\d]/g, '').slice(0, 12))}
                    keyboardType="numeric"
                    placeholder={t('settings.binPh')}
                    placeholderTextColor={colors.inkSoft}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                  />
                </View>
                <View style={{ width: 110 }}>
                  <Text style={[styles.hint, { color: colors.inkSoft }]}>{t('settings.rateHint')}</Text>
                  <TextInput
                    value={vatRate}
                    onChangeText={(t) => setVatRate(t.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={colors.inkSoft}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                  />
                </View>
              </View>
              <Text style={[styles.hint, { color: colors.warningText }]}>
                {t('settings.vatGuidance')}
              </Text>
              {wasTaxOff() && (
                <Pressable onPress={() => setVatConfirmed(!vatConfirmed)} style={styles.confirmRow} hitSlop={8}>
                  <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: vatConfirmed ? colors.accent : 'transparent' }]}>
                    {vatConfirmed && <Check size={14} color="#FFF" />}
                  </View>
                  <Text style={[styles.hint, { color: colors.ink }]}>{t('settings.confirmVat')}</Text>
                </Pressable>
              )}
              <Button onPress={handleSaveVat} loading={savingVat} size="md" shape="pill" leftIcon={<Save size={16} color={colors.onPrimary} />}>
                {t('settings.saveVat')}
              </Button>
            </View>
          )}
        </View>

        {/* ── Branding ── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
              <Palette size={20} color={colors.inkSoft} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.ink }]}>{t('settings.brandAccent')}</Text>
              <Text style={[styles.desc, { color: colors.inkSoft }]}>{t('settings.brandAccentSub')}</Text>
            </View>
          </View>
          <View style={styles.swatchGrid}>
            {ACCENT_PALETTE.map(({ hex, label }) => {
              const sel = accentColor.toLowerCase() === hex.toLowerCase();
              return (
                <Pressable
                  key={hex}
                  onPress={() => setAccentColor(hex)}
                  style={[styles.swatch, { backgroundColor: hex, borderColor: sel ? colors.ink : 'transparent' }]}
                  accessibilityLabel={`${label}${sel ? ', selected' : ''}`}
                  accessibilityRole="radio"
                >
                  {sel && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Notification Preferences ── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>{t('settings.notifPrefs')}</Text>
          <ToggleSetting
            icon={Bell}
            title={t('settings.notifOrders')}
            description={t('settings.notifOrdersSub')}
            value={prefs.notifyOrders}
            onChange={() => prefs.toggle('notifyOrders')}
          />
          <ToggleSetting
            icon={Music}
            title={t('settings.soundAlerts')}
            description={t('settings.soundAlertsSub')}
            value={prefs.notifySound}
            onChange={() => prefs.toggle('notifySound')}
          />
          <ToggleSetting
            icon={Waves}
            title={t('settings.haptic')}
            description={t('settings.hapticSub')}
            value={prefs.notifyHaptic}
            onChange={() => prefs.toggle('notifyHaptic')}
          />
        </View>

        {/* ── Save Bar ── */}
        <View style={[styles.saveBar, { borderTopColor: colors.border }]}>
          <Text style={[styles.saveHint, { color: colors.inkSoft }]}>
            {t('settings.saveHint')}
          </Text>
          {isOwner && (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { backgroundColor: colors.ink, opacity: saving ? 0.6 : 1 }]}
            >
              {saving ? (
                <Loader2 size={16} color="#FFFFFF" />
              ) : (
                <Save size={16} color="#FFFFFF" />
              )}
              <Text style={styles.saveBtnText}>{t('settings.saveChanges')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

// ─── Time picker modal ───
function TimePicker({
  value, onChange, options, colors,
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; colors: ReturnType<typeof useTheme>['colors'];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.surface2 }]}
      >
        <Text style={[styles.pickerText, { color: colors.ink }]} numberOfLines={1}>{value.replace('_', ' ')}</Text>
      </Pressable>
      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
              <ScrollView>
                {options.map((tz) => (
                  <Pressable
                    key={tz}
                    onPress={() => { onChange(tz); setOpen(false); }}
                    style={[styles.pickerOption, { borderBottomColor: colors.border }, tz === value && { backgroundColor: colors.primary50 }]}
                  >
                    <Text style={[styles.pickerOptionText, { color: tz === value ? colors.primary : colors.ink }]}>{tz}</Text>
                    {tz === value && <Check size={18} color={colors.primary} />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

// ─── Reusable text input for settings fields ───
function PickerTextInput({
  value, onChangeText, placeholder, multiline, colors,
}: {
  value: string; onChangeText: (v: string) => void; placeholder: string;
  multiline?: boolean; colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.inkSoft}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      style={[styles.textInput, { color: colors.ink, borderColor: colors.border, backgroundColor: colors.surface2 }]}
    />
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },

  // Cards
  card: { marginHorizontal: 20, marginTop: 16, padding: 20, borderRadius: 20 },
  sectionHeading: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: spacing.md },

  // Toggle rows
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: typography.body.size, fontWeight: '600' },
  desc: { fontSize: typography.caption.size, marginTop: 2 },

  // Profile fields
  rowBetween: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.md,
  },
  fieldInfo: { flex: 1 },
  fieldLabel: { fontSize: typography.body.size, fontWeight: '600', marginBottom: 4 },
  textInput: {
    fontSize: typography.body.size, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, marginTop: 4,
  },
  hint: { fontSize: typography.micro.size, marginTop: 4 },

  // Logo
  logoPreview: { width: 64, height: 64, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: 64, height: 64, borderRadius: 14 },
  logoActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  chipBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipBtnText: { fontSize: typography.caption.size, fontWeight: '600' },
  removeText: { fontSize: typography.caption.size, fontWeight: '600' },

  // Currency chips
  chipScroll: { flexDirection: 'row', gap: spacing.xs },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: typography.caption.size, fontWeight: '600' },

  // VAT
  vatTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vatTypeChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  vatTypeText: { fontSize: typography.caption.size, fontWeight: '700' },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44, fontSize: typography.body.size },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Tax rate
  taxInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingRight: 10 },
  taxInputField: { fontSize: typography.body.size, fontWeight: '700', width: 56, textAlign: 'center', paddingVertical: 8 },
  suffix: { fontSize: typography.body.size, fontWeight: '700' },

  // Time picker
  pickerBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, maxWidth: 180 },
  pickerText: { fontSize: typography.caption.size, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 40 },
  pickerSheet: { maxHeight: 400, borderRadius: 20, padding: 8 },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  pickerOptionText: { fontSize: typography.body.size, fontWeight: '500' },

  // Branding
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  swatch: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5 },

  // Save bar
  saveBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, marginTop: 20, paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveHint: { fontSize: typography.micro.size, flex: 1, marginRight: 16 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: typography.body.size, fontWeight: '700' },
});
