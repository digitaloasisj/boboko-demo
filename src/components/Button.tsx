import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  compact,
}: Props) {
  const bg = {
    primary: colors.primary,
    secondary: colors.primarySoft,
    accent: colors.accent,
    ghost: 'transparent',
    danger: colors.error,
  }[variant];
  const fg = {
    primary: colors.white,
    secondary: colors.primary,
    accent: colors.white,
    ghost: colors.primary,
    danger: colors.white,
  }[variant];
  const border = variant === 'ghost' ? colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          paddingVertical: compact ? spacing.sm : spacing.md,
          paddingHorizontal: compact ? spacing.md : spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.text, { color: fg, fontSize: compact ? fontSize.sm : fontSize.md }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});
