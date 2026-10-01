import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarPerfil } from '@/api/endpoints';
import { AppHeader } from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import { iniciais } from '@/utils/format';

const emBreve = (titulo: string) => () => Alert.alert(titulo, 'Disponível em breve.');

// 07 — Perfil
export default function Perfil() {
  const { usuario, municipio, logout } = useApp();
  // Total de denúncias do usuário (GET /me); recarrega ao abrir a aba
  const [totalDenuncias, setTotalDenuncias] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      buscarPerfil()
        .then((perfil) => setTotalDenuncias(perfil.estatisticas.denuncias))
        // Sem internet, mantém o último número; 401 já leva de volta ao login
        .catch(() => {});
    }, []),
  );

  if (!usuario) return null;

  const stats = [{ valor: totalDenuncias ?? '–', label: 'denúncias', cor: colors.primary }];
  const ehGestor = usuario.papel === 'gestor';

  // Só para gestores (a API também recusa quem não é): ações da prefeitura do município dele
  const menuGestor = [
    { label: 'Cadastrar morador', onPress: () => router.push('/cadastrar-morador') },
  ];

  const menu = [
    { label: 'Editar perfil', onPress: emBreve('Editar perfil') },
    { label: 'Minhas denúncias', onPress: () => router.push('/minhas-denuncias') },
    { label: 'Alterar senha', onPress: () => router.push('/alterar-senha') },
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
        {ehGestor && (
          <View style={styles.selo}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.primary} />
            <Text style={styles.seloTexto}>Gestor</Text>
          </View>
        )}

        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: s.cor }]}>{s.valor}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {ehGestor && (
          <View style={styles.menu}>
            <Text style={styles.secao}>Painel da prefeitura</Text>
            {menuGestor.map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

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
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  seloTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  menu: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  secao: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.xs,
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
