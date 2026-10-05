import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useSelectedBranch } from '@/features/branches/store';
import { useQrDesign, useSaveQrDesign } from '@/features/qr/hooks';
import { buildBranchQrUrl } from '@/features/qr/url';
import type { QrDesign } from '@/features/qr/api';

const FG_PRESETS = ['#0f172a', '#000000', '#FF4D00', '#1D4ED8', '#15803D', '#57534E'];
const BG_PRESETS = ['#ffffff', '#F7F4EC', '#111111', '#FFC42E', '#EDF1E8', '#F3EEE1'];

const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v.trim());

export default function QrDesignerScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { restaurant } = useSession();
  const branch = useSelectedBranch();
  const { data: saved, isLoading } = useQrDesign();
  const saveMutation = useSaveQrDesign();

  const [fg, setFg] = useState<string | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);

  if (isLoading || !saved) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      </Screen>
    );
  }

  const design: QrDesign = {
    fgColor: fg ?? saved.fgColor,
    bgColor: bg ?? saved.bgColor,
    dotStyle: saved.dotStyle,
    cornerStyle: saved.cornerStyle,
    logo: logo ?? saved.logo ?? '',
  };
  const qrValue =
    restaurant?.slug && branch?.slug ? buildBranchQrUrl(restaurant.slug, branch.slug) : 'https://example.com';

  const handleSave = () => {
    if (!isHex(design.fgColor) || !isHex(design.bgColor)) return;
    saveMutation.mutate(design, {
      onSuccess: () => Alert.alert(t('qr.designSaved')),
      onError: () => Alert.alert(t('qr.designFail')),
    });
  };

  const swatch = (value: string, selected: string, onPick: (v: string) => void) => (
    <Pressable
      key={value}
      onPress={() => onPick(value)}
      style={[
        styles.swatch,
        { backgroundColor: value, borderColor: selected.toLowerCase() === value.toLowerCase() ? colors.ink : colors.border },
      ]}
    />
  );

  return (
    <Screen padded={false}>
      <ScreenHeader title={t('qr.designerTitle')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}>
        <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('qr.designerSub')}</Text>

        {/* live preview */}
        <Card style={styles.previewCard}>
          <View style={[styles.qrBox, { backgroundColor: design.bgColor }]}>
            <QRCode
              value={qrValue}
              size={200}
              color={design.fgColor}
              backgroundColor={design.bgColor}
              ecl="M"
              logo={design.logo ? { uri: design.logo } : undefined}
              logoSize={44}
              logoBackgroundColor={design.bgColor}
            />
          </View>
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={[styles.label, { color: colors.inkSoft }]}>{t('qr.fgLabel')}</Text>
          <View style={styles.swatches}>{FG_PRESETS.map((c) => swatch(c, design.fgColor, setFg))}</View>
          <Input value={design.fgColor} onChangeText={setFg} autoCapitalize="none" placeholder="#0f172a" />

          <Text style={[styles.label, { color: colors.inkSoft }]}>{t('qr.bgLabel')}</Text>
          <View style={styles.swatches}>{BG_PRESETS.map((c) => swatch(c, design.bgColor, setBg))}</View>
          <Input value={design.bgColor} onChangeText={setBg} autoCapitalize="none" placeholder="#ffffff" />

          <Input
            label={t('qr.logoLabel')}
            value={design.logo || ''}
            onChangeText={setLogo}
            placeholder={t('qr.logoPh')}
            autoCapitalize="none"
            hint={t('qr.logoHint')}
          />
        </Card>

        <Button
          onPress={handleSave}
          loading={saveMutation.isPending}
          disabled={!isHex(design.fgColor) || !isHex(design.bgColor)}
          size="lg"
          shape="pill"
        >
          {t('qr.saveDesign')}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { fontSize: 13, fontFamily: fontFamilies.ui },
  previewCard: { alignItems: 'center', paddingVertical: 20 },
  qrBox: { padding: 12, borderRadius: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  swatches: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
});
