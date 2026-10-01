import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ListaDenuncias } from '@/components/ListaDenuncias';
import { colors, spacing } from '@/theme';

// 04 — Feed: ocorrências do município, mais recentes primeiro (GET /denuncias)
export default function Feed() {
  return (
    <View style={styles.screen}>
      <AppHeader />
      <ListaDenuncias
        lista="feed"
        textoVazio="Nenhuma ocorrência registrada ainda. Seja o primeiro a denunciar!"
        cabecalho={<Text style={styles.title}>Ocorrências recentes</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm + 4,
  },
});
