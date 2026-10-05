import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';

interface Props {
  summaryEn: string;
  summaryBn: string;
  generatedAt: string | null;
}

export function AiSummaryCard({ summaryEn, summaryBn, generatedAt }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [lang, setLang] = useState(0);
  return (
    <View style={[styles.wrap, { backgroundColor: colors.ink }]}>
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Sparkles size={12} color="#fff" />
          <Text style={styles.badgeText}>{t('more.aiInsights')}</Text>
        </View>
        {generatedAt ? (
          <Text style={[styles.ago, { color: colors.overlay }]}>{timeAgo(t, generatedAt)}</Text>
        ) : null}
      </View>
      <Text style={[styles.body, { color: '#fff' }]}>{lang === 0 ? summaryEn : summaryBn}</Text>
      <View style={styles.toggle}>
        <SegmentedControl segments={['English', 'বাংলা']} index={lang} onChange={setLang} />
      </View>
    </View>
  );
}

function timeAgo(t: (key: string, vars?: Record<string, string | number>) => string, iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t('more.agoMins', { n: mins });
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return t('more.agoHours', { n: hrs });
  return t('more.agoDays', { n: Math.round(hrs / 24) });
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 20, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: typography.micro.size, fontWeight: '700' as const, letterSpacing: 0.8 },
  ago: { fontSize: typography.micro.size },
  body: { fontSize: typography.body.size, lineHeight: 24, fontFamily: fontFamilies.ui },
  toggle: { marginTop: 14 },
});
