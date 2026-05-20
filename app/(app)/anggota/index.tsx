import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/Screen';
import { FilterChips } from '../../../src/components/FilterChip';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Empty } from '../../../src/components/Empty';
import { useAuth } from '../../../src/store/AuthContext';
import * as anggotaSvc from '../../../src/services/anggota';
import * as distrikSvc from '../../../src/services/distrik';
import { Anggota, Distrik } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';
import { formatTanggal, maskHp, maskNik, debounce } from '../../../src/utils';

const PAGE_SIZE = 20;

export default function AnggotaListScreen() {
  const { user, can } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Anggota[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [distrikId, setDistrikId] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);
  const [loading, setLoading] = useState(false);

  const isDistrikAdmin = user?.role === 'admin_distrik';

  const setSearchDebounced = useMemo(
    () => debounce((v: string) => setDebouncedSearch(v), 300),
    [],
  );

  useEffect(() => {
    setSearchDebounced(search);
  }, [search, setSearchDebounced]);

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      const result = await anggotaSvc.list(user, {
        search: debouncedSearch,
        distrikId,
        status: status as any,
        page: reset ? 0 : page,
        pageSize: PAGE_SIZE,
      });
      setTotal(result.total);
      setItems((prev) => (reset ? result.items : [...prev, ...result.items]));
      if (reset) setPage(1);
      else setPage((p) => p + 1);
      setLoading(false);
    },
    [user, debouncedSearch, distrikId, status, page],
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setDistrikList(await distrikSvc.list());
        await load(true);
      })();
    }, [debouncedSearch, distrikId, status]),
  );

  const distrikItems = useMemo(
    () => [
      { key: 'all', label: 'Semua Distrik' },
      ...distrikList.map((d) => ({ key: d.id, label: 'Distrik ' + d.kode })),
    ],
    [distrikList],
  );

  const statusItems = [
    { key: 'all', label: 'Semua Status' },
    { key: 'aktif', label: 'Aktif' },
    { key: 'nonaktif', label: 'Nonaktif' },
    { key: 'pending', label: 'Pending' },
  ];

  const namaDistrik = (id: string) =>
    distrikList.find((d) => d.id === id)?.nama.replace(/Distrik [A-E] - /, '') || '-';

  return (
    <Screen
      title="Data Anggota"
      subtitle={isDistrikAdmin ? 'Distrik Anda' : `Total: ${total} anggota`}
      right={
        can('write_anggota') ? (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/(app)/anggota/tambah')}
            hitSlop={6}
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
          placeholder="Cari nama / NIK / No HP / No Anggota"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!isDistrikAdmin ? (
        <FilterChips items={distrikItems} value={distrikId} onChange={setDistrikId} />
      ) : null}
      <FilterChips items={statusItems} value={status} onChange={setStatus} />

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(`/(app)/anggota/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nama.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowHead}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.nama}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>
                {item.nomorAnggota} • {namaDistrik(item.distrikId)}
              </Text>
              <Text style={styles.metaSmall}>
                {maskNik(item.nik)} • {maskHp(item.noHp)} • {formatTanggal(item.tanggalDaftar)}
              </Text>
            </View>
          </Pressable>
        )}
        onEndReached={() => {
          if (!loading && items.length < total) load(false);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={!loading ? <Empty text="Belum ada data anggota." /> : null}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
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
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.primary, fontWeight: '700' },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontWeight: '600', fontSize: fontSize.md, color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.text, marginTop: 2 },
  metaSmall: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  sep: { height: spacing.sm },
});
