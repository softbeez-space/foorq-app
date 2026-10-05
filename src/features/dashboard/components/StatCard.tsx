import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { Card } from '@/ui/Card';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, typography } from '@/ui/theme/tokens';
import { formatCurrency, formatNumber, formatPercent } from '@/shared/format';

interface StatCardProps {
  label: string;
  value: number;
  display?: 'currency' | 'number';
  change?: number;
  icon: LucideIcon;
  color: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, display = 'currency', change, icon: Icon, color, style }: StatCardProps) {
  const { colors } = useTheme();
  const displayValue = display === 'currency' ? formatCurrency(value) : formatNumber(value);
  const animated = useCountUp(value, display);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
          <Icon size={18} color={color} />
        </View>
        {typeof change === 'number' && !Number.isNaN(change) && (
          <View style={[styles.change, { backgroundColor: change >= 0 ? colors.successBg : colors.dangerBg }]}>
            <Text style={[styles.changeText, { color: change >= 0 ? colors.successText : colors.dangerText }]}>
              {formatPercent(change)}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.ink }]}>{animated || displayValue}</Text>
    </Card>
  );
}

function useCountUp(target: number, display: 'currency' | 'number') {
  const [val, setVal] = useState(0);
  const raf = useRef<any>(null);
  useEffect(() => {
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return display === 'currency' ? formatCurrency(val) : formatNumber(val);
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  icon: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  change: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9999 },
  changeText: { fontSize: 10, fontWeight: '700' },
  label: { fontSize: typography.micro.size, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: typography.h1.size, fontWeight: '700', fontFamily: fontFamilies.display },
});
