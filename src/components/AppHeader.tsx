import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoIcon } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

// Cabeçalho com a marca, usado nas telas principais (Feed, Perfil, Sucesso).
// O município é o da conta logada: para usar outro, é preciso sair e entrar com uma conta de lá.
export function AppHeader({ subtitle }: { subtitle?: string }) {
  const insets = useSafeAreaInsets();
  const { municipio } = useApp();
  const sub = subtitle ?? (municipio ? `${municipio.nome} • ${municipio.uf}` : '');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <LogoIcon size={52} style={styles.logo} />
      <View style={styles.texts}>
        <Text style={styles.title}>Smart Poste</Text>
        {!!sub && <Text style={styles.subtitle}>{sub}</Text>}
      </View>
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
