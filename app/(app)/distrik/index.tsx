import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Empty } from '../../../src/components/Empty';
import * as distrikSvc from '../../../src/services/distrik';
import { Distrik } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';

export default function DistrikListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Distrik[]>([]);

  useFocusEffect(
    useCallback(() => {
      distrikSvc.list().then(setItems);
    }, []),
  );

  return (
    <Screen title="Data Distrik / Korwil" subtitle={`Total: ${items.length}`} back scroll={false}>
      <FlatList
        data={items}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Empty text="Belum ada data distrik." />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(`/(app)/distrik/${item.id}`)}
          >
            <View style={styles.kode}>
              <Text style={styles.kodeText}>{item.kode}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.head}>
                <Text style={styles.name} numberOfLines={1}>{item.nama}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>Korwil: {item.korwil}</Text>
              <Text style={styles.meta}>{item.jumlahAnggota} anggota terdaftar</Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  kode: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  kodeText: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
