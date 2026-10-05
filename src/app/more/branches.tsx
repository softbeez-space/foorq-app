import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, GitBranch, MapPin, Plus, Wifi } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Skeleton } from '@/ui/Skeleton';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Subway / Rodeo pattern: status pills above a bold name, meta rows below,
// chevron for drill-in. Current branch gets the lime pill.
export default function BranchListScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { branches, loading, loaded, loadBranches, selectedBranchId } = useBranchStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loaded) loadBranches();
  }, [loaded, loadBranches]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBranches();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('more.branchesTitle')}
        right={
          <Pressable
            hitSlop={10}
            onPress={() => router.push('/setup-branch' as any)}
            style={[styles.addBtn, { backgroundColor: colors.surface2 }]}
            accessibilityLabel={t('more.newBranch')}
          >
            <Plus size={20} color={colors.ink} />
          </Pressable>
        }
      />

      {loading && !loaded ? (
        <View style={{ gap: 10, paddingHorizontal: 20 }}>
          {[1, 2].map((i) => <Skeleton key={i} width="100%" height={104} radius={16} />)}
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(b) => b._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            branches.length > 0 ? (
              <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>
                {t(branches.length === 1 ? 'more.locationOne' : 'more.locations', { count: branches.length })}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const current = item._id === selectedBranchId;
            const tableCount = item.tables?.length ?? item.tableCount ?? 0;
            return (
              <Pressable
                onPress={() => router.push(`/more/branches/${item._id}` as any)}
                style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                accessibilityLabel={t('more.branchSettings', { name: item.name })}
              >
                <Card style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryBg }]}>
                    <Text style={[styles.avatarText, { color: colors.primary700 }]}>
                      {initials(item.name)}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <View style={styles.pills}>
                      {current ? <Badge label={t('more.current')} color="lime" /> : null}
                      <Badge label={t(tableCount === 1 ? 'more.tableBadgeOne' : 'more.tablesBadge', { count: tableCount })} color="neutral" />
                    </View>
                    <Text style={[styles.name, { color: colors.ink }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.address ? (
                      <View style={styles.meta}>
                        <MapPin size={12} color={colors.inkSoft} />
                        <Text style={[styles.metaText, { color: colors.inkSoft }]} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                    ) : null}
                    {item.wifiSSID ? (
                      <View style={styles.meta}>
                        <Wifi size={12} color={colors.accent} />
                        <Text style={[styles.metaText, { color: colors.accent }]} numberOfLines={1}>
                          {item.wifiSSID}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <ChevronRight size={18} color={colors.inkSoft} />
                </Card>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={<GitBranch size={28} color={colors.inkSoft} />}
              title={t('more.noBranches')}
              subtitle={t('more.noBranchesSub')}
              action={
                <Button onPress={() => router.push('/setup-branch' as any)} leftIcon={<Plus size={16} color={colors.onPrimary} />}>
                  {t('more.newBranch')}
                </Button>
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.h2.size, fontWeight: '800' },
  info: { flex: 1, gap: 4 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: typography.h2.size, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.caption.size, flex: 1 },
});
