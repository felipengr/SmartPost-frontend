import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoIcon } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { MUNICIPIOS } from '@/mocks/data';
import { colors, spacing } from '@/theme';

// Cabeçalho com a marca, usado nas telas principais (Feed, Perfil, Sucesso)
export function AppHeader({ subtitle }: { subtitle?: string }) {
  const insets = useSafeAreaInsets();
  const { municipio, selecionarMunicipio } = useApp();
  const sub = subtitle ?? (municipio ? `${municipio.nome} • ${municipio.uf}` : '');

  const trocarMunicipio = () =>
    Alert.alert('Município', 'Selecione o município conveniado.', [
      ...MUNICIPIOS.map((m) => ({
        text: `${m.nome} • ${m.uf}`,
        onPress: () => selecionarMunicipio(m),
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <LogoIcon size={52} style={styles.logo} />
      <View style={styles.texts}>
        <Text style={styles.title}>Smart Poste</Text>
        {!!sub && <Text style={styles.subtitle}>{sub}</Text>}
      </View>
      <Pressable hitSlop={12} accessibilityLabel="Trocar município" onPress={trocarMunicipio}>
        <Ionicons name="chevron-down" size={20} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  logo: {
    marginLeft: -10,
    marginRight: -4,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
