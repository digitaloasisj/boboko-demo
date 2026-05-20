import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Empty } from '../../src/components/Empty';
import * as notifSvc from '../../src/services/notifikasi';
import { Notifikasi } from '../../src/types';
import { colors, fontSize, radius, spacing } from '../../src/theme';
import { formatTanggalJam } from '../../src/utils';

const TONE: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  info: { bg: '#DBEAFE', fg: '#1E40AF', icon: 'information-circle' },
  sukses: { bg: '#D1FAE5', fg: '#047857', icon: 'checkmark-circle' },
  peringatan: { bg: '#FEF3C7', fg: '#92400E', icon: 'alert-circle' },
  error: { bg: '#FEE2E2', fg: '#991B1B', icon: 'close-circle' },
};

export default function NotifikasiScreen() {
  const [items, setItems] = useState<Notifikasi[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setItems(await notifSvc.list());
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markRead = async (id: string) => {
    await notifSvc.markRead(id);
    await load();
  };

  const markAll = async () => {
    await notifSvc.markAllRead();
    await load();
  };

  return (
    <Screen
      title="Notifikasi"
      subtitle="Pengumuman & Aktivitas"
      back
      right={
        <Pressable hitSlop={6} onPress={markAll}>
          <Text style={{ color: colors.white, fontWeight: '600' }}>Tandai Semua</Text>
        </Pressable>
      }
      scroll={false}
    >
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Empty text="Belum ada notifikasi." icon="notifications-outline" />}
        renderItem={({ item }) => {
          const tone = TONE[item.tipe] || TONE.info;
          return (
            <Pressable
              onPress={() => markRead(item.id)}
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed ? 0.7 : 1, backgroundColor: item.dibaca ? colors.white : colors.primarySoft },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: tone.bg }]}>
                <Ionicons name={tone.icon} size={20} color={tone.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, !item.dibaca && { fontWeight: '700' }]}>{item.judul}</Text>
                <Text style={styles.body}>{item.pesan}</Text>
                <Text style={styles.time}>{formatTanggalJam(item.tanggal)}</Text>
              </View>
              {!item.dibaca ? <View style={styles.unread} /> : null}
            </Pressable>
          );
        }}
        refreshing={refreshing}
        onRefresh={load}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
  body: { fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  time: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
