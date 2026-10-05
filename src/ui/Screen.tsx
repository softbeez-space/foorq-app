import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from './theme/useTheme';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  edges?: Edge[];
}

export function Screen({ children, style, padded = true, edges = ['top', 'bottom', 'left', 'right'] }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={[styles.flex, padded && styles.padded, style]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
