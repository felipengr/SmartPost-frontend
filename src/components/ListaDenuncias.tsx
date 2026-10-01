import { type ReactElement, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErroApi } from '@/api/cliente';
import { mudarStatus } from '@/api/endpoints';
import { Button } from '@/components/Button';
import { DenunciaCard } from '@/components/DenunciaCard';
import { useApp } from '@/context/AppContext';
import { useDenuncias } from '@/hooks/useDenuncias';
import { PROXIMO_STATUS, STATUS_LABEL } from '@/rotulos';
import { colors, spacing } from '@/theme';
import type { Denuncia } from '@/types';
import { confirmar } from '@/utils/confirmar';

type Props = {
  lista: 'feed' | 'minhas';
  cabecalho?: ReactElement;
  textoVazio: string;
};

// Lista paginada de denúncias: puxar para atualizar, carregar mais no fim, vazio e erro
export function ListaDenuncias({ lista, cabecalho, textoVazio }: Props) {
  const { municipio, usuario } = useApp();
  const {
    itens,
    carregando,
    atualizando,
    carregandoMais,
    erro,
    recarregar,
    carregarMais,
    substituir,
  } = useDenuncias(lista);
  const [avancando, setAvancando] = useState<string | null>(null);
  const ehGestor = usuario?.papel === 'gestor';

  // Gestor leva a denúncia ao próximo status; a API registra quem mudou e quando
  const avancarStatus = (denuncia: Denuncia) => {
    const proximo = PROXIMO_STATUS[denuncia.status];
    if (!proximo) return;
    confirmar(
      `Protocolo #${denuncia.protocolo}`,
      `Mudar de "${STATUS_LABEL[denuncia.status]}" para "${STATUS_LABEL[proximo]}"? Todos do município verão o novo status.`,
      'Confirmar',
      async () => {
        setAvancando(denuncia.id);
        try {
          substituir(await mudarStatus(denuncia.id, proximo));
        } catch (e) {
          // Outro gestor pode ter mudado antes (a API recusa): mostra o motivo e atualiza a lista
          const motivo =
            e instanceof ErroApi ? (Object.values(e.campos ?? {})[0] ?? e.message) : '';
          Alert.alert('Não foi possível mudar o status', motivo || 'Tente novamente.');
          recarregar();
        } finally {
          setAvancando(null);
        }
      },
    );
  };

  const vazio = carregando ? (
    <ActivityIndicator color={colors.primary} style={styles.status} />
  ) : erro ? (
    <View style={styles.status}>
      <Text style={styles.texto}>{erro}</Text>
      <Button title="Tentar de novo" variant="link" onPress={() => recarregar()} />
    </View>
  ) : (
    <Text style={[styles.texto, styles.status]}>{textoVazio}</Text>
  );

  return (
    <FlatList
      data={itens}
      keyExtractor={(d) => d.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          {cabecalho}
          {/* Erro com a lista já na tela (ex.: caiu a internet ao atualizar) */}
          {erro && itens.length > 0 && <Text style={styles.aviso}>{erro}</Text>}
        </>
      }
      ListEmptyComponent={vazio}
      ListFooterComponent={
        carregandoMais ? <ActivityIndicator color={colors.primary} style={styles.mais} /> : null
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item }) => (
        <DenunciaCard
          denuncia={item}
          municipio={municipio}
          onAvancarStatus={ehGestor ? () => avancarStatus(item) : undefined}
          avancando={avancando === item.id}
        />
      )}
      extraData={avancando}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={() => recarregar(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onEndReached={carregarMais}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  status: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  texto: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  aviso: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  mais: {
    marginVertical: spacing.md,
  },
});
