import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Check, FileSpreadsheet } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import { api } from '@/shared/api/client';

interface PreviewItem {
  category: string;
  name: string;
  description?: string;
  price: number;
}

interface ImportPreview {
  source: string;
  categories: { name: string }[];
  items: PreviewItem[];
  errors: string[];
}

async function uploadPreview(uri: string, name: string, mime: string): Promise<ImportPreview> {
  const form = new FormData();
  form.append('file', { uri, name, type: mime } as any);
  const res = await api.post('/menu/import/preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export default function MenuImportScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const branchId = useBranchStore((s) => s.selectedBranchId);

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [reading, setReading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const pickFile = async (kind: 'csv' | 'photo') => {
    try {
      let asset: { uri: string; name: string; mimeType?: string } | null = null;
      if (kind === 'csv') {
        const { getDocumentAsync } = await import('expo-document-picker');
        const result = await getDocumentAsync({ type: 'text/csv', copyToCacheDirectory: true });
        if (result.canceled || !result.assets?.[0]) return;
        const a = result.assets[0];
        asset = { uri: a.uri, name: a.name || 'menu.csv', mimeType: a.mimeType || 'text/csv' };
      } else {
        const { launchImageLibraryAsync } = await import('expo-image-picker');
        const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (result.canceled || !result.assets?.[0]) return;
        const a = result.assets[0];
        asset = { uri: a.uri, name: a.fileName || 'menu.jpg', mimeType: a.mimeType || 'image/jpeg' };
      }
      setReading(true);
      const data = await uploadPreview(asset.uri, asset.name, asset.mimeType!);
      setPreview(data);
      setSelected((data.items || []).map((_, i) => i));
    } catch (e: any) {
      Alert.alert(t('menu.import.failed'), e?.response?.data?.message || t('menu.import.failedBody'));
    } finally {
      setReading(false);
    }
  };

  const toggle = (i: number) =>
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleConfirm = async () => {
    if (!preview || selected.length === 0) return;
    setConfirming(true);
    try {
      await api.post('/menu/import/confirm', {
        branchId: branchId || undefined,
        categories: preview.categories,
        items: preview.items,
        selected,
      });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      Alert.alert(t('menu.import.done', { n: selected.length }));
      router.back();
    } catch (e: any) {
      Alert.alert(t('menu.import.failed'), e?.response?.data?.message || t('menu.import.failedBody'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('menu.import.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 14 }}>
        <View style={styles.pickRow}>
          <Pressable
            onPress={() => pickFile('csv')}
            style={[styles.pick, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <FileSpreadsheet size={22} color={colors.primary} />
            <Text style={[styles.pickText, { color: colors.ink }]}>{t('menu.import.csv')}</Text>
          </Pressable>
          <Pressable
            onPress={() => pickFile('photo')}
            style={[styles.pick, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Camera size={22} color={colors.primary} />
            <Text style={[styles.pickText, { color: colors.ink }]}>{t('menu.import.photo')}</Text>
          </Pressable>
        </View>

        {reading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.inkSoft} />
            <Text style={[styles.reading, { color: colors.inkSoft }]}>{t('menu.import.reading')}</Text>
          </View>
        )}

        {preview && !reading && (
          <>
            <Card>
              <Text style={[styles.summary, { color: colors.ink }]}>
                {t('menu.import.summary', {
                  items: preview.items.length,
                  cats: preview.categories.length,
                })}
              </Text>
              {(preview.errors || []).length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {preview.errors.slice(0, 5).map((e, i) => (
                    <Text key={i} style={[styles.errorLine, { color: colors.rose }]}>
                      {e}
                    </Text>
                  ))}
                </View>
              )}
            </Card>

            {preview.items.length === 0 ? (
              <EmptyState
                icon={<FileSpreadsheet size={24} color={colors.inkSoft} />}
                title={t('menu.import.empty')}
                subtitle={t('menu.import.emptySub')}
              />
            ) : (
              <Card padded={false} style={{ overflow: 'hidden' }}>
                <Pressable
                  onPress={() =>
                    setSelected(selected.length === preview.items.length ? [] : preview.items.map((_, i) => i))
                  }
                  style={styles.toggleAll}
                >
                  <Text style={[styles.toggleAllText, { color: colors.primary }]}>
                    {selected.length === preview.items.length
                      ? t('menu.import.deselectAll')
                      : t('menu.import.selectAll')}
                  </Text>
                  <Text style={[styles.toggleAllText, { color: colors.inkSoft }]}>
                    {selected.length}/{preview.items.length}
                  </Text>
                </Pressable>
                {preview.items.map((item, i) => {
                  const on = selected.includes(i);
                  return (
                    <Pressable
                      key={i}
                      onPress={() => toggle(i)}
                      style={[
                        styles.row,
                        { borderTopColor: colors.border },
                        on && { backgroundColor: colors.surface2 },
                      ]}
                    >
                      <View
                        style={[
                          styles.check,
                          { borderColor: on ? colors.ink : colors.inkSoft, backgroundColor: on ? colors.ink : 'transparent' },
                        ]}
                      >
                        {on && <Check size={12} color="#FFF" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.ink }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.itemMeta, { color: colors.inkSoft }]} numberOfLines={1}>
                          {item.category} · {item.price}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </Card>
            )}

            {preview.items.length > 0 && (
              <Button onPress={handleConfirm} loading={confirming} disabled={selected.length === 0} size="lg" shape="pill">
                {t('menu.import.confirm', { n: selected.length })}
              </Button>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  pickRow: { flexDirection: 'row', gap: 10 },
  pick: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 20,
  },
  pickText: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.ui },
  center: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  reading: { fontSize: 13, fontFamily: fontFamilies.ui },
  summary: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.display },
  errorLine: { fontSize: 11, fontFamily: fontFamilies.ui },
  toggleAll: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  toggleAllText: { fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.ui },
  itemMeta: { fontSize: 11, marginTop: 2, fontFamily: fontFamilies.ui },
});
