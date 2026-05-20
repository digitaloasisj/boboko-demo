import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { FilterChips } from '../../../src/components/FilterChip';
import { Empty } from '../../../src/components/Empty';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/store/AuthContext';
import * as pembayaranSvc from '../../../src/services/pembayaran';
import * as registrasiSvc from '../../../src/services/registrasi';
import { Pembayaran, Registrasi } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';
import { formatRupiah, formatTanggal } from '../../../src/utils';

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
  { key: 'berhasil', label: 'Berhasil' },
  { key: 'gagal', label: 'Gagal' },
];

export default function PembayaranListScreen() {
  const { user, can } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState<Pembayaran[]>([]);
  const [regMap, setRegMap] = useState<Record<string, Registrasi>>({});

  const load = useCallback(async () => {
    const allBayar = await pembayaranSvc.list({ status: status as any });
    const regs = await registrasiSvc.list(user);
    const regIds = new Set(regs.map((r) => r.id));
    const scoped = user?.role === 'admin_distrik'
      ? allBayar.filter((p) => regIds.has(p.registrasiId))
      : allBayar;
    setItems(scoped);
    const map: Record<string, Registrasi> = {};
    regs.forEach((r) => (map[r.id] = r));
    setRegMap(map);
  }, [status, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const quickVerifikasi = (p: Pembayaran, approve: boolean) => {
    Alert.alert(
      approve ? 'Verifikasi pembayaran?' : 'Tolak pembayaran?',
      approve
        ? 'Pembayaran akan ditandai sukses. Anggota akan aktif setelah konfirmasi.'
        : 'Pembayaran akan ditandai gagal.',
      [
        { text: 'Batal' },
        {
          text: 'Lanjut',
          onPress: async () => {
            await pembayaranSvc.verifikasi(p.id, approve, user);
            if (approve) {
              await registrasiSvc.setStatus(p.registrasiId, 'menunggu_verifikasi', user);
            }
            await load();
          },
        },
      ],
    );
  };

  return (
    <Screen title="Pembayaran Registrasi" subtitle={`Total: ${items.length}`} scroll={false}>
      <FilterChips items={FILTERS} value={status} onChange={setStatus} />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<Empty text="Belum ada data pembayaran." />}
        renderItem={({ item }) => {
          const reg = regMap[item.registrasiId];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push(`/(app)/pembayaran/${item.registrasiId}`)}
            >
              <View style={styles.head}>
                <Text style={styles.name} numberOfLines={1}>
                  {reg?.nama || 'Registrasi tidak ditemukan'}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>
                {item.metode === 'transfer_bank' ? 'Transfer Bank' : 'QRIS'} •{' '}
                {formatRupiah(item.nominal)}
              </Text>
              <Text style={styles.metaSmall}>
                {item.noReferensi ? `Ref: ${item.noReferensi} • ` : ''}
                {formatTanggal(item.tanggal)}
              </Text>
              {can('*') && item.status === 'menunggu_verifikasi' ? (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm }}>
                  <Button title="Tolak" variant="ghost" compact onPress={() => quickVerifikasi(item, false)} />
                  <Button title="Verifikasi" variant="accent" compact onPress={() => quickVerifikasi(item, true)} />
                </View>
              ) : null}
            </Pressable>
          );
        }}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.text, marginTop: 4 },
  metaSmall: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
