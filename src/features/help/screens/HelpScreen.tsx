import { ScrollView, StyleSheet, View, Text, Pressable, Linking } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Mail, Shield, FileText, MessageCircle, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Card } from '@/ui/Card';
import { useTheme } from '@/ui/theme/useTheme';
import { typography, spacing } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';
import { ENV } from '@/shared/config/env';

const SUPPORT_EMAIL = 'support@foorq.app';
const PRIVACY_URL = 'https://foorq.app/privacy';
const DPA_URL = 'https://foorq.app/dpa';

export function HelpScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const openMail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
  };

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScreenHeader title={t('more.helpTitle')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('more.helpTitle')}</Text>

          <Pressable onPress={openMail} style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryBg }]}>
              <Mail size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.ink }]}>{t('more.contactSupport')}</Text>
              <Text style={[styles.rowDesc, { color: colors.inkSoft }]}>{SUPPORT_EMAIL}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkSoft} />
          </Pressable>

          <Pressable onPress={() => openLink(PRIVACY_URL)} style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accentBg }]}>
              <Shield size={20} color={colors.accent} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.ink }]}>{t('more.privacy')}</Text>
              <Text style={[styles.rowDesc, { color: colors.inkSoft }]}>{t('more.privacySub')}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkSoft} />
          </Pressable>

          <Pressable onPress={() => openLink(DPA_URL)} style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.warningBg }]}>
              <FileText size={20} color={colors.amber} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.ink }]}>{t('more.dpa')}</Text>
              <Text style={[styles.rowDesc, { color: colors.inkSoft }]}>{t('more.dpaSub')}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkSoft} />
          </Pressable>

          <Pressable onPress={openMail} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>
              <MessageCircle size={20} color={colors.inkSoft} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.ink }]}>{t('more.reportBug')}</Text>
              <Text style={[styles.rowDesc, { color: colors.inkSoft }]}>{t('more.reportBugSub')}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkSoft} />
          </Pressable>
        </Card>

        <View style={styles.versionWrap}>
          <Text style={[styles.versionLabel, { color: colors.inkSoft }]}>{t('more.appVersion')}</Text>
          <Text style={[styles.versionValue, { color: colors.ink }]}>
            {Constants.expoConfig?.version ?? '1.0.0'} ({Constants.expoConfig?.name ?? ENV.appName})
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: typography.h1.size, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: typography.body.size, fontWeight: '600' },
  rowDesc: { fontSize: typography.caption.size, marginTop: 2 },
  versionWrap: { alignItems: 'center', paddingVertical: 24 },
  versionLabel: { fontSize: typography.caption.size, fontWeight: '600' },
  versionValue: { fontSize: typography.body.size, fontWeight: '700', marginTop: 4 },
});
