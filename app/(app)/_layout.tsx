import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/AuthContext';
import { colors, fontSize } from '../../src/theme';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/(auth)/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, paddingTop: 4, height: 60 },
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="anggota"
        options={{
          title: 'Anggota',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="registrasi"
        options={{
          title: 'Registrasi',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pembayaran"
        options={{
          title: 'Bayar',
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="lainnya"
        options={{
          title: 'Lainnya',
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="distrik" options={{ href: null }} />
      <Tabs.Screen name="sinkronisasi" options={{ href: null }} />
      <Tabs.Screen name="laporan" options={{ href: null }} />
      <Tabs.Screen name="notifikasi" options={{ href: null }} />
      <Tabs.Screen name="pengaturan" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
