import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErroApi } from '@/api/cliente';
import { Button } from '@/components/Button';
import { CampoSenha } from '@/components/CampoSenha';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

const TAMANHO_MINIMO = 8;

// Perfil → Alterar senha (PATCH /me/senha)
export default function AlterarSenha() {
  const insets = useSafeAreaInsets();
  const { trocarSenha } = useApp();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Confere tudo antes de chamar a API
  const problema = (): string | null => {
    if (!atual) return 'Informe a sua senha atual.';
    if (nova.length < TAMANHO_MINIMO) {
      return `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO} caracteres.`;
    }
    if (nova !== confirmacao) return 'A confirmação não é igual à nova senha.';
    if (nova === atual) return 'A nova senha precisa ser diferente da atual.';
    return null;
  };

  const salvar = async () => {
    if (salvando) return;
    const motivo = problema();
    if (motivo) {
      setErro(motivo);
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await trocarSenha(atual, nova);
      Alert.alert(
        'Senha alterada',
        'Pronto! Por segurança, você foi desconectado dos outros aparelhos.',
      );
      router.back();
    } catch (e) {
      // Senha atual errada (403), sem conexão…: a API já manda a mensagem pronta
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível alterar a senha.');
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Alterar senha" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.label}>Senha atual</Text>
        <CampoSenha value={atual} onChangeText={setAtual} autoComplete="current-password" />

        <Text style={styles.label}>Nova senha</Text>
        <CampoSenha
          value={nova}
          onChangeText={setNova}
          placeholder={`Pelo menos ${TAMANHO_MINIMO} caracteres`}
          autoComplete="new-password"
        />

        <Text style={styles.label}>Confirme a nova senha</Text>
        <CampoSenha
          value={confirmacao}
          onChangeText={setConfirmacao}
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={salvar}
        />

        <Text style={styles.dica}>
          Ao trocar a senha, os outros aparelhos conectados à sua conta saem automaticamente.
        </Text>

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button title="Salvar nova senha" onPress={salvar} loading={salvando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md + 4,
    paddingTop: spacing.md,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  dica: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  erro: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
