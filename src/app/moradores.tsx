import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErroApi } from '@/api/cliente';
import { listarUsuarios, redefinirSenha, type UsuarioDaCidade } from '@/api/endpoints';
import { Button } from '@/components/Button';
import { CartaoAcesso } from '@/components/CartaoAcesso';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import { confirmar } from '@/utils/confirmar';
import { iniciais } from '@/utils/format';
import { gerarSenhaInicial } from '@/utils/senha';

function mensagem(e: unknown, padrao: string) {
  return e instanceof ErroApi ? e.message : padrao;
}

// Perfil → Painel da prefeitura → Moradores: usuários da cidade e "esqueci a senha"
export default function Moradores() {
  const insets = useSafeAreaInsets();
  const { usuario, municipio } = useApp();

  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<UsuarioDaCidade[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [redefinindo, setRedefinindo] = useState<string | null>(null);
  const [redefinido, setRedefinido] = useState<{ nome: string; senha: string } | null>(null);
  // Ignora respostas antigas se a pessoa continuou digitando
  const geracao = useRef(0);

  // Busca meio segundo depois que a pessoa para de digitar
  useEffect(() => {
    const minha = ++geracao.current;
    setCarregando(true);
    const relogio = setTimeout(() => {
      listarUsuarios(busca)
        .then((r) => {
          if (minha !== geracao.current) return;
          setItens(r.itens);
          setTotal(r.total);
          setErro(null);
        })
        .catch(
          (e) => minha === geracao.current && setErro(mensagem(e, 'Não foi possível carregar.')),
        )
        .finally(() => minha === geracao.current && setCarregando(false));
    }, 500);
    return () => clearTimeout(relogio);
  }, [busca]);

  if (usuario?.papel !== 'gestor') {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Moradores" />
        <Text style={[styles.dica, styles.content]}>Só gestores da prefeitura têm acesso.</Text>
      </View>
    );
  }

  const redefinir = (pessoa: UsuarioDaCidade) =>
    confirmar(
      'Redefinir senha',
      `${pessoa.nome} vai receber uma senha nova e sair de todos os aparelhos em que estiver conectado.`,
      'Redefinir',
      async () => {
        setRedefinindo(pessoa.id);
        setErro(null);
        const senha = gerarSenhaInicial();
        try {
          await redefinirSenha(pessoa.id, senha);
          setRedefinido({ nome: pessoa.nome, senha });
        } catch (e) {
          setErro(mensagem(e, 'Não foi possível redefinir a senha.'));
        } finally {
          setRedefinindo(null);
        }
      },
      true,
    );

  if (redefinido) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Moradores" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <CartaoAcesso
            titulo={`Senha de ${redefinido.nome} redefinida`}
            subtitulo="A pessoa foi desconectada de todos os aparelhos."
            linhas={[{ rotulo: 'Nova senha', valor: redefinido.senha, destaque: true }]}
            mensagem={
              `Olá, ${redefinido.nome}! Sua senha do Smart Poste foi redefinida.\n\n` +
              `Município: ${municipio?.nome ?? ''}\nNova senha: ${redefinido.senha}\n\n` +
              'Entre com o seu CPF e troque a senha em Perfil → Alterar senha.'
            }>
            <Button
              title="Voltar para a lista"
              variant="link"
              onPress={() => setRedefinido(null)}
            />
          </CartaoAcesso>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Moradores" />
      <View style={styles.content}>
        <View style={styles.busca}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.buscaInput}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome ou CPF"
            placeholderTextColor={colors.textSubtle}
            autoCorrect={false}
            returnKeyType="search"
          />
          {carregando && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        <Text style={styles.dica}>
          {total === 1 ? '1 usuário' : `${total} usuários`} em {municipio?.nome}
          {total > itens.length ? ` · mostrando ${itens.length}, refine a busca` : ''}
        </Text>
        {erro && <Text style={styles.erro}>{erro}</Text>}
      </View>

      <FlatList
        data={itens}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + spacing.lg }]}
        ListEmptyComponent={
          carregando ? null : <Text style={styles.vazio}>Ninguém encontrado com essa busca.</Text>
        }
        renderItem={({ item }) => {
          const souEu = item.id === usuario.id;
          return (
            <View style={styles.item}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{iniciais(item.nome)}</Text>
              </View>
              <View style={styles.itemTextos}>
                <View style={styles.itemLinha}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {item.nome}
                    {souEu ? ' (você)' : ''}
                  </Text>
                  {item.papel === 'gestor' && <Text style={styles.selo}>Gestor</Text>}
                </View>
                <Text style={styles.cpf}>CPF {item.cpfMascarado}</Text>
              </View>
              {!souEu &&
                (redefinindo === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Redefinir senha de ${item.nome}`}
                    onPress={() => redefinir(item)}
                    disabled={!!redefinindo}
                    hitSlop={8}>
                    <Text style={styles.acao}>Redefinir senha</Text>
                  </Pressable>
                ))}
            </View>
          );
        }}
      />
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
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  buscaInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.text,
  },
  dica: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  erro: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  lista: {
    paddingHorizontal: spacing.md + 4,
  },
  vazio: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  itemTextos: {
    flex: 1,
  },
  itemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nome: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selo: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  cpf: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  acao: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
