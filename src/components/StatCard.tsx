import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, fontSize, spacing } from '../theme';

interface Props {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'accent' | 'warning' | 'info' | 'error';
  sub?: string;
}

export function StatCard({ label, value, icon, tone = 'primary', sub }: Props) {
  const toneColor = {
    primary: colors.primary,
    accent: colors.accent,
    warning: colors.warning,
    info: colors.info,
    error: colors.error,
  }[tone];
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
          {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        </View>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: toneColor + '22' }]}>
            <Ionicons name={icon} size={20} color={toneColor} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '500' },
  value: { fontSize: fontSize.xxl, color: colors.text, fontWeight: '700', marginTop: 2 },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
