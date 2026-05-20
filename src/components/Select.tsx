import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSize } from '../theme';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Select({ label, value, options, onChange, placeholder, containerStyle }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !selected && { color: colors.textMuted }]}>
          {selected?.label || placeholder || 'Pilih...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || 'Pilih'}</Text>
            <FlatList
              data={options}
              keyExtractor={(it) => it.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: pressed ? colors.primarySoft : 'transparent' },
                  ]}
                >
                  <Text
                    style={{
                      color: item.value === value ? colors.primary : colors.text,
                      fontWeight: item.value === value ? '600' : '400',
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
