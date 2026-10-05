import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/i18n/LocaleContext';
import { useTheme } from './theme/useTheme';
import { typography } from './theme/tokens';

// Compact EN | বাং pill (settings / more screens).
export function LocaleToggle() {
  const { colors } = useTheme();
  const { locale, setLocale } = useLocale();
  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.surface2 }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Language / ভাষা"
    >
      {(['en', 'bn'] as const).map((l) => {
        const active = locale === l;
        return (
          <Pressable
            key={l}
            onPress={() => setLocale(l)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[
              styles.opt,
              active && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.text, { color: active ? colors.onPrimary : colors.inkSoft }]}>
              {l === 'en' ? 'EN' : 'বাং'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 3, borderRadius: 9999, alignSelf: 'flex-start' },
  opt: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  text: { fontSize: typography.caption.size, fontWeight: '800' },
});
