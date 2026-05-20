import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Input } from '../../../src/components/Input';
import { Select } from '../../../src/components/Select';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/store/AuthContext';
import * as anggotaSvc from '../../../src/services/anggota';
import * as distrikSvc from '../../../src/services/distrik';
import { Distrik } from '../../../src/types';

export default function TambahAnggotaScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [distrikId, setDistrikId] = useState(user?.distrikId || '');
  const [catatan, setCatatan] = useState('');
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    distrikSvc.list().then((list) => {
      setDistrikList(list);
      if (!distrikId && list.length > 0) setDistrikId(list[0].id);
    });
  }, []);

  const submit = async () => {
    if (!nama || !nik || !noHp || !distrikId) {
      Alert.alert('Lengkapi data', 'Nama, NIK, No HP, dan Distrik wajib diisi.');
      return;
    }
    if (nik.length < 8) {
      Alert.alert('NIK tidak valid', 'Minimal 8 karakter.');
      return;
    }
    setSaving(true);
    try {
      await anggotaSvc.create(
        { nama, nik, noHp, email, alamat, distrikId, catatan },
        user,
      );
      Alert.alert('Berhasil', 'Anggota baru disimpan.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const distrikOptions =
    user?.role === 'admin_distrik' && user.distrikId
      ? distrikList
          .filter((d) => d.id === user.distrikId)
          .map((d) => ({ value: d.id, label: d.nama }))
      : distrikList.map((d) => ({ value: d.id, label: d.nama }));

  return (
    <Screen title="Tambah Anggota" back>
      <Card>
        <Input label="Nama Lengkap" value={nama} onChangeText={setNama} placeholder="Nama lengkap" />
        <Input
          label="NIK"
          value={nik}
          onChangeText={setNik}
          placeholder="16 digit NIK"
          keyboardType="number-pad"
          maxLength={16}
        />
        <Input
          label="No. HP"
          value={noHp}
          onChangeText={setNoHp}
          placeholder="08xxxxxxxxxx"
          keyboardType="phone-pad"
        />
        <Input
          label="Email (opsional)"
          value={email}
          onChangeText={setEmail}
          placeholder="email@contoh.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Alamat (opsional)"
          value={alamat}
          onChangeText={setAlamat}
          placeholder="Alamat lengkap"
          multiline
        />
        <Select
          label="Distrik / Korwil"
          value={distrikId}
          options={distrikOptions}
          onChange={setDistrikId}
          placeholder="Pilih distrik"
        />
        <Input
          label="Catatan (opsional)"
          value={catatan}
          onChangeText={setCatatan}
          placeholder="Catatan tambahan"
          multiline
        />
        <View style={{ marginTop: 8 }}>
          <Button title="Simpan Anggota" onPress={submit} loading={saving} />
        </View>
      </Card>
    </Screen>
  );
}
