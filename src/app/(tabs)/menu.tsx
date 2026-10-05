import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, SectionList, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Search, UtensilsCrossed, Plus, FileUp } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { EmptyState } from '@/ui/EmptyState';
import { Input } from '@/ui/Input';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import { useMenuItems, useToggleAvailability, useMenuCategories } from '@/features/menu/hooks';
import { useLocale } from '@/i18n/LocaleContext';

export default function MenuScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: items, isLoading } = useMenuItems();
  const { data: categories } = useMenuCategories();
  const toggleAvail = useToggleAvailability();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryNames = useMemo(() => {
    if (!categories) return ['All'];
    return ['All', ...categories.map((c: any) => c.name)];
  }, [categories]);

  const sections = useMemo(() => {
    if (!items) return [];
    const filtered = items.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory && selectedCategory !== 'All' && i.categoryId?.name !== selectedCategory) return false;
      return true;
    });
    const grouped: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      const cat = item.categoryId?.name ?? t('menu.uncategorized');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [items, search, selectedCategory, t]);

  const offCount = items?.filter((i) => !i.isAvailable).length ?? 0;

  if (isLoading) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.ink }]}>{t('menu.title')}</Text>
        </View>
        <View style={styles.searchRow}>
          <Skeleton width="100%" height={48} radius={14} />
        </View>
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} width="100%" height={88} radius={16} />)}
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']} padded={false}>
      <View style={styles.head}>
        <View>
          <Text style={[styles.title, { color: colors.ink, fontFamily: fontFamilies.display }]}>{t('menu.title')}</Text>
          {(items?.length ?? 0) > 0 && (
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              {t('menu.count', { count: items!.length })}{offCount > 0 ? t('menu.offSuffix', { count: offCount }) : ''}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            hitSlop={12}
            onPress={() => router.push('/menu/import' as any)}
            style={[styles.addBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            accessibilityLabel={t('menu.import.title')}
          >
            <FileUp size={20} color={colors.ink} />
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={() => router.push('/menu/create' as any)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel={t('menu.addItem')}
          >
            <Plus size={22} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder={t('menu.searchPh')}
          autoCapitalize="none"
          leftIcon={<Search size={18} color={colors.inkSoft} />}
        />
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {categoryNames.map((cat) => {
            const isActive = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isActive ? colors.onPrimary : colors.ink },
                  ]}
                >
                  {cat === 'All' ? t('orders.seg.all') : cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {(!items || items.length === 0) ? (
        <EmptyState
          icon={<UtensilsCrossed size={32} color={colors.inkSoft} />}
          title={t('menu.emptyT')}
          subtitle={t('menu.emptyS')}
        />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<Search size={28} color={colors.inkSoft} />}
          title={t('menu.noMatchT')}
          subtitle={t('menu.noMatchS')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={[styles.sectionHeaderWrap, { backgroundColor: colors.bg }]}>
              <Text style={[styles.sectionHeader, { color: colors.ink }]}>{title}</Text>
              <View style={[styles.countPill, { backgroundColor: colors.surface2 }]}>
                <Text style={[styles.countText, { color: colors.inkSoft }]}>{data.length}</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/menu/${item._id}` as any)}
              style={({ pressed }) => [
                styles.itemRow,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : item.isAvailable ? 1 : 0.55 },
              ]}
              accessibilityLabel={t('menu.itemA11y', { name: item.name, state: t(item.isAvailable ? 'menu.available' : 'menu.soldOut') })}
            >
              <View style={styles.itemImageWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.primaryBg }]}>
                    <Text style={[styles.itemImageLetter, { color: colors.primary700, fontFamily: fontFamilies.display }]}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.ink }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.ink }]}>
                  {formatCurrency(item.price)}
                  {item.stockQty != null && item.stockQty <= (item.lowThreshold ?? 5) && (
                    <Text style={{ color: item.stockQty <= 0 ? colors.dangerText : colors.warningText }}>
                      {item.stockQty <= 0 ? t('menu.out') : t('menu.left', { count: item.stockQty })}
                    </Text>
                  )}
                </Text>
                {item.tags && item.tags.length > 0 ? (
                  <Text style={[styles.itemTags, { color: colors.inkSoft }]} numberOfLines={1}>
                    {item.tags.slice(0, 3).join(' · ')}
                  </Text>
                ) : (
                  <Text style={[styles.itemTags, { color: item.isAvailable ? colors.successText : colors.rose }]}>
                    {item.isAvailable ? t('menu.available') : t('menu.soldOut')}
                  </Text>
                )}
              </View>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleAvail.mutate(item._id)}
                trackColor={{ false: colors.surface2, true: colors.primary }}
                thumbColor="#FFF"
              />
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 20, 
    paddingBottom: 16,
    paddingHorizontal: 16 
  },
  title: {
    fontSize: typography.displayM.size,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: typography.caption.size,
    fontWeight: '600',
    marginTop: 2,
  },
  addBtn: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  searchRow: {
    marginBottom: 12,
    paddingHorizontal: 16
  },
  categoriesWrapper: {
    height: 38,
    marginBottom: 20,
  },
  categories: { 
    flex: 1 
  },
  categoriesContent: { 
    gap: 8, 
    alignItems: 'center',
    paddingHorizontal: 16
  },
  categoryChip: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryText: { 
    fontSize: typography.caption.size, 
    fontWeight: '700' 
  },
  skeletonList: { 
    paddingHorizontal: 16, 
    gap: 12 
  },
  list: { 
    paddingBottom: 40,
    paddingHorizontal: 16
  },
  sectionHeaderWrap: {
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  countText: { fontSize: typography.micro.size, fontWeight: '800' },
  sectionHeader: { 
    fontSize: typography.h2.size, 
    fontWeight: '800',
    letterSpacing: -0.3
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  itemImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden'
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover'
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemImageLetter: {
    fontSize: 24,
  },
  itemInfo: { 
    flex: 1, 
    marginLeft: 14,
    justifyContent: 'center'
  },
  itemName: { 
    fontSize: typography.body.size, 
    fontWeight: '700',
    marginBottom: 2
  },
  itemPrice: {
    fontSize: typography.body.size,
    fontWeight: '800',
    marginTop: 1,
  },
  itemTags: {
    fontSize: typography.caption.size,
    fontWeight: '600',
    marginTop: 2,
  },
});