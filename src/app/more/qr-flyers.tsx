import { useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Check, Download, Printer, Share2 } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useSelectedBranch } from '@/features/branches/store';
import { useQrDesign } from '@/features/qr/hooks';
import { buildBranchQrUrl } from '@/features/qr/url';
import { api } from '@/shared/api/client';
import { FLYER_W, FLYER_H, flyerTemplates, getFlyerTemplate } from '@/features/qr/flyers/templates';

function ActionBtn({
  busy,
  dimmed,
  label,
  icon,
  onPress,
  primary,
}: {
  busy: boolean;
  dimmed: boolean;
  label: string;
  icon: ReactNode;
  onPress: () => void;
  primary?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy || dimmed}
      style={[
        styles.action,
        {
          backgroundColor: primary ? colors.ink : colors.surface,
          borderColor: colors.border,
          opacity: dimmed ? 0.5 : 1,
        },
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={primary ? '#FFF' : colors.ink} /> : icon}
      <Text style={[styles.actionText, { color: primary ? '#FFF' : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

function ScaledFlyer({
  templateId,
  qrValue,
  fg,
  bg,
  logoUri,
  restaurantName,
  scale,
}: {
  templateId: number;
  qrValue: string;
  fg: string;
  bg: string;
  logoUri?: string;
  restaurantName: string;
  scale: number;
}) {
  const meta = getFlyerTemplate(templateId);
  const Flyer = meta.Component;
  return (
    <View style={{ width: FLYER_W * scale, height: FLYER_H * scale, overflow: 'hidden', borderRadius: 16 }}>
      <View
        style={{
          position: 'absolute',
          width: FLYER_W,
          height: FLYER_H,
          transform: [{ scale }],
          left: -(FLYER_W * (1 - scale)) / 2,
          top: -(FLYER_H * (1 - scale)) / 2,
        }}
      >
        <Flyer qrValue={qrValue} fg={fg} bg={bg} logoUri={logoUri} restaurantName={restaurantName} />
      </View>
    </View>
  );
}

export default function QrFlyersScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const { restaurant } = useSession();
  const branch = useSelectedBranch();
  const { data: design } = useQrDesign();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const viewRef = useRef<View>(null);

  const { data: savedTemplateId } = useQuery({
    queryKey: ['qr-flyer-default'],
    queryFn: async () => {
      const res = await api.get('/restaurant');
      return (res.data?.data?.settings?.qrFlyer?.templateId as number) ?? null;
    },
    staleTime: 60_000,
  });

  const stageScale = Math.min(0.86, (width - 64) / FLYER_W);
  const thumbScale = 0.3;

  const activeId = selectedId ?? savedTemplateId ?? 1;
  const meta = getFlyerTemplate(activeId);
  const qrValue =
    restaurant?.slug && branch?.slug ? buildBranchQrUrl(restaurant.slug, branch.slug) : '';
  const fg = design?.fgColor || '#111111';
  const bg = design?.bgColor || '#ffffff';
  const logoUri = design?.logo || undefined;
  const restaurantName = restaurant?.name || branch?.name || '';

  async function capture(): Promise<string> {
    return captureRef(viewRef, { format: 'png', quality: 1, result: 'tmpfile' });
  }

  async function run(key: string, fn: (uri: string) => Promise<void>, failKey: string) {
    if (busy) return;
    setBusy(key);
    try {
      const uri = await capture();
      await fn(uri);
    } catch {
      Alert.alert(t(failKey));
    } finally {
      setBusy(null);
    }
  }

  const onShare = () =>
    run('share', async (uri) => {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('qr.shareUnavailable'));
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: meta.name });
    }, 'qr.shareFail');

  const onSave = () =>
    run('save', async (uri) => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('qr.photoDenied'));
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('qr.saved'));
    }, 'qr.saveFail');

  const onPrint = () =>
    run('print', async (uri) => {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Print.printAsync({
        html: `<html><body style="margin:0;padding:0"><img src="data:image/png;base64,${base64}" style="width:100%" /></body></html>`,
      });
    }, 'qr.printFail');

  return (
    <Screen padded={false}>
      <ScreenHeader title={t('qr.flyersTitle')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}>
        <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('qr.flyersSub')}</Text>

        {/* stage */}
        <Card style={styles.stage}>
          <Text style={[styles.stageName, { color: colors.ink }]}>{meta.name}</Text>
          <View style={{ marginTop: 12 }}>
            <ScaledFlyer
              templateId={activeId}
              qrValue={qrValue}
              fg={fg}
              bg={bg}
              logoUri={logoUri}
              restaurantName={restaurantName}
              scale={stageScale}
            />
          </View>
          <View style={styles.actions}>
            <ActionBtn
              busy={busy === 'share'}
              dimmed={busy !== null && busy !== 'share'}
              label={t('qr.share')}
              icon={<Share2 size={15} color="#FFF" />}
              onPress={onShare}
              primary
            />
            <ActionBtn
              busy={busy === 'save'}
              dimmed={busy !== null && busy !== 'save'}
              label={t('qr.save')}
              icon={<Download size={15} color={colors.ink} />}
              onPress={onSave}
            />
            <ActionBtn
              busy={busy === 'print'}
              dimmed={busy !== null && busy !== 'print'}
              label={t('qr.print')}
              icon={<Printer size={15} color={colors.ink} />}
              onPress={onPrint}
            />
          </View>
        </Card>

        {/* full-size off-screen instance — captures at print resolution */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: -10000, top: 0 }}
        >
          <View ref={viewRef} collapsable={false}>
            {(() => {
              const Full = meta.Component;
              return (
                <Full
                  qrValue={qrValue}
                  fg={fg}
                  bg={bg}
                  logoUri={logoUri}
                  restaurantName={restaurantName}
                />
              );
            })()}
          </View>
        </View>

        {/* gallery */}
        <View style={styles.grid}>
          {flyerTemplates.map((f) => {
            const isActive = f.id === activeId;
            return (
              <Pressable
                key={f.id}
                onPress={() => setSelectedId(f.id)}
                style={[
                  styles.thumb,
                  { backgroundColor: colors.surface, borderColor: isActive ? colors.ink : colors.border },
                ]}
              >
                <View
                  style={{
                    height: FLYER_H * thumbScale,
                    overflow: 'hidden',
                    borderRadius: 10,
                    backgroundColor: colors.surface2,
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      width: FLYER_W,
                      transform: [{ scale: thumbScale }],
                      left: -(FLYER_W * (1 - thumbScale)) / 2,
                      top: -(FLYER_H * (1 - thumbScale)) / 2,
                    }}
                  >
                    <f.Component
                      qrValue={qrValue}
                      fg={fg}
                      bg={bg}
                      logoUri={logoUri}
                      restaurantName={restaurantName}
                    />
                  </View>
                </View>
                <View style={styles.thumbFoot}>
                  {isActive && <Check size={13} color={colors.primary} />}
                  <Text style={[styles.thumbName, { color: colors.ink }]} numberOfLines={1}>
                    {f.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 13, fontFamily: fontFamilies.ui },
  stage: { alignItems: 'center' },
  stageName: { fontSize: 16, fontWeight: '700', fontFamily: fontFamilies.display },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, width: '100%' },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 12,
  },
  actionText: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.ui },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumb: { flex: 1, minWidth: '47%', borderWidth: 1.5, borderRadius: 16, padding: 8 },
  thumbFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 2 },
  thumbName: { flex: 1, fontSize: 12, fontWeight: '700', fontFamily: fontFamilies.ui },
});
