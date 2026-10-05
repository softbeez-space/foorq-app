import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from './theme/useTheme';
import { fontFamilies, typography } from './theme/tokens';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, right }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <Pressable hitSlop={8} onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={22} color={colors.ink} />
      </Pressable>
      <Text style={[styles.title, { color: colors.ink }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{right ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: typography.h1.size,
    fontWeight: '700',
    fontFamily: fontFamilies.display,
    textAlign: 'center',
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  spacer: { width: 40 },
});
