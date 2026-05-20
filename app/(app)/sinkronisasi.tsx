import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { StatusBadge } from '../../src/components/StatusBadge';
import { useAuth } from '../../src/store/AuthContext';
import * as syncSvc from '../../src/services/sinkronisasi';
import * as distrikSvc from '../../src/services/distrik';
import { Distrik, SyncStatus } from '../../src/types';
import { colors, fontSize, spacing } from '../../src/theme';

export default function SinkronisasiScreen() {
  const { user, can } = useAuth();
  const [items, setItems] = useState<SyncStatus[]>([]);
  const [distrikMap, setDistrikMap] = useState<Record<string, Distrik>>({});
  const [loading, setLoading] = useState<string | 'all' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setItems(await syncSvc.list());
    const list = await distrikSvc.list();
    const map: Record<string, Distrik> = {};
    list.forEach((d) => (map[d.id] = d));
    setDistrikMap(map);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sinkronOne = async (distrikId: string) => {
    setLoading(distrikId);
    try {
      await syncSvc.syncOne(distrikId, user);
      await load();
    } finally {
      setLoading(null);
    }
  };

  const sinkronAll = async () => {
    setLoading('all');
    try {
      await syncSvc.syncAll(user);
      await load();
    } finally {
      setLoading(null);
    }
  };

  return (
    <Screen
      title="Sinkronisasi Data"
      subtitle="Pusat ↔ Distrik"
      back
      onRefresh={load}
      refreshing={refreshing}
    >
      <Card>
        <Text style={styles.h}>Status Keseluruhan</Text>
        <Text style={styles.muted}>
          Data dari setiap distrik disinkronkan ke master data pusat secara berkala. Pastikan
          sinkronisasi berjalan untuk menjaga data tetap up-to-date.
        </Text>
        {can('sync') ? (
          <Button
            title={loading === 'all' ? 'Menyinkronkan...' : 'Sinkronkan Semua'}
            onPress={sinkronAll}
            loading={loading === 'all'}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Card>

      <View style={{ marginTop: spacing.md }}>
        {items.map((s) => {
          const d = distrikMap[s.distrikId];
          return (
            <Card key={s.distrikId} style={{ marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.distrikName}>{d?.nama || s.distrikId}</Text>
                  <Text style={styles.meta}>
                    {s.totalData.toLocaleString('id-ID')} data • Sinkron terakhir {s.lastSync}
                  </Text>
                  <View style={{ marginTop: 4 }}>
                    <StatusBadge status={s.status} />
                  </View>
                </View>
                {can('sync') ? (
                  <Button
                    title="Sinkron"
                    compact
                    variant="secondary"
                    onPress={() => sinkronOne(s.distrikId)}
                    loading={loading === s.distrikId}
                  />
                ) : null}
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  distrikName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
