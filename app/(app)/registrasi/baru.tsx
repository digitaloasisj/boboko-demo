import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/Screen';
import { Card } from '../../../src/components/Card';
import { Input } from '../../../src/components/Input';
import { Select } from '../../../src/components/Select';
import { Button } from '../../../src/components/Button';
import { Section } from '../../../src/components/Section';
import { useAuth } from '../../../src/store/AuthContext';
import * as registrasiSvc from '../../../src/services/registrasi';
import * as distrikSvc from '../../../src/services/distrik';
import { Distrik } from '../../../src/types';
import { colors, fontSize, radius, spacing } from '../../../src/theme';

export default function RegistrasiBaruScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [distrikId, setDistrikId] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | undefined>();
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    distrikSvc.list().then((list) => {
      setDistrikList(list);
      const def = user?.role === 'admin_distrik' && user.distrikId ? user.distrikId : list[0]?.id;
      setDistrikId(def || '');
    });
  }, [user]);

  const pickFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Berikan akses galeri untuk upload foto.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!res.canceled && res.assets[0]) {
      setFotoUrl(res.assets[0].uri);
    }
  };

  const nextStep = () => {
    if (!nama || !nik || !noHp || !distrikId) {
      Alert.alert('Lengkapi data', 'Nama, NIK, No HP, dan Distrik wajib diisi.');
      return;
    }
    if (nik.length < 8) {
      Alert.alert('NIK tidak valid', 'Minimal 8 karakter.');
      return;
    }
    setStep(2);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const reg = await registrasiSvc.create(
        { nama, nik, noHp, email, alamat, distrikId, fotoUrl },
        user,
      );
      Alert.alert('Registrasi tersimpan', 'Lanjut ke pembayaran.', [
        {
          text: 'OK',
          onPress: () => router.replace(`/(app)/pembayaran/${reg.id}`),
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const distrikOptions =
    user?.role === 'admin_distrik' && user.distrikId
      ? distrikList.filter((d) => d.id === user.distrikId).map((d) => ({ value: d.id, label: d.nama }))
      : distrikList.map((d) => ({ value: d.id, label: d.nama }));

  return (
    <Screen title="Registrasi Anggota Baru" back>
      <View style={styles.stepperRow}>
        <Step active={step === 1} label="Data Diri" num={1} />
        <View style={styles.stepLine} />
        <Step active={step === 2} label="Konfirmasi" num={2} />
      </View>

      {step === 1 ? (
        <Card>
          <Section title="Foto / Identitas">
            <Pressable onPress={pickFoto} style={styles.fotoBox}>
              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={styles.foto} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                  <Text style={styles.fotoText}>Ketuk untuk upload foto (opsional)</Text>
                </>
              )}
            </Pressable>
          </Section>

          <Input label="Nama Lengkap" value={nama} onChangeText={setNama} placeholder="Nama lengkap" />
          <Input label="NIK" value={nik} onChangeText={setNik} keyboardType="number-pad" maxLength={16} />
          <Input label="No. HP" value={noHp} onChangeText={setNoHp} keyboardType="phone-pad" />
          <Input
            label="Email (opsional)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input label="Alamat" value={alamat} onChangeText={setAlamat} multiline />
          <Select
            label="Distrik / Korwil"
            value={distrikId}
            options={distrikOptions}
            onChange={setDistrikId}
          />
          <Button title="Lanjut" onPress={nextStep} />
        </Card>
      ) : (
        <Card>
          <Section title="Konfirmasi Data">
            <View style={{ gap: 6 }}>
              <Row label="Nama" value={nama} />
              <Row label="NIK" value={nik} />
              <Row label="No HP" value={noHp} />
              <Row label="Email" value={email || '-'} />
              <Row label="Alamat" value={alamat || '-'} />
              <Row
                label="Distrik"
                value={distrikList.find((d) => d.id === distrikId)?.nama || '-'}
              />
            </View>
          </Section>
          <Text style={styles.note}>
            Setelah disimpan, sistem akan mengarahkan ke halaman pembayaran registrasi.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button title="Kembali" variant="secondary" onPress={() => setStep(1)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Daftarkan" onPress={submit} loading={saving} />
            </View>
          </View>
        </Card>
      )}
    </Screen>
  );
}

function Step({ active, label, num }: { active: boolean; label: string; num: number }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, active && { backgroundColor: colors.primary }]}>
        <Text style={[styles.stepNum, active && { color: colors.white }]}>{num}</Text>
      </View>
      <Text style={[styles.stepLabel, active && { color: colors.primary, fontWeight: '700' }]}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ width: 100, fontSize: fontSize.xs, color: colors.textMuted }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  step: { alignItems: 'center', width: 100 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontWeight: '700', color: colors.text },
  stepLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border },
  fotoBox: {
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%', resizeMode: 'cover' },
  fotoText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md },
});
