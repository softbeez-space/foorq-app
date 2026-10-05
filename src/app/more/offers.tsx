import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Percent, Layers, Gift, Clock, TicketPercent } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Card } from '@/ui/Card';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useOffers, useToggleOffer } from '@/features/offers/hooks';
import { formatDate } from '@/shared/format';
import type { Offer } from '@/entities/offer';

// Grab two-line offer rows with a Luma-style ticket strip
// (big value left, code + terms right) and an inline Active toggle.
export default function OffersScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [tabIdx, setTabIdx] = useState(0);
  const activeOnly = tabIdx === 0;
  const { data: offers, isLoading } = useOffers(activeOnly);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.offersTitle')}
        right={
          <Pressable
            hitSlop={10}
            onPress={() => router.push('/more/offers/create')}
            style={[styles.addBtn, { backgroundColor: colors.surface2 }]}
            accessibilityLabel={t('more.newOffer')}
          >
            <Plus size={20} color={colors.ink} />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={172} radius={16} />)}
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.filterWrap}>
                <SegmentedControl segments={[t('more.tabActive'), t('more.tabAll')]} index={tabIdx} onChange={setTabIdx} />
              </View>
              {(offers ?? []).length > 0 && (
                <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>
                  {t('more.offersCount', { tab: activeOnly ? t('more.tabActive') : t('more.tabAll'), count: offers!.length })}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={<TicketPercent size={28} color={colors.inkSoft} />}
              title={activeOnly ? t('more.noActiveOffers') : t('more.noOffersYet')}
              subtitle={activeOnly
                ? t('more.noActiveOffersSub')
                : t('more.noOffersYetSub')}
              action={
                !activeOnly ? (
                  <Button
                    onPress={() => router.push('/more/offers/create')}
                    shape="pill"
                    leftIcon={<Plus size={16} color={colors.onPrimary} />}
                  >
                    {t('more.newOffer')}
                  </Button>
                ) : undefined
              }
            />
          }
          renderItem={({ item }) => <OfferCard item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </Screen>
  );
}

function OfferCard({ item }: { item: Offer }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const toggleMutation = useToggleOffer();

  const typeConfig = {
    discount: { icon: Percent, bgKey: 'primaryBg' as const, colorKey: 'primary' as const },
    bogo: { icon: Layers, bgKey: 'accentBg' as const, colorKey: 'accent' as const },
    free_item: { icon: Gift, bgKey: 'successBg' as const, colorKey: 'lime' as const },
  };
  const config = typeConfig[item.type] ?? typeConfig.discount;
  const Icon = config.icon;

  const bigValue =
    item.type === 'discount'
      ? `${item.discountValue}${item.discountType === 'percentage' ? '%' : '৳'}`
      : item.type === 'bogo'
        ? t('more.typeBogo')
        : t('more.bigFree');

  return (
    <Pressable
      onPress={() => router.push(`/more/offers/${item._id}`)}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      accessibilityLabel={t('more.offerDetails', { name: item.name })}
    >
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: colors[config.bgKey] }]}>
            <Icon size={20} color={colors[config.colorKey]} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={[styles.offerName, { color: colors.ink }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Badge
              label={item.isActive ? t('more.tabActive') : t('more.paused')}
              color={item.isActive ? 'lime' : 'neutral'}
              uppercase
            />
          </View>
          <Switch
            value={item.isActive}
            onValueChange={() =>
              toggleMutation.mutate({ id: item._id, isActive: !item.isActive })
            }
            trackColor={{ false: colors.surface2, true: colors.primary50 }}
            thumbColor={item.isActive ? colors.primary : colors.inkSoft}
            accessibilityLabel={item.isActive ? t('more.pauseOffer') : t('more.activateOffer')}
          />
        </View>

        {/* Ticket strip */}
        <View style={[styles.ticket, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.ticketValue, { color: colors[config.colorKey] }]} numberOfLines={1}>
            {bigValue}
          </Text>
          <View style={styles.ticketRight}>
            <Text style={[styles.ticketCode, { color: colors.ink }]} numberOfLines={1}>
              {item.promoCode || t('more.autoApplied')}
            </Text>
            <Text style={[styles.ticketTerms, { color: colors.inkSoft }]} numberOfLines={1}>
              {item.minOrderAmount > 0 ? t('more.minOrderShort', { amount: item.minOrderAmount }) : ''}{formatDate(item.startDate)} → {formatDate(item.endDate)}
            </Text>
          </View>
        </View>

        {/* Usage */}
        {item.usageCount > 0 && (
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.inkSoft} />
            <Text style={[styles.metaText, { color: colors.inkSoft }]}>
              {t('more.offerUsed', { used: item.usageCount, limit: item.usageLimit ? `/${item.usageLimit}` : '×' })}
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  skeletonList: { gap: 10, paddingHorizontal: 20, paddingTop: 22 },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  filterWrap: { marginBottom: 14 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  // Card
  card: { gap: spacing.sm, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardHeaderInfo: { flex: 1, gap: 5 },
  offerName: { fontSize: typography.body.size, fontWeight: '700' },

  // Ticket
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ticketValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  ticketRight: { flex: 1, alignItems: 'flex-end', gap: 2 },
  ticketCode: { fontSize: typography.caption.size, fontWeight: '800' },
  ticketTerms: { fontSize: typography.micro.size, fontWeight: '600' },

  // Meta
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.micro.size },
});
