import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColor, StatusColorKey, radius, spacing, fontSize } from '../theme';

export function StatusBadge({ status }: { status: string }) {
  const key = (status as StatusColorKey) in statusColor ? (status as StatusColorKey) : 'pending';
  const cfg = statusColor[key];
  return (
    <View style={[styles.wrap, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
