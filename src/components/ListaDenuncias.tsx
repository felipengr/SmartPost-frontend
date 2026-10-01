import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DenunciaCard } from '@/components/DenunciaCard';
import { useApp } from '@/context/AppContext';
import { useDenuncias } from '@/hooks/useDenuncias';
import { colors, spacing } from '@/theme';

type Props = {
  lista: 'feed' | 'minhas';
  cabecalho?: ReactElement;
  textoVazio: string;
};

// Lista paginada de denúncias: puxar para atualizar, carregar mais no fim, vazio e erro
export function ListaDenuncias({ lista, cabecalho, textoVazio }: Props) {
  const { municipio } = useApp();
  const { itens, carregando, atualizando, carregandoMais, erro, recarregar, carregarMais } =
    useDenuncias(lista);

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
      renderItem={({ item }) => <DenunciaCard denuncia={item} municipio={municipio} />}
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
