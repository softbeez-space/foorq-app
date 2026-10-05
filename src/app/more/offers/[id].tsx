import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Layers, Gift, Percent, Clock, Check, Pencil, Trash2, X } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useOffer, useUpdateOffer, useDeleteOffer } from '@/features/offers/hooks';
import { formatDate } from '@/shared/format';

// Deliveroo voucher sheet (title + status caption, Details label-value
// rows) with Luma coupon rows. Edit mode matches the New Offer grouped
// form; stats have spacing instead of divider lines.
export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: offer, isLoading } = useOffer(id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const updateMutation = useUpdateOffer();
  const deleteMutation = useDeleteOffer();

  const valid = name.trim().length > 0;

  const startEdit = () => {
    if (!offer) return;
    setName(offer.name);
    setDescription(offer.description ?? '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!valid) {
      Alert.alert(t('more.required'), t('more.offerRequiredBody'));
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        data: { name: name.trim(), description: description.trim() || undefined },
      });
      setEditing(false);
    } catch { /* handled by hook */ }
  };

  const handleDelete = () => {
    Alert.alert(t('more.deleteOffer'), t('more.deleteOfferBody'), [
      { text: t('more.cancel'), style: 'cancel' },
      {
        text: t('more.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('more.offerTitle')} />
        <View style={styles.loading}>
          <Skeleton width="100%" height={200} radius={20} />
        </View>
      </Screen>
    );
  }

  if (!offer) {
    return (
      <Screen>
        <ScreenHeader title={t('more.offerTitle')} />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.inkSoft }]}>{t('more.offerNotFound')}</Text>
        </View>
      </Screen>
    );
  }

  const typeConfig = {
    discount: { icon: Percent, label: t('more.typeDiscount'), bg: colors.primaryBg, color: colors.primary },
    bogo: { icon: Layers, label: t('more.typeBogo'), bg: colors.accentBg, color: colors.accent },
    free_item: { icon: Gift, label: t('more.typeFree'), bg: colors.successBg, color: colors.lime },
  };
  const config = typeConfig[offer.type];
  const TypeIcon = config.icon;

  const bigValue =
    offer.type === 'discount'
      ? `${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '৳'} ${t('more.offSuffix')}`
      : offer.type === 'bogo'
        ? t('more.bigBogo')
        : t('more.bigFree');

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.offerTitle')}
        right={
          editing ? (
            <Pressable
              hitSlop={10}
              onPress={handleSave}
              disabled={!valid || updateMutation.isPending}
              style={[styles.headerAction, valid && { backgroundColor: colors.primary }]}
              accessibilityLabel={t('more.saveChangesA11y')}
            >
              <Check size={18} color={valid ? colors.onPrimary : colors.inkSoft} />
            </Pressable>
          ) : (
            <Pressable
              hitSlop={10}
              onPress={startEdit}
              style={[styles.headerAction, { backgroundColor: colors.surface2 }]}
              accessibilityLabel={t('more.editOffer')}
            >
              <Pencil size={18} color={colors.ink} />
            </Pressable>
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {editing ? (
          <View>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.editOfferEyebrow')}</Text>
            <Card padded={false} style={styles.groupCard}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>
                  {t('more.offerNameLabel')} <Text style={{ color: colors.rose }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('more.offerNamePh')}
                  placeholderTextColor={colors.inkSoft}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.inkSoft }]}>{t('more.expDescLabel')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.ink }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('more.offerDescPh')}
                  placeholderTextColor={colors.inkSoft}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </Card>
            <View style={styles.editActions}>
              <Pressable
                onPress={cancelEdit}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                accessibilityLabel={t('more.cancelEditing')}
              >
                <X size={16} color={colors.inkSoft} />
                <Text style={[styles.cancelText, { color: colors.inkSoft }]}>{t('more.cancel')}</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button onPress={handleSave} loading={updateMutation.isPending} disabled={!valid} shape="pill">
                  {t('more.saveChanges')}
                </Button>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* ── Ticket hero ── */}
            <Card style={styles.hero}>
              <View style={[styles.heroIcon, { backgroundColor: config.bg }]}>
                <TypeIcon size={28} color={config.color} />
              </View>
              <Text style={[styles.offerName, { color: colors.ink }]} numberOfLines={2}>
                {offer.name}
              </Text>
              <Text style={[styles.heroValue, { color: config.color }]}>{bigValue}</Text>
              <View style={styles.badges}>
                <Badge label={config.label} color="primary" uppercase />
                {offer.promoCode && <Badge label={offer.promoCode} color="accent" uppercase={false} />}
                <Badge label={offer.isActive ? t('more.tabActive') : t('more.paused')} color={offer.isActive ? 'lime' : 'neutral'} uppercase />
              </View>
              {offer.description ? (
                <Text style={[styles.description, { color: colors.inkSoft }]}>{offer.description}</Text>
              ) : null}
            </Card>

            {/* ── Details ── */}
            <View>
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.details')}</Text>
              <Card padded={false} style={styles.groupCard}>
                <DetailRow label={t('more.offerType')} value={config.label} />
                {offer.type === 'discount' && (
                  <DetailRow
                    label={t('more.offerDiscount')}
                    value={`${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '৳'}`}
                  />
                )}
                {offer.minOrderAmount > 0 && (
                  <DetailRow label={t('more.offerMinOrder')} value={`৳${offer.minOrderAmount}`} />
                )}
                <DetailRow label={t('more.offerPromo')} value={offer.promoCode || t('more.autoApplied')} />
              </Card>
            </View>

            {/* ── Schedule ── */}
            <View>
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('more.schedule')}</Text>
              <Card padded={false} style={styles.groupCard}>
                <DetailRow label={t('more.starts')} value={formatDate(offer.startDate)} />
                <DetailRow label={t('more.ends')} value={formatDate(offer.endDate)} />
                <DetailRow
                  label={t('more.usage')}
                  value={offer.usageCount > 0
                    ? t('more.redeemed', { used: offer.usageCount, limit: offer.usageLimit ? ` / ${offer.usageLimit}` : '' })
                    : t('more.notUsedYet')}
                />
              </Card>
            </View>

            {/* ── Usage ── */}
            <View style={styles.usageRow}>
              <Clock size={14} color={colors.inkSoft} />
              <Text style={[styles.usageText, { color: colors.inkSoft }]}>
                {t('more.redeemed', { used: offer.usageCount, limit: offer.usageLimit ? ` of ${offer.usageLimit}` : '' })}
              </Text>
            </View>

            {/* ── Delete ── */}
            <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.rose }]}>
              <Trash2 size={18} color={colors.rose} />
              <Text style={[styles.deleteText, { color: colors.rose }]}>{t('more.deleteOffer')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.ink }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  loading: { padding: 20, flex: 1, justifyContent: 'center' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: typography.body.size },
  headerAction: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  // Hero
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 6 },
  heroIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  offerName: { fontSize: typography.h1.size, fontWeight: '700', fontFamily: fontFamilies.display, textAlign: 'center' },
  heroValue: { fontSize: typography.h2.size, fontWeight: '800' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' },
  description: { fontSize: typography.body.size, textAlign: 'center', marginTop: 6 },

  // Grouped rows
  groupCard: { paddingHorizontal: 16, paddingVertical: 10, gap: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  detailLabel: { fontSize: typography.body.size },
  detailValue: { fontSize: typography.body.size, fontWeight: '700', textAlign: 'right', flex: 1 },

  // Edit form (matches New Offer)
  field: { gap: 4 },
  label: { fontSize: typography.micro.size, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: typography.body.size, fontWeight: '600', paddingVertical: 4 },
  textArea: { minHeight: 72 },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 50, borderRadius: 9999, borderWidth: 1.5 },
  cancelText: { fontSize: typography.body.size, fontWeight: '700' },

  // Usage + delete
  usageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  usageText: { fontSize: typography.caption.size, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, borderWidth: 1.5 },
  deleteText: { fontSize: typography.body.size, fontWeight: '700' },
});
