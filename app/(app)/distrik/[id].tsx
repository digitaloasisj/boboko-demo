import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Section } from '../../../src/components/Section';
import { StatusBadge } from '../../../src/components/StatusBadge';
import * as distrikSvc from '../../../src/services/distrik';
import * as anggotaSvc from '../../../src/services/anggota';
import * as syncSvc from '../../../src/services/sinkronisasi';
import { useAuth } from '../../../src/store/AuthContext';
import { Distrik, SyncStatus } from '../../../src/types';
import { colors, fontSize, spacing } from '../../../src/theme';

export default function DetailDistrikScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [distrik, setDistrik] = useState<Distrik | null>(null);
  const [jumlah, setJumlah] = useState(0);
  const [sync, setSync] = useState<SyncStatus | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setDistrik(await distrikSvc.getById(id));
    const { items } = await anggotaSvc.list(user, { distrikId: id, pageSize: 1, page: 0 });
    setJumlah(items.length > 0 ? (await anggotaSvc.list(user, { distrikId: id, pageSize: 100000, page: 0 })).total : 0);
    const list = await syncSvc.list();
    setSync(list.find((s) => s.distrikId === id) || null);
  }, [id, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!distrik) return <Screen title="Detail Distrik" back><Text>Memuat...</Text></Screen>;

  return (
    <Screen title={distrik.nama} subtitle={`Kode ${distrik.kode}`} back>
      <Card>
        <View style={styles.head}>
          <View style={styles.kode}>
            <Text style={styles.kodeText}>{distrik.kode}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{distrik.nama}</Text>
            <Text style={styles.meta}>Korwil: {distrik.korwil}</Text>
            <View style={{ marginTop: 4 }}><StatusBadge status={distrik.status} /></View>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.label}>Jumlah Anggota</Text>
          <Text style={styles.value}>{jumlah}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.label}>Status Sync</Text>
          <Text style={styles.value}>{sync?.status || '-'}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
            {sync?.lastSync || '-'}
          </Text>
        </Card>
      </View>

      <Section title="Aksi">
        <Card>
          <Button
            title="Lihat Anggota Distrik"
            onPress={() => router.push({ pathname: '/(app)/anggota', params: { distrikId: distrik.id } })}
          />
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kode: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  kodeText: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  label: { fontSize: fontSize.xs, color: colors.textMuted },
  value: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginTop: 2 },
});
