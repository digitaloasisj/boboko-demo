import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { useAuth } from '../../src/store/AuthContext';
import { colors, fontSize, radius, spacing } from '../../src/theme';
import { roleLabel } from '../../src/utils';

interface MenuItem {
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: any;
  show?: boolean;
}

export default function LainnyaScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const items: MenuItem[] = [
    { label: 'Data Distrik', desc: 'Daftar distrik / korwil', icon: 'map-outline', path: '/(app)/distrik' },
    { label: 'Sinkronisasi', desc: 'Pusat ↔ Distrik', icon: 'sync-outline', path: '/(app)/sinkronisasi' },
    { label: 'Laporan Ringkas', desc: 'Total anggota, registrasi, pembayaran', icon: 'bar-chart-outline', path: '/(app)/laporan' },
    { label: 'Notifikasi', desc: 'Pengumuman & aktivitas', icon: 'notifications-outline', path: '/(app)/notifikasi' },
    { label: 'Pengaturan', desc: 'Akun & aplikasi', icon: 'settings-outline', path: '/(app)/pengaturan' },
  ];

  return (
    <Screen title="Lainnya" subtitle={`${roleLabel(user?.role || '')} • ${user?.nama || ''}`}>
      <Card>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nama.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name}>{user?.nama}</Text>
            <Text style={styles.role}>{roleLabel(user?.role || '')}</Text>
          </View>
          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
            style={styles.logout}
            hitSlop={6}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </Card>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {items.map((it) => (
          <Pressable
            key={it.label}
            onPress={() => router.push(it.path)}
            style={({ pressed }) => [styles.menu, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={it.icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{it.label}</Text>
              <Text style={styles.menuDesc}>{it.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 20 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  role: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  logout: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  menuDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
