import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Section } from '../../src/components/Section';
import { useAuth } from '../../src/store/AuthContext';
import * as laporanSvc from '../../src/services/laporan';
import { colors, fontSize, spacing } from '../../src/theme';
import { formatRupiah } from '../../src/utils';

const LABEL: Record<string, string> = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
  pending: 'Pending',
  draft: 'Draft',
  menunggu_pembayaran: 'Menunggu Bayar',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  diverifikasi: 'Diverifikasi',
  ditolak: 'Ditolak',
  belum_bayar: 'Belum Bayar',
  berhasil: 'Berhasil',
  gagal: 'Gagal',
};

export default function LaporanScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<laporanSvc.LaporanRingkas | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setData(await laporanSvc.ringkas(user));
    setRefreshing(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!data) return <Screen title="Laporan" back><Text>Memuat...</Text></Screen>;

  return (
    <Screen title="Laporan Ringkas" back onRefresh={load} refreshing={refreshing}>
      <View style={styles.statRow}>
        <Stat label="Total Anggota" value={data.totalAnggota.toLocaleString('id-ID')} />
        <Stat label="Total Registrasi" value={data.totalRegistrasi.toLocaleString('id-ID')} />
      </View>
      <View style={[styles.statRow, { marginTop: spacing.sm }]}>
        <Stat label="Total Pembayaran" value={data.totalPembayaran.toLocaleString('id-ID')} />
        <Stat label="Nominal Berhasil" value={formatRupiah(data.totalNominalBerhasil)} small />
      </View>

      <Section title="Anggota per Status">
        <Card>
          {data.anggotaPerStatus.map((s) => (
            <Row key={s.status} label={LABEL[s.status] || s.status} value={s.jumlah} />
          ))}
        </Card>
      </Section>

      <Section title="Registrasi per Status">
        <Card>
          {data.registrasiPerStatus.map((s) => (
            <Row key={s.status} label={LABEL[s.status] || s.status} value={s.jumlah} />
          ))}
        </Card>
      </Section>

      <Section title="Pembayaran per Status">
        <Card>
          {data.pembayaranPerStatus.map((s) => (
            <Row key={s.status} label={LABEL[s.status] || s.status} value={s.jumlah} />
          ))}
        </Card>
      </Section>
    </Screen>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, small && { fontSize: fontSize.lg }]}>{value}</Text>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '500' },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: fontSize.sm, color: colors.text },
  rowValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
});
