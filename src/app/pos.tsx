import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Animated, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ChevronDown, Minus, Plus, Search, ShoppingCart, Utensils, X, WifiOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { EmptyState } from '@/ui/EmptyState';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency } from '@/shared/format';
import { useMenuItems, useCreateOrder } from '@/features/orders/hooks';
import { useBranchTables } from '@/features/tables/hooks';
import { useBranchStore } from '@/features/branches/store';
import { useAuthStore } from '@/features/auth/store';
import { getCurrentWifiSSID } from '@/shared/utils/wifi';
import { api } from '@/shared/api/client';
import { useLocale } from '@/i18n/LocaleContext';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

const ORDER_TYPES = [
  { key: 'dine-in', labelKey: 'orders.type.dineIn' },
  { key: 'takeaway', labelKey: 'orders.type.takeaway' },
];

export default function PosScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branchId = useBranchStore((s) => s.selectedBranchId);
  const restaurant = useAuthStore((s) => s.restaurant);
  const { data: items, isLoading, isError } = useMenuItems();
  const createOrder = useCreateOrder();
  const { data: branch, isLoading: tablesLoading } = useBranchTables();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [eta, setEta] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const cartBounce = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastText, setToastText] = useState('');
  const [wifiWarning, setWifiWarning] = useState<string | null>(null);
  const [checkoutUpsells, setCheckoutUpsells] = useState<{
    enabled?: boolean;
    title?: string;
    itemIds?: string[];
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const branch = useBranchStore.getState().branches.find(
          (b) => b._id === useBranchStore.getState().selectedBranchId
        );
        if (!branch?.wifiSSID) { setWifiWarning(null); return; }

        const res = await api.get('/restaurant');
        const restricted = !!(res.data?.data?.settings?.restrictOrdersToWifi);
        setCheckoutUpsells(res.data?.data?.settings?.checkoutUpsells ?? null);
        if (!restricted) { setWifiWarning(null); return; }

        const currentSSID = await getCurrentWifiSSID();
        if (currentSSID && currentSSID !== branch.wifiSSID) {
          setWifiWarning(branch.wifiSSID);
        } else if (!currentSSID) {
          setWifiWarning(branch.wifiSSID);
        } else {
          setWifiWarning(null);
        }
      } catch { setWifiWarning(null); }
    })();
  }, []);

  const categories = useMemo(() => {
    if (!items) return [];
    const cats = [...new Set(items.map((i) => i.categoryId?.name).filter(Boolean))] as string[];
    return ['All', ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    
    if (!items) return [];
    return items.filter((i) => {
      if (!i.isAvailable) return false;
      if (selectedCategory && selectedCategory !== 'All' && i.categoryId?.name !== selectedCategory) return false;
      if (search) return i.name.toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [items, selectedCategory, search]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartIds = useMemo(() => new Set(cart.map((c) => c.menuItemId)), [cart]);

  // Same pairing data as the web guest menu: pairs of what's in the tray
  // plus the restaurant's checkout suggestions, minus what's already added.
  const pairSuggestions = useMemo(() => {
    if (!items) return [];
    const seen = new Set<string>();
    const out: NonNullable<typeof items> = [];
    for (const c of cart) {
      const src = items.find((m) => m._id === c.menuItemId);
      for (const r of src?.relatedItems || []) {
        const id = String((r as any)?.menuItemId?._id ?? (r as any)?.menuItemId);
        if (!id || id === c.menuItemId || cartIds.has(id) || seen.has(id)) continue;
        const full = items.find((m) => m._id === id);
        if (!full || !full.isAvailable) continue;
        seen.add(id);
        out.push(full);
        if (out.length >= 6) break;
      }
      if (out.length >= 6) break;
    }
    return out;
  }, [cart, cartIds, items]);

  const checkoutPicks = useMemo(() => {
    if (!checkoutUpsells?.enabled || !items) return [];
    return ((checkoutUpsells.itemIds || []).map(String) as string[])
      .map((id) => items.find((m) => m._id === id))
      .filter((m): m is NonNullable<typeof items>[number] => !!m && m.isAvailable && !cartIds.has(m._id))
      .slice(0, 5);
  }, [checkoutUpsells, items, cartIds]);
  const availableTables = useMemo(() => {
    if (!branch?.tables) return [];
    return branch.tables.filter((t) => t.status === 'available');
  }, [branch]);

  const showAddedFeedback = useCallback((itemName: string, id: string) => {
    setJustAddedId(id);
    Animated.sequence([
      Animated.timing(cartBounce, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.spring(cartBounce, { toValue: 1, damping: 8, stiffness: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setJustAddedId(null), 600);
    setToastText(t('pos.addedToast', { name: itemName }));
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [cartBounce, toastOpacity, t]);

  const addToCart = useCallback((item: NonNullable<typeof items>[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
    showAddedFeedback(item.name, item._id);
  }, [showAddedFeedback]);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItemId === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    const rid = restaurant?.id;
    if (!branchId || !rid || cart.length === 0) return;

    const wifiSSID = await getCurrentWifiSSID();

    // Staff POS orders stamp origin + a fresh idempotency key per ticket.
    await createOrder.mutateAsync({
      restaurantId: rid,
      branchId,
      clientOrderId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      origin: 'staff',
      items: cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
        addons: [],
        specialInstructions: '',
      })),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      orderType,
      tableNumber: tableNumber ? Number(tableNumber) : undefined,
      estimatedTime: eta.trim() ? Number(eta) : undefined,
      wifiSSID: wifiSSID || undefined,
    });
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');
    setEta('');
    router.back();
  }, [restaurant, branchId, cart, customerName, customerPhone, orderType, tableNumber, eta, createOrder]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}><Skeleton width="100%" height={400} radius={20} /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <X size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('pos.title')}</Text>
        <Pressable hitSlop={8} onPress={() => setShowCart(!showCart)} style={styles.cartBtn}>
          <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
            <ShoppingCart size={22} color={colors.ink} />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cartCount, { color: colors.onPrimary }]}>{cartCount}</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>

      {wifiWarning && (
        <View style={[styles.wifiBanner, { backgroundColor: colors.warningBg, borderColor: colors.warningText }]}>
          <WifiOff size={16} color={colors.warningText} />
          <Text style={[styles.wifiBannerText, { color: colors.warningText }]}>{t('pos.wifiWarn', { ssid: wifiWarning })}</Text>
        </View>
      )}

      {showCart ? (
        <View style={styles.cartSection}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('pos.cart')}</Text>
          {cart.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.inkSoft }]}>{t('pos.cartEmpty')}</Text>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(c) => c.menuItemId}
              renderItem={({ item }) => (
                <Card style={styles.cartItem}>
                  <View style={styles.cartItemLeft}>
                    <Text style={[styles.cartItemName, { color: colors.ink }]}>{item.name}</Text>
                    <Text style={[styles.cartItemPrice, { color: colors.inkSoft }]}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <Pressable onPress={() => updateQty(item.menuItemId, -1)} style={styles.qtyBtn}>
                      <Minus size={16} color={colors.ink} />
                    </Pressable>
                    <Text style={[styles.qty, { color: colors.ink }]}>{item.quantity}</Text>
                    <Pressable onPress={() => updateQty(item.menuItemId, 1)} style={styles.qtyBtn}>
                      <Plus size={16} color={colors.ink} />
                    </Pressable>
                  </View>
                </Card>
              )}
              ListFooterComponent={
                <View style={styles.cartFooter}>
                  {pairSuggestions.length > 0 && (
                    <View style={styles.suggestBlock}>
                      <Text style={[styles.suggestTitle, { color: colors.inkSoft }]}>
                        {t('menu.pos.suggest')}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
                        {pairSuggestions.map((m) => (
                          <View key={m._id} style={[styles.suggestChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.suggestName, { color: colors.ink }]} numberOfLines={1}>
                              {m.name}
                            </Text>
                            <Text style={[styles.suggestPrice, { color: colors.primary }]}>
                              {formatCurrency(m.price)}
                            </Text>
                            <Pressable
                              onPress={() => addToCart(m)}
                              accessibilityLabel={`${t('menu.pos.add')} ${m.name}`}
                              style={[styles.suggestAdd, { backgroundColor: colors.ink }]}
                            >
                              <Plus size={14} color="#FFF" />
                            </Pressable>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {checkoutPicks.length > 0 && (
                    <View style={styles.suggestBlock}>
                      <Text style={[styles.suggestTitle, { color: colors.inkSoft }]}>
                        {checkoutUpsells?.title || t('menu.pos.suggestMore')}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
                        {checkoutPicks.map((m) => (
                          <View key={m._id} style={[styles.suggestChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.suggestName, { color: colors.ink }]} numberOfLines={1}>
                              {m.name}
                            </Text>
                            <Text style={[styles.suggestPrice, { color: colors.primary }]}>
                              {formatCurrency(m.price)}
                            </Text>
                            <Pressable
                              onPress={() => addToCart(m)}
                              accessibilityLabel={`${t('menu.pos.add')} ${m.name}`}
                              style={[styles.suggestAdd, { backgroundColor: colors.ink }]}
                            >
                              <Plus size={14} color="#FFF" />
                            </Pressable>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.ink }]}>{t('orders.detail.total')}</Text>
                    <Text style={[styles.totalValue, { color: colors.ink }]}>{formatCurrency(cartTotal)}</Text>
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.ink, marginTop: 16 }]}>{t('pos.orderType')}</Text>
                  <View style={styles.typeRow}>
                    {ORDER_TYPES.map((ot) => (
                      <Pressable
                        key={ot.key}
                        onPress={() => setOrderType(ot.key)}
                        style={[
                          styles.typeChip,
                          { borderColor: orderType === ot.key ? colors.primary : colors.border },
                        ]}
                      >
                        <Text style={[styles.typeText, { color: orderType === ot.key ? colors.primary : colors.inkSoft }]}>
                          {t(ot.labelKey)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {orderType === 'dine-in' && (
                    <View style={{ marginBottom: 16 }}>
                      <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{t('pos.tableField')}</Text>
                      <Pressable
                        onPress={() => setShowTablePicker(true)}
                        style={[styles.tableSelect, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Text style={[styles.tableSelectText, { color: tableNumber ? colors.ink : colors.inkSoft }]}>
                          {tableNumber ? t('kitchen.table', { number: tableNumber }) : tablesLoading ? t('pos.loading') : t('pos.selectTable')}
                        </Text>
                        <ChevronDown size={16} color={colors.inkSoft} />
                      </Pressable>

                      <Modal visible={showTablePicker} transparent animationType="fade" onRequestClose={() => setShowTablePicker(false)}>
                        <Pressable style={styles.modalOverlay} onPress={() => setShowTablePicker(false)}>
                          <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.ink }]}>{t('pos.selectTableTitle')}</Text>
                            <FlatList
                              data={availableTables}
                              keyExtractor={(t) => t._id}
                              renderItem={({ item }) => (
                                <Pressable
                                  onPress={() => {
                                    setTableNumber(item.number);
                                    setShowTablePicker(false);
                                  }}
                                  style={[styles.tableOption, { borderBottomColor: colors.border }]}
                                >
                                  <Text style={[styles.tableOptionNum, { color: colors.ink }]}>{t('kitchen.table', { number: item.number })}</Text>
                                  <Text style={[styles.tableOptionCap, { color: colors.inkSoft }]}>
                                    {t('pos.capacity', { count: item.capacity })}
                                  </Text>
                                </Pressable>
                              )}
                              ListFooterComponent={
                                tableNumber ? (
                                  <Pressable
                                    onPress={() => {
                                      setTableNumber('');
                                      setShowTablePicker(false);
                                    }}
                                    style={[styles.clearOption, { borderTopColor: colors.border }]}
                                  >
                                    <Text style={[styles.clearText, { color: colors.rose }]}>{t('pos.clear')}</Text>
                                  </Pressable>
                                ) : null
                              }
                              ListEmptyComponent={
                                <Text style={[styles.emptyTables, { color: colors.inkSoft }]}>
                                  {tablesLoading ? t('pos.loadingTables') : t('pos.noTables')}
                                </Text>
                              }
                            />
                          </Pressable>
                        </Pressable>
                      </Modal>
                    </View>
                  )}
                  <Input label={t('pos.customerName')} value={customerName} onChangeText={setCustomerName} />
                  <Input label={t('pos.customerPhone')} value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
                  <Input
                    label={t('pos.eta')}
                    value={eta}
                    onChangeText={(v) => setEta(v.replace(/[^0-9]/g, '').slice(0, 3))}
                    keyboardType="numeric"
                    placeholder={t('pos.etaPh')}
                  />

                  <Button
                    onPress={handleSubmit}
                    loading={createOrder.isPending}
                    disabled={cart.length === 0}
                    size="lg"
                    style={{ marginTop: 16 }}
                  >
                    {t('pos.placeOrder', { total: formatCurrency(cartTotal) })}
                  </Button>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cartList}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {isError ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <EmptyState
                icon={<Utensils size={28} color={colors.rose} />}
                title={t('pos.menuErrorT')}
                subtitle={t('pos.menuErrorS')}
              />
            </View>
          ) : !items ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Skeleton width="45%" height={160} radius={16} />
            </View>
          ) : items.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <EmptyState
                icon={<Utensils size={28} color={colors.inkSoft} />}
                title={t('pos.menuEmptyT')}
                subtitle={t('pos.menuEmptyS')}
              />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(i) => i._id}
              numColumns={2}
              renderItem={({ item }) => {
                const added = justAddedId === item._id;
                return (
                  <Pressable
                    onPress={() => addToCart(item)}
                    style={({ pressed }) => [
                      styles.menuCard,
                      { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <View style={[styles.menuImageWrap, { backgroundColor: colors.surface2 }]}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.menuImage} />
                      ) : (
                        <Text style={[styles.menuImageFallback, { color: colors.inkSoft }]}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                      {added && (
                        <View style={[styles.addedOverlay, { backgroundColor: colors.successText }]}>
                          <Check size={14} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.menuCardBody}>
                      <Text style={[styles.menuName, { color: colors.ink }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.menuPrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
                    </View>
                  </Pressable>
                );
              }}
              columnWrapperStyle={styles.menuRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuList}
              ListHeaderComponent={
                <View>
                  <View style={styles.searchWrap}>
                    <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                      <Search size={16} color={colors.inkSoft} />
                    </View>
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder={t('pos.searchPh')}
                      placeholderTextColor={colors.inkSoft}
                      style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
                    />
                  </View>
                  {categories.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
                      {categories.map((cat, idx) => (
                        <Pressable
                          key={cat}
                          onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
                          style={[
                            styles.categoryChip,
                            {
                              backgroundColor: (cat === 'All' && !selectedCategory) || selectedCategory === cat ? colors.primary : colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              { color: (cat === 'All' && !selectedCategory) || selectedCategory === cat ? colors.onPrimary : colors.ink },
                            ]}
                          >
                            {cat === 'All' ? t('orders.seg.all') : cat}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              }
              ListEmptyComponent={
                <View style={{ paddingTop: 40 }}>
                  <EmptyState
                    icon={<Search size={24} color={colors.inkSoft} />}
                    title={t('pos.noMatchT')}
                    subtitle={t('pos.noMatchS')}
                  />
                </View>
              }
            />
          )}
        </View>
      )}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          { backgroundColor: colors.ink, opacity: toastOpacity },
        ]}
      >
        <Check size={14} color={colors.onPrimary} />
        <Text style={[styles.toastText, { color: colors.onPrimary }]}>{toastText}</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: typography.displayM.size, fontWeight: '700', fontFamily: fontFamilies.display },
  cartBtn: { position: 'relative' },
  cartBadge: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartCount: { fontSize: 10, fontWeight: '700' },
  searchWrap: { position: 'relative', marginBottom: 12 },
  searchInput: { height: 44, borderRadius: 12, borderWidth: 1, paddingLeft: 36, paddingRight: 14, fontSize: typography.body.size },
  categories: { marginBottom: 16 },
  categoriesContent: { gap: 8, alignItems: 'center' },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, marginRight: 8, borderWidth: 1 },
  categoryText: { fontSize: typography.caption.size, fontWeight: '600' },
  menuList: { paddingBottom: 24 },
  menuRow: { gap: 12, marginBottom: 12 },
  suggestBlock: { marginBottom: 14 },
  suggestTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  suggestRow: { gap: 8, paddingRight: 4 },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    maxWidth: 220,
  },
  suggestName: { flex: 1, fontSize: 12, fontWeight: '700', minWidth: 60 },
  suggestPrice: { fontSize: 12, fontWeight: '800' },
  suggestAdd: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuCard: { flex: 1, padding: 0, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuImageWrap: { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  menuImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  menuImageFallback: { fontSize: 28, fontWeight: '700', fontFamily: fontFamilies.display },
  addedOverlay: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  menuCardBody: { padding: 12, gap: 4 },
  menuName: { fontSize: typography.body.size, fontWeight: '600' },
  menuPrice: { fontSize: typography.body.size, fontWeight: '700' },
  toast: { position: 'absolute', bottom: 100, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  wifiBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  wifiBannerText: { fontSize: typography.caption.size, fontWeight: '600', flex: 1 },
  toastText: { fontSize: typography.caption.size, fontWeight: '600' },
  cartSection: { flex: 1 },
  sectionTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: 12 },
  emptyText: { fontSize: typography.body.size },
  cartList: { paddingBottom: 24 },
  cartItem: { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartItemLeft: { gap: 2 },
  cartItemName: { fontSize: typography.body.size, fontWeight: '600' },
  cartItemPrice: { fontSize: typography.caption.size },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  qty: { fontSize: typography.body.size, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  cartFooter: { marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  totalLabel: { fontSize: typography.h2.size, fontWeight: '700' },
  totalValue: { fontSize: typography.h1.size, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1 },
  typeText: { fontSize: typography.caption.size, fontWeight: '600' },
  fieldLabel: { fontSize: typography.caption.size, fontWeight: '600', marginBottom: 6 },
  tableSelect: { height: 44, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  tableSelectText: { fontSize: typography.body.size },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', maxHeight: 400, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: 16 },
  tableOption: { paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  tableOptionNum: { fontSize: typography.body.size, fontWeight: '600' },
  tableOptionCap: { fontSize: typography.caption.size },
  clearOption: { paddingVertical: 12, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  clearText: { fontSize: typography.body.size, fontWeight: '600' },
  emptyTables: { textAlign: 'center', paddingVertical: 20, fontSize: typography.body.size },
});
