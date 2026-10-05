import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme/useTheme';
import { initials } from '@/shared/format';

interface AvatarProps {
  name?: string | null;
  size?: number;
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, backgroundColor: colors.violet, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontWeight: '700' },
});
