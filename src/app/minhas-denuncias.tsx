import { FlatList, StyleSheet, Text, View } from 'react-native';

import { DenunciaCard } from '@/components/DenunciaCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

export default function MinhasDenuncias() {
  const { denuncias, municipio } = useApp();
  const minhas = denuncias.filter((d) => d.doUsuario);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Minhas denúncias" />
      <FlatList
        data={minhas}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não registrou denúncias.</Text>}
        renderItem={({ item }) => <DenunciaCard denuncia={item} municipio={municipio} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
