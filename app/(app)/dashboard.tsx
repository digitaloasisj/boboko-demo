import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { StatCard } from '../../src/components/StatCard';
import { Card } from '../../src/components/Card';
import { Section } from '../../src/components/Section';
import { useAuth } from '../../src/store/AuthContext';
import * as laporanSvc from '../../src/services/laporan';
import * as distrikSvc from '../../src/services/distrik';
import * as notifSvc from '../../src/services/notifikasi';
import { DashboardStats, Distrik } from '../../src/types';
import { colors, fontSize, radius, spacing } from '../../src/theme';
import { formatTanggalJam, roleLabel } from '../../src/utils';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [distrik, setDistrik] = useState<Distrik | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    setRefreshing(true);
    const s = await laporanSvc.dashboard(user);
    setStats(s);
    if (user?.role === 'admin_distrik' && user.distrikId) {
      setDistrik(await distrikSvc.getById(user.distrikId));
    } else {
      setDistrik(null);
    }
    setUnread(await notifSvc.countUnread());
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const isDistrik = user?.role === 'admin_distrik';
  const subtitle = isDistrik && distrik ? distrik.nama : 'Dashboard Pusat';

  const maxBar = Math.max(1, ...(stats?.ringkasanPerDistrik.map((x) => x.jumlah) || [1]));

  return (
    <Screen
      title={isDistrik ? 'Dashboard Distrik' : 'Dashboard Pusat'}
      subtitle={`${roleLabel(user?.role || '')} • ${user?.nama || ''}`}
      right={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push('/(app)/notifikasi')}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.white} />
            {unread > 0 ? (
              <View style={styles.dot}>
                <Text style={styles.dotText}>{unread}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      }
      refreshing={refreshing}
      onRefresh={load}
    >
      <View style={styles.row}>
        <StatCard
          label="Total Anggota"
          value={stats?.totalAnggota.toLocaleString('id-ID') || '0'}
          icon="people"
          tone="primary"
          sub={isDistrik ? subtitle : 'Seluruh Distrik'}
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          label="Anggota Baru"
          value={stats?.anggotaBaruBulanIni || 0}
          icon="person-add"
          tone="accent"
          sub="Bulan ini"
        />
      </View>

      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <StatCard
          label="Registrasi Baru"
          value={stats?.registrasiBaru || 0}
          icon="document-text"
          tone="info"
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          label="Bayar Menunggu"
          value={stats?.pembayaranMenunggu || 0}
          icon="time"
          tone="warning"
        />
      </View>

      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <StatCard
          label="Total Distrik"
          value={stats?.totalDistrik || 0}
          icon="map"
          tone="primary"
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          label="Bayar Sukses Hari Ini"
          value={stats?.pembayaranSuksesHariIni || 0}
          icon="checkmark-circle"
          tone="accent"
        />
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.syncRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.syncLabel}>Status Sinkronisasi</Text>
            <Text style={styles.syncStatus}>
              {stats?.statusSinkronisasi === 'berhasil'
                ? 'Berhasil — semua distrik tersinkron'
                : stats?.statusSinkronisasi === 'sebagian'
                ? 'Sebagian distrik belum tersinkron'
                : 'Gagal — perlu tinjauan'}
            </Text>
          </View>
          <Pressable
            style={styles.syncBtn}
            onPress={() => router.push('/(app)/sinkronisasi')}
          >
            <Ionicons name="sync" size={14} color={colors.white} />
            <Text style={styles.syncBtnText}>Buka</Text>
          </Pressable>
        </View>
      </Card>

      <Section
        title="Ringkasan Anggota per Distrik"
        right={
          !isDistrik ? (
            <Pressable onPress={() => router.push('/(app)/distrik')}>
              <Text style={styles.link}>Lihat semua</Text>
            </Pressable>
          ) : null
        }
      >
        <Card>
          {stats?.ringkasanPerDistrik
            .filter((d) => (isDistrik ? d.distrikId === user?.distrikId : true))
            .map((d) => (
              <View key={d.distrikId} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {d.namaDistrik.replace(/Distrik [A-E] - /, '')}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(d.jumlah / maxBar) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{d.jumlah}</Text>
              </View>
            ))}
        </Card>
      </Section>

      <Section title="Aktivitas Terakhir">
        <Card>
          {stats?.aktivitasTerakhir.length === 0 ? (
            <Text style={{ color: colors.textMuted }}>Belum ada aktivitas.</Text>
          ) : (
            stats?.aktivitasTerakhir.slice(0, 6).map((a) => (
              <View key={a.id} style={styles.actRow}>
                <View style={styles.actDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.actTitle}>{a.detail || a.action}</Text>
                  <Text style={styles.actMeta}>
                    {a.userName} • {formatTanggalJam(a.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </Section>

      <Section title="Aksi Cepat">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <QuickAction
            icon="person-add"
            label="Daftar Anggota"
            onPress={() => router.push('/(app)/registrasi/baru')}
          />
          <QuickAction
            icon="people"
            label="Data Anggota"
            onPress={() => router.push('/(app)/anggota')}
          />
          <QuickAction
            icon="card"
            label="Pembayaran"
            onPress={() => router.push('/(app)/pembayaran')}
          />
          <QuickAction
            icon="sync"
            label="Sinkronisasi"
            onPress={() => router.push('/(app)/sinkronisasi')}
          />
          <QuickAction
            icon="bar-chart"
            label="Laporan"
            onPress={() => router.push('/(app)/laporan')}
          />
        </ScrollView>
      </Section>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.qa, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.qaIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.qaText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  link: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dotText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  syncRow: { flexDirection: 'row', alignItems: 'center' },
  syncLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  syncStatus: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', marginTop: 2 },
  syncBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncBtnText: { color: colors.white, fontWeight: '600', fontSize: fontSize.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  barLabel: { width: 110, fontSize: fontSize.xs, color: colors.text },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  barValue: { width: 40, textAlign: 'right', fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  actRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6 },
  actDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  actTitle: { fontSize: fontSize.sm, color: colors.text },
  actMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  qa: {
    alignItems: 'center',
    width: 80,
    marginRight: spacing.sm,
  },
  qaIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  qaText: { fontSize: fontSize.xs, color: colors.text, textAlign: 'center', fontWeight: '500' },
});
