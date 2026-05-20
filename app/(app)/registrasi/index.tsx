import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/Screen';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { FilterChips } from '../../../src/components/FilterChip';
import { Empty } from '../../../src/components/Empty';
import { useAuth } from '../../../src/store/AuthContext';
import * as registrasiSvc from '../../../src/services/registrasi';
import * as distrikSvc from '../../../src/services/distrik';
import { Registrasi, Distrik } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';
import { formatTanggal } from '../../../src/utils';

const STATUS_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'menunggu_pembayaran', label: 'Menunggu Bayar' },
  { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
  { key: 'aktif', label: 'Aktif' },
  { key: 'ditolak', label: 'Ditolak' },
];

export default function RegistrasiListScreen() {
  const { user, can } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Registrasi[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);

  const load = useCallback(async () => {
    setItems(await registrasiSvc.list(user, { status: status as any, search }));
    setDistrikList(await distrikSvc.list());
  }, [user, status, search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const distrikNama = (id: string) =>
    distrikList.find((d) => d.id === id)?.nama.replace(/Distrik [A-E] - /, '') || '-';

  return (
    <Screen
      title="Registrasi"
      subtitle={`Total: ${items.length}`}
      right={
        can('write_registrasi') ? (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/(app)/registrasi/baru')}
          >
            <Ionicons name="add" size={20} color={colors.white} />
          </Pressable>
        ) : null
      }
      scroll={false}
    >
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama / NIK / No HP"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>
      <FilterChips items={STATUS_FILTERS} value={status} onChange={setStatus} />

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(`/(app)/registrasi/${item.id}`)}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.head}>
                <Text style={styles.name} numberOfLines={1}>{item.nama}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>
                {distrikNama(item.distrikId)} • {item.noHp}
              </Text>
              <Text style={styles.metaSmall}>Daftar: {formatTanggal(item.tanggalDaftar)}</Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Empty text="Belum ada registrasi." />}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.sm, color: colors.text },
  row: { padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.text, marginTop: 2 },
  metaSmall: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
