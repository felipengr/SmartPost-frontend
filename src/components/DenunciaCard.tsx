import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { LogoIcon } from '@/components/Logo';
import { PoleIllustration } from '@/components/PoleIllustration';
import { STATUS_LABEL, TIPO_CHIP } from '@/mocks/data';
import { colors, radius, spacing } from '@/theme';
import type { Denuncia, Municipio, StatusDenuncia, TipoProblema } from '@/types';
import { distancia, tempoRelativo } from '@/utils/format';

const TIPO_TONE: Record<TipoProblema, 'danger' | 'warning' | 'info'> = {
  fio_exposto: 'danger',
  risco_populacao: 'danger',
  sem_energia: 'warning',
  sem_internet: 'info',
  sem_telefone: 'info',
};

const STATUS_TONE: Record<StatusDenuncia, 'success' | 'warning'> = {
  recebida: 'success',
  em_analise: 'warning',
  resolvida: 'success',
};

type Props = {
  denuncia: Denuncia;
  municipio: Municipio | null;
};

export function DenunciaCard({ denuncia, municipio }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <LogoIcon size={40} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.city}>
            {municipio ? `${municipio.nome} • ${municipio.uf}` : 'Município'}
          </Text>
          <Text style={styles.address}>{denuncia.endereco}</Text>
        </View>
        <Text style={styles.time}>{tempoRelativo(denuncia.criadaEm)}</Text>
      </View>

      {denuncia.fotoUri ? (
        <Image source={{ uri: denuncia.fotoUri }} style={styles.photo} />
      ) : (
        <PoleIllustration height={220} />
      )}

      <View style={styles.body}>
        <View style={styles.chips}>
          {denuncia.tipos.map((t) => (
            <Chip key={t} label={TIPO_CHIP[t]} tone={TIPO_TONE[t]} />
          ))}
          <Chip label={STATUS_LABEL[denuncia.status]} tone={STATUS_TONE[denuncia.status]} />
        </View>

        {!!denuncia.descricao && <Text style={styles.description}>{denuncia.descricao}</Text>}

        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={12} color={colors.textSubtle} />
            <Text style={styles.meta}>{distancia(denuncia.distanciaKm)}</Text>
          </View>
          <Text style={styles.meta}>Protocolo #{denuncia.protocolo}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.sm + 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  city: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  address: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    alignSelf: 'flex-start',
  },
  photo: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surface,
  },
  body: {
    padding: spacing.sm + 4,
    gap: spacing.sm + 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
