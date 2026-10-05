import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useCreateMenuItem, useMenuCategories, useMenuItems } from '@/features/menu/hooks';
import { RelatedPicker } from '@/features/menu/components/RelatedPicker';
import { useLocale } from '@/i18n/LocaleContext';

export default function CreateMenuItemScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: categories } = useMenuCategories();
  const { data: allItems } = useMenuItems();
  const createMutation = useCreateMenuItem();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState('');
  const [stock, setStock] = useState('');
  const [lowThreshold, setLowThreshold] = useState('5');
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const valid =
    name.trim().length > 0 &&
    Number(price) > 0 &&
    categoryId.length > 0;

  const handleCreate = async () => {
    setError(null);
    if (!valid) {
      setError(t('menu.create.invalid'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        price: Number(price),
        categoryId,
        description: description.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        stockQty: stock.trim() === '' ? null : Math.max(0, Math.round(Number(stock) || 0)),
        lowThreshold: Math.max(0, Math.round(Number(lowThreshold) || 0)),
        relatedItems: relatedIds,
      });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('menu.create.failed'));
    }
  };

  return (
    <Screen >
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel={t('menu.detail.back')}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('menu.create.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t('menu.create.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('menu.create.namePh')}
          autoCapitalize="words"
        />

        <Input
          label={t('menu.create.priceLabel')}
          value={price}
          onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        {(categories ?? []).length > 0 ? (
          <Select
            label={t('menu.create.categoryLabel')}
            value={categoryId || null}
            options={(categories ?? []).map((c: any) => ({ value: c._id, label: c.name }))}
            placeholder={t('menu.create.chooseCategory')}
            title={t('menu.create.categoryTitle')}
            onChange={setCategoryId}
          />
        ) : (
          <Text style={[styles.hint, { color: colors.inkSoft }]}>
            {t('menu.create.noCategories')}
          </Text>
        )}

        <Input
          label={t('menu.detail.descLabel')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('menu.create.descPh')}
          multiline
          numberOfLines={3}
        />

        <Input
          label={t('menu.create.tagsLabel')}
          value={tags}
          onChangeText={setTags}
          placeholder={t('menu.create.tagsPh')}
          autoCapitalize="none"
          hint={t('menu.create.tagsHint')}
        />

        <Input
          label={t('menu.detail.stockLabel')}
          value={stock}
          onChangeText={(t) => setStock(t.replace(/[^0-9]/g, ''))}
          placeholder={t('menu.detail.stockPh')}
          keyboardType="numeric"
          hint={t('menu.create.stockHint')}
        />

        {stock.trim() !== '' && (
          <Input
            label={t('menu.detail.lowLabel')}
            value={lowThreshold}
            onChangeText={(t) => setLowThreshold(t.replace(/[^0-9]/g, ''))}
            placeholder="5"
            keyboardType="numeric"
          />
        )}

        <View>
          <Text style={[styles.pairsLabel, { color: colors.inkSoft }]}>
            {t('menu.detail.pairs')}
          </Text>
          <RelatedPicker
            items={(allItems || []).filter((m) => m.type !== 'bundle')}
            selectedIds={relatedIds}
            onToggle={(pid) =>
              setRelatedIds((prev) =>
                prev.includes(pid)
                  ? prev.filter((r) => r !== pid)
                  : prev.length < 8
                    ? [...prev, pid]
                    : prev
              )
            }
          />
        </View>

        {error && <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>}

        <Button
          onPress={handleCreate}
          loading={createMutation.isPending}
          disabled={!valid}
          size="lg"
          shape="pill"
        >
          {t('menu.create.submit')}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  hint: { fontSize: typography.caption.size },
  pairsLabel: { fontSize: typography.caption.size, fontWeight: '700', marginBottom: 8 },
  error: { fontSize: typography.caption.size, fontWeight: '600' },
});
