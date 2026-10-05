import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { fieldMetrics, fontFamilies, typography } from './theme/tokens';
import { useTheme } from './theme/useTheme';
import { Input } from './Input';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SelectProps {
  label?: string;
  hint?: string;
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  error?: string;
  searchable?: boolean;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

/**
 * Bottom-sheet picker (Postmates/Target store-picker pattern): field-styled
 * trigger, search when the list is long, radio rows, tap-to-confirm.
 */
export function Select({
  label,
  hint,
  value,
  options,
  placeholder = 'Select…',
  title,
  error,
  searchable,
  onChange,
  style,
}: SelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value) ?? null;
  const showSearch = searchable ?? options.length > 5;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q),
    );
  }, [options, query]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={style}>
      {label && <Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.rose : colors.border,
            borderRadius: fieldMetrics.radius,
            minHeight: fieldMetrics.heightMd,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selected ? colors.ink : colors.inkSoft, fontFamily: fontFamilies.ui },
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={colors.inkSoft} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: colors.rose }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.inkSoft }]}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: colors.ink, fontFamily: fontFamilies.uiBold }]}>
                {title ?? label ?? placeholder}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityLabel="Close">
                <X size={20} color={colors.inkSoft} />
              </Pressable>
            </View>
            {showSearch && (
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                leftIcon={<Search size={16} color={colors.inkSoft} />}
              />
            )}
            <FlatList
              data={results}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => pick(item.value)}
                    style={[
                      styles.option,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                        backgroundColor: active ? colors.primaryBg : colors.surface,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityLabel={item.label}
                  >
                    <View style={styles.optionInfo}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.ink, fontFamily: fontFamilies.uiSemibold },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.hint ? (
                        <Text style={[styles.optionHint, { color: colors.inkSoft }]}>{item.hint}</Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {active && <Check size={13} color={colors.onPrimary} strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.inkSoft }]}>No matches.</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: typography.caption.size, fontWeight: '600', fontFamily: fontFamilies.uiSemibold, marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: { fontSize: typography.body.size, flex: 1 },
  error: { fontSize: typography.micro.size, marginTop: 4, fontFamily: fontFamilies.uiMedium },
  hint: { fontSize: typography.micro.size, marginTop: 4, fontFamily: fontFamilies.ui },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { maxHeight: '75%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontSize: typography.h1.size },
  list: { paddingBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 13 },
  optionInfo: { flex: 1, gap: 2 },
  optionLabel: { fontSize: typography.body.size },
  optionHint: { fontSize: typography.caption.size },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { textAlign: 'center', paddingVertical: 20, fontSize: typography.body.size },
});
