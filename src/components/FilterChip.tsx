import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

export interface ChipItem {
  key: string;
  label: string;
}

const CHIP_HEIGHT = 34;

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
    <View style={styles.wrap}>
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
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  { color: active ? colors.white : colors.text },
                ]}
              >
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: CHIP_HEIGHT + 8,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 14,
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    lineHeight: 16,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
});
