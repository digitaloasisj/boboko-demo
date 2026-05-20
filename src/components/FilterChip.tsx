import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';

export interface ChipItem {
  key: string;
  label: string;
}

export function FilterChips({
  items,
  value,
  onChange,
}: {
  items: ChipItem[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {items.map((it) => {
        const active = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.white,
                borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.text, { color: active ? colors.white : colors.text }]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  text: { fontSize: fontSize.sm, fontWeight: '500' },
});
