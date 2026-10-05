import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { fieldMetrics, fontFamilies, typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';

interface InputProps {
  label?: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  leftIcon?: ReactNode;
  /** Custom trailing slot (e.g. password eye toggle). */
  right?: ReactNode;
  /** Shows a green valid check at the trailing edge. */
  valid?: boolean;
  error?: string;
  size?: 'md' | 'lg';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

/**
 * Brand field: 48/54pt, 14r, Inter, ember focus ring, optional hint,
 * trailing slot and valid check (Burger King inline-check pattern).
 */
export function Input({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  right,
  valid,
  error,
  size = 'md',
  multiline,
  numberOfLines,
  style,
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const height = size === 'lg' ? fieldMetrics.heightLg : fieldMetrics.heightMd;

  return (
    <View style={[styles.wrap, style]}>
      {label && (
        <Text style={[styles.label, { color: focused && !error ? colors.primary700 : colors.inkSoft }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.rose : focused ? colors.primary : colors.border,
            borderWidth: focused || error ? 1.5 : 1,
            borderRadius: fieldMetrics.radius,
            minHeight: multiline ? height + 40 : height,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconWrap}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSoft}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            { color: colors.ink, fontFamily: fontFamilies.ui, height: multiline ? undefined : '100%' },
          ]}
        />
        {valid && !error && (
          <View style={[styles.validDot, { backgroundColor: colors.successBg }]}>
            <Check size={12} strokeWidth={3} color={colors.successText} />
          </View>
        )}
        {right && <View style={styles.rightWrap}>{right}</View>}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.inkSoft }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: typography.caption.size, fontWeight: '600', fontFamily: fontFamilies.uiSemibold },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  iconWrap: { marginRight: 10, justifyContent: 'center' },
  input: { flex: 1, fontSize: typography.body.size, paddingVertical: 10 },
  validDot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  rightWrap: { marginLeft: 8, justifyContent: 'center' },
  error: { fontSize: typography.micro.size, marginTop: 2, fontFamily: fontFamilies.uiMedium },
  hint: { fontSize: typography.micro.size, marginTop: 2, fontFamily: fontFamilies.ui },
});
