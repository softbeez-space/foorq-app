import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies } from '@/ui/theme/tokens';
import { useLocale } from '@/i18n/LocaleContext';

interface RelatedPickerProps {
  items: { _id: string; name: string }[];
  excludeId?: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
  max?: number;
}

/** Searchable multi-picker for "pairs well with" upsells (max enforced). */
export function RelatedPicker({ items, excludeId, selectedIds, onToggle, max = 8 }: RelatedPickerProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const candidates = items.filter(
    (i) => i._id !== excludeId && (q.length === 0 || i.name.toLowerCase().includes(q))
  );

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('menu.detail.pairsSearch')}
        placeholderTextColor={colors.inkSoft}
        style={[styles.search, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
      />
      <View style={styles.list}>
        {candidates.length === 0 && (
          <Text style={[styles.empty, { color: colors.inkSoft }]}>{t('menu.detail.pairsEmpty')}</Text>
        )}
        {candidates.map((i) => {
          const on = selectedIds.includes(i._id);
          const capped = !on && selectedIds.length >= max;
          return (
            <Pressable
              key={i._id}
              disabled={capped}
              onPress={() => onToggle(i._id)}
              style={[
                styles.row,
                { borderColor: colors.border, opacity: capped ? 0.4 : 1 },
                on && { backgroundColor: colors.ink, borderColor: colors.ink },
              ]}
            >
              <View style={[styles.check, { borderColor: on ? '#FFF' : colors.inkSoft, backgroundColor: on ? '#FFF' : 'transparent' }]}>
                {on && <Text style={[styles.checkMark, { color: colors.ink }]}>✓</Text>}
              </View>
              <Text style={[styles.name, { color: on ? '#FFF' : colors.ink }]} numberOfLines={1}>
                {i.name}
              </Text>
              <Text style={[styles.count, { color: on ? '#FFF' : colors.inkSoft }]}>
                {selectedIds.length}/{max}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 8,
  },
  list: { gap: 6, maxHeight: 220 },
  empty: { textAlign: 'center', fontSize: 11, fontWeight: '700', paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 11, fontWeight: '800' },
  name: { flex: 1, fontSize: 13, fontWeight: '600', fontFamily: fontFamilies.ui },
  count: { fontSize: 10, fontWeight: '700' },
});
