import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {icon && <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>{icon}</View>}
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: typography.h2.size, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: typography.body.size, marginTop: 6, textAlign: 'center' },
  action: { marginTop: 20 },
});
