import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Section } from '../../../src/components/Section';
import { useAuth } from '../../../src/store/AuthContext';
import * as registrasiSvc from '../../../src/services/registrasi';
import * as pembayaranSvc from '../../../src/services/pembayaran';
import * as distrikSvc from '../../../src/services/distrik';
import { Registrasi, Pembayaran, Distrik } from '../../../src/types';
import { colors, fontSize, spacing } from '../../../src/theme';
import { formatTanggal } from '../../../src/utils';

export default function DetailRegistrasiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, can } = useAuth();
  const router = useRouter();
  const [reg, setReg] = useState<Registrasi | null>(null);
  const [bayar, setBayar] = useState<Pembayaran | null>(null);
  const [distrik, setDistrik] = useState<Distrik | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const r = await registrasiSvc.getById(id);
    setReg(r);
    if (r?.pembayaranId) setBayar(await pembayaranSvc.getById(r.pembayaranId));
    else if (r) setBayar(await pembayaranSvc.getByRegistrasiId(r.id));
    if (r) setDistrik(await distrikSvc.getById(r.distrikId));
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!reg) return <Screen title="Detail Registrasi" back><Text>Memuat...</Text></Screen>;

  const verifAnggota = async () => {
    setLoading(true);
    try {
      await registrasiSvc.setStatus(reg.id, 'diverifikasi', user, undefined);
      const anggota = await registrasiSvc.aktifkanSebagaiAnggota(reg.id, user);
      Alert.alert(
        'Anggota aktif',
        anggota ? `${anggota.nama} sudah masuk data anggota.` : 'Berhasil.',
      );
      await load();
    } finally {
      setLoading(false);
    }
  };

  const tolak = () => {
    Alert.alert('Tolak registrasi?', 'Anda yakin menolak registrasi ini?', [
      { text: 'Batal' },
      {
        text: 'Tolak',
        style: 'destructive',
        onPress: async () => {
          await registrasiSvc.setStatus(reg.id, 'ditolak', user, 'Ditolak oleh admin');
          await load();
        },
      },
    ]);
  };

  return (
    <Screen title="Detail Registrasi" subtitle={reg.nama} back>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{reg.nama.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{reg.nama}</Text>
            <Text style={styles.meta}>{reg.noHp} • {distrik?.nama || '-'}</Text>
            <View style={{ marginTop: 4 }}><StatusBadge status={reg.status} /></View>
          </View>
        </View>
      </Card>

      <Section title="Data Registrasi">
        <Card>
          <Field label="NIK" value={reg.nik} />
          <Field label="Email" value={reg.email || '-'} />
          <Field label="Alamat" value={reg.alamat || '-'} />
          <Field label="Distrik" value={distrik?.nama || '-'} />
          <Field label="Tanggal Daftar" value={formatTanggal(reg.tanggalDaftar)} />
          <Field label="Catatan" value={reg.catatan || '-'} last />
        </Card>
      </Section>

      <Section title="Pembayaran">
        <Card>
          {bayar ? (
            <>
              <Field label="Metode" value={bayar.metode === 'transfer_bank' ? 'Transfer Bank' : 'QRIS'} />
              <Field label="Nominal" value={`Rp ${bayar.nominal.toLocaleString('id-ID')}`} />
              <Field label="No Referensi" value={bayar.noReferensi || '-'} />
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 4 }}>Status Pembayaran</Text>
                <StatusBadge status={bayar.status} />
              </View>
              <Button
                title="Buka Halaman Pembayaran"
                variant="secondary"
                onPress={() => router.push(`/(app)/pembayaran/${reg.id}`)}
              />
            </>
          ) : (
            <>
              <Text style={{ color: colors.textMuted, marginBottom: spacing.sm }}>Belum ada pembayaran.</Text>
              <Button
                title="Buat Pembayaran"
                onPress={() => router.push(`/(app)/pembayaran/${reg.id}`)}
              />
            </>
          )}
        </Card>
      </Section>

      {can('write_registrasi') && reg.status === 'menunggu_verifikasi' && bayar?.status === 'berhasil' ? (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={{ fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Aksi Admin Pusat</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="Tolak" variant="danger" onPress={tolak} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Aktifkan Anggota" variant="accent" onPress={verifAnggota} loading={loading} />
            </View>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

function Field({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ width: 110, fontSize: fontSize.xs, color: colors.textMuted }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 20 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
