import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoIcon } from '@/components/Logo';
import { colors } from '@/theme';

// 01 — Splash
export default function Splash() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/municipio'), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.center}>
        <LogoIcon size={160} />
        <Text style={styles.title}>Smart Poste</Text>
        <Text style={styles.tagline}>Cidade conectada. Problema identificado.</Text>
      </View>
      <Text style={styles.footer}>UNIVESP • Projeto Integrador</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginTop: -8,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
  footer: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
