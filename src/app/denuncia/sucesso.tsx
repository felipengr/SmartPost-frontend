import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

// 08 — Denúncia Publicada
export default function DenunciaPublicada() {
  const insets = useSafeAreaInsets();
  const { protocolo } = useLocalSearchParams<{ protocolo: string }>();
  const { municipio } = useApp();

  const voltarAoFeed = () => router.dismissTo('/feed');

  return (
    <View style={styles.screen}>
      <AppHeader />
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.halo}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>Denúncia registrada!</Text>
        <Text style={styles.subtitle}>
          Sua ocorrência foi enviada para a Prefeitura{municipio ? ` de ${municipio.nome}` : ''}.
        </Text>

        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Protocolo</Text>
            <Text style={styles.protocol}>#{protocolo}</Text>
          </View>
          <View style={{ width: 90 }}>
            <Text style={styles.cardLabel}>Status</Text>
            <Text style={styles.status}>Recebida</Text>
          </View>
        </View>

        <Button title="Ver no feed" onPress={voltarAoFeed} style={styles.button} />
        <Button title="Voltar para o início" variant="link" onPress={voltarAoFeed} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md + 4,
    paddingTop: spacing.xl * 3,
  },
  halo: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    marginTop: spacing.xl + spacing.sm,
  },
  cardLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  protocol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm + 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm + 4,
  },
  button: {
    marginTop: spacing.xl + spacing.sm,
    marginBottom: spacing.xs,
  },
});
