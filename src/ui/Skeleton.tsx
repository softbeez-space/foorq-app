import { View } from 'react-native';
import { useTheme } from './theme/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surface2, opacity: 0.6 },
        style,
      ]}
    />
  );
}
