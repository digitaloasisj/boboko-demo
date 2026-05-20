import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../../src/components/Screen';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { Section } from '../../../src/components/Section';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { useAuth } from '../../../src/store/AuthContext';
import * as pembayaranSvc from '../../../src/services/pembayaran';
import * as registrasiSvc from '../../../src/services/registrasi';
import { Pembayaran, Registrasi, MetodePembayaran } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';
import { formatRupiah, formatTanggal } from '../../../src/utils';

const BIAYA = pembayaranSvc.BIAYA_REGISTRASI;

export default function PembayaranScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, can } = useAuth();
  const router = useRouter();
  const [reg, setReg] = useState<Registrasi | null>(null);
  const [bayar, setBayar] = useState<Pembayaran | null>(null);
  const [metode, setMetode] = useState<MetodePembayaran>('transfer_bank');
  const [noReferensi, setNoReferensi] = useState('');
  const [buktiUrl, setBuktiUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const r = await registrasiSvc.getById(id);
    setReg(r);
    if (r) {
      const p = await pembayaranSvc.getByRegistrasiId(r.id);
      setBayar(p);
      if (p) {
        setMetode(p.metode);
        setNoReferensi(p.noReferensi || '');
        setBuktiUrl(p.buktiUrl);
      }
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!reg) return <Screen title="Pembayaran" back><Text>Memuat...</Text></Screen>;

  const pickBukti = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Berikan akses galeri untuk upload bukti.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!res.canceled && res.assets[0]) setBuktiUrl(res.assets[0].uri);
  };

  const submitBukti = async () => {
    if (metode === 'transfer_bank' && !noReferensi && !buktiUrl) {
      Alert.alert('Lengkapi data', 'Isi nomor referensi/berita transfer atau upload bukti.');
      return;
    }
    setLoading(true);
    try {
      if (bayar) {
        const updated: Pembayaran = {
          ...bayar,
          metode,
          noReferensi,
          buktiUrl,
          status: 'menunggu_verifikasi',
          tanggal: bayar.tanggal,
        };
        await pembayaranSvc.update(updated, user);
      } else {
        const p = await pembayaranSvc.create(reg.id, metode, user, noReferensi, buktiUrl);
        await registrasiSvc.update(
          { ...reg, pembayaranId: p.id, status: 'menunggu_verifikasi' },
          user,
        );
      }
      await registrasiSvc.setStatus(reg.id, 'menunggu_verifikasi', user);
      Alert.alert('Bukti terkirim', 'Menunggu verifikasi admin pusat.');
      await load();
    } finally {
      setLoading(false);
    }
  };

  const verifikasi = async (approve: boolean) => {
    if (!bayar) return;
    setLoading(true);
    try {
      await pembayaranSvc.verifikasi(bayar.id, approve, user);
      if (approve) {
        await registrasiSvc.aktifkanSebagaiAnggota(reg.id, user);
      } else {
        await registrasiSvc.setStatus(reg.id, 'ditolak', user, 'Pembayaran ditolak');
      }
      Alert.alert('Selesai', approve ? 'Anggota sudah aktif.' : 'Pembayaran ditolak.');
      router.replace(`/(app)/registrasi/${reg.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Pembayaran Registrasi" subtitle={reg.nama} back>
      <Card>
        <View style={styles.totalRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalLabel}>Total biaya registrasi</Text>
            <Text style={styles.totalValue}>{formatRupiah(BIAYA)}</Text>
          </View>
          {bayar ? <StatusBadge status={bayar.status} /> : <StatusBadge status="belum_bayar" />}
        </View>
        <Text style={styles.note}>
          Berlaku biaya kartu anggota, kaos perdana, dan administrasi tahunan.
        </Text>
      </Card>

      <Section title="Metode Pembayaran">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MethodTab
            active={metode === 'transfer_bank'}
            onPress={() => setMetode('transfer_bank')}
            icon="card"
            label="Transfer Bank"
          />
          <MethodTab
            active={metode === 'qris'}
            onPress={() => setMetode('qris')}
            icon="qr-code"
            label="QRIS"
          />
        </View>
      </Section>

      {metode === 'transfer_bank' ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.h}>Instruksi Transfer Bank</Text>
          <View style={styles.bankBox}>
            <Text style={styles.bankName}>BANK BCA</Text>
            <Text style={styles.bankNo}>012 345 6789</Text>
            <Text style={styles.bankAtas}>a.n. Boboko Persib Pusat</Text>
          </View>
          <Text style={styles.li}>1. Transfer tepat Rp 50.000 ke rekening di atas.</Text>
          <Text style={styles.li}>2. Tulis berita transfer "BP-{reg.id.slice(0, 6)}".</Text>
          <Text style={styles.li}>3. Isi nomor referensi/berita transfer di bawah.</Text>
          <Text style={styles.li}>4. Upload bukti transfer untuk mempercepat verifikasi.</Text>
        </Card>
      ) : (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.h}>Scan QRIS</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={colors.primary} />
            </View>
            <Text style={styles.qrAtas}>Boboko Persib Pusat</Text>
            <Text style={styles.qrNominal}>{formatRupiah(BIAYA)}</Text>
          </View>
          <Text style={styles.li}>
            Scan QR ini menggunakan aplikasi mobile banking / e-wallet yang mendukung QRIS.
          </Text>
          <Text style={styles.li}>Setelah berhasil, salin nomor referensi pada bukti pembayaran.</Text>
        </Card>
      )}

      <Section title="Konfirmasi Pembayaran">
        <Card>
          <Input
            label="Nomor Referensi / Berita Transfer"
            value={noReferensi}
            onChangeText={setNoReferensi}
            placeholder="contoh: TRX-001234"
          />
          <Text style={{ fontSize: fontSize.sm, color: colors.text, marginBottom: 6, fontWeight: '500' }}>Bukti Pembayaran</Text>
          <Pressable onPress={pickBukti} style={styles.buktiBox}>
            {buktiUrl ? (
              <Image source={{ uri: buktiUrl }} style={styles.bukti} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.textMuted} />
                <Text style={styles.fotoText}>Upload bukti transfer / pembayaran</Text>
              </>
            )}
          </Pressable>
          <Button
            title={bayar ? 'Update Bukti' : 'Kirim Bukti'}
            onPress={submitBukti}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      </Section>

      {can('*') && bayar?.status === 'menunggu_verifikasi' ? (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={{ fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>
            Aksi Verifikasi Admin Pusat
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="Tolak" variant="danger" onPress={() => verifikasi(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Verifikasi & Aktifkan" variant="accent" onPress={() => verifikasi(true)} loading={loading} />
            </View>
          </View>
        </Card>
      ) : null}

      {bayar?.status === 'berhasil' ? (
        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.successSoft, borderColor: colors.success }}>
          <Text style={{ fontWeight: '700', color: '#047857' }}>Pembayaran Berhasil</Text>
          <Text style={{ fontSize: fontSize.sm, color: '#047857', marginTop: 4 }}>
            Diverifikasi oleh {bayar.verifikasiBy} pada {formatTanggal(bayar.tanggalVerifikasi || bayar.tanggal)}.
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function MethodTab({
  active,
  onPress,
  icon,
  label,
}: {
  active: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        { backgroundColor: active ? colors.primary : colors.white, opacity: pressed ? 0.8 : 1, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? colors.white : colors.primary} />
      <Text style={[styles.tabText, { color: active ? colors.white : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  totalRow: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  totalValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.primary, marginTop: 2 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm },
  tab: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1 },
  tabText: { fontWeight: '600', fontSize: fontSize.sm },
  h: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  bankBox: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  bankName: { fontWeight: '700', color: colors.primary },
  bankNo: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginTop: 4 },
  bankAtas: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  li: { fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  qrBox: { alignItems: 'center', paddingVertical: spacing.md },
  qrPlaceholder: { borderWidth: 2, borderColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  qrAtas: { fontWeight: '600', color: colors.text },
  qrNominal: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary, marginTop: 4 },
  buktiBox: {
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bukti: { width: '100%', height: '100%', resizeMode: 'cover' },
  fotoText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6 },
});
