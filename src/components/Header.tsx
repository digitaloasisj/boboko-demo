import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function Header({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: spacing.md },
  title: { color: colors.white, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: '#CFE0FF', fontSize: fontSize.xs, marginTop: 2 },
});
