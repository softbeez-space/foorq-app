import { useState, useEffect, type ReactNode } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Armchair, Check, MapPin, Phone, QrCode, Save, Store, Wifi } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Badge } from '@/ui/Badge';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import { BranchQrStudio } from '@/features/qr/components/BranchQrStudio';
import { api } from '@/shared/api/client';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Grab-style hero (avatar, name, status pills, primary action) over
// Places-style info rows and Luma-style grouped setting sections.
export default function BranchSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const branches = useBranchStore((s) => s.branches);
  const loadBranches = useBranchStore((s) => s.loadBranches);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const setBranch = useBranchStore((s) => s.setBranch);

  const branch = branches.find((b) => b._id === id);
  const isCurrent = !!branch && branch._id === selectedBranchId;
  const tableCount = branch?.tables?.length ?? branch?.tableCount ?? 0;

  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [restrictWifi, setRestrictWifi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGoogleUrl, setSavingGoogleUrl] = useState(false);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);

  // Derived form state: reset WiFi fields when a different branch loads.
  // Done during render (not in an effect) so user edits are never clobbered
  // by store refreshes for the same branch.
  if (branch && branch._id !== lastSyncedId) {
    setLastSyncedId(branch._id);
    setWifiSSID(branch.wifiSSID || '');
    setWifiPassword(branch.wifiPassword || '');
    setGoogleReviewUrl(branch.googleReviewUrl || '');
  }

  useEffect(() => {
    if (!branches.length) loadBranches();
  }, [branches.length, loadBranches]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/restaurant');
        const settings = res.data?.data?.settings;
        if (settings) setRestrictWifi(!!settings.restrictOrdersToWifi);
      } catch {
        // ignore
      } finally {
        setLoadingRestaurant(false);
      }
    })();
  }, []);

  const handleSaveWifi = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/restaurant/branches/${id}`, { wifiSSID, wifiPassword });
      await loadBranches();
      Alert.alert(t('more.saved'), t('more.wifiSaved'));
    } catch {
      Alert.alert(t('more.errTitle'), t('more.errWifi'));
    } finally {
      setSaving(false);
    }
  };

  const googleUrlDirty = googleReviewUrl.trim() !== (branch?.googleReviewUrl || '');

  const handleSaveGoogleUrl = async () => {
    if (!id) return;
    const url = googleReviewUrl.trim();
    if (url && !/^https:\/\//.test(url)) {
      Alert.alert(t('more.invalidLink'), t('more.invalidLinkBody'));
      return;
    }
    setSavingGoogleUrl(true);
    try {
      await api.put(`/restaurant/branches/${id}`, { googleReviewUrl: url });
      await loadBranches();
      Alert.alert(t('more.saved'), t('more.reviewSaved'));
    } catch (e: any) {
      Alert.alert(t('more.errTitle'), e?.response?.data?.message || t('more.errReview'));
    } finally {
      setSavingGoogleUrl(false);
    }
  };

  const handleToggleRestrict = async (value: boolean) => {
    setRestrictWifi(value);
    try {
      await api.put('/restaurant', { 'settings.restrictOrdersToWifi': value });
    } catch {
      setRestrictWifi(!value);
      Alert.alert(t('more.errTitle'), t('more.errRestrict'));
    }
  };

  if (!branch) {
    return (
      <Screen>
        <View style={styles.loading}><Skeleton width="100%" height={200} radius={20} /></View>
      </Screen>
    );
  }

  const wifiDirty = wifiSSID !== (branch.wifiSSID || '') || wifiPassword !== (branch.wifiPassword || '');

  const infoRows: { icon: ReactNode; label: string; value: string }[] = [
    ...(branch.address
      ? [{ icon: <MapPin size={16} color={colors.inkSoft} />, label: t('more.infoAddress'), value: branch.address }]
      : []),
    ...(branch.phone
      ? [{ icon: <Phone size={16} color={colors.inkSoft} />, label: t('more.infoPhone'), value: branch.phone }]
      : []),
    {
      icon: <Armchair size={16} color={colors.inkSoft} />,
      label: t('more.infoTables'),
      value: t(tableCount === 1 ? 'more.tableValOne' : 'more.tablesVal', { count: tableCount }),
    },
    {
      icon: <Store size={16} color={colors.inkSoft} />,
      label: t('more.infoStatus'),
      value: branch.status === 'inactive' ? t('more.inactive') : t('more.active'),
    },
  ];

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.branchTitle')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero — Grab pattern */}
        <Card style={[styles.hero, { backgroundColor: colors.surface }]}>
          <View style={[styles.heroAvatar, { backgroundColor: colors.primaryBg }]}>
            <Text style={[styles.heroInitials, { color: colors.primary700 }]}>
              {initials(branch.name)}
            </Text>
          </View>
          <Text style={[styles.heroName, { color: colors.ink }]} numberOfLines={2}>
            {branch.name}
          </Text>
          {branch.address ? (
            <Text style={[styles.heroAddress, { color: colors.inkSoft }]} numberOfLines={2}>
              {branch.address}
            </Text>
          ) : null}
          <View style={styles.heroPills}>
            {isCurrent ? <Badge label={t('more.currentBranch')} color="lime" /> : null}
            <Badge label={t(tableCount === 1 ? 'more.tableValOne' : 'more.tablesVal', { count: tableCount })} color="neutral" />
            {branch.status ? (
              <Badge label={branch.status === 'active' ? t('more.active') : branch.status === 'inactive' ? t('more.inactive') : branch.status} color={branch.status === 'active' ? 'accent' : 'neutral'} />
            ) : null}
          </View>
          {!isCurrent ? (
            <Button
              onPress={() => setBranch(branch._id)}
              size="md"
              shape="pill"
              style={{ marginTop: 14, alignSelf: 'stretch' }}
              leftIcon={<Check size={16} color={colors.onPrimary} />}
            >
              {t('more.setCurrent')}
            </Button>
          ) : null}
        </Card>

        {/* At a glance — Places pattern: labeled icon rows */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.atGlance')}</Text>
          <Card padded={false} style={styles.groupCard}>
            {infoRows.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.surface2 }]}>
                  {row.icon}
                </View>
                <View style={styles.infoBody}>
                  <Text style={[styles.infoLabel, { color: colors.inkSoft }]}>{row.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.ink }]}>{row.value}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Guest menu QR */}
        {branch.qrCode ? (
          <View>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.guestQr')}</Text>
            <Card style={styles.qrCard}>
              <Text style={[styles.helpText, { color: colors.inkSoft }]}>
                {t('more.guestQrHelp')}
              </Text>
              <View style={styles.qrContainer}>
                <Image source={{ uri: branch.qrCode }} style={styles.qrImage} />
              </View>
            </Card>
          </View>
        ) : null}

        {/* Branch QR style override + previous codes */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('qr.overrideTitle')}</Text>
          <BranchQrStudio key={branch._id} branchId={branch._id} />
        </View>

        {/* Guest WiFi — Luma settings pattern */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.guestWifi')}</Text>
          <Card>
            <Text style={[styles.helpText, { color: colors.inkSoft }]}>
              {t('more.guestWifiHelp')}
            </Text>

            <View style={{ gap: 4, marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.ssid')}</Text>
              <View style={styles.ssidRow}>
                <Wifi size={18} color={colors.accent} />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                  value={wifiSSID}
                  onChangeText={setWifiSSID}
                  placeholder={t('more.ssidPh')}
                  placeholderTextColor={colors.inkSoft}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={{ gap: 4, marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.wifiPw')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder={t('more.wifiPwPh')}
                placeholderTextColor={colors.inkSoft}
                autoCapitalize="none"
                secureTextEntry
              />
            </View>

            <Button
              onPress={handleSaveWifi}
              loading={saving}
              disabled={!wifiDirty}
              size="md"
              style={{ marginTop: 16 }}
              leftIcon={<Save size={16} color={colors.onPrimary} />}
            >
              {t('more.saveWifi')}
            </Button>
          </Card>
        </View>

        {branch.wifiQR ? (
          <View>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.wifiQr')}</Text>
            <Card style={styles.qrCard}>
              <Text style={[styles.helpText, { color: colors.inkSoft }]}>
                {t('more.wifiQrHelp')}
              </Text>
              <View style={styles.qrContainer}>
                <Image source={{ uri: branch.wifiQR }} style={styles.qrImage} />
              </View>
            </Card>
          </View>
        ) : null}

        {/* Google reviews */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.googleReviews')}</Text>
          <Card>
            <Text style={[styles.helpText, { color: colors.inkSoft }]}>
              {t('more.googleHelp')}
            </Text>
            <View style={{ gap: 4, marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('more.reviewLink')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                value={googleReviewUrl}
                onChangeText={setGoogleReviewUrl}
                placeholder={t('more.reviewLinkPh')}
                placeholderTextColor={colors.inkSoft}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <Button
              onPress={handleSaveGoogleUrl}
              loading={savingGoogleUrl}
              disabled={!googleUrlDirty}
              size="md"
              style={{ marginTop: 16 }}
              leftIcon={<Save size={16} color={colors.onPrimary} />}
            >
              {t('more.saveReview')}
            </Button>
          </Card>
        </View>

        {/* Order restriction */}
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.ordering')}</Text>
          <Card>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.ink }]}>{t('more.restrictWifi')}</Text>
                <Text style={[styles.helpText, { color: colors.inkSoft }]}>
                  {t('more.restrictHelp')}
                </Text>
              </View>
              {loadingRestaurant ? (
                <Skeleton width={48} height={28} radius={14} />
              ) : (
                <Switch
                  value={restrictWifi}
                  onValueChange={handleToggleRestrict}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.surface}
                />
              )}
            </View>
          </Card>
        </View>

        {/* QR shortcut row */}
        <View style={styles.qrHint}>
          <QrCode size={14} color={colors.inkSoft} />
          <Text style={[styles.qrHintText, { color: colors.inkSoft }]}>
            {t('more.qrHint')}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, gap: 20, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', padding: 20 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  // Hero
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  heroAvatar: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heroInitials: { fontSize: 26, fontWeight: '800' },
  heroName: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display, textAlign: 'center', marginTop: 12 },
  heroAddress: { fontSize: typography.caption.size, textAlign: 'center', marginTop: 4 },
  heroPills: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  // Info rows
  groupCard: { overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoBody: { flex: 1, gap: 1 },
  infoLabel: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: typography.body.size, fontWeight: '600' },
  // Settings
  helpText: { fontSize: typography.caption.size, marginTop: 4, lineHeight: 18 },
  fieldLabel: { fontSize: typography.caption.size, fontWeight: '600', marginBottom: 4 },
  input: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44, fontSize: typography.body.size },
  ssidRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qrCard: { alignItems: 'center' },
  qrContainer: { alignItems: 'center', marginTop: 12 },
  qrImage: { width: 200, height: 200, borderRadius: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  toggleLabel: { fontSize: typography.body.size, fontWeight: '600' },
  qrHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  qrHintText: { fontSize: typography.caption.size },
});
