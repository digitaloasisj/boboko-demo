import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/store/AuthContext';
import { colors, fontSize, spacing } from '../src/theme';

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (user) router.replace('/(app)/dashboard');
      else router.replace('/(auth)/login');
    }, 400);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  return (
    <View style={styles.wrap}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>BP</Text>
      </View>
      <Text style={styles.title}>Boboko Persib</Text>
      <Text style={styles.subtitle}>Sistem Manajemen Keanggotaan</Text>
      <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { color: colors.primary, fontWeight: '800', fontSize: 32 },
  title: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700' },
  subtitle: { color: '#CFE0FF', fontSize: fontSize.sm, marginTop: 4 },
});
