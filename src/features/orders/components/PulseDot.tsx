import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface PulseDotProps {
  color: string;
  size?: number;
}

export function PulseDot({ color, size = 8 }: PulseDotProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }]} />;
}

const styles = StyleSheet.create({
  dot: {},
});
