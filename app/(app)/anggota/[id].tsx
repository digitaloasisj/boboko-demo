import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Select } from '../../../src/components/Select';
import { Section } from '../../../src/components/Section';
import { useAuth } from '../../../src/store/AuthContext';
import * as anggotaSvc from '../../../src/services/anggota';
import * as distrikSvc from '../../../src/services/distrik';
import { Anggota, Distrik } from '../../../src/types';
import { colors, fontSize, spacing } from '../../../src/theme';
import { formatTanggal } from '../../../src/utils';

export default function DetailAnggotaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, can } = useAuth();
  const router = useRouter();
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Anggota | null>(null);
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const a = await anggotaSvc.getById(id);
    setAnggota(a);
    setDraft(a);
    setDistrikList(await distrikSvc.list());
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!anggota || !draft) return <Screen title="Detail Anggota" back><Text>Memuat...</Text></Screen>;

  const distrikNama = distrikList.find((d) => d.id === anggota.distrikId)?.nama || '-';

  const save = async () => {
    if (!draft.nama || !draft.nik || !draft.noHp) {
      Alert.alert('Lengkapi data');
      return;
    }
    await anggotaSvc.update(draft, user);
    setAnggota(draft);
    setEditing(false);
  };

  const hapus = () => {
    Alert.alert('Hapus anggota?', `${anggota.nama} akan dihapus.`, [
      { text: 'Batal' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await anggotaSvc.remove(anggota.id, user);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen title="Detail Anggota" subtitle={anggota.nomorAnggota} back>
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{anggota.nama.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{anggota.nama}</Text>
            <Text style={styles.muted}>{anggota.nomorAnggota}</Text>
            <View style={{ marginTop: 4 }}>
              <StatusBadge status={anggota.status} />
            </View>
          </View>
        </View>
      </Card>

      <Section
        title="Informasi"
        right={
          can('write_anggota') ? (
            editing ? (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Button title="Batal" variant="ghost" compact onPress={() => { setDraft(anggota); setEditing(false); }} />
                <Button title="Simpan" variant="accent" compact onPress={save} />
              </View>
            ) : (
              <Button title="Edit" variant="secondary" compact onPress={() => setEditing(true)} />
            )
          ) : null
        }
      >
        <Card>
          {editing ? (
            <>
              <Input label="Nama" value={draft.nama} onChangeText={(v) => setDraft({ ...draft, nama: v })} />
              <Input label="NIK" value={draft.nik} onChangeText={(v) => setDraft({ ...draft, nik: v })} keyboardType="number-pad" />
              <Input label="No HP" value={draft.noHp} onChangeText={(v) => setDraft({ ...draft, noHp: v })} keyboardType="phone-pad" />
              <Input label="Email" value={draft.email || ''} onChangeText={(v) => setDraft({ ...draft, email: v })} autoCapitalize="none" />
              <Input label="Alamat" value={draft.alamat || ''} onChangeText={(v) => setDraft({ ...draft, alamat: v })} multiline />
              <Select
                label="Distrik"
                value={draft.distrikId}
                options={distrikList.map((d) => ({ value: d.id, label: d.nama }))}
                onChange={(v) => setDraft({ ...draft, distrikId: v })}
              />
              <Select
                label="Status"
                value={draft.status}
                options={[
                  { value: 'aktif', label: 'Aktif' },
                  { value: 'nonaktif', label: 'Nonaktif' },
                  { value: 'pending', label: 'Pending' },
                ]}
                onChange={(v) => setDraft({ ...draft, status: v as any })}
              />
              <Input
                label="Catatan"
                value={draft.catatan || ''}
                onChangeText={(v) => setDraft({ ...draft, catatan: v })}
                multiline
              />
            </>
          ) : (
            <>
              <Field label="Nomor Anggota" value={anggota.nomorAnggota} />
              <Field label="NIK" value={anggota.nik} />
              <Field label="No HP" value={anggota.noHp} />
              <Field label="Email" value={anggota.email || '-'} />
              <Field label="Alamat" value={anggota.alamat || '-'} />
              <Field label="Distrik" value={distrikNama} />
              <Field label="Tanggal Daftar" value={formatTanggal(anggota.tanggalDaftar)} />
              <Field label="Status" value={anggota.status} />
              <Field label="Catatan" value={anggota.catatan || '-'} last />
            </>
          )}
        </Card>
      </Section>

      {can('delete_anggota') && !editing ? (
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Hapus Anggota" variant="danger" onPress={hapus} />
        </View>
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
      <Text style={{ width: 120, fontSize: fontSize.xs, color: colors.textMuted }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 22 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
