import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/store/AuthContext';
import { colors, fontSize, spacing, radius } from '../src/theme';

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
      <View style={styles.logoBox}>
        <Image
          source={require('../assets/logo-display.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { width: '100%', height: '100%' },
  title: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700' },
  subtitle: { color: '#CFE0FF', fontSize: fontSize.sm, marginTop: 4 },
});
