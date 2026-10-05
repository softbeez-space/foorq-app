import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link2, MessageSquare, Star } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import {
  useBranchReviews,
  useToggleReviewHidden,
  useSaveGoogleReviewUrl,
} from '@/features/reviews/hooks';

function Stars({ rating, color }: { rating: number; color: string }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          color={s <= rating ? '#F59E0B' : color}
          fill={s <= rating ? '#F59E0B' : 'transparent'}
        />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branch = useBranchStore((s) => s.branches.find((b) => b._id === s.selectedBranchId) ?? null);
  const { data, isLoading } = useBranchReviews();
  const toggleHidden = useToggleReviewHidden();
  const saveUrl = useSaveGoogleReviewUrl();
  const [url, setUrl] = useState<string | null>(null);

  const items = data?.items || [];

  const handleSaveUrl = () => {
    const value = (url ?? branch?.googleReviewUrl ?? '').trim();
    if (!value) return;
    saveUrl.mutate(value, {
      onSuccess: () => setUrl(null),
    });
  };

  return (
    <Screen padded={false}>
      <ScreenHeader title={t('reviews.title')} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>{t('reviews.sub')}</Text>

          {/* Google review link */}
          <Card>
            <View style={styles.googleHead}>
              <Link2 size={15} color={colors.inkSoft} />
              <Text style={[styles.cardTitle, { color: colors.ink }]}>{t('reviews.googleTitle')}</Text>
            </View>
            <Text style={[styles.googleSub, { color: colors.inkSoft }]}>{t('reviews.googleSub')}</Text>
            <Input
              value={url ?? branch?.googleReviewUrl ?? ''}
              onChangeText={setUrl}
              placeholder={t('reviews.googlePh')}
              autoCapitalize="none"
            />
            <View style={{ marginTop: 12 }}>
              <Button onPress={handleSaveUrl} loading={saveUrl.isPending}>
                {t('reviews.save')}
              </Button>
            </View>
            {saveUrl.isError && (
              <Text style={[styles.error, { color: colors.rose }]}>{t('reviews.googleInvalid')}</Text>
            )}
          </Card>

          {/* list */}
          {items.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={26} color={colors.inkSoft} />}
              title={t('reviews.empty')}
              subtitle={t('reviews.emptySub')}
            />
          ) : (
            items.map((r) => (
              <Card key={r._id} style={r.hidden ? { opacity: 0.55 } : undefined}>
                <View style={styles.reviewHead}>
                  <Stars rating={r.rating} color={colors.border} />
                  {r.googleClicked && (
                    <View style={[styles.gBadge, { backgroundColor: colors.surface2 }]}>
                      <Text style={[styles.gText, { color: colors.inkSoft }]}>{t('reviews.googleBadge')}</Text>
                    </View>
                  )}
                  {r.hidden && (
                    <View style={[styles.hiddenBadge, { backgroundColor: colors.surface2 }]}>
                      <Text style={[styles.gText, { color: colors.inkSoft }]}>{t('reviews.hiddenBadge')}</Text>
                    </View>
                  )}
                </View>
                {!!r.comment && (
                  <Text style={[styles.comment, { color: colors.ink }]}>{r.comment}</Text>
                )}
                <View style={styles.reviewFoot}>
                  <Text style={[styles.orderNo, { color: colors.inkSoft }]}>#{r.orderNumber}</Text>
                  <Pressable
                    hitSlop={8}
                    disabled={toggleHidden.isPending}
                    onPress={() => toggleHidden.mutate({ id: r._id, hidden: !r.hidden })}
                  >
                    <Text style={[styles.hideLink, { color: colors.primary }]}>
                      {r.hidden ? t('reviews.unhide') : t('reviews.hide')}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { fontSize: 13, fontFamily: fontFamilies.ui },
  cardTitle: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.display },
  googleHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  googleSub: { fontSize: 12, marginTop: 4, marginBottom: 12, fontFamily: fontFamilies.ui },
  error: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gBadge: { borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  hiddenBadge: { borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  gText: { fontSize: 10, fontWeight: '700' },
  comment: { fontSize: 14, lineHeight: 20, marginTop: 8, fontFamily: fontFamilies.ui },
  reviewFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  orderNo: { fontSize: 11, fontWeight: '600' },
  hideLink: { fontSize: 12, fontWeight: '700' },
});
