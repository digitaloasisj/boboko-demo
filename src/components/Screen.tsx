import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Header } from './Header';

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  title,
  subtitle,
  back,
  right,
  scroll = true,
  refreshing,
  onRefresh,
  children,
  contentStyle,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {title ? <Header title={title} subtitle={subtitle} back={back} right={right} /> : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, contentStyle]}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  flex: { flex: 1 },
});
