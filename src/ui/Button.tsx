import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { fontFamilies, typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'md' | 'lg';
type Shape = 'rounded' | 'pill';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  /** pill = full-round food-app CTA (talabat/Zomato/Linktree pattern). */
  shape?: Shape;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading,
  disabled,
  leftIcon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const height = size === 'lg' ? 50 : 42;
  const radius = shape === 'pill' ? 9999 : 16;
  const opaque = disabled || loading;

  const variantStyle = flatVariant(variant, colors);

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={labelColor(variant, colors)} size="small" />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          <Text
            style={[
              styles.label,
              { color: labelColor(variant, colors), fontFamily: fontFamilies.uiSemibold },
              size === 'lg' && styles.labelLg,
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={opaque}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        { height, borderRadius: radius, opacity: pressed ? 0.88 : opaque ? 0.5 : 1 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

function labelColor(variant: Variant, c: ReturnType<typeof useTheme>['colors']): string {
  switch (variant) {
    case 'secondary':
      return c.onPrimary;
    case 'danger':
      return '#FFFFFF';
    case 'outline':
      return c.primary700;
    case 'ghost':
      return c.inkSoft;
    default:
      return c.onPrimary;
  }
}

function flatVariant(variant: Variant, c: ReturnType<typeof useTheme>['colors']): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: c.primary };
    case 'secondary':
      return { backgroundColor: c.ink };
    case 'danger':
      return { backgroundColor: c.rose };
    case 'outline':
      return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.primary };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  base: { width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: typography.body.size, letterSpacing: 0.2 },
  labelLg: { fontSize: typography.h2.size, fontFamily: fontFamilies.uiBold },
});
