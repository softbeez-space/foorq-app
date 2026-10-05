import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { History, RotateCcw } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import {
  fetchQrHistory,
  restoreQrHistory,
  updateBranchQrDesign,
} from '@/features/qr/api';

const FG_PRESETS = ['#0f172a', '#000000', '#FF4D00', '#1D4ED8', '#15803D', '#57534E'];
const BG_PRESETS = ['#ffffff', '#F7F4EC', '#111111', '#FFC42E', '#EDF1E8', '#F3EEE1'];
const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v.trim());

/** Per-branch QR design override + previous-codes history with restore. */
export function BranchQrStudio({ branchId }: { branchId: string }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const branch = useBranchStore((s) => s.branches.find((b) => b._id === branchId) ?? null);
  const loadBranches = useBranchStore((s) => s.loadBranches);

  const [fg, setFg] = useState<string | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: history } = useQuery({
    queryKey: ['qr-history', branchId],
    queryFn: () => fetchQrHistory(branchId),
    staleTime: 30_000,
  });

  if (!branch) return null;
  const override = branch.qrDesign?.fgColor ? branch.qrDesign : null;
  const curFg = fg ?? override?.fgColor ?? '';
  const curBg = bg ?? override?.bgColor ?? '';

  const handleSave = async () => {
    if (!isHex(curFg) || !isHex(curBg)) return;
    setSaving(true);
    try {
      await updateBranchQrDesign(branchId, { fgColor: curFg.trim(), bgColor: curBg.trim() });
      await loadBranches();
      queryClient.invalidateQueries({ queryKey: ['qr-history', branchId] });
      Alert.alert(t('qr.overrideSaved'));
    } catch {
      Alert.alert(t('qr.overrideFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await updateBranchQrDesign(branchId, { fgColor: '', bgColor: '' });
      setFg(null);
      setBg(null);
      await loadBranches();
      Alert.alert(t('qr.overrideSaved'));
    } catch {
      Alert.alert(t('qr.overrideFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (entryId: string, label: string) => {
    Alert.alert(t('qr.restoreTitle', { label }), undefined, [
      { text: t('qr.cancelAction'), style: 'cancel' },
      {
        text: t('qr.restore'),
        onPress: async () => {
          try {
            await restoreQrHistory(branchId, entryId);
            await loadBranches();
            queryClient.invalidateQueries({ queryKey: ['qr-history', branchId] });
            Alert.alert(t('qr.restored'));
          } catch {
            Alert.alert(t('qr.restoreFail'));
          }
        },
      },
    ]);
  };

  const swatch = (value: string, selected: string, onPick: (v: string) => void) => (
    <Pressable
      key={value}
      onPress={() => onPick(value)}
      style={[
        styles.swatch,
        {
          backgroundColor: value,
          borderColor: selected.toLowerCase() === value.toLowerCase() ? colors.ink : colors.border,
        },
      ]}
    />
  );

  return (
    <View style={{ gap: 14 }}>
      {/* design override */}
      <Card>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>{t('qr.overrideTitle')}</Text>
        <Text style={[styles.cardSub, { color: colors.inkSoft }]}>{t('qr.overrideSub')}</Text>
        <Text style={[styles.label, { color: colors.inkSoft }]}>{t('qr.fgLabel')}</Text>
        <View style={styles.swatches}>{FG_PRESETS.map((c) => swatch(c, curFg, setFg))}</View>
        <Input value={curFg} onChangeText={setFg} autoCapitalize="none" placeholder="#0f172a" />
        <Text style={[styles.label, { color: colors.inkSoft }]}>{t('qr.bgLabel')}</Text>
        <View style={styles.swatches}>{BG_PRESETS.map((c) => swatch(c, curBg, setBg))}</View>
        <Input value={curBg} onChangeText={setBg} autoCapitalize="none" placeholder="#ffffff" />
        <View style={styles.btnRow}>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              onPress={handleReset}
              disabled={saving || !override}
            >
              {t('qr.useRestaurant')}
            </Button>
          </View>
          <View style={{ flex: 2 }}>
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={!isHex(curFg) || !isHex(curBg)}
            >
              {t('qr.saveOverride')}
            </Button>
          </View>
        </View>
      </Card>

      {/* history */}
      <Card>
        <View style={styles.historyHead}>
          <History size={15} color={colors.inkSoft} />
          <Text style={[styles.cardTitle, { color: colors.ink }]}>
            {t('qr.historyTitle')} · {(history || []).length}
          </Text>
        </View>
        <Text style={[styles.cardSub, { color: colors.inkSoft }]}>{t('qr.historySub')}</Text>
        {(history || []).length === 0 ? (
          <Text style={[styles.empty, { color: colors.inkSoft }]}>{t('qr.historyEmpty')}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRow}>
            {(history || []).map((e) => {
              const label = e.kind === 'branch' ? t('qr.historyBranch') : `T-${e.ref}`;
              return (
                <View key={e._id} style={[styles.histCard, { borderColor: colors.border }]}>
                  {e.qrCode ? (
                    <Image source={{ uri: e.qrCode }} style={styles.histImg} />
                  ) : (
                    <View style={[styles.histImg, { backgroundColor: colors.surface2 }]} />
                  )}
                  <Text style={[styles.histLabel, { color: colors.ink }]} numberOfLines={1}>
                    {label}
                  </Text>
                  <Pressable
                    onPress={() => handleRestore(e._id, label)}
                    style={[styles.restoreBtn, { backgroundColor: colors.ink }]}
                  >
                    <RotateCcw size={11} color="#FFF" />
                    <Text style={styles.restoreText}>{t('qr.restore')}</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.display },
  cardSub: { fontSize: 12, marginTop: 4, marginBottom: 12, fontFamily: fontFamilies.ui },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 10, marginBottom: 8 },
  swatches: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  swatch: { width: 38, height: 38, borderRadius: 19, borderWidth: 2 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  historyHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { fontSize: 12, marginTop: 4, fontFamily: fontFamilies.ui },
  historyRow: { gap: 10, paddingTop: 4 },
  histCard: { width: 104, borderWidth: 1, borderRadius: 14, padding: 8, alignItems: 'center' },
  histImg: { width: 84, height: 84, borderRadius: 8 },
  histLabel: { fontSize: 11, fontWeight: '700', marginTop: 6, fontFamily: fontFamilies.ui },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  restoreText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
