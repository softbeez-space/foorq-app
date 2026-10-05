import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GitBranch, MapPin, Check, Search, Plus, Armchair } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Input } from '@/ui/Input';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { useBranchStore } from '@/features/branches/store';
import { useAuthStore } from '@/features/auth/store';
import type { Branch } from '@/entities/branch';
import { AuthHeader } from './_components/AuthHeader';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SelectBranchScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const branches = useBranchStore((s) => s.branches);
  const loaded = useBranchStore((s) => s.loaded);
  const storedSelected = useBranchStore((s) => s.selectedBranchId);
  const setBranch = useBranchStore((s) => s.setBranch);
  const assignedBranchId = useAuthStore((s) => s.user?.branchId ?? null);

  // Branch-locked staff only ever see their own branch.
  const visible = useMemo(
    () =>
      assignedBranchId ? branches.filter((b) => b._id === assignedBranchId) : branches,
    [assignedBranchId, branches],
  );

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || (b.address ?? '').toLowerCase().includes(q),
    );
  }, [visible, query]);

  const selected = picked ?? storedSelected ?? visible[0]?._id ?? null;

  const go = async (id: string) => {
    setSaving(true);
    try {
      await setBranch(id);
      router.replace('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Branch }) => {
    const active = item._id === selected;
    const tableCount = item.tables?.length ?? 0;
    return (
      <Pressable onPress={() => setPicked(item._id)}>
        <Card
          style={[
            styles.row,
            {
              borderColor: active ? colors.primary : colors.border,
              borderWidth: active ? 2 : StyleSheet.hairlineWidth,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryBg }]}>
            <Text style={[styles.avatarText, { color: colors.primary700 }]}>
              {initials(item.name)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.ink }]}>{item.name}</Text>
            {item.address ? (
              <View style={styles.addrRow}>
                <MapPin size={12} color={colors.inkSoft} />
                <Text style={[styles.addr, { color: colors.inkSoft }]} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            ) : null}
            <View style={styles.addrRow}>
              <Armchair size={12} color={colors.inkSoft} />
              <Text style={[styles.addr, { color: colors.inkSoft }]}>
                {t('auth.branchTables', { count: tableCount })}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.radio,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : 'transparent',
              },
            ]}
          >
            {active && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen>
      <AuthHeader
        title={t('auth.branchTitle')}
        subtitle={
          assignedBranchId
            ? t('auth.branchSubAssigned')
            : t('auth.branchSubChoose')
        }
      />

      {!loaded ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={28} color={colors.inkSoft} />}
          title={t('auth.branchEmptyTitle')}
          subtitle={t('auth.branchEmptySub')}
          action={<Button onPress={() => router.replace('/setup-branch')}>{t('auth.createBranch')}</Button>}
        />
      ) : (
        <>
          {visible.length > 3 && (
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder={t('auth.branchSearchPh')}
              leftIcon={<Search size={16} color={colors.inkSoft} />}
              style={{ marginBottom: 12 }}
            />
          )}
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.inkSoft }]}>{t('auth.branchNoMatch')}</Text>
            }
          />
          <View style={styles.footer}>
            <Button onPress={() => selected && go(selected)} loading={saving} disabled={!selected} size="lg" shape="pill">
              {t('auth.continue')}
            </Button>
            {!assignedBranchId && (
              <Button
                variant="ghost"
                onPress={() => router.push('/setup-branch')}
                leftIcon={<Plus size={16} color={colors.primary700} />}
              >
                {t('auth.addAnotherBranch')}
              </Button>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.h2.size, fontWeight: '800' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: typography.h2.size, fontWeight: '700' },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addr: { fontSize: typography.caption.size, flex: 1 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { textAlign: 'center', paddingVertical: 20, fontSize: typography.body.size },
  footer: { gap: 4, paddingTop: 8, paddingBottom: 8 },
});
