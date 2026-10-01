import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErroApi } from '@/api/cliente';
import { cadastrarUsuario } from '@/api/endpoints';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import type { Papel } from '@/types';
import { cpfValido, mascararCpf } from '@/utils/format';
import { gerarSenhaInicial } from '@/utils/senha';

const PAPEIS: { valor: Papel; rotulo: string; descricao: string }[] = [
  { valor: 'cidadao', rotulo: 'Morador', descricao: 'Vê o feed e faz denúncias' },
  { valor: 'gestor', rotulo: 'Gestor', descricao: 'Também cadastra moradores e muda status' },
];

type Cadastrado = { nome: string; cpf: string; papel: Papel; senha: string };

function mensagemDeErro(e: unknown) {
  if (!(e instanceof ErroApi)) return 'Não foi possível cadastrar. Tente novamente.';
  const campos = e.campos ? Object.values(e.campos).join('; ') : '';
  return campos ? `${e.message} (${campos})` : e.message;
}

// Perfil → Painel da prefeitura → Cadastrar morador (POST /usuarios, só gestor).
// O morador nasce no município do gestor logado: quem decide é a API, não o app.
export default function CadastrarMorador() {
  const insets = useSafeAreaInsets();
  const { usuario, municipio } = useApp();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [papel, setPapel] = useState<Papel>('cidadao');
  const [senha, setSenha] = useState(gerarSenhaInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cadastrado, setCadastrado] = useState<Cadastrado | null>(null);

  if (usuario?.papel !== 'gestor') {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Cadastrar morador" />
        <Text style={[styles.dica, styles.content]}>
          Só gestores da prefeitura podem cadastrar.
        </Text>
      </View>
    );
  }

  const problema = (): string | null => {
    if (nome.trim().length < 3) return 'Informe o nome completo.';
    if (!cpfValido(cpf)) return 'CPF inválido. Confira os números.';
    if (senha.length < 8) return 'A senha inicial precisa ter pelo menos 8 caracteres.';
    return null;
  };

  const cadastrar = async () => {
    if (salvando) return;
    const motivo = problema();
    if (motivo) {
      setErro(motivo);
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const novo = await cadastrarUsuario({ nome: nome.trim(), cpf, senhaInicial: senha, papel });
      setCadastrado({ nome: novo.nome, cpf, papel: novo.papel, senha });
    } catch (e) {
      // CPF já cadastrado (409), dados inválidos (422), sem conexão…
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  };

  const recomecar = () => {
    setNome('');
    setCpf('');
    setPapel('cidadao');
    setSenha(gerarSenhaInicial());
    setCadastrado(null);
  };

  const compartilhar = (c: Cadastrado) =>
    Share.share({
      message:
        `Olá, ${c.nome}! Seu acesso ao Smart Poste:\n\n` +
        `Município: ${municipio?.nome ?? ''}\nCPF: ${c.cpf}\nSenha: ${c.senha}\n\n` +
        'No primeiro acesso, troque a senha em Perfil → Alterar senha.',
    });

  if (cadastrado) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Cadastrar morador" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sucesso}>
            <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
            <Text style={styles.titulo}>{cadastrado.nome} foi cadastrado!</Text>
            <Text style={styles.dica}>
              {cadastrado.papel === 'gestor' ? 'Gestor' : 'Morador'} em {municipio?.nome}
            </Text>
          </View>

          <View style={styles.cartao}>
            <Linha rotulo="CPF" valor={cadastrado.cpf} />
            <Linha rotulo="Senha inicial" valor={cadastrado.senha} destaque />
          </View>

          <Text style={styles.dica}>
            Envie o acesso só para essa pessoa, por mensagem privada. Ela deve trocar a senha no
            primeiro acesso.
          </Text>

          <Button title="Compartilhar acesso" onPress={() => compartilhar(cadastrado)} />
          <Button title="Cadastrar outro morador" variant="link" onPress={recomecar} />
          <Button title="Voltar ao perfil" variant="link" onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Cadastrar morador" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.dica}>
          A conta será criada em {municipio?.nome ?? 'seu município'}.
        </Text>

        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Maria Souza"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="words"
          autoComplete="off"
        />

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

        <Text style={styles.label}>Papel</Text>
        <View style={styles.papeis}>
          {PAPEIS.map((p) => {
            const marcado = papel === p.valor;
            return (
              <Pressable
                key={p.valor}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcado }}
                onPress={() => setPapel(p.valor)}
                style={[styles.papel, marcado && styles.papelMarcado]}>
                <Text style={[styles.papelRotulo, marcado && { color: colors.primary }]}>
                  {p.rotulo}
                </Text>
                <Text style={styles.papelDescricao}>{p.descricao}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Senha inicial</Text>
        <View style={styles.senha}>
          <TextInput
            style={[styles.input, styles.senhaInput]}
            value={senha}
            onChangeText={setSenha}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gerar outra senha"
            onPress={() => setSenha(gerarSenhaInicial())}
            hitSlop={8}
            style={styles.gerar}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.gerarTexto}>Gerar outra</Text>
          </Pressable>
        </View>

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button title="Cadastrar" onPress={cadastrar} loading={salvando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text selectable style={[styles.linhaValor, destaque && styles.linhaDestaque]}>
        {valor}
      </Text>
    </View>
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
  papeis: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  papel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
  },
  papelMarcado: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  papelRotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  papelDescricao: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
  senha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  senhaInput: {
    flex: 1,
  },
  gerar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gerarTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  sucesso: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  cartao: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linhaRotulo: {
    fontSize: 13,
    color: colors.textMuted,
  },
  linhaValor: {
    fontSize: 15,
    color: colors.text,
  },
  linhaDestaque: {
    fontWeight: '700',
    color: colors.primary,
  },
});
