import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { DENUNCIAS_MOCK, ESTATISTICAS_MOCK } from '@/mocks/data';
import { colors, radius, spacing } from '@/theme';
import { iniciais } from '@/utils/format';

const emBreve = (titulo: string) => () => Alert.alert(titulo, 'Disponível em breve.');

// 07 — Perfil
export default function Perfil() {
  const { usuario, municipio, denuncias, logout } = useApp();
  if (!usuario) return null;

  // Soma as denúncias criadas nesta sessão às estatísticas mockadas
  const novas = denuncias.length - DENUNCIAS_MOCK.length;
  const stats = [
    { valor: ESTATISTICAS_MOCK.denuncias + novas, label: 'denúncias', cor: colors.primary },
    { valor: ESTATISTICAS_MOCK.resolvidas, label: 'resolvidas', cor: colors.primary },
    { valor: ESTATISTICAS_MOCK.emAnalise, label: 'em análise', cor: colors.accent },
  ];

  const menu = [
    { label: 'Editar perfil', onPress: emBreve('Editar perfil') },
    { label: 'Minhas denúncias', onPress: () => router.push('/minhas-denuncias') },
    { label: 'Alterar senha', onPress: emBreve('Alterar senha') },
    {
      label: 'Sobre o Smart Poste',
      onPress: () =>
        Alert.alert(
          'Smart Poste',
          'Projeto Integrador UNIVESP.\nCidade conectada. Problema identificado.',
        ),
    },
  ];

  const sair = () => {
    // Alert com botões não funciona no react-native-web
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja sair da sua conta?')) logout();
      return;
    }
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppHeader subtitle="Perfil" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciais(usuario.nome)}</Text>
        </View>
        <Text style={styles.name}>{usuario.nome}</Text>
        {municipio && (
          <Text style={styles.city}>
            {municipio.nome} • {municipio.uf}
          </Text>
        )}

        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: s.cor }]}>{s.valor}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {menu.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}>
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={sair} hitSlop={8} style={styles.logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md + 4,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  city: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  menu: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    fontSize: 14,
    color: colors.text,
  },
  logout: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.danger,
  },
});
