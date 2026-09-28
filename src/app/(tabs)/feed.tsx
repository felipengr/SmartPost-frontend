import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { DenunciaCard } from '@/components/DenunciaCard';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

// 04 — Feed
export default function Feed() {
  const { denuncias, municipio } = useApp();

  return (
    <View style={styles.screen}>
      <AppHeader />
      <FlatList
        data={denuncias}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.title}>Ocorrências recentes</Text>
            <Text style={styles.filter}>Hoje</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  filter: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
