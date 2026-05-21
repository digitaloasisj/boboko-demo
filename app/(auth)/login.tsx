import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/AuthContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { getApiUrl } from '../../src/services/storage';
import { colors, fontSize, spacing, radius } from '../../src/theme';

const ACCOUNTS = [
  { username: 'admin', label: 'Admin Pusat' },
  { username: 'distrikA', label: 'Admin Distrik A' },
  { username: 'operator', label: 'Operator Pusat' },
  { username: 'viewer', label: 'Viewer' },
];

export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrlState] = useState<string | null>(null);

  useEffect(() => {
    getApiUrl().then(setApiUrlState);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const u = await login(username, password);
      if (!u) {
        setError('Akun tidak ditemukan. Gunakan akun demo di bawah.');
        return;
      }
      router.replace('/(app)/dashboard');
    } catch (e: any) {
      Alert.alert('Login gagal', e?.message || 'Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo-display.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Boboko Persib</Text>
            <Text style={styles.tagline}>Manajemen Keanggotaan Komunitas Persib</Text>
            <View style={styles.modeBadge}>
              <Ionicons
                name={apiUrl ? 'cloud-done' : 'cloud-offline-outline'}
                size={12}
                color={colors.white}
              />
              <Text style={styles.modeText}>{apiUrl ? 'Mode Online' : 'Mode Offline'}</Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Text style={styles.title}>Masuk</Text>
            <Text style={styles.subtitle}>Gunakan akun yang terdaftar untuk melanjutkan.</Text>

            <Input
              label="Username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              placeholder="admin / distrikA / operator / viewer"
            />
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              error={error || undefined}
            />

            <Button title="Masuk" onPress={onSubmit} loading={loading} />

            <View style={styles.demo}>
              <Text style={styles.demoTitle}>Akun Demo (password apa saja)</Text>
              <View style={styles.demoRow}>
                {ACCOUNTS.map((a) => (
                  <Pressable
                    key={a.username}
                    onPress={() => setUsername(a.username)}
                    style={({ pressed }) => [
                      styles.demoChip,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={styles.demoChipText}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { width: '100%', height: '100%' },
  appName: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700' },
  tagline: { color: '#CFE0FF', fontSize: fontSize.sm, marginTop: 4 },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  modeText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  card: { },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.lg },
  demo: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  demoTitle: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '600' },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demoChip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  demoChipText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '600' },
});
