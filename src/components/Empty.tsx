import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../theme';

export function Empty({
  text,
  icon = 'document-text-outline',
}: {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={36} color={colors.textMuted} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  text: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
