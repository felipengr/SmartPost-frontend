import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErroApi } from '@/api/cliente';
import { publicarDenuncia } from '@/api/endpoints';
import { Button } from '@/components/Button';
import { PoleIllustration } from '@/components/PoleIllustration';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { TIPO_LABEL } from '@/rotulos';
import { colors, radius, spacing } from '@/theme';
import type { TipoProblema } from '@/types';
import { dataHora } from '@/utils/format';
import { prepararFoto } from '@/utils/foto';
import { ErroLocalizacao, type LocalDaDenuncia, obterLocalDaDenuncia } from '@/utils/localizacao';

const TIPOS = Object.keys(TIPO_LABEL) as TipoProblema[];

// Mensagem do erro de envio: no 422, junta o que a API apontou em cada campo
function mensagemDeEnvio(e: unknown) {
  if (!(e instanceof ErroApi)) return 'Não foi possível publicar. Tente novamente.';
  const campos = e.campos ? Object.values(e.campos).join('; ') : '';
  return campos ? `${e.message} (${campos})` : e.message;
}

// 06 — Detalhes da Denúncia
export default function DetalhesDenuncia() {
  const insets = useSafeAreaInsets();
  const { fotoRascunho: fotoUri, setFotoRascunho } = useApp();
  const agora = useMemo(() => new Date(), []);

  const [selecionados, setSelecionados] = useState<TipoProblema[]>([]);
  const [observacao, setObservacao] = useState('');
  const [local, setLocal] = useState<LocalDaDenuncia | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // Onde está o problema: GPS de agora + endereço por extenso
  const buscarLocal = useCallback(() => {
    setErroLocal(null);
    setLocal(null);
    obterLocalDaDenuncia()
      .then(setLocal)
      .catch((e) =>
        setErroLocal(
          e instanceof ErroLocalizacao ? e.message : 'Não foi possível obter sua localização.',
        ),
      );
  }, []);

  useEffect(buscarLocal, [buscarLocal]);

  const alternar = (t: TipoProblema) =>
    setSelecionados((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const podePublicar = !!fotoUri && !!local && selecionados.length > 0;

  const publicar = async () => {
    if (!fotoUri || !local || publicando) return;
    setErroEnvio(null);
    setPublicando(true);
    try {
      const nova = await publicarDenuncia({
        fotoUri: await prepararFoto(fotoUri),
        tipos: selecionados,
        descricao: observacao.trim(),
        posicao: local.posicao,
        endereco: local.endereco,
      });
      setFotoRascunho(undefined);
      // Tira câmera e detalhes da pilha, para o "voltar" não reabrir o formulário
      router.dismissAll();
      router.push({ pathname: '/denuncia/sucesso', params: { protocolo: nova.protocolo } });
    } catch (e) {
      // Foto, tipos e texto continuam na tela: dá para tentar de novo sem refazer nada
      setErroEnvio(mensagemDeEnvio(e));
      setPublicando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Detalhes da denúncia" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.photo}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <PoleIllustration height={170} withWire={false} />
          )}
        </View>

        {!fotoUri && <Text style={styles.erro}>Volte e tire uma foto do problema.</Text>}

        <View style={[styles.row, { marginTop: spacing.md }]}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          {local ? (
            <Text style={styles.address}>{local.endereco}</Text>
          ) : erroLocal ? (
            <Text style={[styles.address, styles.erroTexto]}>{erroLocal}</Text>
          ) : (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.address}>Obtendo sua localização…</Text>
            </>
          )}
        </View>
        {erroLocal && <Button title="Tentar de novo" variant="link" onPress={buscarLocal} />}
        <Text style={styles.time}>{dataHora(agora)}</Text>

        <Text style={styles.section}>O que está acontecendo?</Text>
        {TIPOS.map((t) => {
          const marcado = selecionados.includes(t);
          return (
            <Pressable
              key={t}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marcado }}
              onPress={() => alternar(t)}
              style={styles.check}>
              <View style={[styles.box, marcado && styles.boxChecked]}>
                {marcado && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkLabel}>{TIPO_LABEL[t]}</Text>
            </Pressable>
          );
        })}

        <Text style={styles.obsLabel}>Observação</Text>
        <TextInput
          style={styles.textarea}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Descreva o problema (opcional)"
          placeholderTextColor={colors.textSubtle}
          multiline
          textAlignVertical="top"
          maxLength={300}
        />

        {erroEnvio && <Text style={styles.erro}>{erroEnvio}</Text>}

        <Button
          title="Publicar denúncia"
          onPress={publicar}
          loading={publicando}
          disabled={!podePublicar}
          style={{ marginTop: spacing.lg }}
        />
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
  },
  photo: {
    height: 170,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#DCE5DA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.text,
  },
  erroTexto: {
    color: colors.danger,
  },
  erro: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
    marginTop: spacing.md,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  section: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkLabel: {
    fontSize: 14,
    color: colors.text,
  },
  obsLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
});
