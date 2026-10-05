import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from './theme/useTheme';
import { radii } from './theme/tokens';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  surface2?: boolean;
}

export function Card({ children, style, padded = true, surface2 }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: surface2 ? colors.surface2 : colors.surface,
          borderColor: colors.border,
          borderRadius: radii.card,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: 16 },
});
