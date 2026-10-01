import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/theme';

type Linha = { rotulo: string; valor: string; destaque?: boolean };

type Props = {
  titulo: string;
  subtitulo: string;
  linhas: Linha[];
  // Texto enviado pelo menu nativo de compartilhar (WhatsApp, SMS…)
  mensagem: string;
  // Botões extras abaixo de "Compartilhar acesso"
  children?: ReactNode;
};

// Sucesso de cadastro ou de senha redefinida: mostra o acesso e permite compartilhar
export function CartaoAcesso({ titulo, subtitulo, linhas, mensagem, children }: Props) {
  return (
    <View>
      <View style={styles.sucesso}>
        <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.dica}>{subtitulo}</Text>
      </View>

      <View style={styles.cartao}>
        {linhas.map((l) => (
          <View key={l.rotulo} style={styles.linha}>
            <Text style={styles.linhaRotulo}>{l.rotulo}</Text>
            <Text selectable style={[styles.linhaValor, l.destaque && styles.linhaDestaque]}>
              {l.valor}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.dica}>
        Envie o acesso só para essa pessoa, por mensagem privada. Ela deve trocar a senha no
        primeiro acesso.
      </Text>

      <Button title="Compartilhar acesso" onPress={() => Share.share({ message: mensagem })} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
  dica: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textAlign: 'center',
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
