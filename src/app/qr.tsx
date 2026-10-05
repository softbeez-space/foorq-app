import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Download, QrCode, Share2 } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useSession } from '@/features/auth/hooks';
import { useBranchTables } from '@/features/tables/hooks';
import { useQrDesign } from '@/features/qr/hooks';
import { ENV } from '@/shared/config/env';
import type { TableInfo } from '@/entities/branch';

type QrSvgRef = { toDataURL: (cb: (base64: string) => void) => void };

export default function QrScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { restaurant } = useSession();
  const { data: branch, isLoading } = useBranchTables();
  const [busy, setBusy] = useState<string | null>(null);
  const qrRefs = useRef<Record<string, QrSvgRef | null>>({});

  // Full restaurant profile carries settings.qrDesign (session copy is minimal).
  const { data: design } = useQrDesign();

  const { branchUrl, tables } = useMemo(() => {
    const slug = restaurant?.slug;
    if (!slug || !branch?.slug) return { branchUrl: '', tables: [] as { table: TableInfo; url: string }[] };
    const base = `${ENV.menuBaseUrl}/${slug}/${branch.slug}`;
    return {
      branchUrl: base,
      tables: (branch.tables ?? []).map((table) => ({
        table,
        url: `${base}?table=${encodeURIComponent(table.number)}`,
      })),
    };
  }, [restaurant?.slug, branch]);

  // Saved QR design: per-branch override wins, else restaurant design.
  // (react-native-qrcode-svg supports flat colors only — dot styles and
  // logos stay a web-flyer feature.)
  const savedDesign = branch?.qrDesign?.fgColor
    ? branch.qrDesign
    : design;
  const qrFg = savedDesign?.fgColor || '#111111';
  const qrBg = savedDesign?.bgColor || '#ffffff';

  async function renderQrFile(key: string, filename: string): Promise<string> {
    const ref = qrRefs.current[key];
    if (!ref) throw new Error('qr-ref-missing');
    const base64 = await new Promise<string>((resolve) => ref.toDataURL(resolve));
    const uri = `${FileSystem.cacheDirectory ?? ''}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  }

  async function onShare(key: string, filename: string, dialogTitle: string) {
    if (busy) return;
    setBusy(`share:${key}`);
    try {
      const uri = await renderQrFile(key, filename);
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('tabs.qrShareUnavailable'));
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle });
    } catch {
      Alert.alert(t('tabs.qrPrepareFail'));
    } finally {
      setBusy(null);
    }
  }

  async function onSave(key: string, filename: string) {
    if (busy) return;
    setBusy(`save:${key}`);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('tabs.qrPhotoDenied'));
        return;
      }
      const uri = await renderQrFile(key, filename);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('tabs.qrSaved'));
    } catch {
      Alert.alert(t('tabs.qrPrepareFail'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('tabs.qrTitle')}</Text>
        {!!branch && (
          <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{branch.name}</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      ) : !branch || !branchUrl ? (
        <EmptyState
          icon={<QrCode size={28} color={colors.inkSoft} />}
          title={t('tabs.qrEmptyTitle')}
          subtitle={t('tabs.qrEmptySub')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <Card style={styles.branchCard}>
            <Text style={[styles.cardLabel, { color: colors.inkSoft }]}>
              {t('tabs.qrBranch')}
            </Text>
            <View style={styles.qrWrap}>
              <QRCode
                value={branchUrl}
                size={216}
                color={qrFg}
                backgroundColor={qrBg}
                getRef={(c) => {
                  qrRefs.current.branch = c;
                }}
              />
            </View>
            <Text style={[styles.note, { color: colors.inkSoft }]}>
              {t('tabs.qrScanNote')}
            </Text>
            <View style={styles.actions}>
              <View style={styles.actionBtn}>
                <Button
                  onPress={() => onShare('branch', `qr-${branch.slug}.png`, branch.name)}
                  loading={busy === 'share:branch'}
                  disabled={busy !== null}
                >
                  {t('tabs.qrShare')}
                </Button>
              </View>
              <View style={styles.actionBtn}>
                <Button
                  variant="outline"
                  onPress={() => onSave('branch', `qr-${branch.slug}.png`)}
                  loading={busy === 'save:branch'}
                  disabled={busy !== null}
                >
                  {t('tabs.qrSave')}
                </Button>
              </View>
            </View>
          </Card>

          {tables.length > 0 && (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.inkSoft }]}>
                {t('tabs.qrTables')}
              </Text>
              {tables.map(({ table, url }) => {
                const key = `table-${table._id}`;
                const sharing = busy === `share:${key}`;
                const saving = busy === `save:${key}`;
                return (
                  <Card key={table._id} style={styles.row}>
                    <QRCode
                      value={url}
                      size={60}
                      color={qrFg}
                      backgroundColor={qrBg}
                      getRef={(c) => {
                        qrRefs.current[key] = c;
                      }}
                    />
                    <View style={styles.rowMeta}>
                      <Text style={[styles.rowTitle, { color: colors.ink }]}>
                        {t('tabs.qrTableMeta', { n: table.number, c: table.capacity })}
                      </Text>
                      <Text style={[styles.rowSub, { color: colors.inkSoft }]} numberOfLines={1}>
                        {url}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={t('tabs.qrShare')}
                      disabled={busy !== null}
                      onPress={() => onShare(key, `qr-${branch.slug}-t${table.number}.png`, `Table ${table.number}`)}
                      style={styles.iconBtn}
                    >
                      {sharing
                        ? <ActivityIndicator size="small" color={colors.inkSoft} />
                        : <Share2 size={18} color={colors.ink} />}
                    </Pressable>
                    <Pressable
                      accessibilityLabel={t('tabs.qrSave')}
                      disabled={busy !== null}
                      onPress={() => onSave(key, `qr-${branch.slug}-t${table.number}.png`)}
                      style={styles.iconBtn}
                    >
                      {saving
                        ? <ActivityIndicator size="small" color={colors.inkSoft} />
                        : <Download size={18} color={colors.ink} />}
                    </Pressable>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  subtitle: { marginTop: 2, fontSize: 13, fontFamily: fontFamilies.ui },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 24, gap: 16 },
  branchCard: { alignItems: 'center' },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.ui,
  },
  qrWrap: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  note: { marginTop: 12, fontSize: 13, fontFamily: fontFamilies.ui },
  actions: { marginTop: 14, flexDirection: 'row', gap: 10, width: '100%' },
  actionBtn: { flex: 1 },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.ui,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  rowMeta: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.ui },
  rowSub: { marginTop: 2, fontSize: 11, fontFamily: fontFamilies.ui },
  iconBtn: { padding: 8 },
});
