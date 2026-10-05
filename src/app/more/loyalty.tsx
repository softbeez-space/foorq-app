import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Award, Coins, Gift, Plus, Trash2, Users } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { EmptyState } from '@/ui/EmptyState';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import {
  useLoyaltyProgram,
  useUpdateProgram,
  useLoyaltyRewards,
  useUpdateReward,
  useDeleteReward,
  useLoyaltyStats,
} from '@/features/loyalty/hooks';

export default function LoyaltyScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: program, isLoading: programLoading } = useLoyaltyProgram();
  const { data: stats } = useLoyaltyStats();
  const { data: rewards } = useLoyaltyRewards();
  const updateProgram = useUpdateProgram();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

  const [rate, setRate] = useState<string | null>(null);
  const [minimum, setMinimum] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);

  if (programLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      </Screen>
    );
  }

  const activeRewards = (rewards || []).filter((r) => r.isActive);
  const earnLine =
    program && program.minimumSpend > 0
      ? t('loyalty.earnLineMin', { rate: program.earningRate, min: program.minimumSpend })
      : t('loyalty.earnLine', { rate: program?.earningRate ?? 0 });

  const saveSettings = () => {
    const data: any = {};
    if (rate !== null) data.earningRate = Math.max(1, Math.round(Number(rate) || 0));
    if (minimum !== null) data.minimumSpend = Math.max(0, Math.round(Number(minimum) || 0));
    if (welcome !== null) data.welcomePoints = Math.max(0, Math.round(Number(welcome) || 0));
    if (Object.keys(data).length === 0) return;
    updateProgram.mutate(data, {
      onSuccess: () => {
        setRate(null);
        setMinimum(null);
        setWelcome(null);
      },
    });
  };

  const confirmDelete = (id: string) => {
    Alert.alert(t('loyalty.deleteConfirm'), undefined, [
      { text: t('loyalty.cancel'), style: 'cancel' },
      { text: t('loyalty.deleteConfirm'), style: 'destructive', onPress: () => deleteReward.mutate(id) },
    ]);
  };

  return (
    <Screen padded={false}>
      <ScreenHeader title={t('loyalty.title')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 14 }}>
        {/* status */}
        <Card>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: program?.isEnabled ? colors.successText : colors.inkSoft }]} />
            <Text style={[styles.statusText, { color: colors.ink }]}>
              {program?.isEnabled ? t('loyalty.programOn') : t('loyalty.programOff')}
            </Text>
            <Switch
              value={!!program?.isEnabled}
              onValueChange={(v) => updateProgram.mutate({ isEnabled: v } as any)}
              trackColor={{ false: colors.surface2, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={[styles.earnLine, { color: colors.inkSoft }]}>{earnLine}</Text>
        </Card>

        {/* stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: Users, label: t('loyalty.statMembers'), value: String(stats?.totalMembers ?? 0) },
            { icon: Coins, label: t('loyalty.statIssued'), value: String(stats?.totalPointsIssued ?? 0) },
            { icon: Award, label: t('loyalty.statRedeemed'), value: String(stats?.totalPointsRedeemed ?? 0) },
            { icon: Gift, label: t('loyalty.statRewards'), value: String(activeRewards.length) },
          ].map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <s.icon size={16} color={colors.inkSoft} />
              <Text style={[styles.statValue, { color: colors.ink }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.inkSoft }]}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* settings */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>{t('loyalty.settings')}</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            <Input
              label={t('loyalty.rateLabel')}
              value={rate ?? String(program?.earningRate ?? '')}
              onChangeText={(v) => setRate(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            <Input
              label={t('loyalty.minLabel')}
              value={minimum ?? String(program?.minimumSpend ?? '')}
              onChangeText={(v) => setMinimum(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            <Input
              label={t('loyalty.welcomeLabel')}
              value={welcome ?? String(program?.welcomePoints ?? '')}
              onChangeText={(v) => setWelcome(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            <Button onPress={saveSettings} loading={updateProgram.isPending}>
              {t('loyalty.saveSettings')}
            </Button>
          </View>
        </Card>

        {/* rewards */}
        <Card>
          <View style={styles.rewardsHead}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>
              {t('loyalty.rewards')} · {(rewards || []).length}
            </Text>
            <Pressable
              onPress={() => router.push('/more/loyalty-reward' as any)}
              style={[styles.newBtn, { backgroundColor: colors.ink }]}
            >
              <Plus size={14} color="#FFF" />
              <Text style={styles.newBtnText}>{t('loyalty.newReward')}</Text>
            </Pressable>
          </View>
          {(rewards || []).length === 0 ? (
            <EmptyState
              icon={<Gift size={24} color={colors.inkSoft} />}
              title={t('loyalty.noRewards')}
              subtitle={t('loyalty.noRewardsSub')}
            />
          ) : (
            <View style={{ marginTop: 12, gap: 8 }}>
              {(rewards || []).map((r) => (
                <View key={r._id} style={[styles.rewardRow, { borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rewardName, { color: colors.ink }]} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={[styles.rewardMeta, { color: colors.inkSoft }]}>
                      {t('loyalty.pointsSuffix', { n: r.pointsRequired })}
                      {r.type === 'discount' && r.discountValue
                        ? ` · ${r.isPercentage ? `${r.discountValue}%` : r.discountValue}`
                        : ''}
                    </Text>
                  </View>
                  <Switch
                    value={r.isActive}
                    onValueChange={(v) => updateReward.mutate({ id: r._id, data: { isActive: v } })}
                    trackColor={{ false: colors.surface2, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                  <Pressable
                    hitSlop={8}
                    onPress={() => router.push(`/more/loyalty-reward?id=${r._id}` as any)}
                  >
                    <Text style={[styles.editLink, { color: colors.primary }]}>{t('loyalty.edit')}</Text>
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => confirmDelete(r._id)}>
                    <Trash2 size={16} color={colors.rose} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { flex: 1, fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.ui },
  earnLine: { marginTop: 6, fontSize: 13, fontFamily: fontFamilies.ui },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '47%', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', fontFamily: fontFamilies.display },
  statLabel: { fontSize: 11, fontFamily: fontFamilies.ui },
  cardTitle: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.display },
  rewardsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 8 },
  newBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rewardName: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.ui },
  rewardMeta: { fontSize: 11, marginTop: 2, fontFamily: fontFamilies.ui },
  editLink: { fontSize: 12, fontWeight: '700' },
});
