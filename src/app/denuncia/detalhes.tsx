import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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

import { Button } from '@/components/Button';
import { PoleIllustration } from '@/components/PoleIllustration';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { TIPO_LABEL } from '@/mocks/data';
import { colors, radius, spacing } from '@/theme';
import type { TipoProblema } from '@/types';
import { dataHora } from '@/utils/format';

const TIPOS = Object.keys(TIPO_LABEL) as TipoProblema[];

// 06 — Detalhes da Denúncia
export default function DetalhesDenuncia() {
  const insets = useSafeAreaInsets();
  const { criarDenuncia, fotoRascunho: fotoUri, setFotoRascunho } = useApp();
  const agora = useMemo(() => new Date(), []);

  const [selecionados, setSelecionados] = useState<TipoProblema[]>([]);
  const [observacao, setObservacao] = useState('');

  const alternar = (t: TipoProblema) =>
    setSelecionados((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const publicar = () => {
    const nova = criarDenuncia({ fotoUri, tipos: selecionados, observacao: observacao.trim() });
    setFotoRascunho(undefined);
    // Tira câmera e detalhes da pilha, para o "voltar" não reabrir o formulário
    router.dismissAll();
    router.push({ pathname: '/denuncia/sucesso', params: { protocolo: nova.protocolo } });
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

        <View style={[styles.row, { marginTop: spacing.md }]}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.address}>Rua Dr. Cândido Rodrigues</Text>
        </View>
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

        <Button
          title="Publicar denúncia"
          onPress={publicar}
          disabled={selecionados.length === 0}
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
    fontSize: 13,
    color: colors.text,
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
