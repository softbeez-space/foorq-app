import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, type LayoutChangeEvent } from 'react-native';
import { typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';

interface SegmentedControlProps {
  segments: string[];
  index: number;
  onChange: (i: number) => void;
}

export function SegmentedControl({ segments, index, onChange }: SegmentedControlProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const needsScroll = contentWidth > containerWidth && containerWidth > 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      onContentSizeChange={(_, w) => setContentWidth(w)}
      style={[styles.container, { backgroundColor: colors.surface2 }]}
      contentContainerStyle={[styles.content, !needsScroll && styles.contentFill]}
      scrollEnabled={needsScroll}
    >
      {segments.map((seg, i) => {
        const active = i === index;
        return (
          <Pressable
            key={seg}
            onPress={() => onChange(i)}
            style={[
              styles.segment,
              !needsScroll && styles.segmentFlex,
              active && { backgroundColor: colors.surface, ...styles.activePill },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.ink : colors.inkSoft, fontWeight: active ? '700' : '500' },
              ]}
            >
              {seg}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, maxHeight: 42 },
  content: { padding: 4, gap: 2, alignItems: 'center' },
  contentFill: { flexGrow: 1 },
  segment: { paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segmentFlex: { flex: 1 },
  activePill: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  label: { fontSize: typography.caption.size, textAlign: 'center' },
});
