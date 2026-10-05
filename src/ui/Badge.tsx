import { StyleSheet, Text, View } from 'react-native';
import { typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';

type ColorKey = 'primary' | 'accent' | 'lime' | 'amber' | 'rose' | 'violet' | 'neutral';

interface BadgeProps {
  label: string;
  color?: ColorKey;
  uppercase?: boolean;
}

export function Badge({ label, color = 'primary', uppercase = true }: BadgeProps) {
  const { colors } = useTheme();
  const pair = pairFor(color, colors);
  return (
    <View style={[styles.badge, { backgroundColor: pair.bg }]}>
      <Text style={[styles.text, { color: pair.text, textTransform: uppercase ? 'uppercase' : 'none' }]}>
        {label}
      </Text>
    </View>
  );
}

function pairFor(key: ColorKey, c: ReturnType<typeof useTheme>['colors']) {
  switch (key) {
    case 'primary':
      return { bg: c.primaryBg, text: c.primaryText };
    case 'accent':
      return { bg: c.accentBg, text: c.accentText };
    case 'lime':
      return { bg: c.successBg, text: c.successText };
    case 'amber':
      return { bg: c.warningBg, text: c.warningText };
    case 'rose':
      return { bg: c.dangerBg, text: c.dangerText };
    case 'violet':
      return { bg: c.primaryBg, text: c.violet };
    case 'neutral':
      return { bg: c.surface2, text: c.inkSoft };
  }
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, alignSelf: 'flex-start' },
  text: { fontSize: typography.micro.size, fontWeight: '700', letterSpacing: 0.5 },
});
