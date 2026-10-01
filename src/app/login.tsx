import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErroApi } from '@/api/cliente';
import { Button } from '@/components/Button';
import { CampoSenha } from '@/components/CampoSenha';
import { LogoIcon } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import { mascararCpf } from '@/utils/format';

// 03 — Login
export default function Login() {
  const insets = useSafeAreaInsets();
  const { municipio, login } = useApp();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const entrar = async () => {
    if (carregando) return;
    if (cpf.replace(/\D/g, '').length !== 11 || !senha) {
      setErro('Informe o CPF completo e a senha.');
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      // Em caso de sucesso, o Stack.Protected do _layout redireciona para o feed
      await login(cpf, senha);
    } catch (e) {
      // A API já manda a mensagem pronta: senha errada, muitas tentativas, sem conexão…
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível entrar. Tente novamente.');
      setCarregando(false);
    }
  };

  const esqueci = () =>
    Alert.alert(
      'Esqueci minha senha',
      'Procure a Prefeitura para redefinir suas credenciais de acesso.',
    );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <LogoIcon size={72} style={styles.logo} />
        <Text style={styles.title}>Bem-vindo</Text>
        {municipio && (
          <Text style={styles.city}>
            {municipio.nome} • {municipio.uf}
          </Text>
        )}
        <Text style={styles.subtitle}>Entre com as credenciais fornecidas pela prefeitura.</Text>

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={(v) => setCpf(mascararCpf(v))}
          placeholder="000.000.000-00"
          placeholderTextColor={colors.textSubtle}
          keyboardType="number-pad"
          maxLength={14}
          autoComplete="off"
        />

        <Text style={styles.label}>Senha</Text>
        <CampoSenha
          value={senha}
          onChangeText={setSenha}
          placeholder="••••••••"
          returnKeyType="go"
          onSubmitEditing={entrar}
        />

        {erro && <Text style={styles.error}>{erro}</Text>}

        <Button title="Entrar" onPress={entrar} loading={carregando} style={styles.button} />
        <Button title="Esqueci minha senha" variant="link" onPress={esqueci} />

        <View style={{ flex: 1 }} />
        <Text style={styles.footer}>
          Acesso exclusivo para cidadãos cadastrados pela Prefeitura.
        </Text>
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 2,
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
  city: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
