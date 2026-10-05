import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import { useMenuItem, useUpdateMenuItem, useToggleAvailability, useMenuItems } from '@/features/menu/hooks';
import { RelatedPicker } from '@/features/menu/components/RelatedPicker';
import { useLocale } from '@/i18n/LocaleContext';

export default function MenuItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: item, isLoading } = useMenuItem(id!);
  const { data: allItems } = useMenuItems();
  const updateItem = useUpdateMenuItem();
  const toggleAvail = useToggleAvailability();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<string | null>(null);
  const [lowThreshold, setLowThreshold] = useState<string | null>(null);
  const [relatedIds, setRelatedIds] = useState<string[] | null>(null);
  const [dirty, setDirty] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Skeleton width="100%" height={300} radius={20} />
        </View>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <Text style={{ color: colors.inkSoft, textAlign: 'center', marginTop: 40 }}>{t('menu.detail.notFound')}</Text>
      </Screen>
    );
  }

  const currentName = name || item.name;
  const currentPrice = price || String(item.price);
  const currentStock = stock !== null ? stock : (item.stockQty ?? '').toString();
  const tracking = currentStock.trim() !== '';
  const currentRelated: string[] =
    relatedIds ?? (item.relatedItems || []).map((r) => String(r.menuItemId?._id ?? r.menuItemId));

  const handleSave = async () => {
    const data: any = {};
    if (name) data.name = name;
    if (price) data.price = Number(price);
    if (description) data.description = description;
    if (stock !== null) {
      data.stockQty = stock.trim() === '' ? null : Math.max(0, Math.round(Number(stock) || 0));
    }
    if (lowThreshold !== null) data.lowThreshold = Math.max(0, Math.round(Number(lowThreshold) || 0));
    if (relatedIds !== null) data.relatedItems = relatedIds;
    if (Object.keys(data).length === 0) return;
    await updateItem.mutateAsync({ id: item._id, data });
    setDirty(false);
    router.back();
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: dirty ? 24 : 40 }}
      >
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel={t('menu.detail.back')}>
            <ArrowLeft size={22} color={colors.ink} />
          </Pressable>
          <Text style={[styles.title, { color: colors.ink }]}>{t('menu.detail.editTitle')}</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Photo hero with availability switch (BK item-header pattern) */}
        <View style={styles.heroWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: colors.primaryBg }]}>
              <Text style={[styles.heroLetter, { color: colors.primary700, fontFamily: fontFamilies.display }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.availPill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.availText, { color: item.isAvailable ? colors.successText : colors.inkSoft }]}>
              {item.isAvailable ? t('menu.available') : t('menu.soldOut')}
            </Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => toggleAvail.mutate(item._id)}
              trackColor={{ false: colors.surface2, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.itemName, { color: colors.ink, fontFamily: fontFamilies.display }]}>
            {currentName}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary700 }]}>
            {formatCurrency(Number(currentPrice) || item.price)}
            {item.categoryId?.name ? (
              <Text style={[styles.itemCat, { color: colors.inkSoft }]}> · {item.categoryId.name}</Text>
            ) : null}
          </Text>
        </View>

        <Card style={{ marginBottom: 16, gap: 14 }}>
          <Input label={t('menu.detail.nameLabel')} value={currentName} onChangeText={(v) => { setName(v); setDirty(true); }} />

          <Input
            label={t('menu.detail.priceLabel')}
            value={currentPrice}
            onChangeText={(v) => { setPrice(v); setDirty(true); }}
            keyboardType="decimal-pad"
          />

          <Input
            label={t('menu.detail.descLabel')}
            value={description || item.description || ''}
            onChangeText={(v) => { setDescription(v); setDirty(true); }}
            placeholder={t('menu.detail.descPh')}
            multiline
            numberOfLines={3}
          />

          <Input
            label={t('menu.detail.stockLabel')}
            value={currentStock}
            onChangeText={(v) => { setStock(v.replace(/[^0-9]/g, '')); setDirty(true); }}
            placeholder={t('menu.detail.stockPh')}
            keyboardType="numeric"
          />

          {tracking && (
            <Input
              label={t('menu.detail.lowLabel')}
              value={lowThreshold !== null ? lowThreshold : String(item.lowThreshold ?? 5)}
              onChangeText={(v) => { setLowThreshold(v.replace(/[^0-9]/g, '')); setDirty(true); }}
              placeholder="5"
              keyboardType="numeric"
            />
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('menu.detail.details')}</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('menu.detail.category')}</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>{item.categoryId?.name ?? '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('menu.detail.priceLabel')}</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('menu.detail.prepTime')}</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>{item.preparationTime != null ? t('menu.detail.prepMin', { minutes: item.preparationTime }) : '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('menu.detail.type')}</Text>
            <Text style={[styles.detailValue, { color: colors.ink }]}>{item.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{t('menu.detail.stock')}</Text>
            <Text style={[styles.detailValue, { color: item.stockQty != null && item.stockQty <= (item.lowThreshold ?? 5) ? colors.dangerText : colors.ink }]}>
              {item.stockQty == null ? t('menu.detail.notTracked') : t('menu.detail.stockLeft', { count: item.stockQty })}
            </Text>
          </View>
        </Card>

        {item.variants && item.variants.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('menu.detail.variants')}</Text>
            {item.variants.map((v, i) => (
              <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.ink }]}>{v.name}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{formatCurrency(v.price)}</Text>
              </View>
            ))}
          </Card>
        )}

        {item.addons && item.addons.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('menu.detail.addons')}</Text>
            {item.addons.map((a, i) => (
              <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.ink }]}>{a.name}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>+{formatCurrency(a.price)}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('menu.detail.pairs')}</Text>
          <Text style={{ fontSize: 12, color: colors.inkSoft, marginBottom: 10 }}>
            {t('menu.detail.pairsAbout')}
          </Text>
          <RelatedPicker
            items={(allItems || []).filter((m) => m.type !== 'bundle')}
            excludeId={item._id}
            selectedIds={currentRelated}
            onToggle={(pid) => {
              setRelatedIds((prev) => {
                const base = prev ?? currentRelated;
                const next = base.includes(pid)
                  ? base.filter((r) => r !== pid)
                  : base.length < 8
                    ? [...base, pid]
                    : base;
                return next;
              });
              setDirty(true);
            }}
          />
        </Card>

      </ScrollView>
      {dirty && (
        <View style={[styles.saveBar, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <Button
            onPress={handleSave}
            loading={updateItem.isPending}
            size="lg"
            shape="pill"
            leftIcon={<Save size={18} color="#FFF" />}
          >
            {t('menu.detail.save')}
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  heroWrap: { marginBottom: 16 },
  heroImage: { width: '100%', height: 200, borderRadius: 20, resizeMode: 'cover' },
  heroPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  heroLetter: { fontSize: 72 },
  availPill: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  availText: { fontSize: typography.caption.size, fontWeight: '800' },
  titleBlock: { marginBottom: 16, gap: 2 },
  itemName: { fontSize: typography.displayM.size },
  itemPrice: { fontSize: typography.h1.size, fontWeight: '800' },
  itemCat: { fontSize: typography.caption.size, fontWeight: '600' },
  sectionTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  saveBar: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: { fontSize: typography.body.size },
  detailValue: { fontSize: typography.body.size, fontWeight: '600' },
});
