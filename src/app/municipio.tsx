import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoIcon } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { MUNICIPIOS } from '@/mocks/data';
import { colors, radius, spacing } from '@/theme';
import type { Municipio } from '@/types';

// 02 — Selecionar Município
export default function SelecionarMunicipio() {
  const insets = useSafeAreaInsets();
  const { selecionarMunicipio } = useApp();

  const escolher = (m: Municipio) => {
    selecionarMunicipio(m);
    router.push('/login');
  };

  const outro = () =>
    Alert.alert(
      'Outro município',
      'No momento o Smart Poste está disponível apenas em Piracaia. Em breve novos municípios conveniados.',
    );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
      <LogoIcon size={72} style={styles.logo} />
      <Text style={styles.title}>Onde você está?</Text>
      <Text style={styles.subtitle}>
        Selecione o município conveniado para acessar as denúncias da sua região.
      </Text>

      <Text style={styles.section}>Municípios disponíveis</Text>

      {MUNICIPIOS.map((m) => (
        <Item
          key={m.id}
          badge={<Text style={styles.badgeText}>{m.nome[0]}</Text>}
          badgeStyle={{ backgroundColor: colors.primaryLight }}
          title={m.nome}
          subtitle={m.estado}
          onPress={() => escolher(m)}
        />
      ))}
      <Item
        badge={<Ionicons name="add" size={16} color={colors.textMuted} />}
        badgeStyle={{ backgroundColor: colors.surface }}
        title="Outro município"
        subtitle="Consulte disponibilidade"
        onPress={outro}
      />
    </ScrollView>
  );
}

type ItemProps = {
  badge: React.ReactNode;
  badgeStyle: object;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function Item({ badge, badgeStyle, title, subtitle, onPress }: ItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.surface }]}>
      <View style={[styles.badge, badgeStyle]}>{badge}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg - 2,
    paddingBottom: spacing.xl,
  },
  logo: {
    marginLeft: -14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm + 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm + 2,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
