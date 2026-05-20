import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Section } from '../../src/components/Section';
import { useAuth } from '../../src/store/AuthContext';
import {
  resetData,
  getApiUrl,
  setApiUrl,
  getApiKey,
  setApiKey,
  testConnection,
  initializeData,
} from '../../src/services/storage';
import { colors, fontSize, radius, spacing } from '../../src/theme';
import { roleLabel } from '../../src/utils';

export default function PengaturanScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [apiUrl, setApiUrlState] = useState('');
  const [apiKey, setApiKeyState] = useState('');
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBackend = useCallback(async () => {
    const u = await getApiUrl();
    const k = await getApiKey();
    setCurrentUrl(u);
    setApiUrlState(u || '');
    setApiKeyState(k || '');
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBackend();
    }, [loadBackend]),
  );

  const onLogout = () => {
    Alert.alert('Keluar?', 'Anda akan keluar dari aplikasi.', [
      { text: 'Batal' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const onReset = () => {
    Alert.alert(
      'Reset data demo?',
      currentUrl
        ? 'Data di backend online akan diganti dengan data awal. Semua pengguna akan terpengaruh.'
        : 'Semua data lokal akan diganti dengan data awal.',
      [
        { text: 'Batal' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await resetData();
            setLoading(false);
            Alert.alert('Selesai', 'Data demo telah direset.');
          },
        },
      ],
    );
  };

  const onTest = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('URL kosong', 'Isi URL backend terlebih dahulu.');
      return;
    }
    setTesting(true);
    const result = await testConnection(apiUrl, apiKey || null);
    setTesting(false);
    if (result.ok) {
      Alert.alert(
        'Terhubung',
        `Backend aktif. Tersimpan ${result.keys ?? 0} kunci data.`,
      );
    } else {
      Alert.alert('Gagal terhubung', result.message || 'Periksa URL & koneksi.');
    }
  };

  const onSaveBackend = async () => {
    setSaving(true);
    try {
      const trimmed = apiUrl.trim();
      if (trimmed) {
        const result = await testConnection(trimmed, apiKey || null);
        if (!result.ok) {
          Alert.alert('Gagal terhubung', result.message || 'Backend tidak dapat dijangkau.');
          return;
        }
        await setApiUrl(trimmed);
        await setApiKey(apiKey || null);
      } else {
        await setApiUrl(null);
        await setApiKey(null);
      }
      await initializeData();
      await logout();
      Alert.alert(
        'Backend disimpan',
        trimmed
          ? 'Mode ONLINE aktif. Silakan login ulang untuk menyinkronkan data.'
          : 'Mode OFFLINE aktif. Data tersimpan di perangkat ini saja.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } finally {
      setSaving(false);
    }
  };

  const onClearBackend = async () => {
    Alert.alert(
      'Kembali ke mode offline?',
      'Aplikasi akan kembali memakai data lokal di perangkat ini saja.',
      [
        { text: 'Batal' },
        {
          text: 'Lanjut',
          onPress: async () => {
            await setApiUrl(null);
            await setApiKey(null);
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  return (
    <Screen title="Pengaturan" back>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nama.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name}>{user?.nama}</Text>
            <Text style={styles.muted}>{roleLabel(user?.role || '')}</Text>
            <Text style={styles.muted}>{user?.email || user?.username}</Text>
          </View>
        </View>
      </Card>

      <Section title="Backend Online">
        <Card>
          <View
            style={[
              styles.modeBox,
              currentUrl
                ? { backgroundColor: colors.successSoft, borderColor: colors.success }
                : { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name={currentUrl ? 'cloud-done' : 'cloud-offline-outline'}
              size={20}
              color={currentUrl ? '#047857' : colors.textMuted}
            />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text
                style={[
                  styles.modeLabel,
                  { color: currentUrl ? '#047857' : colors.text },
                ]}
              >
                {currentUrl ? 'Mode ONLINE' : 'Mode OFFLINE'}
              </Text>
              <Text style={styles.modeSub} numberOfLines={1}>
                {currentUrl || 'Data tersimpan di perangkat ini saja'}
              </Text>
            </View>
          </View>

          <Text style={styles.help}>
            Isi URL backend (mis. dari Render/Fly/Glitch) untuk berbagi data secara online
            antar admin pusat dan distrik. Kosongkan untuk mode offline.
          </Text>

          <Input
            label="URL Backend"
            value={apiUrl}
            onChangeText={setApiUrlState}
            placeholder="https://boboko-backend.onrender.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Input
            label="API Key (opsional)"
            value={apiKey}
            onChangeText={setApiKeyState}
            placeholder="hanya jika backend memerlukan key"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="Tes Koneksi" variant="secondary" onPress={onTest} loading={testing} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={apiUrl.trim() ? 'Simpan & Aktifkan' : 'Aktifkan Offline'}
                onPress={onSaveBackend}
                loading={saving}
              />
            </View>
          </View>

          {currentUrl ? (
            <Pressable onPress={onClearBackend} style={{ marginTop: spacing.sm, alignSelf: 'center' }}>
              <Text style={{ color: colors.error, fontSize: fontSize.sm, fontWeight: '600' }}>
                Kembali ke Mode Offline
              </Text>
            </Pressable>
          ) : null}
        </Card>
      </Section>

      <Section title="Akun">
        <Card>
          <Item
            icon="person-outline"
            label="Profil"
            onPress={() => Alert.alert('Profil', 'Edit profil belum tersedia di demo.')}
          />
          <Item
            icon="key-outline"
            label="Ubah Password"
            onPress={() =>
              Alert.alert(
                'Ubah Password',
                'Fitur demo. Implementasi nyata akan terhubung ke backend.',
              )
            }
          />
          <Item
            icon="shield-outline"
            label="Hak Akses"
            onPress={() => Alert.alert('Hak Akses', `Role: ${roleLabel(user?.role || '')}`)}
            last
          />
        </Card>
      </Section>

      <Section title="Lainnya">
        <Card>
          <Item
            icon="information-circle-outline"
            label="Tentang Aplikasi"
            onPress={() =>
              Alert.alert(
                'Boboko Persib',
                'Versi 1.0.0 demo. Dibangun dengan React Native + Expo.',
              )
            }
          />
          <Item icon="refresh-outline" label="Reset Data Demo" onPress={onReset} last />
        </Card>
      </Section>

      <View style={{ marginTop: spacing.lg }}>
        <Button title="Keluar" variant="danger" onPress={onLogout} loading={loading} />
      </View>
    </Screen>
  );
}

function Item({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { borderBottomWidth: last ? 0 : 1, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.itemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 22 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomColor: colors.border,
  },
  itemText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  modeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  modeLabel: { fontWeight: '700', fontSize: fontSize.sm },
  modeSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  help: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.sm },
});
